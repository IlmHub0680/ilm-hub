import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

// Charges the Author Application Fee via Stripe, mirroring
// app/api/admissions/stripe/initialize/route.js and this same
// application's Paystack path (app/api/author/paystack/initialize).
// Stripe is offered only for international (USD) author
// applications — exactly the same "Ghana residents must use
// Paystack" split already used for student admissions — since
// Stripe here settles in USD and is never converted to GHS.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function response(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is missing.");
  }

  return new Stripe(key);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const admissionId = normalizeString(body.admissionId);

    if (!admissionId) {
      return response({ success: false, error: "admissionId is required." }, 400);
    }

    const admission = await prisma.authorAdmission.findUnique({
      where: { id: admissionId },
      include: { user: true },
    });

    if (!admission) {
      return response({ success: false, error: "Author application not found." }, 404);
    }

    if (!admission.applicationFee || !admission.currencyCode) {
      return response(
        {
          success: false,
          error:
            "This application does not have a fee recorded. Please contact the administration.",
        },
        400
      );
    }

    if (admission.status !== "PENDING") {
      return response(
        {
          success: false,
          error: `This application is already ${admission.status.toLowerCase()} and cannot be paid for again.`,
        },
        409
      );
    }

    if (admission.feeExpiresAt && admission.feeExpiresAt < new Date()) {
      return response(
        {
          success: false,
          error: "This application's fee window has expired. Please submit a new application.",
        },
        410
      );
    }

    const feeCurrency = admission.currencyCode;

    if (feeCurrency !== "USD") {
      return response(
        {
          success: false,
          error: "Stripe is only available for international (USD) author applications. Ghana residents should pay via Paystack.",
        },
        400
      );
    }

    const applicationFee = Number(admission.applicationFee);

    if (!Number.isFinite(applicationFee) || applicationFee <= 0) {
      return response({ success: false, error: "Invalid application fee configuration." }, 500);
    }

    const stripe = getStripe();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const trackUrl = appUrl
      ? `${appUrl.replace(/\/$/, "")}/author-portal/admission/track?admissionId=${admission.id}`
      : `/author-portal/admission/track?admissionId=${admission.id}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: admission.user.email,
      currency: "usd",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Ulul Azm Author Application Fee",
              description: `Author application — ${admission.user.email}`,
            },
            unit_amount: Math.round(applicationFee * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        admissionId: admission.id,
        applicationFee: String(applicationFee),
        feeCurrency: "USD",
      },
      success_url: `${trackUrl}&stripe_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${trackUrl}&payment=cancelled`,
    });

    if (!session.url) {
      return response({ success: false, error: "Stripe did not return a checkout URL." }, 500);
    }

    await prisma.authorPayment.upsert({
      where: { admissionId: admission.id },
      create: {
        admissionId: admission.id,
        gateway: "STRIPE",
        status: "PENDING",
        amount: applicationFee,
        currencyCode: "USD",
        exchangeRate: 1,
        gatewayReference: session.payment_intent ? String(session.payment_intent) : session.id,
        checkoutReference: session.id,
        checkoutUrl: session.url,
      },
      update: {
        gateway: "STRIPE",
        status: "PENDING",
        amount: applicationFee,
        currencyCode: "USD",
        exchangeRate: 1,
        gatewayReference: session.payment_intent ? String(session.payment_intent) : session.id,
        checkoutReference: session.id,
        checkoutUrl: session.url,
        transactionId: null,
        paidAt: null,
      },
    });

    return response({
      success: true,
      data: {
        admissionId: admission.id,
        sessionId: session.id,
        authorizationUrl: session.url,
        amount: applicationFee,
        currency: "USD",
      },
    });
  } catch (error) {
    console.error("Author Stripe initialization error:", error);

    return response(
      { success: false, error: error?.message || "Unable to initialize author application payment." },
      500
    );
  }
}
