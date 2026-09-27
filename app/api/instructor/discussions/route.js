import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireInstructor, requireInstructorEdit } from "@/lib/auth";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

async function getAssignedCourses(instructorId) {
  const assignments = await prisma.instructorCourse.findMany({
    where: { instructorId },
    include: { course: { select: { id: true, titleEn: true, courseCode: true } } },
  });
  return assignments.map((a) => a.course);
}

export async function GET(request) {
  try {
    const user = await requireInstructor();
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    const assignedCourses = await getAssignedCourses(user.id);

    if (!courseId) {
      return NextResponse.json({ success: true, courses: assignedCourses });
    }

    const isAssigned = assignedCourses.some((c) => c.id === courseId);
    if (!isAssigned) {
      return errorResponse("You are not assigned to this course.", 403);
    }

    const discussions = await prisma.discussion.findMany({
      where: { courseId },
      include: {
        author: { select: { id: true, name: true, role: true } },
        _count: { select: { comments: true, submissions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      courses: assignedCourses,
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
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("Instructor access required.", 403);
    }
    console.error("Instructor discussions list error:", error);
    return errorResponse("Unable to load discussions.", 500);
  }
}

// Instructors can post a regular discussion OR a real exercise/activity
// (isExercise=true), with instructions, a deadline, and an optional
// supporting file — only reachable through this endpoint, never the
// student-facing one, so a student can never mark their own post as an
// exercise.
export async function POST(request) {
  try {
    const user = await requireInstructorEdit();
    const body = await request.json();
    const { courseId, title, body: text, isExercise, deadline, attachmentKey } = body;

    if (!courseId || typeof courseId !== "string") {
      return errorResponse("A course must be specified.", 400);
    }
    if (!title || !title.trim()) {
      return errorResponse("A title is required.", 400);
    }
    if (!text || !text.trim()) {
      return errorResponse("Instructions or a message are required.", 400);
    }

    const assignment = await prisma.instructorCourse.findUnique({
      where: { instructorId_courseId: { instructorId: user.id, courseId } },
    });
    if (!assignment) {
      return errorResponse("You are not assigned to this course.", 403);
    }

    let deadlineDate = null;
    if (isExercise && deadline) {
      const parsed = new Date(deadline);
      if (Number.isNaN(parsed.getTime())) {
        return errorResponse("Invalid deadline.", 400);
      }
      deadlineDate = parsed;
    }

    const discussion = await prisma.discussion.create({
      data: {
        courseId,
        authorId: user.id,
        title: title.trim(),
        body: text.trim(),
        isExercise: !!isExercise,
        deadline: deadlineDate,
        attachmentUrl: isExercise && attachmentKey ? attachmentKey : null,
      },
      include: { author: { select: { id: true, name: true, role: true } } },
    });

    return NextResponse.json({
      success: true,
      discussion: { ...discussion, attachmentUrl: discussion.attachmentUrl ? true : null },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("Instructor access required.", 403);
    }
    console.error("Instructor discussion create error:", error);
    return errorResponse("Unable to create this discussion.", 500);
  }
}
