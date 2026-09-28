import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireInstructorEdit } from '@/lib/auth';

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

export async function PUT(request, { params }) {
  try {
    const user = await requireInstructorEdit();
    const { id } = await params;

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { assignment: true },
    });

    if (!submission) {
      return errorResponse('Submission not found', 404);
    }

    const assigned = await prisma.instructorCourse.findUnique({
      where: {
        instructorId_courseId: {
          instructorId: user.id,
          courseId: submission.assignment.courseId,
        },
      },
    });

    if (!assigned) {
      return errorResponse('You are not assigned to this course', 403);
    }

    const body = await request.json();
    const score = Number(body.score);
    const feedback =
      typeof body.feedback === 'string' ? body.feedback.trim().slice(0, 4000) : null;

    if (!Number.isFinite(score) || score < 0 || score > submission.assignment.maxScore) {
      return errorResponse(
        `Score must be between 0 and ${submission.assignment.maxScore}`,
        400
      );
    }

    const updated = await prisma.submission.update({
      where: { id },
      data: { score, feedback, status: 'GRADED' },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        status: updated.status,
        score: updated.score,
        feedback: updated.feedback,
      },
    });
  } catch (error) {
    console.error('Instructor submission grade PUT error:', error);

    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized', 401);
    if (error?.message === 'FORBIDDEN') return errorResponse('Instructor access required', 403);

    return errorResponse('Failed to save grade', 500);
  }
}
