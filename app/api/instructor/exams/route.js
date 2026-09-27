import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireInstructor, requireInstructorEdit } from '@/lib/auth';

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

// Conflict detection (Model 22): an exam's [scheduledAt, scheduledAt +
// durationMin) window must not overlap another exam that shares either
// (a) an instructor assigned to the exam's course, within the same term,
// or (b) the same physical venue, within the same term. Venue is optional
// free text (online/take-home exams leave it blank), so the venue check
// only applies when both exams name one and it matches exactly.
async function findExamConflict(courseId, termId, venue, scheduledAt, durationMin) {
  const windowStart = scheduledAt;
  const windowEnd = new Date(windowStart.getTime() + durationMin * 60000);

  const instructorAssignments = await prisma.instructorCourse.findMany({
    where: { courseId },
    select: { instructorId: true },
  });
  const instructorIds = instructorAssignments.map((a) => a.instructorId);

  const orClauses = [];
  if (instructorIds.length > 0) {
    orClauses.push({ course: { instructors: { some: { instructorId: { in: instructorIds } } } } });
  }
  if (venue) {
    orClauses.push({ venue });
  }
  if (orClauses.length === 0) return null;

  const candidates = await prisma.exam.findMany({
    where: {
      termId,
      scheduledAt: {
        gte: new Date(windowStart.getTime() - 24 * 60 * 60000),
        lt: windowEnd,
      },
      OR: orClauses,
    },
    include: { course: { select: { titleEn: true } } },
  });

  for (const existing of candidates) {
    const existingStart = new Date(existing.scheduledAt);
    const existingEnd = new Date(existingStart.getTime() + existing.durationMin * 60000);

    if (windowStart < existingEnd && existingStart < windowEnd) {
      return existing;
    }
  }

  return null;
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

    const terms = await prisma.academicTerm.findMany({
      where: { isActive: true },
      orderBy: { startDate: 'desc' },
      take: 10,
    });

    if (courses.length === 0) {
      return NextResponse.json({ courses: [], activeCourseId: null, terms, exams: [] });
    }

    const activeCourse =
      courses.find((c) => c.id === requestedCourseId) || courses[0];

    const exams = await prisma.exam.findMany({
      where: { courseId: activeCourse.id },
      include: { term: { select: { id: true, name: true } } },
      orderBy: { scheduledAt: 'asc' },
    });

    return NextResponse.json({
      courses,
      activeCourseId: activeCourse.id,
      terms,
      exams,
    });
  } catch (error) {
    console.error('Instructor exams GET error:', error);

    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized', 401);
    if (error?.message === 'FORBIDDEN') return errorResponse('Instructor access required', 403);

    return errorResponse('Failed to fetch exams', 500);
  }
}

export async function POST(request) {
  try {
    const user = await requireInstructorEdit();

    const body = await request.json();
    const courseId = body?.courseId;
    const termId = body?.termId;
    const examType = body?.examType;
    const scheduledAt = body?.scheduledAt ? new Date(body.scheduledAt) : null;
    const durationMin = Number(body?.durationMin);
    const venue = typeof body?.venue === 'string' ? body.venue.trim() : null;
    const maxScore = typeof body?.maxScore === 'number' ? body.maxScore : 100;

    const validTypes = ['QUIZ', 'MIDTERM', 'FINAL', 'MAKEUP'];

    if (
      !courseId ||
      !termId ||
      !validTypes.includes(examType) ||
      !scheduledAt ||
      isNaN(scheduledAt.getTime()) ||
      !Number.isFinite(durationMin)
    ) {
      return errorResponse(
        'Course, term, a valid exam type, scheduled date, and duration are required',
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

    const conflict = await findExamConflict(courseId, termId, venue, scheduledAt, durationMin);
    if (conflict) {
      return errorResponse(
        `This overlaps an existing exam ("${conflict.course.titleEn}") for the same instructor or venue.`,
        409
      );
    }

    const created = await prisma.exam.create({
      data: { courseId, termId, examType, scheduledAt, durationMin, venue, maxScore },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    console.error('Instructor exams POST error:', error);

    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized', 401);
    if (error?.message === 'FORBIDDEN') return errorResponse('Instructor access required', 403);

    return errorResponse('Failed to schedule exam', 500);
  }
}