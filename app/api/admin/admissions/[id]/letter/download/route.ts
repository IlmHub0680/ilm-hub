import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmissionsView } from "@/lib/permissions";
import { getR2PresignedUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";

// Staff preview/download of the current letter PDF (draft or
// finalized) -- used by the Review Letter step in the admin UI.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmissionsView();

    const { id } = await params;

    const letter = await prisma.admissionLetter.findUnique({
      where: { applicationId: id },
    });

    if (!letter || !letter.pdfUrl) {
      return NextResponse.json(
        { success: false, error: "No letter has been generated yet." },
        { status: 404 }
      );
    }

    const url = await getR2PresignedUrl(letter.pdfUrl, 300);

    return NextResponse.json({
      success: true,
      data: { url, status: letter.status, version: letter.version },
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

    console.error("Admission letter download error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to open the letter of admission." },
      { status: 500 }
    );
  }
}
