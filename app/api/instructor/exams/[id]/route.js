import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireInstructorEdit } from '@/lib/auth';

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

const VALID_TYPES = ['QUIZ', 'MIDTERM', 'FINAL', 'MAKEUP'];

async function loadOwnedExam(instructorId, examId) {
  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) return { exam: null, allowed: false };

  const assignment = await prisma.instructorCourse.findUnique({
    where: { instructorId_courseId: { instructorId, courseId: exam.courseId } },
  });

  return { exam, allowed: !!assignment };
}

// An instructor can already reschedule an exam's date/time, type,
// duration, venue or max score after creating it — this was
// previously create-only, forcing a new exam to be scheduled instead
// of correcting one already on the calendar.
export async function PUT(request, { params }) {
  try {
    const user = await requireInstructorEdit();
    const { id } = await params;

    const { exam, allowed } = await loadOwnedExam(user.id, id);

    if (!exam) return errorResponse('Exam not found', 404);
    if (!allowed) return errorResponse('You are not assigned to this course', 403);

    const body = await request.json();
    const values = {};

    if (body.termId !== undefined) {
      const term = await prisma.academicTerm.findUnique({ where: { id: body.termId } });
      if (!term) return errorResponse('Selected term could not be found', 400);
      values.termId = body.termId;
    }

    if (body.examType !== undefined) {
      if (!VALID_TYPES.includes(body.examType)) {
        return errorResponse('Invalid exam type', 400);
      }
      values.examType = body.examType;
    }

    if (body.scheduledAt !== undefined) {
      const scheduledAt = new Date(body.scheduledAt);
      if (isNaN(scheduledAt.getTime())) {
        return errorResponse('Invalid scheduled date/time', 400);
      }
      values.scheduledAt = scheduledAt;
    }

    if (body.durationMin !== undefined) {
      const durationMin = Number(body.durationMin);
      if (!Number.isFinite(durationMin) || durationMin <= 0) {
        return errorResponse('Duration must be a positive number of minutes', 400);
      }
      values.durationMin = durationMin;
    }

    if (body.venue !== undefined) {
      values.venue = typeof body.venue === 'string' ? body.venue.trim() || null : null;
    }

    if (body.maxScore !== undefined) {
      const maxScore = Number(body.maxScore);
      if (!Number.isFinite(maxScore) || maxScore <= 0) {
        return errorResponse('Max score must be a positive number', 400);
      }
      values.maxScore = maxScore;
    }

    const updated = await prisma.exam.update({
      where: { id },
      data: values,
      include: { term: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Instructor exam PUT error:', error);

    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized', 401);
    if (error?.message === 'FORBIDDEN') return errorResponse('Instructor access required', 403);

    return errorResponse('Failed to update exam', 500);
  }
}

export async function DELETE(_request, { params }) {
  try {
    const user = await requireInstructorEdit();
    const { id } = await params;

    const { exam, allowed } = await loadOwnedExam(user.id, id);

    if (!exam) return errorResponse('Exam not found', 404);
    if (!allowed) return errorResponse('You are not assigned to this course', 403);

    await prisma.exam.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Instructor exam DELETE error:', error);

    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized', 401);
    if (error?.message === 'FORBIDDEN') return errorResponse('Instructor access required', 403);

    return errorResponse('Failed to remove exam', 500);
  }
}
