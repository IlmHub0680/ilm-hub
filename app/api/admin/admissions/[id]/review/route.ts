import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmissionsEdit } from "@/lib/permissions";
import { logAdmissionEvent } from "@/lib/admissionAudit";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireAdmissionsEdit();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Application ID is required." },
        { status: 400 }
      );
    }

    const application = await prisma.admissionApplication.findUnique({
      where: { id },
      include: { payment: true },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Admission application not found." },
        { status: 404 }
      );
    }

    if (application.status !== "PAID") {
      return NextResponse.json(
        {
          success: false,
          error: "Only applications with verified PAID status can be moved to review.",
          currentStatus: application.status,
        },
        { status: 409 }
      );
    }

    if (!application.payment || application.payment.status !== "PAID") {
      return NextResponse.json(
        {
          success: false,
          error: "The admission payment must be verified before reviewing this application.",
        },
        { status: 409 }
      );
    }

    const updated = await prisma.admissionApplication.update({
      where: { id },
      data: { status: "UNDER_REVIEW" },
      include: { payment: true },
    });

    await logAdmissionEvent({
      applicationId: id,
      action: "MOVED_TO_REVIEW",
      fromStatus: "PAID",
      toStatus: "UNDER_REVIEW",
      actorUserId: actor.id,
      actorName: actor.name,
    });

    return NextResponse.json({
      success: true,
      message: "Admission application moved to review.",
      data: updated,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json(
          { success: false, error: "Authentication required." },
          { status: 401 }
        );
      }
      if (error.message === "FORBIDDEN") {
        return NextResponse.json(
          { success: false, error: "Admissions edit access required." },
          { status: 403 }
        );
      }
    }

    console.error("Admissions review error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to move admission application to review." },
      { status: 500 }
    );
  }
}