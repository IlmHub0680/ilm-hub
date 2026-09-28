import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireInstructor, requireInstructorEdit } from '@/lib/auth';

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

async function assertOwnsQuiz(userId, quizId) {
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) return { quiz: null, allowed: false };

  const assigned = await prisma.instructorCourse.findUnique({
    where: { instructorId_courseId: { instructorId: userId, courseId: quiz.courseId } },
  });

  return { quiz, allowed: !!assigned };
}

export async function GET(request, { params }) {
  try {
    const user = await requireInstructor();
    const { id } = await params;

    const { quiz, allowed } = await assertOwnsQuiz(user.id, id);
    if (!quiz) return errorResponse('Quiz not found', 404);
    if (!allowed) return errorResponse('You are not assigned to this course', 403);

    const full = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: { options: { orderBy: { order: 'asc' } } },
        },
      },
    });

    return NextResponse.json({ success: true, data: full });
  } catch (error) {
    console.error('Instructor quiz GET error:', error);
    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized', 401);
    if (error?.message === 'FORBIDDEN') return errorResponse('Instructor access required', 403);
    return errorResponse('Failed to fetch quiz', 500);
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await requireInstructorEdit();
    const { id } = await params;

    const { quiz, allowed } = await assertOwnsQuiz(user.id, id);
    if (!quiz) return errorResponse('Quiz not found', 404);
    if (!allowed) return errorResponse('You are not assigned to this course', 403);

    const body = await request.json();
    const values = {};

    if (body.title !== undefined) {
      const title = String(body.title).trim();
      if (!title) return errorResponse('Title cannot be empty', 400);
      values.title = title;
    }
    if (body.description !== undefined) values.description = body.description ? String(body.description).trim() : null;
    if (body.timeLimitMinutes !== undefined) {
      const t = Number(body.timeLimitMinutes);
      if (!Number.isFinite(t) || t <= 0) return errorResponse('Time limit must be a positive number of minutes', 400);
      values.timeLimitMinutes = t;
    }
    if (body.maxAttempts !== undefined) {
      const m = Number(body.maxAttempts);
      if (!Number.isInteger(m) || m < 1) return errorResponse('Max attempts must be a whole number of at least 1', 400);
      values.maxAttempts = m;
    }
    if (body.passingScore !== undefined) {
      values.passingScore = body.passingScore === '' || body.passingScore == null ? null : Number(body.passingScore);
    }
    if (body.showResultsImmediately !== undefined) values.showResultsImmediately = !!body.showResultsImmediately;
    if (body.startAt !== undefined) values.startAt = body.startAt ? new Date(body.startAt) : null;
    if (body.endAt !== undefined) values.endAt = body.endAt ? new Date(body.endAt) : null;
    if (body.isPublished !== undefined) values.isPublished = !!body.isPublished;
    if (body.resultsReleased !== undefined) values.resultsReleased = !!body.resultsReleased;

    const updated = await prisma.quiz.update({ where: { id }, data: values });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Instructor quiz PUT error:', error);
    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized', 401);
    if (error?.message === 'FORBIDDEN') return errorResponse('Instructor access required', 403);
    return errorResponse('Failed to update quiz', 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await requireInstructorEdit();
    const { id } = await params;

    const { quiz, allowed } = await assertOwnsQuiz(user.id, id);
    if (!quiz) return errorResponse('Quiz not found', 404);
    if (!allowed) return errorResponse('You are not assigned to this course', 403);

    const attemptCount = await prisma.quizAttempt.count({ where: { quizId: id } });

    if (attemptCount > 0) {
      return errorResponse(
        'This quiz already has student attempts and cannot be deleted. Unpublish it instead.',
        409
      );
    }

    await prisma.quiz.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Instructor quiz DELETE error:', error);
    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized', 401);
    if (error?.message === 'FORBIDDEN') return errorResponse('Instructor access required', 403);
    return errorResponse('Failed to delete quiz', 500);
  }
}
