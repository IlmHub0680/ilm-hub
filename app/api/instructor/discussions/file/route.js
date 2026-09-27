import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireInstructor } from "@/lib/auth";
import { getR2PresignedUrl } from "@/lib/r2";

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

export async function GET(request) {
  try {
    const user = await requireInstructor();
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
      const assigned = await assertAssigned(user.id, discussion.courseId);
      if (!assigned) {
        return errorResponse("You are not assigned to this course.", 403);
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
    const assigned = await assertAssigned(user.id, submission.discussion.courseId);
    if (!assigned) {
      return errorResponse("You are not assigned to this course.", 403);
    }
    const url = await getR2PresignedUrl(submission.fileUrl, 300);
    return NextResponse.json({ success: true, url });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("Instructor access required.", 403);
    }
    console.error("Instructor discussion file resolve error:", error);
    return errorResponse("Unable to open this file.", 500);
  }
}
