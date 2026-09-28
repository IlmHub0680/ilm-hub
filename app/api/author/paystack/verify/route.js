import { prisma } from "@/lib/prisma";

// Verifies an author application-fee payment, mirroring
// app/api/admissions/paystack/verify/route.js.

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
    const admissionId = normalizeString(body.admissionId);

    if (!reference) {
      return response(
        {
          success: false,
          error: "Payment reference is required.",
        },
        400
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return response(
        {
          success: false,
          error: "Paystack is not configured.",
        },
        500
      );
    }

    // Find the payment by Paystack's reference. If admissionId was
    // supplied, it must also match — never let a reference belonging
    // to one application verify another.
    const payment = await prisma.authorPayment.findFirst({
      where: {
        gateway: "PAYSTACK",
        gatewayReference: reference,
        ...(admissionId ? { admissionId } : {}),
      },
      include: { admission: true },
    });

    if (!payment) {
      return response(
        {
          success: false,
          error: "Author payment transaction not found.",
        },
        404
      );
    }

    if (admissionId && payment.admissionId !== admissionId) {
      return response(
        {
          success: false,
          error: "Payment reference does not belong to this author application.",
        },
        400
      );
    }

    // Idempotency: already verified — return the stored result.
    if (payment.status === "PAID") {
      return response({
        success: true,
        message: "Author application payment has already been verified.",
        data: {
          admissionId: payment.admissionId,
          reference: payment.gatewayReference,
          amount: Number(payment.amount),
          currency: payment.currencyCode,
          status: "PAID",
          paidAt: payment.paidAt,
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
      console.error("Paystack verification network error:", verifyError);

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
      console.error("Paystack verification failed:", {
        status: verifyResponse.status,
        result,
        reference,
        admissionId: payment.admissionId,
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

    // 1. The returned reference MUST match exactly.
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

    // 2. The transaction itself must be successful.
    if (transaction.status !== "success") {
      await prisma.authorPayment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          transactionId: transaction.id ? String(transaction.id) : reference,
        },
      });

      return response(
        {
          success: false,
          error: "Payment was not successful.",
        },
        400
      );
    }

    // 3. Metadata is additional protection against a payment being
    //    associated with the wrong application.
    const metadata = transaction.metadata || {};
    const metadataAdmissionId = normalizeString(metadata.admissionId);

    if (metadataAdmissionId && metadataAdmissionId !== payment.admissionId) {
      console.error("Paystack admission metadata mismatch:", {
        reference,
        expectedAdmissionId: payment.admissionId,
        receivedAdmissionId: metadataAdmissionId,
      });

      return response(
        {
          success: false,
          error: "Payment verification failed because the transaction does not belong to this author application.",
        },
        400
      );
    }

    // 4. Compare actual amount/currency paid with what was stored
    //    (deliberately the Paystack amount, not the original fee).
    const expectedAmount = Number(payment.amount);
    const paidAmountMinor = Number(transaction.amount || 0);

    if (!Number.isFinite(expectedAmount) || expectedAmount <= 0) {
      console.error("Invalid stored author payment amount:", {
        paymentId: payment.id,
        expectedAmount,
      });

      return response(
        {
          success: false,
          error: "Stored author payment amount is invalid.",
        },
        500
      );
    }

    if (!Number.isFinite(paidAmountMinor) || paidAmountMinor <= 0) {
      return response(
        {
          success: false,
          error: "Paystack returned an invalid payment amount.",
        },
        400
      );
    }

    const paidAmount = paidAmountMinor / 100;
    const expectedCurrency = normalizeString(payment.currencyCode).toUpperCase();
    const receivedCurrency = normalizeString(transaction.currency).toUpperCase();
    const amountsMatch = Math.abs(paidAmount - expectedAmount) < 0.01;
    const currencyMatches = receivedCurrency === expectedCurrency;

    if (!amountsMatch || !currencyMatches) {
      console.error("Author payment mismatch:", {
        reference,
        paymentId: payment.id,
        admissionId: payment.admissionId,
        expectedAmount,
        paidAmount,
        expectedCurrency,
        receivedCurrency,
        transactionId: transaction.id,
      });

      await prisma.authorPayment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          transactionId: transaction.id ? String(transaction.id) : reference,
        },
      });

      return response(
        {
          success: false,
          error: "Payment verification failed because the amount or currency does not match the application fee.",
        },
        400
      );
    }

    // 5. Determine payment time.
    const paidAt = transaction.paid_at ? new Date(transaction.paid_at) : new Date();

    if (Number.isNaN(paidAt.getTime())) {
      return response(
        {
          success: false,
          error: "Paystack returned an invalid payment date.",
        },
        400
      );
    }

    // 6. Atomically mark both records as paid — the application
    //    cannot become PAID without its payment becoming PAID too.
    await prisma.$transaction([
      prisma.authorPayment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          transactionId: transaction.id ? String(transaction.id) : reference,
          gatewayReference: reference,
          paidAt,
        },
      }),
      prisma.authorAdmission.update({
        where: { id: payment.admissionId },
        data: { status: "PAID" },
      }),
    ]);

    return response({
      success: true,
      message: "Author application payment verified successfully.",
      data: {
        admissionId: payment.admissionId,
        reference,
        amount: paidAmount,
        currency: receivedCurrency,
        status: "PAID",
        paidAt,
      },
    });
  } catch (error) {
    console.error("Author Paystack verification error:", error);

    return response(
      {
        success: false,
        error: "Unable to verify author application payment.",
      },
      500
    );
  }
}
