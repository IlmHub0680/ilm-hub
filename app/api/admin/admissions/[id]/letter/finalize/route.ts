import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmissionsEdit } from "@/lib/permissions";
import { logAdmissionEvent } from "@/lib/admissionAudit";
import { sendAdmissionLetterAvailableEmail } from "@/lib/admissionEmails";
import {
  buildAdmissionLetterPdf,
  versionStorageKey,
  storeAdmissionLetterPdf,
} from "@/lib/admissionLetter";

export const dynamic = "force-dynamic";

const REQUIRED_FIELDS = [
  { key: "intakeSession", label: "Intake / Session" },
  { key: "admissionDate", label: "Admission Date" },
  { key: "signatoryName", label: "Authorized Signatory" },
  { key: "signatoryTitle", label: "Signatory Title" },
];

// Locks the current DRAFT letter: renders the official PDF from
// exactly the fields staff have reviewed, stores it at a
// version-numbered key (never overwriting an earlier finalized
// version), and marks it FINALIZED. Once finalized, the letter is
// only editable again via the /letter route's `reopen` action, which
// archives this version first (Model 17 Sections 20-21).
export async function POST(
  _request: Request,
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
          error: "Only the Letter of Admission for an Approved application can be finalized.",
          currentStatus: application.status,
        },
        { status: 409 }
      );
    }

    const letter = await prisma.admissionLetter.findUnique({
      where: { applicationId: id },
    });

    if (!letter) {
      return NextResponse.json(
        { success: false, error: "Generate and review a draft letter before finalizing it." },
        { status: 404 }
      );
    }

    if (letter.status === "FINALIZED") {
      return NextResponse.json(
        {
          success: false,
          error: "This letter is already finalized. Reopen it first to issue a correction.",
        },
        { status: 409 }
      );
    }

    const missing = REQUIRED_FIELDS.filter((f) => !letter[f.key]).map((f) => f.label);
    if (missing.length) {
      return NextResponse.json(
        {
          success: false,
          error: `Complete the following before finalizing: ${missing.join(", ")}.`,
        },
        { status: 400 }
      );
    }

    const pdfBuffer = buildAdmissionLetterPdf({ application, letter });
    const key = versionStorageKey(id, letter.version);
    await storeAdmissionLetterPdf(key, pdfBuffer);

    const finalized = await prisma.admissionLetter.update({
      where: { applicationId: id },
      data: {
        status: "FINALIZED",
        pdfUrl: key,
        finalizedByStaffId: actor.id,
        finalizedByName: actor.name,
        finalizedAt: new Date(),
      },
    });

    await logAdmissionEvent({
      applicationId: id,
      action: "LETTER_FINALIZED",
      actorUserId: actor.id,
      actorName: actor.name,
      note: `Finalized v${finalized.version}`,
    });

    const emailResult = await sendAdmissionLetterAvailableEmail({
      to: application.email,
      applicantName: application.fullName,
      applicationNumber: application.applicationNumber,
    });

    return NextResponse.json({
      success: true,
      message: "Letter of Admission finalized.",
      data: finalized,
      emailSent: emailResult.sent,
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

    console.error("Admission letter finalize error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to finalize the letter of admission." },
      { status: 500 }
    );
  }
}
