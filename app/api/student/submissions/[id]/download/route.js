import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getR2PresignedUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { assignment: { select: { courseId: true } } },
    });

    if (!submission) {
      return NextResponse.json(
        { success: false, error: "Submission not found." },
        { status: 404 }
      );
    }

    const isOwner = submission.studentId === user.id;
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    // The instructor assigned to this submission's course also needs to
    // open the file in order to grade it — previously only the owning
    // student or an admin could ever reach it, which silently blocked
    // instructor grading of file-based submissions.
    let isCourseInstructor = false;

    if (!isOwner && !isAdmin && user.role === "INSTRUCTOR") {
      const assignment = await prisma.instructorCourse.findUnique({
        where: {
          instructorId_courseId: {
            instructorId: user.id,
            courseId: submission.assignment.courseId,
          },
        },
      });

      isCourseInstructor = !!assignment;
    }

    if (!isOwner && !isAdmin && !isCourseInstructor) {
      return NextResponse.json(
        { success: false, error: "Forbidden." },
        { status: 403 }
      );
    }

    if (!submission.fileUrl) {
      return NextResponse.json(
        { success: false, error: "No file on this submission." },
        { status: 404 }
      );
    }

    const url = await getR2PresignedUrl(submission.fileUrl, 300);

    return NextResponse.json({ success: true, url });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("Submission download error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to generate download link." },
      { status: 500 }
    );
  }
}