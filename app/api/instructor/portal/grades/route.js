import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireInstructor, requireInstructorEdit } from '@/lib/auth';

const COURSE_WEIGHTS = {
  quiz1: 15,
  quiz2: 15,
  assignment: 10,
  midterm: 20,
  final: 40,
};

function errorResponse(message, status) {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

export async function GET(request) {
  try {
    const user = await requireInstructor();

    const { searchParams } = new URL(request.url);
    const requestedCourseId =
      searchParams.get('courseId');

    const assignments =
      await prisma.instructorCourse.findMany({
        where: {
          instructorId: user.id,
        },
        include: {
          course: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

    const courses = assignments.map(({ course }) => ({
      id: course.id,
      title: course.titleEn,
      code: course.courseCode,
      quiz1Weight: COURSE_WEIGHTS.quiz1,
      quiz2Weight: COURSE_WEIGHTS.quiz2,
      assignWeight: COURSE_WEIGHTS.assignment,
      midtermWeight: COURSE_WEIGHTS.midterm,
      finalWeight: COURSE_WEIGHTS.final,
      // Model 19 -- only when the course specification actually
      // calls for one; the gradebook only shows a Practical column
      // for a course where this is true.
      practicalRequired: course.practicalRequired,
    }));

    const terms = await prisma.academicTerm.findMany({
      where: { isActive: true },
      orderBy: { startDate: 'desc' },
      take: 10,
    });

    if (courses.length === 0) {
      return NextResponse.json({
        courses: [],
        activeCourseId: null,
        weights: COURSE_WEIGHTS,
        students: [],
        terms,
      });
    }

    const activeCourse =
      courses.find(
        course => course.id === requestedCourseId
      ) || courses[0];

    const students =
      await prisma.enrollment.findMany({
        where: {
          courseId: activeCourse.id,
          status: 'APPROVED',
          user: {
            role: 'STUDENT',
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          user: {
            name: 'asc',
          },
        },
      });

    const grades = await prisma.grade.findMany({
      where: {
        courseId: activeCourse.id,
      },
    });

    // A student can have more than one Grade row for this course now
    // (one per attempt/term -- see lib/grading.js) -- take each
    // student's most recently saved attempt as what the gradebook
    // shows and edits (explicit, deterministic tie-break instead of
    // relying on whatever order the query happens to return, which
    // is what a plain `new Map(grades.map(g => [g.studentId, g]))`
    // did before -- harmless while only one row could ever exist,
    // silently arbitrary now that more than one can).
    const gradeMap = new Map();
    for (const grade of grades) {
      const existing = gradeMap.get(grade.studentId);
      const existingTime = existing ? new Date(existing.updatedAt).getTime() : -Infinity;
      const time = grade.updatedAt ? new Date(grade.updatedAt).getTime() : -Infinity;
      if (!existing || time >= existingTime) {
        gradeMap.set(grade.studentId, grade);
      }
    }

    return NextResponse.json({
      courses,
      activeCourseId: activeCourse.id,
      weights: COURSE_WEIGHTS,
      terms,

      students: students.map(({ user: student }) => {
        const grade = gradeMap.get(student.id);

        return {
          studentId: student.id,
          studentName: student.name,
          studentEmail: student.email,

          quiz1: grade?.quiz1 ?? 0,
          quiz2: grade?.quiz2 ?? 0,
          assignment: grade?.assignment ?? 0,
          midterm: grade?.midterm ?? 0,
          final: grade?.final ?? 0,
          practical: grade?.practical ?? 0,
          termId: grade?.termId ?? null,
          // Grade finalization -- lets the UI show a locked badge and
          // disable inputs for a row the instructor can no longer
          // silently overwrite (see POST below).
          status: grade?.status ?? 'DRAFT',
          finalizedAt: grade?.finalizedAt ?? null,
        };
      }),
    });
  } catch (error) {
    console.error(
      'Instructor grades GET error:',
      error
    );

    if (error?.message === 'UNAUTHORIZED') {
      return errorResponse(
        'Unauthorized',
        401
      );
    }

    if (error?.message === 'FORBIDDEN') {
      return errorResponse(
        'Instructor access required',
        403
      );
    }

    return errorResponse(
      'Failed to fetch grades data',
      500
    );
  }
}

export async function POST(request) {
  try {
    const user = await requireInstructorEdit();

    const body = await request.json();

    const courseId = body?.courseId;
    const termId = body?.termId || null;
    const action = body?.action || 'save';

    if (!courseId) {
      return errorResponse(
        'Course ID is required',
        400
      );
    }

    if (!termId) {
      return errorResponse(
        'Select an academic term before saving grades.',
        400
      );
    }

    const term = await prisma.academicTerm.findUnique({
      where: { id: termId },
    });

    if (!term) {
      return errorResponse(
        'Selected academic term was not found',
        400
      );
    }

    /*
     * Critical security check:
     *
     * The instructor may only submit grades for a
     * course that is actually assigned to them. Shared by both the
     * ordinary save path and the finalize action below -- do not
     * weaken or bypass this for either.
     */
    const assignment =
      await prisma.instructorCourse.findUnique({
        where: {
          instructorId_courseId: {
            instructorId: user.id,
            courseId,
          },
        },
      });

    if (!assignment) {
      return errorResponse(
        'You are not assigned to this course',
        403
      );
    }

    // Grade finalization -- a separate action on this same route
    // (rather than a new endpoint) so it can reuse the ownership
    // check above unchanged. Locks the named students' Grade rows
    // for this course + term as FINALIZED; from then on only the
    // Registrar's grade-correction workflow
    // (/api/records/grade-corrections) can change them -- see the
    // FINALIZED guard in the save path below. There is no
    // "unfinalize" here by design.
    if (action === 'finalize') {
      const studentIds = Array.isArray(body?.studentIds) ? body.studentIds : null;

      const approvedEnrollments =
        await prisma.enrollment.findMany({
          where: {
            courseId,
            status: 'APPROVED',
            user: {
              role: 'STUDENT',
            },
          },
          select: {
            userId: true,
          },
        });

      const approvedStudentIds = new Set(
        approvedEnrollments.map(
          enrollment => enrollment.userId
        )
      );

      const targetStudentIds = (studentIds || Array.from(approvedStudentIds))
        .filter(id => approvedStudentIds.has(id));

      if (targetStudentIds.length === 0) {
        return errorResponse(
          'No approved students to finalize for this course and term.',
          400
        );
      }

      const existingGrades = await prisma.grade.findMany({
        where: {
          courseId,
          termId,
          studentId: { in: targetStudentIds },
        },
      });
      const existingByStudent = new Map(
        existingGrades.map(grade => [grade.studentId, grade])
      );

      const now = new Date();

      const finalizeOps = targetStudentIds.map(studentId => {
        const existing = existingByStudent.get(studentId);

        // This route is plain JS (no compile-time Prisma types to
        // satisfy), so no `as any`-style workaround is needed here.
        // The Prisma Client in node_modules was generated before
        // this schema change, so it won't recognize
        // status/finalizedAt/finalizedByUserId until
        // `npx prisma generate` is run locally -- until then, calls
        // through this route that touch these fields will fail at
        // runtime, same as any other not-yet-generated field would.
        const finalizeData = {
          status: 'FINALIZED',
          finalizedAt: now,
          finalizedByUserId: user.id,
        };

        if (existing) {
          return prisma.grade.update({
            where: { id: existing.id },
            data: finalizeData,
          });
        }

        return prisma.grade.create({
          data: {
            studentId,
            courseId,
            termId,
            ...finalizeData,
          },
        });
      });

      await prisma.$transaction(finalizeOps);

      return NextResponse.json({
        success: true,
        message: 'Selected grades finalized. Further changes require a Registrar grade correction.',
        finalizedStudentIds: targetStudentIds,
      });
    }

    const grades = body?.grades;

    if (!Array.isArray(grades)) {
      return errorResponse(
        'Grades must be an array',
        400
      );
    }

    /*
     * Only approved students enrolled in the course
     * may receive grades.
     */
    const approvedEnrollments =
      await prisma.enrollment.findMany({
        where: {
          courseId,
          status: 'APPROVED',
          user: {
            role: 'STUDENT',
          },
        },
        select: {
          userId: true,
        },
      });

    const approvedStudentIds = new Set(
      approvedEnrollments.map(
        enrollment => enrollment.userId
      )
    );

    for (const item of grades) {
      if (
        !item?.studentId ||
        !approvedStudentIds.has(item.studentId)
      ) {
        return errorResponse(
          'One or more students are not approved for this course',
          400
        );
      }

      const values = [
        item.quiz1,
        item.quiz2,
        item.assignment,
        item.midterm,
        item.final,
        item.practical,
      ];

      for (const value of values) {
        if (
          value !== null &&
          value !== undefined &&
          (!Number.isFinite(Number(value)) ||
            Number(value) < 0 ||
            Number(value) > 100)
        ) {
          return errorResponse(
            'Grades must be numbers between 0 and 100',
            400
          );
        }
      }
    }

    /*
     * Grade finalization guard: a row an instructor already
     * finalized (see the 'finalize' action above) may no longer be
     * silently overwritten by this save path. Only DRAFT rows, or
     * students with no existing row yet (new rows are DRAFT by the
     * schema default), may be upserted here going forward -- a
     * genuinely-needed change to a FINALIZED row must go through the
     * Registrar's controlled workflow at
     * /api/records/grade-corrections instead.
     */
    const existingGradesForCheck = await prisma.grade.findMany({
      where: {
        courseId,
        termId,
        studentId: { in: grades.map(item => item.studentId) },
      },
    });
    const existingStatusByStudent = new Map(
      existingGradesForCheck.map(grade => [grade.studentId, grade.status])
    );

    const finalizedStudentIds = grades
      .filter(item => existingStatusByStudent.get(item.studentId) === 'FINALIZED')
      .map(item => item.studentId);

    if (finalizedStudentIds.length > 0) {
      return errorResponse(
        'One or more grades in this request are already finalized and cannot be overwritten here. ' +
          'A genuine correction to a finalized grade must go through the Registrar\'s grade-correction workflow (Academic Records).',
        409
      );
    }

    await prisma.$transaction(
      grades.map(item =>
        prisma.grade.upsert({
          where: {
            studentId_courseId_termId: {
              studentId: item.studentId,
              courseId,
              termId,
            },
          },

          create: {
            studentId: item.studentId,
            courseId,
            termId,

            quiz1:
              item.quiz1 == null
                ? null
                : Number(item.quiz1),

            quiz2:
              item.quiz2 == null
                ? null
                : Number(item.quiz2),

            assignment:
              item.assignment == null
                ? null
                : Number(item.assignment),

            midterm:
              item.midterm == null
                ? null
                : Number(item.midterm),

            final:
              item.final == null
                ? null
                : Number(item.final),

            practical:
              item.practical == null
                ? null
                : Number(item.practical),
          },

          update: {
            quiz1:
              item.quiz1 == null
                ? null
                : Number(item.quiz1),

            quiz2:
              item.quiz2 == null
                ? null
                : Number(item.quiz2),

            assignment:
              item.assignment == null
                ? null
                : Number(item.assignment),

            midterm:
              item.midterm == null
                ? null
                : Number(item.midterm),

            final:
              item.final == null
                ? null
                : Number(item.final),

            practical:
              item.practical == null
                ? null
                : Number(item.practical),
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: 'Grades saved successfully.',
    });
  } catch (error) {
    console.error(
      'Instructor grades POST error:',
      error
    );

    if (error?.message === 'UNAUTHORIZED') {
      return errorResponse(
        'Unauthorized',
        401
      );
    }

    if (error?.message === 'FORBIDDEN') {
      return errorResponse(
        'Instructor access required',
        403
      );
    }

    return errorResponse(
      'Failed to save grades',
      500
    );
  }
}
