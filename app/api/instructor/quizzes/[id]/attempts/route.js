import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireInstructor } from '@/lib/auth';

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request, { params }) {
  try {
    const user = await requireInstructor();
    const { id: quizId } = await params;

    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) return errorResponse('Quiz not found', 404);

    const assigned = await prisma.instructorCourse.findUnique({
      where: { instructorId_courseId: { instructorId: user.id, courseId: quiz.courseId } },
    });
    if (!assigned) return errorResponse('You are not assigned to this course', 403);

    const attempts = await prisma.quizAttempt.findMany({
      where: { quizId, status: { not: 'IN_PROGRESS' } },
      include: {
        student: { select: { id: true, name: true, email: true, studentProfile: { select: { studentNo: true } } } },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: attempts.map((a) => ({
        id: a.id,
        attemptNumber: a.attemptNumber,
        status: a.status,
        score: a.score,
        maxScore: a.maxScore,
        submittedAt: a.submittedAt,
        studentName: a.student.name,
        studentEmail: a.student.email,
        studentNo: a.student.studentProfile?.studentNo || null,
      })),
    });
  } catch (error) {
    console.error('Instructor quiz attempts GET error:', error);
    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized', 401);
    if (error?.message === 'FORBIDDEN') return errorResponse('Instructor access required', 403);
    return errorResponse('Failed to fetch attempts', 500);
  }
}
