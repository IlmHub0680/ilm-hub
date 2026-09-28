import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmissionsEdit } from "@/lib/permissions";
import { logAdmissionEvent } from "@/lib/admissionAudit";

export const dynamic = "force-dynamic";

// Model 16: the second of two intermediate review stages. Still NOT
// final admission -- the /decision route (Approve/Decline) is the
// only route that can move an application out of this stage.
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

    if (application.status !== "INITIAL_ACCEPTANCE") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only applications with INITIAL_ACCEPTANCE status can be moved to Pending Final Approval.",
          currentStatus: application.status,
        },
        { status: 409 }
      );
    }

    const updated = await prisma.admissionApplication.update({
      where: { id },
      data: { status: "PENDING_FINAL_APPROVAL" },
      include: { payment: true },
    });

    await logAdmissionEvent({
      applicationId: id,
      action: "PENDING_FINAL_APPROVAL",
      fromStatus: "INITIAL_ACCEPTANCE",
      toStatus: "PENDING_FINAL_APPROVAL",
      actorUserId: actor.id,
      actorName: actor.name,
    });

    return NextResponse.json({
      success: true,
      message:
        "Application moved to Pending Final Approval. This is not yet final admission.",
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

    console.error("Admissions pending-final-approval error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to move application to Pending Final Approval.",
      },
      { status: 500 }
    );
  }
}
