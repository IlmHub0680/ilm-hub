import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmissionsView } from "@/lib/permissions";

export const dynamic = "force-dynamic";

// Staff-facing audit/history trail for one application -- every status
// transition and note-worthy action already written by
// lib/admissionAudit.ts's logAdmissionEvent, surfaced here for the
// first time (Model 17 Sections 10, 15, 35: decisions must be
// auditable, not just recorded silently in the database).
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmissionsView();

    const { id } = await params;

    const application = await prisma.admissionApplication.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Admission application not found." },
        { status: 404 }
      );
    }

    const logs = await prisma.admissionAuditLog.findMany({
      where: { applicationId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: logs });
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
          { success: false, error: "Admissions access required." },
          { status: 403 }
        );
      }
    }

    console.error("Admission audit log error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to load the application history." },
      { status: 500 }
    );
  }
}
