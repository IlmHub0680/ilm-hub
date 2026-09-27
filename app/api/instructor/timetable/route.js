import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireInstructor } from '@/lib/auth';

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

// Model 22 -- a single chronological schedule combining every LiveClass
// and Exam tied to this instructor's assigned courses. Deliberately NOT a
// stored table: it's a read-only merge of the same two live sources the
// Instructor Portal's "Live Classes" and "Exams" tools already write to,
// so there is nothing here to keep in sync -- create/edit/cancel still
// happens on those existing tools, this view just puts both schedules
// side by side the way a real institute's staff timetable would.
export async function GET() {
  try {
    const user = await requireInstructor();

    const assignments = await prisma.instructorCourse.findMany({
      where: { instructorId: user.id },
      select: { courseId: true },
    });
    const courseIds = assignments.map((a) => a.courseId);

    if (courseIds.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const [liveClasses, exams] = await Promise.all([
      prisma.liveClass.findMany({
        where: { instructorId: user.id },
        include: { course: { select: { titleEn: true, courseCode: true } } },
        orderBy: { scheduledAt: 'asc' },
      }),
      prisma.exam.findMany({
        where: { courseId: { in: courseIds } },
        include: {
          course: { select: { titleEn: true, courseCode: true } },
          term: { select: { name: true } },
        },
        orderBy: { scheduledAt: 'asc' },
      }),
    ]);

    const items = [
      ...liveClasses.map((c) => ({
        kind: 'LIVE_CLASS',
        id: c.id,
        courseTitle: c.course.titleEn,
        courseCode: c.course.courseCode,
        title: c.topic,
        scheduledAt: c.scheduledAt,
        durationMin: c.durationMin,
        location: c.meetingLink,
        termName: null,
      })),
      ...exams.map((e) => ({
        kind: 'EXAM',
        id: e.id,
        courseTitle: e.course.titleEn,
        courseCode: e.course.courseCode,
        title: e.examType,
        scheduledAt: e.scheduledAt,
        durationMin: e.durationMin,
        location: e.venue,
        termName: e.term?.name ?? null,
      })),
    ].sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Instructor timetable GET error:', error);

    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized', 401);
    if (error?.message === 'FORBIDDEN') return errorResponse('Instructor access required', 403);

    return errorResponse('Failed to load timetable', 500);
  }
}
