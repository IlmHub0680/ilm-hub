import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireInstructor, requireInstructorEdit } from '@/lib/auth';

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

async function getMyCourses(instructorId) {
  const assignments = await prisma.instructorCourse.findMany({
    where: { instructorId },
    include: { course: true },
    orderBy: { createdAt: 'asc' },
  });

  return assignments.map(({ course }) => ({
    id: course.id,
    title: course.titleEn,
    code: course.courseCode,
  }));
}

export async function GET(request) {
  try {
    const user = await requireInstructor();
    const { searchParams } = new URL(request.url);
    const requestedCourseId = searchParams.get('courseId');

    const courses = await getMyCourses(user.id);

    if (courses.length === 0) {
      return NextResponse.json({ courses: [], activeCourseId: null, quizzes: [] });
    }

    const activeCourse = courses.find((c) => c.id === requestedCourseId) || courses[0];

    const quizzes = await prisma.quiz.findMany({
      where: { courseId: activeCourse.id },
      include: { questions: true, attempts: { select: { id: true, status: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      courses,
      activeCourseId: activeCourse.id,
      quizzes: quizzes.map((q) => ({
        id: q.id,
        title: q.title,
        description: q.description,
        timeLimitMinutes: q.timeLimitMinutes,
        startAt: q.startAt,
        endAt: q.endAt,
        maxAttempts: q.maxAttempts,
        passingScore: q.passingScore,
        showResultsImmediately: q.showResultsImmediately,
        resultsReleased: q.resultsReleased,
        isPublished: q.isPublished,
        questionCount: q.questions.length,
        attemptCount: q.attempts.length,
        pendingReviewCount: q.attempts.filter((a) => a.status === 'SUBMITTED').length,
      })),
    });
  } catch (error) {
    console.error('Instructor quizzes GET error:', error);
    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized', 401);
    if (error?.message === 'FORBIDDEN') return errorResponse('Instructor access required', 403);
    return errorResponse('Failed to fetch quizzes', 500);
  }
}

export async function POST(request) {
  try {
    const user = await requireInstructorEdit();
    const body = await request.json();

    const courseId = body?.courseId;
    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    const description = typeof body?.description === 'string' ? body.description.trim() : null;
    const timeLimitMinutes = Number(body?.timeLimitMinutes);
    const maxAttempts = Number(body?.maxAttempts) || 1;
    const passingScore = body?.passingScore != null && body.passingScore !== '' ? Number(body.passingScore) : null;
    const showResultsImmediately = body?.showResultsImmediately !== false;
    const startAt = body?.startAt ? new Date(body.startAt) : null;
    const endAt = body?.endAt ? new Date(body.endAt) : null;

    if (!courseId || !title || !Number.isFinite(timeLimitMinutes) || timeLimitMinutes <= 0) {
      return errorResponse('Course, title, and a valid time limit (minutes) are required', 400);
    }

    if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
      return errorResponse('Max attempts must be a whole number of at least 1', 400);
    }

    const assigned = await prisma.instructorCourse.findUnique({
      where: { instructorId_courseId: { instructorId: user.id, courseId } },
    });

    if (!assigned) {
      return errorResponse('You are not assigned to this course', 403);
    }

    const quiz = await prisma.quiz.create({
      data: {
        courseId,
        title,
        description,
        timeLimitMinutes,
        maxAttempts,
        passingScore,
        showResultsImmediately,
        startAt,
        endAt,
      },
    });

    return NextResponse.json({ success: true, data: quiz });
  } catch (error) {
    console.error('Instructor quizzes POST error:', error);
    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized', 401);
    if (error?.message === 'FORBIDDEN') return errorResponse('Instructor access required', 403);
    return errorResponse('Failed to create quiz', 500);
  }
}
