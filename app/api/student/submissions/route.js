import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const user = await requireUser();

    if (user.role !== "STUDENT") {
      return NextResponse.json(
        { success: false, error: "Student access required." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const assignmentId =
      typeof body.assignmentId === "string" ? body.assignmentId : "";
    const fileUrl = typeof body.fileUrl === "string" && body.fileUrl ? body.fileUrl : null;
    const answerText =
      typeof body.answerText === "string" && body.answerText.trim()
        ? body.answerText.trim()
        : null;

    if (!assignmentId || (!fileUrl && !answerText)) {
      return NextResponse.json(
        { success: false, error: "Write an answer or attach a file before submitting." },
        { status: 400 }
      );
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: "Assignment not found." },
        { status: 404 }
      );
    }

    // A submission is only valid for a course the student is actually
    // enrolled in -- the upsert key below already scopes each row to the
    // caller's own id, but without this check any logged-in student could
    // submit work against an assignment for a course they never enrolled in.
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: assignment.courseId } },
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "You are not enrolled in this course." },
        { status: 403 }
      );
    }

    const isLate = new Date() > new Date(assignment.dueDate);

    const submission = await prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: user.id,
        },
      },
      update: {
        fileUrl,
        answerText,
        status: isLate ? "LATE" : "SUBMITTED",
        submittedAt: new Date(),
        // A resubmission replaces the answer, so any prior grade no
        // longer applies to what the instructor is about to see —
        // clear it rather than leaving a stale score/feedback pair
        // attached to different work.
        score: null,
        feedback: null,
      },
      create: {
        assignmentId,
        studentId: user.id,
        fileUrl,
        answerText,
        status: isLate ? "LATE" : "SUBMITTED",
        submittedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: { ...submission, fileUrl: submission.fileUrl ? true : null },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("Submission error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to submit assignment." },
      { status: 500 }
    );
  }
}