import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireInstructor, requireInstructorEdit } from "@/lib/auth";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

async function assertAssigned(instructorId, courseId) {
  const assignment = await prisma.instructorCourse.findUnique({
    where: { instructorId_courseId: { instructorId, courseId } },
  });
  return !!assignment;
}

export async function GET(request, { params }) {
  try {
    const user = await requireInstructor();
    const { id } = await params;

    const discussion = await prisma.discussion.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, role: true } },
        course: { select: { id: true, titleEn: true, courseCode: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: { author: { select: { id: true, name: true, role: true } } },
        },
      },
    });

    if (!discussion) {
      return errorResponse("Discussion not found.", 404);
    }

    const assigned = await assertAssigned(user.id, discussion.courseId);
    if (!assigned) {
      return errorResponse("You are not assigned to this course.", 403);
    }

    let submissions = null;
    if (discussion.isExercise) {
      const rows = await prisma.exerciseSubmission.findMany({
        where: { discussionId: id },
        orderBy: { submittedAt: "asc" },
        include: { student: { select: { id: true, name: true } } },
      });
      submissions = rows.map((s) => ({
        id: s.id,
        student: s.student,
        answerText: s.answerText,
        fileUrl: s.fileUrl ? true : null,
        submittedAt: s.submittedAt,
        updatedAt: s.updatedAt,
        feedback: s.feedback,
      }));
    }

    return NextResponse.json({
      success: true,
      discussion: {
        id: discussion.id,
        title: discussion.title,
        body: discussion.body,
        isExercise: discussion.isExercise,
        deadline: discussion.deadline,
        attachmentUrl: discussion.attachmentUrl ? true : null,
        createdAt: discussion.createdAt,
        author: discussion.author,
        course: discussion.course,
        comments: discussion.comments,
      },
      submissions,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("Instructor access required.", 403);
    }
    console.error("Instructor discussion detail error:", error);
    return errorResponse("Unable to load this discussion.", 500);
  }
}

export async function POST(request, { params }) {
  try {
    const user = await requireInstructor();
    const { id } = await params;
    const body = await request.json();
    const text = body?.body;

    if (!text || !text.trim()) {
      return errorResponse("A message is required.", 400);
    }

    const discussion = await prisma.discussion.findUnique({ where: { id } });
    if (!discussion) {
      return errorResponse("Discussion not found.", 404);
    }

    const assigned = await assertAssigned(user.id, discussion.courseId);
    if (!assigned) {
      return errorResponse("You are not assigned to this course.", 403);
    }

    const comment = await prisma.discussionComment.create({
      data: { discussionId: id, authorId: user.id, body: text.trim() },
      include: { author: { select: { id: true, name: true, role: true } } },
    });

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("Instructor access required.", 403);
    }
    console.error("Instructor discussion comment error:", error);
    return errorResponse("Unable to post your comment.", 500);
  }
}

// Give feedback on one student's exercise submission.
export async function PATCH(request, { params }) {
  try {
    const user = await requireInstructorEdit();
    const { id } = await params;
    const body = await request.json();
    const { submissionId, feedback } = body;

    if (!submissionId || typeof submissionId !== "string") {
      return errorResponse("A submission must be specified.", 400);
    }

    const discussion = await prisma.discussion.findUnique({ where: { id } });
    if (!discussion) {
      return errorResponse("Discussion not found.", 404);
    }

    const assigned = await assertAssigned(user.id, discussion.courseId);
    if (!assigned) {
      return errorResponse("You are not assigned to this course.", 403);
    }

    const submission = await prisma.exerciseSubmission.findUnique({ where: { id: submissionId } });
    if (!submission || submission.discussionId !== id) {
      return errorResponse("Submission not found for this discussion.", 404);
    }

    const updated = await prisma.exerciseSubmission.update({
      where: { id: submissionId },
      data: { feedback: typeof feedback === "string" ? feedback.trim() || null : null },
    });

    return NextResponse.json({ success: true, submission: { ...updated, fileUrl: updated.fileUrl ? true : null } });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("Instructor access required.", 403);
    }
    console.error("Instructor feedback error:", error);
    return errorResponse("Unable to save feedback.", 500);
  }
}
