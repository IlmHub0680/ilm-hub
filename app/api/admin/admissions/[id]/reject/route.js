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
          error: "An approved application cannot be rejected.",
        },
        { status: 409 }
      );
    }

    if (application.status === "REJECTED") {
      return NextResponse.json(
        {
          success: false,
          error: "This admission application has already been rejected.",
        },
        { status: 409 }
      );
    }

    if (application.status === "PENDING_PAYMENT") {
      return NextResponse.json(
        {
          success: false,
          error: "An unpaid application cannot be rejected through the review workflow.",
        },
        { status: 409 }
      );
    }

    const rejectedApplication =
      await prisma.admissionApplication.update({
        where: {
          id: application.id,
        },
        data: {
          status: "REJECTED",
        },
        select: {
          id: true,
          applicationNumber: true,
          fullName: true,
          email: true,
          status: true,
          updatedAt: true,
        },
      });

    return NextResponse.json({
      success: true,
      message: "Student admission application rejected successfully.",
      data: rejectedApplication,
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

    console.error("Reject student admission error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to reject student admission application.",
      },
      { status: 500 }
    );
  }
}
