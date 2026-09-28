import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET() {
  try {
    const user = await requireUser();

    if (user.role !== 'STUDENT') {
      return errorResponse('Student access required.', 403);
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: user.id, status: 'APPROVED' },
      include: { course: true },
    });

    const courseIds = enrollments.map((e) => e.courseId);

    if (courseIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const courseById = new Map(enrollments.map((e) => [e.courseId, e.course]));

    const quizzes = await prisma.quiz.findMany({
      where: { courseId: { in: courseIds }, isPublished: true },
      include: {
        questions: { select: { id: true, points: true } },
        attempts: { where: { studentId: user.id } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();

    const data = quizzes.map((quiz) => {
      const course = courseById.get(quiz.courseId);
      const attempts = quiz.attempts;
      const bestGraded = attempts
        .filter((a) => a.status === 'GRADED' || a.status === 'AUTO_SUBMITTED')
        .sort((a, b) => (b.score || 0) - (a.score || 0))[0];
      const inProgress = attempts.find((a) => a.status === 'IN_PROGRESS');
      const attemptsUsed = attempts.length;
      const notYetOpen = quiz.startAt && now < new Date(quiz.startAt);
      const closed = quiz.endAt && now > new Date(quiz.endAt);
      const maxScore = quiz.questions.reduce((sum, q) => sum + q.points, 0);

      return {
        id: quiz.id,
        courseId: quiz.courseId,
        title: quiz.title,
        description: quiz.description,
        course: course?.titleEn,
        courseCode: course?.courseCode,
        timeLimitMinutes: quiz.timeLimitMinutes,
        startAt: quiz.startAt,
        endAt: quiz.endAt,
        maxAttempts: quiz.maxAttempts,
        attemptsUsed,
        canStart: !notYetOpen && !closed && (attemptsUsed < quiz.maxAttempts || !!inProgress),
        notYetOpen: !!notYetOpen,
        closed: !!closed,
        hasInProgressAttempt: !!inProgress,
        attempted: attemptsUsed > 0,
        maxScore,
        resultVisible: quiz.showResultsImmediately || quiz.resultsReleased,
        bestScore:
          bestGraded && (quiz.showResultsImmediately || quiz.resultsReleased) ? bestGraded.score : null,
        pendingReview: attempts.some((a) => a.status === 'SUBMITTED'),
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Student quizzes GET error:', error);
    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized.', 401);
    return errorResponse('Failed to load quizzes.', 500);
  }
}
