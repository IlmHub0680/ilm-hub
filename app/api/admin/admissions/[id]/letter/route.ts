import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmissionsView, requireAdmissionsEdit } from "@/lib/permissions";
import { logAdmissionEvent } from "@/lib/admissionAudit";
import {
  buildAdmissionLetterPdf,
  draftStorageKey,
  storeAdmissionLetterPdf,
} from "@/lib/admissionLetter";

export const dynamic = "force-dynamic";

function str(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

// Staff-facing: current Letter of Admission for this application (or
// null if none has been started yet), plus sensible defaults pulled
// from the real application/programme data for a first draft. Never
// reachable by the applicant -- the applicant-facing route
// (/api/admissions/track/letter) only ever returns a presigned URL to
// the current FINALIZED pdf, never this record.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmissionsView();

    const { id } = await params;

    const application = await prisma.admissionApplication.findUnique({
      where: { id },
      include: { program: { include: { department: true } } },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Admission application not found." },
        { status: 404 }
      );
    }

    const letter = await prisma.admissionLetter.findUnique({
      where: { applicationId: id },
    });

    return NextResponse.json({
      success: true,
      data: letter,
      applicationStatus: application.status,
      defaults: {
        programmeText: application.program?.nameEn || application.programName || "",
        departmentText: application.program?.department?.nameEn || "",
        qualificationText: application.programLevel || "",
        intakeSession: application.studySession || "",
      },
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
          { success: false, error: "Admissions access required." },
          { status: 403 }
        );
      }
    }

    console.error("Admission letter fetch error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to load the letter of admission." },
      { status: 500 }
    );
  }
}

// Create or update the DRAFT letter for this application. A letter can
// only be prepared once the application itself has reached APPROVED --
// Initial Acceptance / Pending Final Approval are explicitly not final
// (Model 17 Section 8), so no letter may be generated at those stages.
//
// If the letter has already been FINALIZED, this route refuses the
// edit unless `reopen: true` is passed -- reopening archives the
// current finalized version into `previousVersions` and moves the
// letter back to DRAFT (bumping `version`) so a correction is
// traceable rather than a silent overwrite (Model 17 Sections 12, 21).
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireAdmissionsEdit();

    const { id } = await params;

    const application = await prisma.admissionApplication.findUnique({
      where: { id },
      include: { program: { include: { department: true } } },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Admission application not found." },
        { status: 404 }
      );
    }

    if (application.status !== "APPROVED") {
      return NextResponse.json(
        {
          success: false,
          error:
            "A Letter of Admission can only be prepared once the application has been Approved.",
          currentStatus: application.status,
        },
        { status: 409 }
      );
    }

    const body = await request.json();

    let existing = await prisma.admissionLetter.findUnique({
      where: { applicationId: id },
    });

    if (existing && existing.status === "FINALIZED") {
      if (!body.reopen) {
        return NextResponse.json(
          {
            success: false,
            error:
              "This letter has already been finalized. Reopen it to make a correction.",
            status: "FINALIZED",
          },
          { status: 409 }
        );
      }

      const history = Array.isArray(existing.previousVersions)
        ? existing.previousVersions
        : [];
      history.push({
        version: existing.version,
        pdfUrl: existing.pdfUrl,
        finalizedAt: existing.finalizedAt,
        finalizedByName: existing.finalizedByName,
      });

      existing = await prisma.admissionLetter.update({
        where: { applicationId: id },
        data: {
          status: "DRAFT",
          version: { increment: 1 },
          previousVersions: history,
        },
      });

      await logAdmissionEvent({
        applicationId: id,
        action: "LETTER_REOPENED",
        actorUserId: actor.id,
        actorName: actor.name,
        note: `Reopened for correction (now drafting v${existing.version})`,
      });
    }

    const fields = {
      programmeText:
        str(body.programmeText) ||
        application.program?.nameEn ||
        application.programName ||
        null,
      departmentText:
        str(body.departmentText) || application.program?.department?.nameEn || null,
      qualificationText: str(body.qualificationText) || application.programLevel || null,
      intakeSession: str(body.intakeSession) || application.studySession || null,
      admissionDate: body.admissionDate ? new Date(body.admissionDate) : null,
      conditions: str(body.conditions),
      signatoryName: str(body.signatoryName),
      signatoryTitle: str(body.signatoryTitle),
    };

    const wasNew = !existing;

    let letter = await prisma.admissionLetter.upsert({
      where: { applicationId: id },
      create: {
        applicationId: id,
        ...fields,
        generatedByStaffId: actor.id,
        generatedByName: actor.name,
      },
      update: fields,
    });

    // Best-effort preview PDF -- lets staff review the letter exactly
    // as it will look before finalizing. A render/storage failure here
    // must not block saving the draft fields themselves.
    try {
      const pdfBuffer = buildAdmissionLetterPdf({ application, letter });
      const key = draftStorageKey(id);
      await storeAdmissionLetterPdf(key, pdfBuffer);
      letter = await prisma.admissionLetter.update({
        where: { applicationId: id },
        data: { pdfUrl: key },
      });
    } catch (renderError) {
      console.error("Admission letter preview render error:", renderError);
    }

    await logAdmissionEvent({
      applicationId: id,
      action: wasNew ? "LETTER_DRAFT_CREATED" : "LETTER_DRAFT_UPDATED",
      actorUserId: actor.id,
      actorName: actor.name,
    });

    return NextResponse.json({ success: true, data: letter });
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

    console.error("Admission letter save error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to save the letter of admission." },
      { status: 500 }
    );
  }
}
