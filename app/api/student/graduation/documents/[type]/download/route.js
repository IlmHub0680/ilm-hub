import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getR2PresignedUrl } from "@/lib/r2";
import {
  ensureGraduationDocument,
  GRADUATION_DOCUMENT_META,
} from "@/lib/graduationDocuments";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(request, { params }) {
  try {
    const user = await requireUser();
    const { type } = await params;
    const docType = String(type || "").toUpperCase();

    if (!GRADUATION_DOCUMENT_META[docType]) {
      return errorResponse("Unknown document type.", 400);
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
    });

    if (!student) {
      return errorResponse("Only students can access graduation documents.", 403);
    }

    const application = await prisma.graduationApplication.findUnique({
      where: { studentId: student.id },
    });

    if (!application || application.status !== "COMPLETED") {
      return errorResponse(
        "This document is only available once your graduation is completed.",
        404
      );
    }

    const doc = await ensureGraduationDocument(application.id, docType);
    const url = await getR2PresignedUrl(doc.pdfUrl, 300);

    return NextResponse.json({ success: true, url });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required.", 401);
    }

    console.error("Graduation document download error:", error);

    return errorResponse(
      error instanceof Error ? error.message : "Unable to generate download link.",
      500
    );
  }
}
