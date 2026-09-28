import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// Section Discussion is scoped to a student's own enrolled courses — the
// real "section" boundary in this data model (see the Discussion model's
// schema comment). A student never sees another course's discussions.
async function getEnrolledCourses(userId) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId, status: "APPROVED" },
    include: { course: { select: { id: true, titleEn: true, courseCode: true } } },
  });
  return enrollments.map((e) => e.course);
}

export async function GET(request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    const enrolledCourses = await getEnrolledCourses(user.id);

    if (!courseId) {
      return NextResponse.json({ success: true, courses: enrolledCourses });
    }

    const isEnrolled = enrolledCourses.some((c) => c.id === courseId);
    if (!isEnrolled) {
      return errorResponse("You are not enrolled in this course.", 403);
    }

    const discussions = await prisma.discussion.findMany({
      where: { courseId },
      include: {
        author: { select: { id: true, name: true, role: true } },
        _count: { select: { comments: true, submissions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // For each exercise, tell the UI whether the signed-in student has
    // already submitted, without fetching every submission's content here
    // (the full detail — including peers' answers — loads on demand).
    const exerciseIds = discussions.filter((d) => d.isExercise).map((d) => d.id);
    const mySubmissions = exerciseIds.length
      ? await prisma.exerciseSubmission.findMany({
          where: { discussionId: { in: exerciseIds }, studentId: user.id },
          select: { discussionId: true },
        })
      : [];
    const submittedIds = new Set(mySubmissions.map((s) => s.discussionId));

    return NextResponse.json({
      success: true,
      courses: enrolledCourses,
      discussions: discussions.map((d) => ({
        id: d.id,
        title: d.title,
        body: d.body,
        isExercise: d.isExercise,
        deadline: d.deadline,
        attachmentUrl: d.attachmentUrl ? true : null,
        createdAt: d.createdAt,
        author: d.author,
        commentCount: d._count.comments,
        submissionCount: d._count.submissions,
        hasSubmitted: d.isExercise ? submittedIds.has(d.id) : null,
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required.", 401);
    }
    console.error("Student discussions list error:", error);
    return errorResponse("Unable to load discussions.", 500);
  }
}

// Students can start a regular discussion or question — never an
// exercise (isExercise is always false here; only an instructor's own
// endpoint can set it true).
export async function POST(request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const { courseId, title, body: text } = body;

    if (!courseId || typeof courseId !== "string") {
      return errorResponse("A course must be specified.", 400);
    }
    if (!title || !title.trim()) {
      return errorResponse("A title is required.", 400);
    }
    if (!text || !text.trim()) {
      return errorResponse("A message is required.", 400);
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
    });

    if (!enrollment || enrollment.status !== "APPROVED") {
      return errorResponse("You are not enrolled in this course.", 403);
    }

    const discussion = await prisma.discussion.create({
      data: {
        courseId,
        authorId: user.id,
        title: title.trim(),
        body: text.trim(),
        isExercise: false,
      },
      include: { author: { select: { id: true, name: true, role: true } } },
    });

    return NextResponse.json({ success: true, discussion });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required.", 401);
    }
    console.error("Student discussion create error:", error);
    return errorResponse("Unable to create this discussion.", 500);
  }
}
