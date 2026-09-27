import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { newActiveToken, finalizeAttempt } from '@/lib/quizGrading';

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

function serializeAttemptForStudent(attempt, questions) {
  const answerByQuestionId = new Map(attempt.answers.map((a) => [a.questionId, a]));

  return {
    id: attempt.id,
    status: attempt.status,
    startedAt: attempt.startedAt,
    expiresAt: attempt.expiresAt,
    activeToken: attempt.activeToken,
    maxScore: attempt.maxScore,
    attemptNumber: attempt.attemptNumber,
    questions: questions.map((q) => ({
      id: q.id,
      type: q.type,
      promptText: q.promptText,
      videoUrl: q.videoUrl,
      points: q.points,
      // Never send isCorrect while the attempt is live — only the
      // option text/id the student needs to answer with.
      options: q.options.map((o) => ({ id: o.id, text: o.text })),
      answer: answerByQuestionId.get(q.id) || null,
    })),
  };
}

export async function POST(request, { params }) {
  try {
    const user = await requireUser();
    if (user.role !== 'STUDENT') return errorResponse('Student access required.', 403);

    const { id: quizId } = await params;

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: { orderBy: { order: 'asc' }, include: { options: { orderBy: { order: 'asc' } } } } },
    });

    if (!quiz || !quiz.isPublished) return errorResponse('Quiz not found.', 404);

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: quiz.courseId } },
    });

    if (!enrollment || enrollment.status !== 'APPROVED') {
      return errorResponse('You are not enrolled in this course.', 403);
    }

    const now = new Date();
    if (quiz.startAt && now < new Date(quiz.startAt)) {
      return errorResponse('This quiz is not open yet.', 403);
    }
    if (quiz.endAt && now > new Date(quiz.endAt)) {
      return errorResponse('This quiz is now closed.', 403);
    }

    if (quiz.questions.length === 0) {
      return errorResponse('This quiz has no questions yet.', 409);
    }

    let attempt = await prisma.quizAttempt.findFirst({
      where: { quizId, studentId: user.id, status: 'IN_PROGRESS' },
      include: { answers: true },
    });

    // Lazily close out an abandoned attempt whose time has already run
    // out — the server, not the browser, is the one clock that matters.
    if (attempt && attempt.expiresAt < now) {
      await finalizeAttempt(attempt.id, { auto: true });
      attempt = null;
    }

    if (attempt) {
      // Resuming: issue a fresh token (invalidating any other open tab
      // on this same attempt) without touching the original deadline.
      const refreshed = await prisma.quizAttempt.update({
        where: { id: attempt.id },
        data: { activeToken: newActiveToken() },
        include: { answers: true },
      });

      return NextResponse.json({
        success: true,
        data: serializeAttemptForStudent(refreshed, quiz.questions),
      });
    }

    const priorAttemptCount = await prisma.quizAttempt.count({
      where: { quizId, studentId: user.id },
    });

    if (priorAttemptCount >= quiz.maxAttempts) {
      return errorResponse('You have used all of your attempts for this quiz.', 409);
    }

    const maxScore = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const expiresAt = new Date(now.getTime() + quiz.timeLimitMinutes * 60 * 1000);

    const created = await prisma.quizAttempt.create({
      data: {
        quizId,
        studentId: user.id,
        attemptNumber: priorAttemptCount + 1,
        expiresAt,
        maxScore,
        activeToken: newActiveToken(),
      },
      include: { answers: true },
    });

    return NextResponse.json({
      success: true,
      data: serializeAttemptForStudent(created, quiz.questions),
    });
  } catch (error) {
    console.error('Student quiz start error:', error);
    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized.', 401);
    return errorResponse('Failed to start quiz.', 500);
  }
}
