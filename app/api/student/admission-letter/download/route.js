import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getR2PresignedUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// Same download once a student is logged in to the portal, for anyone
// who no longer has their original application number handy. Looked
// up by the account's own email against the approved application --
// AdmissionApplication has no direct userId/studentId link (it predates
// the account), the same way the approval step itself matches by email
// (see the decision route).
export async function GET() {
  try {
    const user = await requireUser();

    const application = await prisma.admissionApplication.findFirst({
      where: { email: user.email, status: "APPROVED" },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    });

    if (!application) {
      return errorResponse("No approved admission application was found for your account.", 404);
    }

    const letter = await prisma.admissionLetter.findUnique({
      where: { applicationId: application.id },
    });

    if (!letter || letter.status !== "FINALIZED" || !letter.pdfUrl) {
      return errorResponse("Your Letter of Admission has not been issued yet.", 404);
    }

    const url = await getR2PresignedUrl(letter.pdfUrl, 300);

    return NextResponse.json({ success: true, url });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required.", 401);
    }

    console.error("Student admission letter download error:", error);

    return errorResponse(
      error instanceof Error ? error.message : "Unable to generate a download link.",
      500
    );
  }
}
