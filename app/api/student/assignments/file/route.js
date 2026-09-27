import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getR2PresignedUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

async function assertEnrolled(userId, courseId) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  return !!enrollment && enrollment.status === "APPROVED";
}

// Resolves a presigned download link for an assignment's instructor
// attachment — never exposing the raw R2 key directly. Gated by course
// enrollment, same convention as the Section Discussion file resolver.
export async function GET(request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!id || type !== "attachment") {
      return errorResponse("Invalid request.", 400);
    }

    const assignment = await prisma.assignment.findUnique({ where: { id } });
    if (!assignment || !assignment.attachmentUrl) {
      return errorResponse("No file on this assignment.", 404);
    }

    const enrolled = await assertEnrolled(user.id, assignment.courseId);
    if (!enrolled) {
      return errorResponse("You are not enrolled in this course.", 403);
    }

    const url = await getR2PresignedUrl(assignment.attachmentUrl, 300);
    return NextResponse.json({ success: true, url });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required.", 401);
    }
    console.error("Assignment file resolve error:", error);
    return errorResponse("Unable to open this file.", 500);
  }
}
