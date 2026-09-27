import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireInstructor, requireInstructorEdit } from '@/lib/auth';
import { findInstructorLiveClassConflict } from './conflict';

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
      return NextResponse.json({ courses: [], activeCourseId: null, liveClasses: [] });
    }

    const activeCourse =
      courses.find((c) => c.id === requestedCourseId) || courses[0];

    const liveClasses = await prisma.liveClass.findMany({
      where: { courseId: activeCourse.id },
      orderBy: { scheduledAt: 'asc' },
    });

    return NextResponse.json({
      courses,
      activeCourseId: activeCourse.id,
      liveClasses,
    });
  } catch (error) {
    console.error('Instructor live classes GET error:', error);

    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized', 401);
    if (error?.message === 'FORBIDDEN') return errorResponse('Instructor access required', 403);

    return errorResponse('Failed to fetch live classes', 500);
  }
}

export async function POST(request) {
  try {
    const user = await requireInstructorEdit();

    const body = await request.json();
    const courseId = body?.courseId;
    const topic = typeof body?.topic === 'string' ? body.topic.trim() : '';
    const scheduledAt = body?.scheduledAt ? new Date(body.scheduledAt) : null;
    const durationMin = Number(body?.durationMin);
    const meetingLink = typeof body?.meetingLink === 'string' ? body.meetingLink.trim() : '';
    const notes = typeof body?.notes === 'string' ? body.notes.trim() : null;

    if (
      !courseId ||
      !topic ||
      !scheduledAt ||
      isNaN(scheduledAt.getTime()) ||
      !Number.isFinite(durationMin) ||
      !meetingLink
    ) {
      return errorResponse(
        'Course, topic, scheduled date/time, duration, and a meeting link are required',
        400
      );
    }

    // Security: instructor must actually be assigned to this course.
    const assignment = await prisma.instructorCourse.findUnique({
      where: { instructorId_courseId: { instructorId: user.id, courseId } },
    });

    if (!assignment) {
      return errorResponse('You are not assigned to this course', 403);
    }

    const conflict = await findInstructorLiveClassConflict(user.id, scheduledAt, durationMin, null);
    if (conflict) {
      return errorResponse(
        `You already have a live class ("${conflict.course.titleEn}") scheduled at an overlapping time.`,
        409
      );
    }

    const created = await prisma.liveClass.create({
      data: {
        courseId,
        instructorId: user.id,
        topic,
        scheduledAt,
        durationMin,
        meetingLink,
        notes,
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    console.error('Instructor live classes POST error:', error);

    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized', 401);
    if (error?.message === 'FORBIDDEN') return errorResponse('Instructor access required', 403);

    return errorResponse('Failed to schedule live class', 500);
  }
}
