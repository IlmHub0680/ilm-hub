import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmissionsEdit } from "@/lib/permissions";
import { logAdmissionEvent } from "@/lib/admissionAudit";

export const dynamic = "force-dynamic";

// Model 16: the first of two intermediate review stages between
// Under Review and Approved. Reaching this stage is NOT final
// admission -- see app/admission/track/page.jsx and the applicant
// tracking route, which both say so explicitly.
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

    if (application.status !== "UNDER_REVIEW") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only applications with UNDER_REVIEW status can be moved to Initial Acceptance.",
          currentStatus: application.status,
        },
        { status: 409 }
      );
    }

    const updated = await prisma.admissionApplication.update({
      where: { id },
      data: { status: "INITIAL_ACCEPTANCE" },
      include: { payment: true },
    });

    await logAdmissionEvent({
      applicationId: id,
      action: "INITIAL_ACCEPTANCE",
      fromStatus: "UNDER_REVIEW",
      toStatus: "INITIAL_ACCEPTANCE",
      actorUserId: actor.id,
      actorName: actor.name,
    });

    return NextResponse.json({
      success: true,
      message:
        "Application moved to Initial Acceptance. This is not yet final admission.",
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

    console.error("Admissions initial-acceptance error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to move application to Initial Acceptance." },
      { status: 500 }
    );
  }
}
