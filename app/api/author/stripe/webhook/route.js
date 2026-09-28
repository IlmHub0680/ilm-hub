import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

// Server-to-server confirmation of an author application-fee Stripe
// payment — defense in depth alongside the client-driven /verify
// route, mirroring app/api/admissions/stripe/webhook/route.js and
// this application's own author/paystack/webhook/route.js.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is missing.");
  }

  return new Stripe(key);
}

export async function POST(request) {
  try {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is missing.");
    }

    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return Response.json({ success: false, error: "Missing Stripe signature." }, { status: 400 });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
      console.error("Author Stripe webhook signature verification failed:", error);
      return Response.json({ success: false, error: "Invalid webhook signature." }, { status: 400 });
    }

    if (event.type !== "checkout.session.completed") {
      return Response.json({ received: true, ignored: true });
    }

    const session = event.data.object;

    if (session.payment_status !== "paid") {
      return Response.json({ received: true, ignored: true });
    }

    const admissionId = session.metadata?.admissionId;

    if (!admissionId) {
      // Not every Stripe checkout on this account is an author
      // application-fee payment (student admissions share Stripe
      // too) — ignore rather than error on events that aren't ours.
      return Response.json({ received: true, ignored: true, reason: "Not an author application payment." });
    }

    const payment = await prisma.authorPayment.findFirst({
      where: { gateway: "STRIPE", checkoutReference: session.id, admissionId },
      include: { admission: true },
    });

    if (!payment) {
      console.error("Author Stripe payment not found for session:", session.id);
      return Response.json({ received: true, ignored: true, reason: "Author payment not found." });
    }

    if (payment.status === "PAID" && payment.admission.status !== "PENDING") {
      return Response.json({ received: true, success: true, alreadyProcessed: true, admissionId });
    }

    const expectedAmount = Number(payment.amount);
    const receivedAmount = Number(session.amount_total || 0) / 100;
    const receivedCurrency = String(session.currency || "").toUpperCase();
    const expectedCurrency = String(payment.currencyCode || "").toUpperCase();

    const amountsMatch = Number.isFinite(receivedAmount) && Math.abs(receivedAmount - expectedAmount) < 0.01;
    const currenciesMatch = receivedCurrency === expectedCurrency;

    if (!amountsMatch || !currenciesMatch) {
      console.error("Author Stripe webhook payment mismatch:", {
        sessionId: session.id,
        admissionId,
        expectedAmount,
        receivedAmount,
        expectedCurrency,
        receivedCurrency,
      });

      await prisma.authorPayment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          transactionId: typeof session.payment_intent === "string" ? session.payment_intent : session.id,
        },
      });

      return Response.json(
        { success: false, error: "Payment amount or currency does not match the application fee." },
        { status: 409 }
      );
    }

    const paidAt = new Date();
    const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : null;

    await prisma.$transaction(async (tx) => {
      const currentPayment = await tx.authorPayment.findUnique({ where: { id: payment.id } });
      const currentAdmission = await tx.authorAdmission.findUnique({ where: { id: admissionId } });

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
          gatewayReference: paymentIntent || session.id,
          transactionId: paymentIntent || session.id,
          paidAt,
        },
      });

      await tx.authorAdmission.update({
        where: { id: currentAdmission.id },
        data: { status: "PAID" },
      });
    });

    return Response.json({ received: true, success: true, admissionId, status: "PAID" });
  } catch (error) {
    console.error("Author Stripe webhook error:", error);

    return Response.json({ success: false, error: error?.message || "Author Stripe webhook failed." }, { status: 500 });
  }
}
