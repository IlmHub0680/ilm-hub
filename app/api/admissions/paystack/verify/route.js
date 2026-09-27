import { prisma } from "@/lib/prisma";

function response(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function normalizeString(value) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

export async function POST(request) {
  try {
    const body = await request.json();

    const reference =
      normalizeString(body.reference);

    const applicationId =
      normalizeString(body.applicationId);

    if (!reference) {
      return response(
        {
          success: false,
          error:
            "Payment reference is required.",
        },
        400
      );
    }

    const secretKey =
      process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return response(
        {
          success: false,
          error:
            "Paystack is not configured.",
        },
        500
      );
    }

    /*
     * Find the payment by Paystack's reference.
     *
     * If applicationId was supplied, it must also match.
     */
    const payment =
      await prisma.admissionPayment.findFirst({
        where: {
          gateway: "PAYSTACK",
          gatewayReference: reference,

          ...(applicationId
            ? {
                applicationId,
              }
            : {}),
        },

        include: {
          application: true,
        },
      });

    if (!payment) {
      return response(
        {
          success: false,
          error:
            "Admission payment transaction not found.",
        },
        404
      );
    }

    /*
     * Never allow a reference belonging to one
     * application to verify another application.
     */
    if (
      applicationId &&
      payment.applicationId !== applicationId
    ) {
      return response(
        {
          success: false,
          error:
            "Payment reference does not belong to this admission application.",
        },
        400
      );
    }

    /*
     * Idempotency:
     *
     * If the payment was already successfully verified,
     * return the stored result instead of unnecessarily
     * changing the payment again.
     */
    if (payment.status === "PAID") {
      return response({
        success: true,
        message:
          "Admission payment has already been verified.",
        data: {
          applicationId:
            payment.applicationId,

          applicationNumber:
            payment.application.applicationNumber,

          reference:
            payment.gatewayReference,

          amount:
            Number(payment.amount),

          currency:
            payment.currencyCode,

          status: "PAID",

          paidAt:
            payment.paidAt,
        },
      });
    }

    /*
     * Verify directly against Paystack.
     */
    let verifyResponse;

    try {
      verifyResponse =
        await fetch(
          `https://api.paystack.co/transaction/verify/${encodeURIComponent(
            reference
          )}`,
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${secretKey}`,
              "Content-Type":
                "application/json",
            },
            cache: "no-store",
          }
        );
    } catch (verifyError) {
      console.error(
        "Paystack verification network error:",
        verifyError
      );

      return response(
        {
          success: false,
          error:
            "Unable to connect to Paystack to verify the payment.",
        },
        502
      );
    }

    let result;

    try {
      result =
        await verifyResponse.json();
    } catch {
      result = null;
    }

    if (
      !verifyResponse.ok ||
      !result?.status ||
      !result?.data
    ) {
      console.error(
        "Paystack verification failed:",
        {
          status: verifyResponse.status,
          result,
          reference,
          applicationId:
            payment.applicationId,
        }
      );

      return response(
        {
          success: false,
          error:
            result?.message ||
            "Unable to verify payment.",
        },
        400
      );
    }

    const transaction =
      result.data;

    /*
     * 1. The returned Paystack reference MUST be
     *    exactly the reference we verified.
     */
    if (
      normalizeString(
        transaction.reference
      ) !== reference
    ) {
      console.error(
        "Paystack reference mismatch:",
        {
          suppliedReference: reference,
          returnedReference:
            transaction.reference,
        }
      );

      return response(
        {
          success: false,
          error:
            "Payment verification failed because the transaction reference does not match.",
        },
        400
      );
    }

    /*
     * 2. The transaction itself must be successful.
     */
    if (
      transaction.status !== "success"
    ) {
      /*
       * We only mark it FAILED for a definitive
       * non-successful transaction response.
       */
      await prisma.admissionPayment.update({
        where: {
          id: payment.id,
        },

        data: {
          status: "FAILED",

          transactionId:
            transaction.id
              ? String(transaction.id)
              : reference,
        },
      });

      return response(
        {
          success: false,
          error:
            "Payment was not successful.",
        },
        400
      );
    }

    /*
     * 3. Verify Paystack metadata when available.
     *
     * Metadata is additional protection against a
     * payment being associated with the wrong application.
     */
    const metadata =
      transaction.metadata || {};

    const metadataApplicationId =
      normalizeString(
        metadata.applicationId
      );

    if (
      metadataApplicationId &&
      metadataApplicationId !==
        payment.applicationId
    ) {
      console.error(
        "Paystack application metadata mismatch:",
        {
          reference,
          expectedApplicationId:
            payment.applicationId,
          receivedApplicationId:
            metadataApplicationId,
        }
      );

      return response(
        {
          success: false,
          error:
            "Payment verification failed because the transaction does not belong to this admission application.",
        },
        400
      );
    }

    /*
     * 4. Compare the actual amount paid with the
     *    amount stored in AdmissionPayment.
     *
     * AdmissionPayment.amount is deliberately the
     * Paystack amount, NOT the original USD application fee.
     */
    const expectedAmount =
      Number(payment.amount);

    const paidAmountMinor =
      Number(transaction.amount || 0);

    if (
      !Number.isFinite(expectedAmount) ||
      expectedAmount <= 0
    ) {
      console.error(
        "Invalid stored admission payment amount:",
        {
          paymentId: payment.id,
          expectedAmount,
        }
      );

      return response(
        {
          success: false,
          error:
            "Stored admission payment amount is invalid.",
        },
        500
      );
    }

    if (
      !Number.isFinite(paidAmountMinor) ||
      paidAmountMinor <= 0
    ) {
      return response(
        {
          success: false,
          error:
            "Paystack returned an invalid payment amount.",
        },
        400
      );
    }

    const paidAmount =
      paidAmountMinor / 100;

    /*
     * Currency must be exactly the currency that
     * was initialized with Paystack.
     */
    const expectedCurrency =
      normalizeString(
        payment.currencyCode
      ).toUpperCase();

    const receivedCurrency =
      normalizeString(
        transaction.currency
      ).toUpperCase();

    const amountsMatch =
      Math.abs(
        paidAmount - expectedAmount
      ) < 0.01;

    const currencyMatches =
      receivedCurrency ===
      expectedCurrency;

    if (
      !amountsMatch ||
      !currencyMatches
    ) {
      console.error(
        "Admission payment mismatch:",
        {
          reference,

          paymentId:
            payment.id,

          applicationId:
            payment.applicationId,

          expectedAmount,

          paidAmount,

          expectedCurrency,

          receivedCurrency,

          transactionId:
            transaction.id,
        }
      );

      /*
       * Mark the payment failed because the transaction
       * Paystack returned cannot satisfy the amount/currency
       * that this application was initialized for.
       */
      await prisma.admissionPayment.update({
        where: {
          id: payment.id,
        },

        data: {
          status: "FAILED",

          transactionId:
            transaction.id
              ? String(transaction.id)
              : reference,
        },
      });

      return response(
        {
          success: false,
          error:
            "Payment verification failed because the amount or currency does not match the application fee.",
        },
        400
      );
    }

    /*
     * 5. Determine payment time.
     */
    const paidAt =
      transaction.paid_at
        ? new Date(transaction.paid_at)
        : new Date();

    if (
      Number.isNaN(
        paidAt.getTime()
      )
    ) {
      return response(
        {
          success: false,
          error:
            "Paystack returned an invalid payment date.",
        },
        400
      );
    }

    /*
     * 6. Atomically mark BOTH records as paid.
     *
     * The application cannot become PAID without
     * its payment becoming PAID in the same transaction.
     */
    await prisma.$transaction([
      prisma.admissionPayment.update({
        where: {
          id: payment.id,
        },

        data: {
          status: "PAID",

          transactionId:
            transaction.id
              ? String(transaction.id)
              : reference,

          gatewayReference:
            reference,

          paidAt,
        },
      }),

      prisma.admissionApplication.update({
        where: {
          id: payment.applicationId,
        },

        data: {
          status: "PAID",
          paidAt,
        },
      }),
    ]);

    return response({
      success: true,

      message:
        "Admission payment verified successfully.",

      data: {
        applicationId:
          payment.applicationId,

        applicationNumber:
          payment.application.applicationNumber,

        reference,

        amount:
          paidAmount,

        currency:
          receivedCurrency,

        status: "PAID",

        paidAt,
      },
    });
  } catch (error) {
    console.error(
      "Admission Paystack verification error:",
      error
    );

    return response(
      {
        success: false,
        error:
          "Unable to verify admission payment.",
      },
      500
    );
  }
}
