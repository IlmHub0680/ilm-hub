import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

// Mirrors app/api/admissions/stripe/verify/route.js's verification
// logic (retrieve the session, confirm payment_status === 'paid',
// compare amount/currency server-side) but against Donation directly.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is missing.');
  }

  return new Stripe(key);
}

export async function POST(request) {
  try {
    const body = await request.json();

    const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : '';

    if (!sessionId) {
      return json(
        { success: false, error: 'Stripe session ID is required.' },
        400
      );
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return json(
        { success: false, error: 'Stripe payment has not been completed.' },
        400
      );
    }

    const donationId = session.metadata?.donationId;

    if (!donationId) {
      return json(
        { success: false, error: 'Donation ID is missing from Stripe session.' },
        400
      );
    }

    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
    });

    if (!donation) {
      return json({ success: false, error: 'Donation not found.' }, 404);
    }

    // Idempotency: return the stored result rather than re-verifying
    // a donation that's already confirmed.
    if (donation.status === 'PAID') {
      return json({
        success: true,
        message: 'Donation has already been verified.',
        data: {
          donationId: donation.id,
          amount: Number(donation.amount),
          currency: donation.currencyCode,
          purpose: donation.purpose,
          status: 'PAID',
          paidAt: donation.paidAt,
        },
      });
    }

    const amountReceived = Number(session.amount_total || 0) / 100;
    const expectedAmount = Number(donation.amount);
    const currency = String(session.currency || '').toUpperCase();
    const expectedCurrency = String(donation.currencyCode || '').toUpperCase();

    if (currency !== expectedCurrency) {
      return json(
        { success: false, error: 'Payment currency does not match the donation.' },
        409
      );
    }

    if (
      !Number.isFinite(amountReceived) ||
      Math.abs(amountReceived - expectedAmount) > 0.01
    ) {
      return json(
        { success: false, error: 'Payment amount does not match the donation.' },
        409
      );
    }

    const paymentIntent =
      typeof session.payment_intent === 'string' ? session.payment_intent : null;
    const paidAt = new Date();

    const updated = await prisma.$transaction(async (tx) => {
      const current = await tx.donation.findUnique({ where: { id: donation.id } });

      if (!current) {
        throw new Error('Donation not found.');
      }

      if (current.status === 'PAID') {
        return current;
      }

      return tx.donation.update({
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

    return json({
      success: true,
      data: {
        donationId: updated.id,
        amount: expectedAmount,
        currency,
        purpose: updated.purpose,
        status: 'PAID',
        paidAt: updated.paidAt,
      },
    });
  } catch (error) {
    console.error('Donation Stripe verification error:', error);

    return json(
      { success: false, error: error?.message || 'Unable to verify Stripe payment.' },
      500
    );
  }
}
