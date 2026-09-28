import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { finalizeAttempt } from '@/lib/quizGrading';

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(request, { params }) {
  try {
    const user = await requireUser();
    const { attemptId } = await params;

    let attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: true,
        quiz: { include: { questions: { orderBy: { order: 'asc' }, include: { options: { orderBy: { order: 'asc' } } } } } },
      },
    });

    if (!attempt) return errorResponse('Attempt not found.', 404);
    if (attempt.studentId !== user.id) return errorResponse('Forbidden.', 403);

    if (attempt.status === 'IN_PROGRESS' && attempt.expiresAt < new Date()) {
      await finalizeAttempt(attempt.id, { auto: true });
      attempt = await prisma.quizAttempt.findUnique({
        where: { id: attemptId },
        include: {
          answers: true,
          quiz: { include: { questions: { orderBy: { order: 'asc' }, include: { options: { orderBy: { order: 'asc' } } } } } },
        },
      });
    }

    const resultVisible =
      attempt.status !== 'IN_PROGRESS' && (attempt.quiz.showResultsImmediately || attempt.quiz.resultsReleased);

    const answerByQuestionId = new Map(attempt.answers.map((a) => [a.questionId, a]));

    return NextResponse.json({
      success: true,
      data: {
        id: attempt.id,
        status: attempt.status,
        startedAt: attempt.startedAt,
        expiresAt: attempt.expiresAt,
        submittedAt: attempt.submittedAt,
        activeToken: attempt.status === 'IN_PROGRESS' ? attempt.activeToken : null,
        maxScore: attempt.maxScore,
        score: resultVisible ? attempt.score : null,
        resultVisible,
        quizTitle: attempt.quiz.title,
        passingScore: attempt.quiz.passingScore,
        questions: attempt.quiz.questions.map((q) => {
          const answer = answerByQuestionId.get(q.id);
          return {
            id: q.id,
            type: q.type,
            promptText: q.promptText,
            videoUrl: q.videoUrl,
            points: q.points,
            options: q.options.map((o) => ({
              id: o.id,
              text: o.text,
              // Correct answers only ever go to the client once the
              // attempt is over AND results have been made visible.
              isCorrect: resultVisible ? o.isCorrect : undefined,
            })),
            answer: answer
              ? {
                  selectedOptionIds: answer.selectedOptionIds,
                  answerText: answer.answerText,
                  score: resultVisible ? answer.score : null,
                  feedback: resultVisible ? answer.feedback : null,
                }
              : null,
          };
        }),
      },
    });
  } catch (error) {
    console.error('Student quiz attempt GET error:', error);
    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized.', 401);
    return errorResponse('Failed to load attempt.', 500);
  }
}

// Autosave — called periodically (and on answer change) while the
// student is inside the exam page, so an accidental refresh or a
// network drop never destroys work in progress.
export async function PUT(request, { params }) {
  try {
    const user = await requireUser();
    const { attemptId } = await params;

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: { quiz: { include: { questions: true } } },
    });

    if (!attempt) return errorResponse('Attempt not found.', 404);
    if (attempt.studentId !== user.id) return errorResponse('Forbidden.', 403);

    if (attempt.status !== 'IN_PROGRESS') {
      return errorResponse('This attempt has already been submitted.', 409);
    }

    if (attempt.expiresAt < new Date()) {
      await finalizeAttempt(attempt.id, { auto: true });
      return errorResponse('Time is up — this attempt has been submitted automatically.', 410);
    }

    const body = await request.json();

    if (body.activeToken !== attempt.activeToken) {
      return errorResponse(
        'This quiz attempt is open in another tab or window — only the most recent one can save answers.',
        409
      );
    }

    const answers = Array.isArray(body.answers) ? body.answers : [];
    const questionIds = new Set(attempt.quiz.questions.map((q) => q.id));

    for (const a of answers) {
      if (!questionIds.has(a.questionId)) continue;

      const selectedOptionIds = Array.isArray(a.selectedOptionIds)
        ? a.selectedOptionIds.filter((v) => typeof v === 'string')
        : [];
      const answerText = typeof a.answerText === 'string' ? a.answerText.slice(0, 20000) : null;

      await prisma.quizAnswer.upsert({
        where: { attemptId_questionId: { attemptId, questionId: a.questionId } },
        update: { selectedOptionIds, answerText },
        create: { attemptId, questionId: a.questionId, selectedOptionIds, answerText },
      });
    }

    return NextResponse.json({ success: true, savedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Student quiz attempt save error:', error);
    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized.', 401);
    return errorResponse('Failed to save answers.', 500);
  }
}

// Finalizes the attempt: auto-grades choice questions, leaves
// written/video questions pending review, and marks it submitted.
// Idempotent — resubmitting an already-finalized attempt just returns
// its current state rather than erroring.
export async function POST(request, { params }) {
  try {
    const user = await requireUser();
    const { attemptId } = await params;

    const attempt = await prisma.quizAttempt.findUnique({ where: { id: attemptId } });

    if (!attempt) return errorResponse('Attempt not found.', 404);
    if (attempt.studentId !== user.id) return errorResponse('Forbidden.', 403);

    if (attempt.status !== 'IN_PROGRESS') {
      return NextResponse.json({ success: true, data: { status: attempt.status, score: attempt.score } });
    }

    const body = await request.json().catch(() => ({}));

    // A manual submit still requires the current tab's token, so a
    // stale background tab can't finalize over a newer one's answers.
    // The auto-submit path (timer hit zero) is allowed to finalize
    // without a token match, since by then it's just enforcing the
    // deadline the server already committed to.
    const isAutoSubmit = body.reason === 'time_expired';

    if (!isAutoSubmit && body.activeToken !== attempt.activeToken) {
      return errorResponse(
        'This quiz attempt is open in another tab or window.',
        409
      );
    }

    const updated = await finalizeAttempt(attemptId, { auto: isAutoSubmit });

    return NextResponse.json({ success: true, data: { status: updated.status, score: updated.score } });
  } catch (error) {
    console.error('Student quiz attempt submit error:', error);
    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized.', 401);
    return errorResponse('Failed to submit quiz.', 500);
  }
}

// Records a lightweight integrity signal (tab-switch or a blocked
// paste) against this attempt. Best-effort only — see the quiz-taking
// page for what this can and cannot actually prevent.
export async function PATCH(request, { params }) {
  try {
    const user = await requireUser();
    const { attemptId } = await params;

    const attempt = await prisma.quizAttempt.findUnique({ where: { id: attemptId } });

    if (!attempt) return errorResponse('Attempt not found.', 404);
    if (attempt.studentId !== user.id) return errorResponse('Forbidden.', 403);
    if (attempt.status !== 'IN_PROGRESS') {
      return NextResponse.json({ success: true });
    }

    const body = await request.json().catch(() => ({}));
    const field = body.type === 'copy_paste' ? 'copyPasteAttemptCount' : 'tabSwitchCount';

    await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: { [field]: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized.', 401);
    return errorResponse('Failed to record activity.', 500);
  }
}

