import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireInstructorEdit } from '@/lib/auth';
import { findInstructorLiveClassConflict } from '../conflict';

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

async function loadOwnedLiveClass(instructorId, liveClassId) {
  const liveClass = await prisma.liveClass.findUnique({ where: { id: liveClassId } });
  if (!liveClass) return { liveClass: null, allowed: false };

  const assignment = await prisma.instructorCourse.findUnique({
    where: { instructorId_courseId: { instructorId, courseId: liveClass.courseId } },
  });

  return { liveClass, allowed: !!assignment };
}

export async function PUT(request, { params }) {
  try {
    const user = await requireInstructorEdit();
    const { id } = await params;

    const { liveClass, allowed } = await loadOwnedLiveClass(user.id, id);

    if (!liveClass) return errorResponse('Live class not found', 404);
    if (!allowed) return errorResponse('You are not assigned to this course', 403);

    const body = await request.json();
    const data = {};

    if (typeof body?.topic === 'string' && body.topic.trim()) {
      data.topic = body.topic.trim();
    }

    if (body?.scheduledAt) {
      const scheduledAt = new Date(body.scheduledAt);
      if (isNaN(scheduledAt.getTime())) {
        return errorResponse('Invalid scheduled date/time', 400);
      }
      data.scheduledAt = scheduledAt;
    }

    if (body?.durationMin !== undefined) {
      const durationMin = Number(body.durationMin);
      if (!Number.isFinite(durationMin)) {
        return errorResponse('Invalid duration', 400);
      }
      data.durationMin = durationMin;
    }

    if (typeof body?.meetingLink === 'string' && body.meetingLink.trim()) {
      data.meetingLink = body.meetingLink.trim();
    }

    if (typeof body?.notes === 'string') {
      data.notes = body.notes.trim() || null;
    }

    if (data.scheduledAt || data.durationMin !== undefined) {
      const checkAt = data.scheduledAt || liveClass.scheduledAt;
      const checkDuration = data.durationMin !== undefined ? data.durationMin : liveClass.durationMin;

      const conflict = await findInstructorLiveClassConflict(user.id, checkAt, checkDuration, id);
      if (conflict) {
        return errorResponse(
          `You already have a live class ("${conflict.course.titleEn}") scheduled at an overlapping time.`,
          409
        );
      }
    }

    const updated = await prisma.liveClass.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Instructor live class PUT error:', error);

    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized', 401);
    if (error?.message === 'FORBIDDEN') return errorResponse('Instructor access required', 403);

    return errorResponse('Failed to update live class', 500);
  }
}

export async function DELETE(_request, { params }) {
  try {
    const user = await requireInstructorEdit();
    const { id } = await params;

    const { liveClass, allowed } = await loadOwnedLiveClass(user.id, id);

    if (!liveClass) return errorResponse('Live class not found', 404);
    if (!allowed) return errorResponse('You are not assigned to this course', 403);

    await prisma.liveClass.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Instructor live class DELETE error:', error);

    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized', 401);
    if (error?.message === 'FORBIDDEN') return errorResponse('Instructor access required', 403);

    return errorResponse('Failed to remove live class', 500);
  }
}
