import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// A student's answer to an exercise — inline text, an uploaded file
// (already staged via /api/student/discussions/upload, key passed here),
// or both. Resubmitting before the deadline replaces the previous
// answer (upsert) rather than creating a second row.
export async function POST(request, { params }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await request.json();
    const { answerText, fileKey } = body;

    const discussion = await prisma.discussion.findUnique({ where: { id } });
    if (!discussion) {
      return errorResponse("Discussion not found.", 404);
    }
    if (!discussion.isExercise) {
      return errorResponse("This discussion is not an exercise.", 400);
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: discussion.courseId } },
    });
    if (!enrollment || enrollment.status !== "APPROVED") {
      return errorResponse("You are not enrolled in this course.", 403);
    }

    if (discussion.deadline && new Date() > new Date(discussion.deadline)) {
      return errorResponse("The deadline for this exercise has passed.", 400);
    }

    const text = typeof answerText === "string" ? answerText.trim() : "";
    const key = typeof fileKey === "string" && fileKey ? fileKey : null;

    if (!text && !key) {
      return errorResponse("Write an answer or attach a file before submitting.", 400);
    }

    const submission = await prisma.exerciseSubmission.upsert({
      where: { discussionId_studentId: { discussionId: id, studentId: user.id } },
      update: { answerText: text || null, fileUrl: key },
      create: {
        discussionId: id,
        studentId: user.id,
        answerText: text || null,
        fileUrl: key,
      },
    });

    return NextResponse.json({ success: true, submission: { ...submission, fileUrl: submission.fileUrl ? true : null } });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required.", 401);
    }
    console.error("Exercise submission error:", error);
    return errorResponse("Unable to submit your answer.", 500);
  }
}
