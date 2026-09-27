import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

// A student's own course evaluations — real, minimal, and the first
// such system in the platform (QA Portal §8's "course evaluations").
// isAnonymous defaults true and the student is never exposed to QA by
// name for an anonymous submission (enforced by only ever selecting
// aggregate figures and comments on the QA side, never studentId).
export async function GET(request) {
  try {
    const user = await requireUser();
    const student = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
    if (!student) return errorResponse("No student profile found.", 403);

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    if (!courseId) return errorResponse("courseId is required.", 400);

    const existing = await prisma.courseEvaluation.findFirst({
      where: { studentId: student.id, courseId, termId: null },
    });

    return NextResponse.json({ success: true, data: existing });
  } catch (error) {
    console.error("Course evaluation GET error:", error);
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    return errorResponse("Failed to load evaluation", 500);
  }
}

export async function POST(request) {
  try {
    const user = await requireUser();
    const student = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
    if (!student) return errorResponse("No student profile found.", 403);

    const body = await request.json();
    const courseId = typeof body.courseId === "string" ? body.courseId : "";
    const ratingOverall = Number(body.ratingOverall);

    if (!courseId || !Number.isFinite(ratingOverall) || ratingOverall < 1 || ratingOverall > 5) {
      return errorResponse("courseId and an overall rating from 1-5 are required.", 400);
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
    });
    if (!enrollment) return errorResponse("You are not enrolled in this course.", 403);

    const ratingContent = Number(body.ratingContent);
    const ratingInstructor = Number(body.ratingInstructor);

    const evaluation = await prisma.courseEvaluation.upsert({
      where: { studentId_courseId_termId: { studentId: student.id, courseId, termId: null } },
      update: {
        ratingOverall,
        ratingContent: Number.isFinite(ratingContent) ? ratingContent : null,
        ratingInstructor: Number.isFinite(ratingInstructor) ? ratingInstructor : null,
        comments: typeof body.comments === "string" ? body.comments.trim() || null : null,
        isAnonymous: body.isAnonymous !== false,
      },
      create: {
        studentId: student.id,
        courseId,
        termId: null,
        ratingOverall,
        ratingContent: Number.isFinite(ratingContent) ? ratingContent : null,
        ratingInstructor: Number.isFinite(ratingInstructor) ? ratingInstructor : null,
        comments: typeof body.comments === "string" ? body.comments.trim() || null : null,
        isAnonymous: body.isAnonymous !== false,
      },
    });

    return NextResponse.json({ success: true, data: evaluation });
  } catch (error) {
    console.error("Course evaluation POST error:", error);
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    return errorResponse("Failed to save your evaluation", 500);
  }
}
