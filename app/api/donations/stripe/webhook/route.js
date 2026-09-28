import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

// Mirrors app/api/admissions/stripe/webhook/route.js exactly --
// same signature verification and amount/currency re-validation --
// but against Donation directly (no separate parent record).

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is missing.');
  }

  return new Stripe(key);
}

export async function POST(request) {
  try {
    const stripe = getStripe();
    // Stripe issues a unique signing secret per webhook endpoint, so this
    // donations endpoint must not share STRIPE_WEBHOOK_SECRET with the
    // admissions endpoint -- reusing that name would break verification
    // for whichever endpoint's secret isn't the one currently stored.
    // Falls back to STRIPE_WEBHOOK_SECRET only so this route doesn't hard
    // fail before the dedicated env var is configured in Vercel.
    const webhookSecret =
      process.env.STRIPE_DONATIONS_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error('STRIPE_DONATIONS_WEBHOOK_SECRET is missing.');
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return Response.json(
        { success: false, error: 'Missing Stripe signature.' },
        { status: 400 }
      );
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
      console.error('Donation Stripe webhook signature verification failed:', error);

      return Response.json(
        { success: false, error: 'Invalid webhook signature.' },
        { status: 400 }
      );
    }

    if (event.type !== 'checkout.session.completed') {
      return Response.json({ received: true, ignored: true });
    }

    const session = event.data.object;

    if (session.payment_status !== 'paid') {
      return Response.json({ received: true, ignored: true });
    }

    const donationId = session.metadata?.donationId;

    if (!donationId) {
      return Response.json(
        { success: false, error: 'Donation ID is missing from Stripe metadata.' },
        { status: 400 }
      );
    }

    const donation = await prisma.donation.findUnique({ where: { id: donationId } });

    if (!donation) {
      console.error('DONATION NOT FOUND:', donationId);

      // Return 200 so Stripe does not endlessly retry a session
      // that does not belong to a donation.
      return Response.json({
        received: true,
        ignored: true,
        reason: 'Donation not found.',
      });
    }

    if (donation.status === 'PAID') {
      return Response.json({
        received: true,
        success: true,
        alreadyProcessed: true,
        donationId: donation.id,
      });
    }

    const stripeCurrency = String(session.currency || '').toUpperCase();
    const expectedCurrency = String(donation.currencyCode || '').toUpperCase();

    if (stripeCurrency !== expectedCurrency || stripeCurrency !== 'USD') {
      console.error('DONATION STRIPE CURRENCY MISMATCH:', {
        donationId,
        stripeCurrency,
        expectedCurrency,
      });

      return Response.json(
        { success: false, error: 'Payment currency does not match the donation.' },
        { status: 409 }
      );
    }

    const expectedAmount = Math.round(Number(donation.amount) * 100);
    const receivedAmount = Number(session.amount_total);

    if (
      !Number.isFinite(expectedAmount) ||
      expectedAmount <= 0 ||
      !Number.isFinite(receivedAmount) ||
      receivedAmount !== expectedAmount
    ) {
      console.error('DONATION STRIPE AMOUNT MISMATCH:', {
        donationId,
        expectedAmount,
        receivedAmount,
      });

      return Response.json(
        { success: false, error: 'Payment amount does not match the donation.' },
        { status: 409 }
      );
    }

    const paymentIntent =
      typeof session.payment_intent === 'string' ? session.payment_intent : null;
    const paidAt = new Date();

    await prisma.$transaction(async (tx) => {
      const current = await tx.donation.findUnique({ where: { id: donation.id } });

      if (!current) {
        throw new Error('Donation not found.');
      }

      if (current.status === 'PAID') {
        return;
      }

      await tx.donation.update({
        where: { id: current.id },
        data: {
          status: 'PAID',
          gatewayReference: session.id,
          checkoutReference: session.id,
          transactionId: paymentIntent,
          paidAt,
        },
      });
    });

    return Response.json({
      received: true,
      success: true,
      donationId: donation.id,
    });
  } catch (error) {
    console.error('Donation Stripe webhook error:', error);

    return Response.json(
      { success: false, error: error?.message || 'Donation Stripe webhook failed.' },
      { status: 500 }
    );
  }
}
