import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Stripe webhook for MEDIA SUBSCRIPTIONS only -- separate from
// app/api/webhooks/stripe/route.js (which is exclusively for Bookstore
// Order/Payment records and looks up orderId, not a subscription).
// Registered as its own endpoint in the Stripe dashboard
// (STRIPE_WEBHOOK_SECRET is shared across every Stripe webhook route
// already in this codebase -- see app/api/webhooks/stripe/route.js,
// app/api/admissions/stripe/webhook, app/api/author/stripe/webhook --
// so no new env var is needed, only a new endpoint URL registered with
// Stripe: <site>/api/media/subscribe/stripe-webhook).
//
// Mirrors app/api/media/subscribe/verify/route.js's own Paystack
// verify behavior exactly: payment confirmed -> record paidAmount ->
// leave status PENDING. Per the institute's existing business rule,
// media subscriptions are never auto-activated by a successful
// payment; an admin must still manually approve/release access from
// /admin/media/subscribers (see app/api/admin/media/subscribers/[id]/
// activate). This webhook does not and must not change that.

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is missing.');
  }
  return new Stripe(key);
}

function getWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is missing.');
  }
  return secret;
}

export async function POST(request) {
  try {
    const stripe = getStripe();

    // Stripe signature verification requires the raw request body.
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
      event = stripe.webhooks.constructEvent(body, signature, getWebhookSecret());
    } catch (error) {
      console.error('MEDIA STRIPE SIGNATURE VERIFICATION FAILED:', error);
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

    // Only handle sessions this route itself created (see
    // app/api/media/subscribe/route.js's Stripe branch, which sets
    // metadata.kind = 'media_subscription') -- never touches a
    // Bookstore checkout session even if it somehow reached this URL.
    if (session.metadata?.kind !== 'media_subscription') {
      return Response.json({ received: true, ignored: true });
    }

    const subscriptionId = session.metadata?.subscriptionId;

    if (!subscriptionId) {
      return Response.json(
        { success: false, error: 'Subscription ID is missing from Stripe metadata.' },
        { status: 400 }
      );
    }

    const subscription = await prisma.userMediaSubscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });

    if (!subscription) {
      console.error('MEDIA STRIPE SUBSCRIPTION NOT FOUND:', subscriptionId);
      return Response.json(
        { success: false, error: 'Subscription not found.' },
        { status: 404 }
      );
    }

    // Idempotency -- Stripe can send the same webhook more than once.
    if (subscription.status === 'ACTIVE') {
      return Response.json({
        received: true,
        success: true,
        alreadyProcessed: true,
        subscriptionId: subscription.id,
      });
    }

    if (subscription.paymentGateway && subscription.paymentGateway !== 'STRIPE') {
      console.error('MEDIA STRIPE GATEWAY MISMATCH:', {
        subscriptionId: subscription.id,
        paymentGateway: subscription.paymentGateway,
      });
      return Response.json(
        { success: false, error: 'Payment gateway does not match the subscription.' },
        { status: 409 }
      );
    }

    // Verify amount: what was charged should match the plan's own
    // priceUSD at the time this session was created.
    const expectedAmount = Math.round(Number(subscription.plan.priceUSD) * 100);
    const receivedAmount = Number(session.amount_total);

    if (!Number.isFinite(receivedAmount) || receivedAmount !== expectedAmount) {
      console.error('MEDIA STRIPE AMOUNT MISMATCH:', {
        subscriptionId: subscription.id,
        expectedAmount,
        receivedAmount,
      });
      return Response.json(
        { success: false, error: 'Payment amount does not match the plan.' },
        { status: 409 }
      );
    }

    // Payment is now verified with Stripe, but per the institute's
    // business rules media subscriptions are not auto-activated -- see
    // the same note in app/api/media/subscribe/verify/route.js. Record
    // the confirmed payment while leaving status PENDING so admins can
    // distinguish "paid, awaiting approval" from "never paid."
    if (subscription.status === 'PENDING' && subscription.paidAmount == null) {
      await prisma.userMediaSubscription.update({
        where: { id: subscription.id },
        data: { paidAmount: receivedAmount / 100 },
      });
    }

    return Response.json({
      received: true,
      success: true,
      subscriptionId: subscription.id,
      awaitingApproval: true,
    });
  } catch (error) {
    console.error('MEDIA STRIPE WEBHOOK ERROR:', error);
    return Response.json(
      { success: false, error: 'Webhook processing failed.' },
      { status: 500 }
    );
  }
}
