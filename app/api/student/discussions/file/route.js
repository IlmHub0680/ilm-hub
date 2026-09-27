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

// Resolves a presigned download link for either an instructor's exercise
// attachment or a student's submission file — never exposing the raw R2
// key directly to the client. Access is gated by course enrollment; a
// submission file is visible to any enrolled student (peer visibility),
// same as the submission's text answer.
export async function GET(request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!id || (type !== "attachment" && type !== "submission")) {
      return errorResponse("Invalid request.", 400);
    }

    if (type === "attachment") {
      const discussion = await prisma.discussion.findUnique({ where: { id } });
      if (!discussion || !discussion.attachmentUrl) {
        return errorResponse("No file on this discussion.", 404);
      }
      const enrolled = await assertEnrolled(user.id, discussion.courseId);
      if (!enrolled) {
        return errorResponse("You are not enrolled in this course.", 403);
      }
      const url = await getR2PresignedUrl(discussion.attachmentUrl, 300);
      return NextResponse.json({ success: true, url });
    }

    const submission = await prisma.exerciseSubmission.findUnique({
      where: { id },
      include: { discussion: true },
    });
    if (!submission || !submission.fileUrl) {
      return errorResponse("No file on this submission.", 404);
    }
    const enrolled = await assertEnrolled(user.id, submission.discussion.courseId);
    if (!enrolled) {
      return errorResponse("You are not enrolled in this course.", 403);
    }
    const url = await getR2PresignedUrl(submission.fileUrl, 300);
    return NextResponse.json({ success: true, url });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required.", 401);
    }
    console.error("Discussion file resolve error:", error);
    return errorResponse("Unable to open this file.", 500);
  }
}
