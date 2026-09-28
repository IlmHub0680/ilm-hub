import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Client-side "confirm my payment now" check, used by the subscribe
// success page while polling. Branches on the subscription's own
// recorded paymentGateway (set at initialize time -- see
// app/api/media/subscribe/route.js) so the same endpoint verifies
// either gateway; the Stripe webhook
// (app/api/media/subscribe/stripe-webhook) is the authoritative async
// path for Stripe and will normally beat this to recording payment,
// but this still gives the success page something to poll rather than
// wait on the webhook alone -- same pattern as
// app/checkout/success/PaystackVerification.jsx's own client check
// alongside app/api/webhooks/stripe for Bookstore orders.

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is missing.");
  }
  return new Stripe(key);
}

async function verifyPaystack(subscription, reference) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    return { ok: false, status: 500, error: "Payments are not configured." };
  }

  let verifyResponse;
  try {
    verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    );
  } catch (err) {
    console.error("Media subscription verify network error:", err);
    return { ok: false, status: 502, error: "Unable to reach Paystack to verify payment." };
  }

  let result;
  try {
    result = await verifyResponse.json();
  } catch {
    result = null;
  }

  const transaction = result?.data;

  if (!verifyResponse.ok || !transaction) {
    console.error("Media subscription verify failed:", { status: verifyResponse.status, result });
    return { ok: false, status: 400, error: "Unable to verify payment with Paystack." };
  }

  if (transaction.status !== "success") {
    return { ok: false, status: 400, error: "Payment was not successful.", notPaid: true };
  }

  return { ok: true, paidAmount: transaction.amount ? transaction.amount / 100 : null };
}

async function verifyStripe(subscription, reference) {
  let stripe;
  try {
    stripe = getStripe();
  } catch (error) {
    return { ok: false, status: 500, error: "Payments are not configured." };
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(reference);
  } catch (err) {
    console.error("Media subscription Stripe verify error:", err);
    return { ok: false, status: 502, error: "Unable to reach Stripe to verify payment." };
  }

  if (session.payment_status !== "paid") {
    return { ok: false, status: 400, error: "Payment was not successful." };
  }

  const expectedAmount = Math.round(Number(subscription.plan.priceUSD) * 100);
  const receivedAmount = Number(session.amount_total);

  if (!Number.isFinite(receivedAmount) || receivedAmount !== expectedAmount) {
    console.error("Media subscription Stripe amount mismatch:", {
      subscriptionId: subscription.id,
      expectedAmount,
      receivedAmount,
    });
    return { ok: false, status: 409, error: "Payment amount does not match the plan." };
  }

  return { ok: true, paidAmount: receivedAmount / 100 };
}

export async function POST(request) {
  try {
    const user = await requireUser();

    const body = await request.json();
    const reference = typeof body.reference === "string" ? body.reference.trim() : "";

    if (!reference) {
      return NextResponse.json(
        { success: false, error: "A payment reference is required." },
        { status: 400 }
      );
    }

    const subscription = await prisma.userMediaSubscription.findUnique({
      where: { paymentRef: reference },
      include: { plan: true },
    });

    if (!subscription || subscription.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Subscription payment not found." },
        { status: 404 }
      );
    }

    if (subscription.status === "ACTIVE") {
      return NextResponse.json({
        success: true,
        message: "Subscription already active.",
        subscription: { id: subscription.id, expiresAt: subscription.expiresAt },
      });
    }

    if (subscription.status === "PENDING" && subscription.paidAmount !== null) {
      return NextResponse.json({
        success: true,
        message:
          "Payment already verified — awaiting admin approval before access is unlocked.",
        awaitingApproval: true,
        subscription: { id: subscription.id },
      });
    }

    const gateway = subscription.paymentGateway;
    const verifyResult =
      gateway === "STRIPE"
        ? await verifyStripe(subscription, reference)
        : await verifyPaystack(subscription, reference);

    if (!verifyResult.ok) {
      if (verifyResult.notPaid) {
        await prisma.userMediaSubscription.update({
          where: { id: subscription.id },
          data: { status: "CANCELLED" },
        });
      }
      return NextResponse.json(
        { success: false, error: verifyResult.error || "Unable to verify payment." },
        { status: verifyResult.status || 400 }
      );
    }

    /*
     * Payment is now verified, but per the institute's business rules
     * media subscriptions are not auto-activated: an admin must review
     * and release access from the Subscribers view (see
     * app/api/admin/media/subscribers/[id]/activate).
     * We record the confirmed payment (paidAmount) while leaving the
     * subscription PENDING so admins can distinguish "paid, awaiting
     * approval" from "never paid" in that view.
     */
    const updated = await prisma.userMediaSubscription.update({
      where: { id: subscription.id },
      data: {
        status: "PENDING",
        paidAmount: verifyResult.paidAmount,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Payment verified successfully. Your subscription will be activated shortly by an administrator.",
      awaitingApproval: true,
      subscription: { id: updated.id },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Please log in first." }, { status: 401 });
    }

    console.error("Media subscription verify error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to verify the subscription payment." },
      { status: 500 }
    );
  }
}
