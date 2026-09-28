import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmissionsView, requireAdmissionsEdit } from "@/lib/permissions";
import { logAdmissionEvent } from "@/lib/admissionAudit";

export const dynamic = "force-dynamic";

// Staff-facing notes list -- both Internal and Applicant-Visible notes,
// clearly labeled. Never call this from an applicant-facing route; the
// public tracking route (/api/admissions/track) fetches
// APPLICANT_VISIBLE notes on its own with a separate, narrower query.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmissionsView();

    const { id } = await params;

    const notes = await prisma.admissionNote.findMany({
      where: { applicationId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: notes });
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

    console.error("Admission notes list error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to load notes." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireAdmissionsEdit();

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

    const body = await request.json();

    const note =
      typeof body.note === "string" ? body.note.trim().slice(0, 4000) : "";

    if (!note) {
      return NextResponse.json(
        { success: false, error: "Note text is required." },
        { status: 400 }
      );
    }

    const visibility =
      body.visibility === "APPLICANT_VISIBLE"
        ? "APPLICANT_VISIBLE"
        : "INTERNAL";

    const created = await prisma.admissionNote.create({
      data: {
        applicationId: id,
        visibility,
        note,
        authorStaffId: actor.id,
        authorName: actor.name,
      },
    });

    await logAdmissionEvent({
      applicationId: id,
      action: visibility === "APPLICANT_VISIBLE" ? "NOTE_APPLICANT_VISIBLE" : "NOTE_INTERNAL",
      actorUserId: actor.id,
      actorName: actor.name,
      note,
    });

    return NextResponse.json({ success: true, data: created });
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

    console.error("Admission note create error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to add note." },
      { status: 500 }
    );
  }
}
