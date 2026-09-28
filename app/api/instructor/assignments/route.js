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
      return NextResponse.json({ courses: [], activeCourseId: null, assignments: [] });
    }

    const activeCourse =
      courses.find((c) => c.id === requestedCourseId) || courses[0];

    const assignments = await prisma.assignment.findMany({
      where: { courseId: activeCourse.id },
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json({
      courses,
      activeCourseId: activeCourse.id,
      assignments: assignments.map((a) => ({
        ...a,
        attachmentUrl: a.attachmentUrl ? true : null,
      })),
    });
  } catch (error) {
    console.error('Instructor assignments GET error:', error);

    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized', 401);
    if (error?.message === 'FORBIDDEN') return errorResponse('Instructor access required', 403);

    return errorResponse('Failed to fetch assignments', 500);
  }
}

export async function POST(request) {
  try {
    const user = await requireInstructorEdit();

    const body = await request.json();
    const courseId = body?.courseId;
    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    const description =
      typeof body?.description === 'string' ? body.description.trim() : null;
    const dueDate = body?.dueDate ? new Date(body.dueDate) : null;
    const maxScore = typeof body?.maxScore === 'number' ? body.maxScore : 100;
    const attachmentKey =
      typeof body?.attachmentKey === 'string' && body.attachmentKey
        ? body.attachmentKey
        : null;

    if (!courseId || !title || !dueDate || isNaN(dueDate.getTime())) {
      return errorResponse('Course, title, and a valid due date are required', 400);
    }

    // Security: instructor must actually be assigned to this course.
    const assignment = await prisma.instructorCourse.findUnique({
      where: { instructorId_courseId: { instructorId: user.id, courseId } },
    });

    if (!assignment) {
      return errorResponse('You are not assigned to this course', 403);
    }

    const created = await prisma.assignment.create({
      data: { courseId, title, description, dueDate, maxScore, attachmentUrl: attachmentKey },
    });

    return NextResponse.json({
      success: true,
      data: { ...created, attachmentUrl: created.attachmentUrl ? true : null },
    });
  } catch (error) {
    console.error('Instructor assignments POST error:', error);

    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized', 401);
    if (error?.message === 'FORBIDDEN') return errorResponse('Instructor access required', 403);

    return errorResponse('Failed to create assignment', 500);
  }
}