import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Application ID is required." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const decision =
      typeof body.decision === "string"
        ? body.decision.trim().toUpperCase()
        : "";

    if (!["APPROVED", "REJECTED"].includes(decision)) {
      return NextResponse.json(
        {
          success: false,
          error: "Decision must be APPROVED or REJECTED.",
        },
        { status: 400 }
      );
    }

    const application = await prisma.admissionApplication.findUnique({
      where: { id },
      include: { payment: true },
    });

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          error: "Admission application not found.",
        },
        { status: 404 }
      );
    }

    if (application.status !== "UNDER_REVIEW") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only applications with UNDER_REVIEW status can be approved or rejected.",
          currentStatus: application.status,
        },
        { status: 409 }
      );
    }

    if (!application.payment || application.payment.status !== "PAID") {
      return NextResponse.json(
        {
          success: false,
          error:
            "The admission payment must be verified before making an admission decision.",
        },
        { status: 409 }
      );
    }

    /*
     * REJECTION:
     * Only update the admission application.
     * Never create a student account.
     */
    if (decision === "REJECTED") {
      const updated = await prisma.admissionApplication.update({
        where: { id },
        data: { status: "REJECTED" },
        include: { payment: true },
      });

      return NextResponse.json({
        success: true,
        message: "Student admission rejected successfully.",
        data: updated,
      });
    }

    /*
     * APPROVAL:
     * Create or reuse the real User account so the applicant
     * becomes visible in Student Management and can use the
     * normal student login.
     */
    const result = await prisma.$transaction(async (tx) => {
      let user = await tx.user.findUnique({
        where: { email: application.email },
      });

      if (!user) {
        const temporaryPassword = crypto.randomBytes(16).toString("hex");

        user = await tx.user.create({
          data: {
            id: crypto.randomUUID(),
            name: application.fullName,
            email: application.email,
            passwordHash:
              application.passwordHash || temporaryPassword,
            role: "STUDENT",
          },
        });
      } else if (user.role !== "STUDENT") {
        user = await tx.user.update({
          where: { id: user.id },
          data: {
            role: "STUDENT",
            name: application.fullName,
          },
        });
      }

      const updatedApplication =
        await tx.admissionApplication.update({
          where: { id },
          data: { status: "APPROVED" },
          include: { payment: true },
        });

      return {
        user,
        application: updatedApplication,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Student admission approved and student account created successfully.",
      data: {
        application: result.application,
        student: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        },
      },
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

    console.error("Admin admission decision error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to update admission decision.",
      },
      { status: 500 }
    );
  }
}
