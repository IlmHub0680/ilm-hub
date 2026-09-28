import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

// Verifies an author application-fee payment made via Stripe,
// mirroring app/api/admissions/stripe/verify/route.js and this
// application's own app/api/author/paystack/verify/route.js.

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
    const sessionId = normalizeString(body.sessionId);
    const admissionId = normalizeString(body.admissionId);

    if (!sessionId) {
      return response({ success: false, error: "Stripe session ID is required." }, 400);
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const metadataAdmissionId = normalizeString(session.metadata?.admissionId);

    if (!metadataAdmissionId) {
      return response({ success: false, error: "Author application ID is missing from the Stripe session." }, 400);
    }

    if (admissionId && admissionId !== metadataAdmissionId) {
      return response(
        { success: false, error: "This Stripe session does not belong to this author application." },
        400
      );
    }

    const payment = await prisma.authorPayment.findFirst({
      where: { gateway: "STRIPE", checkoutReference: sessionId, admissionId: metadataAdmissionId },
      include: { admission: true },
    });

    if (!payment) {
      return response({ success: false, error: "Author payment transaction not found." }, 404);
    }

    // Idempotency: already verified.
    if (payment.status === "PAID") {
      return response({
        success: true,
        message: "Author application payment has already been verified.",
        data: {
          admissionId: payment.admissionId,
          amount: Number(payment.amount),
          currency: payment.currencyCode,
          status: "PAID",
          paidAt: payment.paidAt,
        },
      });
    }

    if (session.payment_status !== "paid") {
      return response({ success: false, error: "Stripe payment has not been completed." }, 400);
    }

    const expectedAmount = Number(payment.amount);
    const receivedAmount = Number(session.amount_total || 0) / 100;
    const receivedCurrency = String(session.currency || "").toUpperCase();
    const expectedCurrency = String(payment.currencyCode || "").toUpperCase();

    const amountsMatch = Number.isFinite(receivedAmount) && Math.abs(receivedAmount - expectedAmount) < 0.01;
    const currencyMatches = receivedCurrency === expectedCurrency;

    if (!amountsMatch || !currencyMatches) {
      console.error("Author Stripe payment mismatch:", {
        sessionId,
        admissionId: payment.admissionId,
        expectedAmount,
        receivedAmount,
        expectedCurrency,
        receivedCurrency,
      });

      await prisma.authorPayment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          transactionId: typeof session.payment_intent === "string" ? session.payment_intent : sessionId,
        },
      });

      return response(
        { success: false, error: "Payment verification failed because the amount or currency does not match the application fee." },
        400
      );
    }

    const paidAt = new Date();
    const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : null;

    await prisma.$transaction(async (tx) => {
      const currentPayment = await tx.authorPayment.findUnique({ where: { id: payment.id } });
      const currentAdmission = await tx.authorAdmission.findUnique({ where: { id: payment.admissionId } });

      if (!currentPayment || !currentAdmission) {
        throw new Error("Author payment or application no longer exists.");
      }

      if (currentPayment.status === "PAID" && currentAdmission.status !== "PENDING") {
        return;
      }

      await tx.authorPayment.update({
        where: { id: currentPayment.id },
        data: {
          status: "PAID",
          gatewayReference: paymentIntent || sessionId,
          transactionId: paymentIntent || sessionId,
          paidAt,
        },
      });

      await tx.authorAdmission.update({
        where: { id: currentAdmission.id },
        data: { status: "PAID" },
      });
    });

    return response({
      success: true,
      message: "Author application payment verified successfully.",
      data: {
        admissionId: payment.admissionId,
        amount: receivedAmount,
        currency: receivedCurrency,
        status: "PAID",
        paidAt,
      },
    });
  } catch (error) {
    console.error("Author Stripe verification error:", error);

    return response({ success: false, error: error?.message || "Unable to verify author application payment." }, 500);
  }
}
