import { prisma } from "@/lib/prisma";

function response(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function POST(request) {
  try {
    const body = await request.json();

    const reference =
      typeof body.reference === "string"
        ? body.reference.trim()
        : "";

    const applicationId =
      typeof body.applicationId === "string"
        ? body.applicationId.trim()
        : "";

    if (!reference) {
      return response(
        {
          success: false,
          error: "Payment reference is required.",
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
          error: "Paystack is not configured.",
        },
        500
      );
    }

    const payment =
      await prisma.admissionPayment.findFirst({
        where: {
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

    const verifyResponse =
      await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(
          reference
        )}`,
        {
          headers: {
            Authorization:
              `Bearer ${secretKey}`,
          },
        }
      );

    const result =
      await verifyResponse.json();

    if (
      !verifyResponse.ok ||
      !result.status ||
      !result.data
    ) {
      return response(
        {
          success: false,
          error:
            result.message ||
            "Unable to verify payment.",
        },
        400
      );
    }

    const transaction =
      result.data;

    if (transaction.status !== "success") {
      await prisma.admissionPayment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: "FAILED",
          transactionId:
            String(
              transaction.id || reference
            ),
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

    const expectedAmount =
      Number(payment.amount);

    const paidAmount =
      Number(transaction.amount || 0) /
      100;

    const expectedCurrency =
      payment.currencyCode;

    const receivedCurrency =
      transaction.currency;

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
        "Admission payment mismatch",
        {
          reference,
          expectedAmount,
          paidAmount,
          expectedCurrency,
          receivedCurrency,
        }
      );

      await prisma.admissionPayment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: "FAILED",
          transactionId:
            String(
              transaction.id || reference
            ),
        },
      });

      return response(
        {
          success: false,
          error:
            "Payment verification failed because the amount or currency does not match the admission fee.",
        },
        400
      );
    }

    const paidAt =
      transaction.paid_at
        ? new Date(
            transaction.paid_at
          )
        : new Date();

    const updated =
      await prisma.$transaction([
        prisma.admissionPayment.update({
          where: {
            id: payment.id,
          },
          data: {
            status: "PAID",
            transactionId:
              String(
                transaction.id ||
                reference
              ),
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
          payment.application
            .applicationNumber,
        reference,
        amount: paidAmount,
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
