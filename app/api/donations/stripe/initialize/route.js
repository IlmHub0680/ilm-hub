import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

// Mirrors app/api/admissions/stripe/initialize/route.js's Checkout
// Session pattern exactly (same getStripe() shape, same line_items/
// metadata/success_url/cancel_url structure) but for a donor-chosen
// amount instead of a computed admission fee, and against Donation
// directly instead of AdmissionApplication + AdmissionPayment.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_PURPOSES = [
  'General Institute Support',
  'Student Scholarship Fund',
  'Library & Publication Expansion',
  'Online Media & Broadcasting',
];

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

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function POST(request) {
  try {
    const body = await request.json();

    const amountInput = Number(body.amount);
    const purposeInput = normalizeString(body.purpose);
    const donorName = normalizeString(body.donorName) || null;
    const donorEmail = normalizeString(body.donorEmail) || null;

    if (!Number.isFinite(amountInput) || amountInput <= 0) {
      return json(
        { success: false, error: 'Enter a valid donation amount.' },
        400
      );
    }

    const purpose = ALLOWED_PURPOSES.includes(purposeInput)
      ? purposeInput
      : ALLOWED_PURPOSES[0];

    // Stripe, like the admissions flow, is USD-only here -- a donor
    // choosing GHS is routed to Paystack by the frontend before this
    // route is ever called.
    const donation = await prisma.donation.create({
      data: {
        donorName,
        donorEmail,
        isRecurring: false,
        purpose,
        amount: amountInput,
        currencyCode: 'USD',
        gateway: 'STRIPE',
        status: 'PENDING',
      },
    });

    const stripe = getStripe();

    let session;

    try {
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        ...(donorEmail ? { customer_email: donorEmail } : {}),
        currency: 'usd',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Donation to Ulul Azm Institute',
                description: purpose,
              },
              unit_amount: Math.round(amountInput * 100),
            },
            quantity: 1,
          },
        ],
        metadata: {
          donationId: donation.id,
          purpose,
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/donate?stripe_session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/donate?payment=cancelled`,
      });
    } catch (stripeError) {
      console.error('Donation Stripe session creation error:', stripeError);

      await prisma.donation.update({
        where: { id: donation.id },
        data: { status: 'FAILED' },
      });

      return json(
        { success: false, error: 'Unable to create Stripe checkout session.' },
        502
      );
    }

    if (!session.url) {
      await prisma.donation.update({
        where: { id: donation.id },
        data: { status: 'FAILED' },
      });

      return json(
        { success: false, error: 'Stripe did not return a checkout URL.' },
        500
      );
    }

    await prisma.donation.update({
      where: { id: donation.id },
      data: {
        gatewayReference: session.payment_intent
          ? String(session.payment_intent)
          : null,
        checkoutReference: session.id,
        authorizationUrl: session.url,
      },
    });

    return json({
      success: true,
      data: {
        donationId: donation.id,
        sessionId: session.id,
        checkoutUrl: session.url,
        amount: amountInput,
        currency: 'USD',
        purpose,
      },
    });
  } catch (error) {
    console.error('Donation Stripe initialization error:', error);

    return json(
      {
        success: false,
        error: error?.message || 'Unable to initialize donation payment.',
      },
      500
    );
  }
}
