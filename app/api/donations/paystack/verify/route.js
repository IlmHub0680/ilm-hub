import { prisma } from "@/lib/prisma";

// Mirrors app/api/admissions/paystack/verify/route.js's verification
// logic exactly (reference cross-check, metadata cross-check, server
// side amount/currency comparison against what was stored at
// initialize-time, idempotency guard) but against Donation directly
// instead of AdmissionPayment + AdmissionApplication as two separate
// records, since a donation has no parent record to keep in sync.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function response(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request) {
  try {
    const body = await request.json();

    const reference = normalizeString(body.reference);
    const donationId = normalizeString(body.donationId);

    if (!reference) {
      return response(
        { success: false, error: "Payment reference is required." },
        400
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return response(
        { success: false, error: "Paystack is not configured." },
        500
      );
    }

    const donation = await prisma.donation.findFirst({
      where: {
        gateway: "PAYSTACK",
        gatewayReference: reference,
        ...(donationId ? { id: donationId } : {}),
      },
    });

    if (!donation) {
      return response(
        { success: false, error: "Donation transaction not found." },
        404
      );
    }

    if (donationId && donation.id !== donationId) {
      return response(
        {
          success: false,
          error: "Payment reference does not belong to this donation.",
        },
        400
      );
    }

    // Idempotency: return the stored result rather than re-verifying
    // a donation that's already confirmed.
    if (donation.status === "PAID") {
      return response({
        success: true,
        message: "Donation has already been verified.",
        data: {
          donationId: donation.id,
          reference: donation.gatewayReference,
          amount: Number(donation.amount),
          currency: donation.currencyCode,
          purpose: donation.purpose,
          status: "PAID",
          paidAt: donation.paidAt,
        },
      });
    }

    let verifyResponse;

    try {
      verifyResponse = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );
    } catch (verifyError) {
      console.error("Donation Paystack verification network error:", verifyError);

      return response(
        {
          success: false,
          error: "Unable to connect to Paystack to verify the payment.",
        },
        502
      );
    }

    let result;

    try {
      result = await verifyResponse.json();
    } catch {
      result = null;
    }

    if (!verifyResponse.ok || !result?.status || !result?.data) {
      console.error("Donation Paystack verification failed:", {
        status: verifyResponse.status,
        result,
        reference,
        donationId: donation.id,
      });

      return response(
        {
          success: false,
          error: result?.message || "Unable to verify payment.",
        },
        400
      );
    }

    const transaction = result.data;

    // 1. Reference must match exactly.
    if (normalizeString(transaction.reference) !== reference) {
      console.error("Paystack reference mismatch:", {
        suppliedReference: reference,
        returnedReference: transaction.reference,
      });

      return response(
        {
          success: false,
          error: "Payment verification failed because the transaction reference does not match.",
        },
        400
      );
    }

    // 2. Transaction itself must be successful.
    if (transaction.status !== "success") {
      await prisma.donation.update({
        where: { id: donation.id },
        data: {
          status: "FAILED",
          transactionId: transaction.id ? String(transaction.id) : reference,
        },
      });

      return response(
        { success: false, error: "Payment was not successful." },
        400
      );
    }

    // 3. Metadata cross-check when available.
    const metadata = transaction.metadata || {};
    const metadataDonationId = normalizeString(metadata.donationId);

    if (metadataDonationId && metadataDonationId !== donation.id) {
      console.error("Paystack donation metadata mismatch:", {
        reference,
        expectedDonationId: donation.id,
        receivedDonationId: metadataDonationId,
      });

      return response(
        {
          success: false,
          error: "Payment verification failed because the transaction does not belong to this donation.",
        },
        400
      );
    }

    // 4. Amount/currency must match what Paystack was initialized
    //    with (stored on the Donation row itself).
    const expectedAmount = Number(donation.amount);
    const paidAmountMinor = Number(transaction.amount || 0);

    if (!Number.isFinite(expectedAmount) || expectedAmount <= 0) {
      console.error("Invalid stored donation amount:", {
        donationId: donation.id,
        expectedAmount,
      });

      return response(
        { success: false, error: "Stored donation amount is invalid." },
        500
      );
    }

    if (!Number.isFinite(paidAmountMinor) || paidAmountMinor <= 0) {
      return response(
        { success: false, error: "Paystack returned an invalid payment amount." },
        400
      );
    }

    const paidAmount = paidAmountMinor / 100;

    const expectedCurrency = normalizeString(donation.currencyCode).toUpperCase();
    const receivedCurrency = normalizeString(transaction.currency).toUpperCase();

    const amountsMatch = Math.abs(paidAmount - expectedAmount) < 0.01;
    const currencyMatches = receivedCurrency === expectedCurrency;

    if (!amountsMatch || !currencyMatches) {
      console.error("Donation payment mismatch:", {
        reference,
        donationId: donation.id,
        expectedAmount,
        paidAmount,
        expectedCurrency,
        receivedCurrency,
        transactionId: transaction.id,
      });

      await prisma.donation.update({
        where: { id: donation.id },
        data: {
          status: "FAILED",
          transactionId: transaction.id ? String(transaction.id) : reference,
        },
      });

      return response(
        {
          success: false,
          error: "Payment verification failed because the amount or currency does not match.",
        },
        400
      );
    }

    // 5. Determine payment time.
    const paidAt = transaction.paid_at ? new Date(transaction.paid_at) : new Date();

    if (Number.isNaN(paidAt.getTime())) {
      return response(
        { success: false, error: "Paystack returned an invalid payment date." },
        400
      );
    }

    // 6. Mark the donation paid. Transaction-scoped with a re-check of
    //    current status, matching every other write path in the
    //    donation flow (Paystack webhook, Stripe verify/webhook, the
    //    admissions-webhook donation fallback) -- this client-triggered
    //    verify can race the Paystack webhook hitting the same
    //    donation, and without the re-check both could pass their own
    //    outer idempotency check and issue a redundant update.
    const updated = await prisma.$transaction(async (tx) => {
      const current = await tx.donation.findUnique({ where: { id: donation.id } });

      if (!current) {
        throw new Error("Donation no longer exists.");
      }

      if (current.status === "PAID") {
        return current;
      }

      return tx.donation.update({
        where: { id: current.id },
        data: {
          status: "PAID",
          transactionId: transaction.id ? String(transaction.id) : reference,
          gatewayReference: reference,
          paidAt,
        },
      });
    });

    return response({
      success: true,
      message: "Donation verified successfully.",
      data: {
        donationId: updated.id,
        reference,
        amount: paidAmount,
        currency: receivedCurrency,
        purpose: updated.purpose,
        status: "PAID",
        paidAt,
      },
    });
  } catch (error) {
    console.error("Donation Paystack verification error:", error);

    return response(
      { success: false, error: "Unable to verify donation payment." },
      500
    );
  }
}
