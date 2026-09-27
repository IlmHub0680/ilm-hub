import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireInstructorEdit } from '@/lib/auth';

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

const CHOICE_TYPES = ['SINGLE_CHOICE', 'MULTIPLE_CHOICE'];
const VALID_TYPES = ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'WRITTEN', 'VIDEO'];

async function assertOwnsQuiz(userId, quizId) {
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) return { quiz: null, allowed: false };

  const assigned = await prisma.instructorCourse.findUnique({
    where: { instructorId_courseId: { instructorId: userId, courseId: quiz.courseId } },
  });

  return { quiz, allowed: !!assigned };
}

export async function POST(request, { params }) {
  try {
    const user = await requireInstructorEdit();
    const { id: quizId } = await params;

    const { quiz, allowed } = await assertOwnsQuiz(user.id, quizId);
    if (!quiz) return errorResponse('Quiz not found', 404);
    if (!allowed) return errorResponse('You are not assigned to this course', 403);

    const body = await request.json();
    const type = body?.type;
    const promptText = typeof body?.promptText === 'string' ? body.promptText.trim() : '';
    const points = Number(body?.points) || 1;
    const videoUrl = typeof body?.videoUrl === 'string' && body.videoUrl.trim() ? body.videoUrl.trim() : null;
    const requiresReview = type === 'WRITTEN' || type === 'VIDEO' ? true : !!body?.requiresReview;
    const options = Array.isArray(body?.options) ? body.options : [];

    if (!VALID_TYPES.includes(type)) {
      return errorResponse('Invalid question type', 400);
    }
    if (!promptText) {
      return errorResponse('Question text is required', 400);
    }
    if (type === 'VIDEO' && !videoUrl) {
      return errorResponse('A video question needs a video URL', 400);
    }

    if (CHOICE_TYPES.includes(type)) {
      const cleanOptions = options
        .map((o) => ({ text: String(o.text || '').trim(), isCorrect: !!o.isCorrect }))
        .filter((o) => o.text);

      if (cleanOptions.length < 2) {
        return errorResponse('Choice questions need at least two options', 400);
      }

      const correctCount = cleanOptions.filter((o) => o.isCorrect).length;

      if (correctCount === 0) {
        return errorResponse('Mark at least one option as correct', 400);
      }
      if (type === 'SINGLE_CHOICE' && correctCount > 1) {
        return errorResponse('A single-choice question can only have one correct option', 400);
      }

      const lastOrder = await prisma.quizQuestion.count({ where: { quizId } });

      const question = await prisma.quizQuestion.create({
        data: {
          quizId,
          type,
          promptText,
          points,
          order: lastOrder,
          requiresReview: false,
          options: {
            create: cleanOptions.map((o, i) => ({ text: o.text, isCorrect: o.isCorrect, order: i })),
          },
        },
        include: { options: true },
      });

      return NextResponse.json({ success: true, data: question });
    }

    const lastOrder = await prisma.quizQuestion.count({ where: { quizId } });

    const question = await prisma.quizQuestion.create({
      data: {
        quizId,
        type,
        promptText,
        points,
        order: lastOrder,
        videoUrl,
        requiresReview,
      },
      include: { options: true },
    });

    return NextResponse.json({ success: true, data: question });
  } catch (error) {
    console.error('Instructor quiz question POST error:', error);
    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized', 401);
    if (error?.message === 'FORBIDDEN') return errorResponse('Instructor access required', 403);
    return errorResponse('Failed to add question', 500);
  }
}
