import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

function response(data, status = 200) {
  return NextResponse.json(data, { status });
}

export async function POST(request) {
  try {
    const body = await request.json();

    const applicationId =
      typeof body.applicationId === "string"
        ? body.applicationId.trim()
        : "";

    if (!applicationId) {
      return response(
        {
          success: false,
          error: "Application ID is required.",
        },
        400
      );
    }

    const application =
      await prisma.admissionApplication.findUnique({
        where: {
          id: applicationId,
        },
        include: {
          payment: true,
        },
      });

    if (!application) {
      return response(
        {
          success: false,
          error: "Admission application not found.",
        },
        404
      );
    }

    if (
      application.status === "PAID" ||
      application.status === "UNDER_REVIEW" ||
      application.status === "INITIAL_ACCEPTANCE" ||
      application.status === "PENDING_FINAL_APPROVAL" ||
      application.status === "APPROVED"
    ) {
      return response({
        success: true,
        data: {
          applicationId,
          applicationNumber:
            application.applicationNumber,
          status: application.status,
        },
      });
    }

    const transferReference =
      `BANK-${Date.now()}-${crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase()}`;

    const payment =
      application.payment
        ? await prisma.admissionPayment.update({
            where: {
              id: application.payment.id,
            },
            data: {
              method:
                "BANK_TRANSFER",
              status: "PENDING",
              checkoutReference:
                transferReference,
            },
          })
        : await prisma.admissionPayment.create({
            data: {
              applicationId,
              gateway: "PAYSTACK",
              method:
                "BANK_TRANSFER",
              status: "PENDING",
              amount:
                application.admissionFee,
              currencyCode:
                application.currencyCode,
              checkoutReference:
                transferReference,
            },
          });

    return response({
      success: true,
      message:
        "Bank transfer instructions generated. Payment remains pending until verified by the admissions team.",
      data: {
        applicationId,
        applicationNumber:
          application.applicationNumber,
        transferReference,
        amount:
          Number(application.admissionFee),
        currency:
          application.currencyCode,
        status: "PENDING_PAYMENT",
        paymentId: payment.id,
      },
    });
  } catch (error) {
    console.error(
      "Bank transfer admission error:",
      error
    );

    return response(
      {
        success: false,
        error:
          "Unable to create bank transfer request.",
      },
      500
    );
  }
}
