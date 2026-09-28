import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireInstructor, requireInstructorEdit } from '@/lib/auth';
import { computeAttendanceStatus } from '@/lib/attendancePolicy';

const VALID_MARKS = ['PRESENT', 'LATE', 'ABSENT'];

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
      return NextResponse.json({ courses: [], activeCourseId: null, students: [] });
    }

    const activeCourse =
      courses.find((c) => c.id === requestedCourseId) || courses[0];

    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId: activeCourse.id,
        status: 'APPROVED',
        user: { role: 'STUDENT' },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            studentProfile: { select: { id: true, studentNo: true } },
          },
        },
      },
      orderBy: { user: { name: 'asc' } },
    });

    const studentProfileIds = enrollments
      .map((e) => e.user.studentProfile?.id)
      .filter(Boolean);

    const attendanceRecords = await prisma.attendance.findMany({
      where: { courseId: activeCourse.id, studentId: { in: studentProfileIds } },
    });

    const attendanceByStudentProfileId = new Map(
      attendanceRecords.map((a) => [a.studentId, a])
    );

    const students = enrollments
      .filter((e) => e.user.studentProfile)
      .map(({ user: student }) => {
        const record = attendanceByStudentProfileId.get(student.studentProfile.id);
        const totalClasses = record?.totalClasses ?? 0;
        const attended = record?.attended ?? 0;
        const late = record?.late ?? 0;
        const absent = record?.absent ?? 0;
        const { rate, status } = computeAttendanceStatus(totalClasses, attended, late);

        return {
          studentProfileId: student.studentProfile.id,
          studentName: student.name,
          studentEmail: student.email,
          studentNo: student.studentProfile.studentNo,
          totalClasses,
          attended,
          late,
          absent,
          attendanceRate: rate,
          status,
        };
      });

    return NextResponse.json({
      courses,
      activeCourseId: activeCourse.id,
      students,
    });
  } catch (error) {
    console.error('Instructor attendance GET error:', error);

    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized', 401);
    if (error?.message === 'FORBIDDEN') return errorResponse('Instructor access required', 403);

    return errorResponse('Failed to fetch attendance', 500);
  }
}

// Records one attendance session (e.g. today's class) for a course: the
// instructor marks every enrolled student Present, Late, or Absent, and
// each mark increments that student's cumulative totals by one session
// (totalClasses +1 always; attended/late/absent +1 depending on the
// mark). This keeps the per-course Attendance row as a running,
// always-accurate cumulative tally rather than requiring the instructor
// to compute/enter raw totals by hand.
export async function POST(request) {
  try {
    const user = await requireInstructorEdit();

    const body = await request.json();
    const courseId = body?.courseId;
    const marks = body?.marks;

    if (!courseId) {
      return errorResponse('Course ID is required', 400);
    }

    if (!Array.isArray(marks) || marks.length === 0) {
      return errorResponse('At least one attendance mark is required', 400);
    }

    // Security: instructor must actually be assigned to this course.
    const assignment = await prisma.instructorCourse.findUnique({
      where: { instructorId_courseId: { instructorId: user.id, courseId } },
    });

    if (!assignment) {
      return errorResponse('You are not assigned to this course', 403);
    }

    // Security: every studentProfileId marked must actually be an
    // approved, enrolled student in this course — otherwise an
    // instructor could inflate/deflate an arbitrary student's record.
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId, status: 'APPROVED', user: { role: 'STUDENT' } },
      include: { user: { select: { studentProfile: { select: { id: true } } } } },
    });
    const validStudentProfileIds = new Set(
      enrollments.map((e) => e.user.studentProfile?.id).filter(Boolean)
    );

    for (const item of marks) {
      if (
        !item?.studentProfileId ||
        !validStudentProfileIds.has(item.studentProfileId) ||
        !VALID_MARKS.includes(item.mark)
      ) {
        return errorResponse('Invalid attendance marks submitted', 400);
      }
    }

    // One mark per student per submission.
    const seen = new Set();
    for (const item of marks) {
      if (seen.has(item.studentProfileId)) {
        return errorResponse('Duplicate student in attendance submission', 400);
      }
      seen.add(item.studentProfileId);
    }

    await prisma.$transaction(
      marks.map((item) => {
        const attendedInc = item.mark === 'PRESENT' ? 1 : 0;
        const lateInc = item.mark === 'LATE' ? 1 : 0;
        const absentInc = item.mark === 'ABSENT' ? 1 : 0;

        return prisma.attendance.upsert({
          where: {
            studentId_courseId: {
              studentId: item.studentProfileId,
              courseId,
            },
          },
          update: {
            totalClasses: { increment: 1 },
            attended: { increment: attendedInc },
            late: { increment: lateInc },
            absent: { increment: absentInc },
          },
          create: {
            studentId: item.studentProfileId,
            courseId,
            totalClasses: 1,
            attended: attendedInc,
            late: lateInc,
            absent: absentInc,
          },
        });
      })
    );

    return NextResponse.json({ success: true, message: 'Attendance recorded successfully.' });
  } catch (error) {
    console.error('Instructor attendance POST error:', error);

    if (error?.message === 'UNAUTHORIZED') return errorResponse('Unauthorized', 401);
    if (error?.message === 'FORBIDDEN') return errorResponse('Instructor access required', 403);

    return errorResponse('Failed to save attendance', 500);
  }
}
