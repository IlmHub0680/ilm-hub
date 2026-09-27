import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

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

// Full discussion thread: the post itself, every comment, and — for an
// exercise — every student's submission in the same course (peer/
// group-learning visibility, as requested). Instructor feedback on a
// classmate's submission stays private: it's only included on the
// viewer's own submission.
export async function GET(request, { params }) {
  try {
    const user = await requireUser();
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

    const enrolled = await assertEnrolled(user.id, discussion.courseId);
    if (!enrolled) {
      return errorResponse("You are not enrolled in this course.", 403);
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
        // Feedback is private between the instructor and that one student.
        feedback: s.studentId === user.id ? s.feedback : null,
        isMine: s.studentId === user.id,
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
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required.", 401);
    }
    console.error("Student discussion detail error:", error);
    return errorResponse("Unable to load this discussion.", 500);
  }
}

export async function POST(request, { params }) {
  try {
    const user = await requireUser();
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

    const enrolled = await assertEnrolled(user.id, discussion.courseId);
    if (!enrolled) {
      return errorResponse("You are not enrolled in this course.", 403);
    }

    const comment = await prisma.discussionComment.create({
      data: { discussionId: id, authorId: user.id, body: text.trim() },
      include: { author: { select: { id: true, name: true, role: true } } },
    });

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required.", 401);
    }
    console.error("Student discussion comment error:", error);
    return errorResponse("Unable to post your comment.", 500);
  }
}
