import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireInstructor, requireInstructorEdit } from '@/lib/auth';

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

// Lists every approved, enrolled student in the assignment's course
// alongside their submission (if any) — mirrors the instructor
// attendance roster pattern, so an instructor sees who has and hasn't
// submitted, not just the students who happened to submit.
export async function GET(request, { params }) {
  try {
    const user = await requireInstructor();
    const { id: assignmentId } = await params;

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { course: true },
    });

    if (!assignment) {
      return errorResponse('Assignment not found', 404);
    }

    const assigned = await prisma.instructorCourse.findUnique({
      where: {
        instructorId_courseId: { instructorId: user.id, courseId: assignment.courseId },
      },
    });

    if (!assigned) {
      return errorResponse('You are not assigned to this course', 403);
    }

    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId: assignment.courseId,
        status: 'APPROVED',
        user: { role: 'STUDENT' },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            studentProfile: { select: { studentNo: true } },
          },
        },
      },
      orderBy: { user: { name: 'asc' } },
    });

    const studentIds = enrollments.map((e) => e.user.id);

    const submissions = await prisma.submission.findMany({
      where: { assignmentId, studentId: { in: studentIds } },
    });

    const submissionByStudentId = new Map(submissions.map((s) => [s.studentId, s]));

    const roster = enrollments.map(({ user: student }) => {
      const submission = submissionByStudentId.get(student.id);

      return {
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        studentNo: student.studentProfile?.studentNo || null,
        submission: submission
          ? {
              id: submission.id,
              status: submission.status,
              answerText: submission.answerText,
              hasFile: !!submission.fileUrl,
              submittedAt: submission.submittedAt,
              score: submission.score,
              feedback: submission.feedback,
            }
          : null,
      };
    });

    return NextResponse.json({
      assignment: {
        id: assignment.id,
        title: assignment.title,
        maxScore: assignment.maxScore,
        dueDate: assignment.dueDate,
        courseTitle: assignment.course.titleEn,
        courseCode: assignment.course.courseCode,
      },
      roster,
    });
  } catch (error) {
    console.error('Instructor assignment submissions GET error:', error);

    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized', 401);
    if (error?.message === 'FORBIDDEN') return errorResponse('Instructor access required', 403);

    return errorResponse('Failed to fetch submissions', 500);
  }
}
