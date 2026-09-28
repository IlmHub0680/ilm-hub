import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Dual-gateway subscription initialize -- mirrors app/api/checkout/route.js's
// own Stripe/Paystack branching for book orders (2026-09: Media previously
// only supported Paystack; this adds Stripe so Media offers the exact same
// "existing payment methods" the Bookstore already does). Whichever gateway
// is used, the resulting UserMediaSubscription is created PENDING and stays
// PENDING even after payment is confirmed -- per the institute's existing
// business rule, an admin must still manually review and activate every
// subscription from /admin/media/subscribers. Nothing about that approval
// step changes here.

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is missing.");
  }
  return new Stripe(key);
}

function getPaystackSecret() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error("PAYSTACK_SECRET_KEY is missing.");
  }
  return key;
}

function getPaystackExchangeRate() {
  const rate = Number(process.env.PAYSTACK_USD_GHS_RATE);
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error("PAYSTACK_USD_GHS_RATE is missing or invalid.");
  }
  return rate;
}

function normalizePaymentMethod(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "stripe") return "stripe";
  if (normalized === "paystack") return "paystack";
  return null;
}

export async function POST(request) {
  let createdSubscriptionId = null;

  try {
    const user = await requireUser();

    const body = await request.json();
    const planId = typeof body.planId === "string" ? body.planId.trim() : "";
    const paymentMethod = normalizePaymentMethod(body.paymentMethod);
    // The visitor must have actually checked the terms/refund-policy
    // acknowledgment on the review page before this request is even
    // sent -- see app/media/subscribe/[planId]/SubscribeForm.jsx. This
    // is the server-side backstop for that same requirement: no
    // acceptance, no subscription created, regardless of what the
    // client sends.
    const termsAccepted = body.termsAccepted === true;

    if (!planId) {
      return NextResponse.json(
        { success: false, error: "A subscription plan is required." },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { success: false, error: "Unsupported payment method." },
        { status: 400 }
      );
    }

    if (!termsAccepted) {
      return NextResponse.json(
        { success: false, error: "You must accept the Terms of Use and Refund Policy to subscribe." },
        { status: 400 }
      );
    }

    const plan = await prisma.mediaSubscriptionPlan.findUnique({ where: { id: planId } });

    if (!plan || !plan.isActive) {
      return NextResponse.json(
        { success: false, error: "Selected subscription plan is not available." },
        { status: 404 }
      );
    }

    const priceUSD = Number(plan.priceUSD);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

    // Placeholder expiry — recalculated from plan.durationDays once payment is verified.
    const pendingSubscription = await prisma.userMediaSubscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        status: "PENDING",
        expiresAt: new Date(),
      },
    });

    createdSubscriptionId = pendingSubscription.id;

    /*
     * ========================================================
     * PAYSTACK
     * ========================================================
     */
    if (paymentMethod === "paystack") {
      const secretKey = getPaystackSecret();
      const exchangeRate = getPaystackExchangeRate();
      const paystackAmountGHS = priceUSD * exchangeRate;
      const paystackAmountMinor = Math.round(paystackAmountGHS * 100);

      if (paystackAmountMinor <= 0) {
        await prisma.userMediaSubscription.update({
          where: { id: pendingSubscription.id },
          data: { status: "CANCELLED" },
        });
        return NextResponse.json(
          { success: false, error: "Invalid subscription payment amount." },
          { status: 500 }
        );
      }

      const reference = `MEDIASUB-${pendingSubscription.id}-${Date.now()}`;
      const callbackUrl = appUrl
        ? `${appUrl.replace(/\/$/, "")}/media/subscribe/success?subscription_id=${encodeURIComponent(pendingSubscription.id)}`
        : undefined;

      let paystackResponse;
      try {
        paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            amount: paystackAmountMinor,
            currency: "GHS",
            reference,
            ...(callbackUrl ? { callback_url: callbackUrl } : {}),
            metadata: {
              subscriptionId: pendingSubscription.id,
              planId: plan.id,
              userId: user.id,
              priceUSD,
              exchangeRate,
            },
          }),
        });
      } catch (paystackError) {
        console.error("Media subscription Paystack network error:", paystackError);
        await prisma.userMediaSubscription.update({
          where: { id: pendingSubscription.id },
          data: { status: "CANCELLED" },
        });
        return NextResponse.json(
          { success: false, error: "Unable to connect to Paystack." },
          { status: 502 }
        );
      }

      let result;
      try {
        result = await paystackResponse.json();
      } catch {
        result = null;
      }

      if (!paystackResponse.ok || !result?.status || !result?.data) {
        console.error("Media subscription Paystack init failed:", {
          status: paystackResponse.status,
          result,
          subscriptionId: pendingSubscription.id,
        });
        await prisma.userMediaSubscription.update({
          where: { id: pendingSubscription.id },
          data: { status: "CANCELLED" },
        });
        return NextResponse.json(
          { success: false, error: result?.message || "Unable to initialize payment." },
          { status: 400 }
        );
      }

      const paystackData = result.data;

      if (!paystackData.reference || !paystackData.authorization_url) {
        console.error("Media subscription Paystack incomplete data:", paystackData);
        await prisma.userMediaSubscription.update({
          where: { id: pendingSubscription.id },
          data: { status: "CANCELLED" },
        });
        return NextResponse.json(
          { success: false, error: "Paystack returned an incomplete response." },
          { status: 502 }
        );
      }

      await prisma.userMediaSubscription.update({
        where: { id: pendingSubscription.id },
        data: { paymentGateway: "PAYSTACK", paymentRef: paystackData.reference },
      });

      return NextResponse.json({
        success: true,
        data: {
          subscriptionId: pendingSubscription.id,
          reference: paystackData.reference,
          authorizationUrl: paystackData.authorization_url,
          plan: { id: plan.id, name: plan.name, priceUSD, durationDays: plan.durationDays },
        },
      });
    }

    /*
     * ========================================================
     * STRIPE
     * ========================================================
     */
    if (paymentMethod === "stripe") {
      if (!appUrl) {
        await prisma.userMediaSubscription.update({
          where: { id: pendingSubscription.id },
          data: { status: "CANCELLED" },
        });
        return NextResponse.json(
          { success: false, error: "NEXT_PUBLIC_APP_URL is missing." },
          { status: 500 }
        );
      }

      let stripe;
      try {
        stripe = getStripe();
      } catch (error) {
        await prisma.userMediaSubscription.update({
          where: { id: pendingSubscription.id },
          data: { status: "CANCELLED" },
        });
        return NextResponse.json(
          { success: false, error: "Payments are not configured." },
          { status: 500 }
        );
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: user.email,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: Math.round(priceUSD * 100),
              product_data: {
                name: `${plan.name} — Ulul Azm Media Subscription`,
                description: plan.descriptionEn || `${plan.durationDays}-day Media subscription`,
              },
            },
          },
        ],
        success_url: `${appUrl.replace(/\/$/, "")}/media/subscribe/success?subscription_id=${encodeURIComponent(pendingSubscription.id)}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl.replace(/\/$/, "")}/media/subscribe/${encodeURIComponent(plan.id)}`,
        metadata: {
          subscriptionId: pendingSubscription.id,
          planId: plan.id,
          userId: user.id,
          kind: "media_subscription",
        },
      });

      if (!session.id) {
        await prisma.userMediaSubscription.update({
          where: { id: pendingSubscription.id },
          data: { status: "CANCELLED" },
        });
        throw new Error("Stripe did not return a session ID.");
      }

      await prisma.userMediaSubscription.update({
        where: { id: pendingSubscription.id },
        data: { paymentGateway: "STRIPE", paymentRef: session.id },
      });

      return NextResponse.json({
        success: true,
        data: {
          subscriptionId: pendingSubscription.id,
          reference: session.id,
          authorizationUrl: session.url,
          plan: { id: plan.id, name: plan.name, priceUSD, durationDays: plan.durationDays },
        },
      });
    }

    // Unreachable — normalizePaymentMethod() only returns 'stripe',
    // 'paystack', or null (already handled above).
    return NextResponse.json(
      { success: false, error: "Unsupported payment method." },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Please log in first." }, { status: 401 });
    }

    if (createdSubscriptionId) {
      await prisma.userMediaSubscription
        .update({ where: { id: createdSubscriptionId }, data: { status: "CANCELLED" } })
        .catch(() => {});
    }

    console.error("Media subscription initialize error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to start the subscription payment." },
      { status: 500 }
    );
  }
}
