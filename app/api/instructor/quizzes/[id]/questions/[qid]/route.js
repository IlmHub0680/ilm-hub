import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireInstructorEdit } from '@/lib/auth';

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

export async function DELETE(request, { params }) {
  try {
    const user = await requireInstructorEdit();
    const { id: quizId, qid } = await params;

    const question = await prisma.quizQuestion.findUnique({ where: { id: qid } });
    if (!question || question.quizId !== quizId) {
      return errorResponse('Question not found', 404);
    }

    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    const assigned = await prisma.instructorCourse.findUnique({
      where: { instructorId_courseId: { instructorId: user.id, courseId: quiz.courseId } },
    });

    if (!assigned) return errorResponse('You are not assigned to this course', 403);

    const attemptCount = await prisma.quizAttempt.count({ where: { quizId } });

    if (attemptCount > 0) {
      return errorResponse(
        'Students have already attempted this quiz — questions can no longer be removed. Unpublish the quiz instead.',
        409
      );
    }

    await prisma.quizQuestion.delete({ where: { id: qid } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Instructor quiz question DELETE error:', error);
    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized', 401);
    if (error?.message === 'FORBIDDEN') return errorResponse('Instructor access required', 403);
    return errorResponse('Failed to delete question', 500);
  }
}
