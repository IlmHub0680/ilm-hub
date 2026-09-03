import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(
  _req,
  { params }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    if (!id?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Application ID is required.",
        },
        { status: 400 }
      );
    }

    const application =
      await prisma.admissionApplication.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          applicationNumber: true,
          fullName: true,
          email: true,
          status: true,
          paidAt: true,
          payment: {
            select: {
              status: true,
              paidAt: true,
            },
          },
        },
      });

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          error: "Student admission application not found.",
        },
        { status: 404 }
      );
    }

    if (application.status === "APPROVED") {
      return NextResponse.json(
        {
          success: false,
          error: "This admission application has already been approved.",
        },
        { status: 409 }
      );
    }

    if (application.status === "REJECTED") {
      return NextResponse.json(
        {
          success: false,
          error: "A rejected application cannot be approved.",
        },
        { status: 409 }
      );
    }

    if (!application.payment) {
      return NextResponse.json(
        {
          success: false,
          error: "Admission payment has not been created.",
        },
        { status: 409 }
      );
    }

    if (application.payment.status !== "PAID") {
      return NextResponse.json(
        {
          success: false,
          error: "Admission payment has not been confirmed.",
        },
        { status: 409 }
      );
    }

    if (
      application.status !== "PAID" &&
      application.status !== "UNDER_REVIEW"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Application cannot be approved from status ${application.status}.`,
        },
        { status: 409 }
      );
    }

    const approvedApplication =
      await prisma.admissionApplication.update({
        where: {
          id: application.id,
        },
        data: {
          status: "APPROVED",
        },
        select: {
          id: true,
          applicationNumber: true,
          fullName: true,
          email: true,
          status: true,
          paidAt: true,
          updatedAt: true,
        },
      });

    return NextResponse.json({
      success: true,
      message: "Student admission application approved successfully.",
      data: approvedApplication,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json(
          {
            success: false,
            error: "Authentication required.",
          },
          { status: 401 }
        );
      }

      if (error.message === "FORBIDDEN") {
        return NextResponse.json(
          {
            success: false,
            error: "Administrator access required.",
          },
          { status: 403 }
        );
      }
    }

    console.error("Approve student admission error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to approve student admission application.",
      },
      { status: 500 }
    );
  }
}
