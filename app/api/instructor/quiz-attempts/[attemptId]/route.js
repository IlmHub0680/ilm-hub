import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireInstructor, requireInstructorEdit } from '@/lib/auth';

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

async function loadOwnedAttempt(userId, attemptId) {
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      student: { select: { id: true, name: true, email: true, studentProfile: { select: { studentNo: true } } } },
      quiz: { include: { questions: { orderBy: { order: 'asc' }, include: { options: { orderBy: { order: 'asc' } } } } } },
      answers: true,
    },
  });

  if (!attempt) return { attempt: null, allowed: false };

  const assigned = await prisma.instructorCourse.findUnique({
    where: { instructorId_courseId: { instructorId: userId, courseId: attempt.quiz.courseId } },
  });

  return { attempt, allowed: !!assigned };
}

export async function GET(request, { params }) {
  try {
    const user = await requireInstructor();
    const { attemptId } = await params;

    const { attempt, allowed } = await loadOwnedAttempt(user.id, attemptId);
    if (!attempt) return errorResponse('Attempt not found', 404);
    if (!allowed) return errorResponse('You are not assigned to this course', 403);

    const answerByQuestionId = new Map(attempt.answers.map((a) => [a.questionId, a]));

    return NextResponse.json({
      success: true,
      data: {
        id: attempt.id,
        status: attempt.status,
        score: attempt.score,
        maxScore: attempt.maxScore,
        submittedAt: attempt.submittedAt,
        student: {
          name: attempt.student.name,
          email: attempt.student.email,
          studentNo: attempt.student.studentProfile?.studentNo || null,
        },
        questions: attempt.quiz.questions.map((q) => {
          const answer = answerByQuestionId.get(q.id);
          return {
            id: q.id,
            type: q.type,
            promptText: q.promptText,
            videoUrl: q.videoUrl,
            points: q.points,
            options: q.options.map((o) => ({ id: o.id, text: o.text, isCorrect: o.isCorrect })),
            answer: answer
              ? {
                  id: answer.id,
                  selectedOptionIds: answer.selectedOptionIds,
                  answerText: answer.answerText,
                  score: answer.score,
                  feedback: answer.feedback,
                }
              : null,
          };
        }),
      },
    });
  } catch (error) {
    console.error('Instructor quiz attempt GET error:', error);
    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized', 401);
    if (error?.message === 'FORBIDDEN') return errorResponse('Instructor access required', 403);
    return errorResponse('Failed to fetch attempt', 500);
  }
}

// Grades every WRITTEN/VIDEO answer in one call: { grades: [{ answerId, score, feedback }] }.
// Once every question in the attempt has a non-null score, the attempt
// itself is marked GRADED and its total (auto + reviewed) is stored.
export async function PUT(request, { params }) {
  try {
    const user = await requireInstructorEdit();
    const { attemptId } = await params;

    const { attempt, allowed } = await loadOwnedAttempt(user.id, attemptId);
    if (!attempt) return errorResponse('Attempt not found', 404);
    if (!allowed) return errorResponse('You are not assigned to this course', 403);

    if (attempt.status === 'IN_PROGRESS') {
      return errorResponse('This attempt has not been submitted yet', 409);
    }

    const body = await request.json();
    const grades = Array.isArray(body?.grades) ? body.grades : [];

    const questionById = new Map(attempt.quiz.questions.map((q) => [q.id, q]));
    const answerById = new Map(attempt.answers.map((a) => [a.id, a]));

    for (const grade of grades) {
      const answer = answerById.get(grade.answerId);
      if (!answer) continue;

      const question = questionById.get(answer.questionId);
      const score = Number(grade.score);

      if (!Number.isFinite(score) || score < 0 || score > question.points) {
        return errorResponse(
          `Score for "${question.promptText.slice(0, 40)}" must be between 0 and ${question.points}`,
          400
        );
      }

      await prisma.quizAnswer.update({
        where: { id: answer.id },
        data: {
          score,
          feedback: typeof grade.feedback === 'string' ? grade.feedback.trim().slice(0, 2000) : null,
          gradedAt: new Date(),
        },
      });
    }

    const refreshedAnswers = await prisma.quizAnswer.findMany({ where: { attemptId } });
    const allGraded = refreshedAnswers.every((a) => a.score != null);

    let updatedAttempt = attempt;

    if (allGraded) {
      const total = refreshedAnswers.reduce((sum, a) => sum + (a.score || 0), 0);
      updatedAttempt = await prisma.quizAttempt.update({
        where: { id: attemptId },
        data: { status: 'GRADED', score: total },
      });
    }

    return NextResponse.json({
      success: true,
      data: { status: updatedAttempt.status, score: updatedAttempt.score, fullyGraded: allGraded },
    });
  } catch (error) {
    console.error('Instructor quiz attempt PUT error:', error);
    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized', 401);
    if (error?.message === 'FORBIDDEN') return errorResponse('Instructor access required', 403);
    return errorResponse('Failed to save grades', 500);
  }
}
