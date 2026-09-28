import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireInstructorEdit } from '@/lib/auth';

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

async function loadOwnedAssignment(instructorId, assignmentId) {
  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
  if (!assignment) return { assignment: null, allowed: false };

  const ownership = await prisma.instructorCourse.findUnique({
    where: { instructorId_courseId: { instructorId, courseId: assignment.courseId } },
  });

  return { assignment, allowed: !!ownership };
}

export async function PUT(request, { params }) {
  try {
    const user = await requireInstructorEdit();
    const { id } = await params;

    const { assignment, allowed } = await loadOwnedAssignment(user.id, id);

    if (!assignment) return errorResponse('Assignment not found', 404);
    if (!allowed) return errorResponse('You are not assigned to this course', 403);

    const body = await request.json();
    const data = {};

    if (typeof body?.title === 'string' && body.title.trim()) {
      data.title = body.title.trim();
    }

    if (typeof body?.description === 'string') {
      data.description = body.description.trim() || null;
    }

    if (body?.dueDate) {
      const dueDate = new Date(body.dueDate);
      if (isNaN(dueDate.getTime())) {
        return errorResponse('Invalid due date', 400);
      }
      data.dueDate = dueDate;
    }

    if (body?.maxScore !== undefined) {
      const maxScore = Number(body.maxScore);
      if (!Number.isFinite(maxScore)) {
        return errorResponse('Invalid max score', 400);
      }
      data.maxScore = maxScore;
    }

    const updated = await prisma.assignment.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      data: { ...updated, attachmentUrl: updated.attachmentUrl ? true : null },
    });
  } catch (error) {
    console.error('Instructor assignment PUT error:', error);

    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized', 401);
    if (error?.message === 'FORBIDDEN') return errorResponse('Instructor access required', 403);

    return errorResponse('Failed to update assignment', 500);
  }
}

export async function DELETE(_request, { params }) {
  try {
    const user = await requireInstructorEdit();
    const { id } = await params;

    const { assignment, allowed } = await loadOwnedAssignment(user.id, id);

    if (!assignment) return errorResponse('Assignment not found', 404);
    if (!allowed) return errorResponse('You are not assigned to this course', 403);

    // Safety: a hard delete would cascade and destroy any student
    // submissions (and grades) already recorded against this
    // assignment. Block it once real student work exists, the same
    // "hard delete gated by zero dependent records" rule used
    // elsewhere in this codebase.
    const submissionCount = await prisma.submission.count({ where: { assignmentId: id } });
    if (submissionCount > 0) {
      return errorResponse(
        'This assignment already has student submissions and cannot be deleted. Edit it instead, or contact Academic Records if it truly must be removed.',
        409
      );
    }

    await prisma.assignment.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Instructor assignment DELETE error:', error);

    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized', 401);
    if (error?.message === 'FORBIDDEN') return errorResponse('Instructor access required', 403);

    return errorResponse('Failed to remove assignment', 500);
  }
}
