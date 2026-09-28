import { prisma } from "@/lib/prisma";
import { gradeLetter } from "@/lib/grading";

/**
 * Real automatic course assignment — the "system" half of course
 * registration (see app/academics/study-plan for the "student" half:
 * request-to-add / request-to-drop).
 *
 * A course is only ever auto-assigned when ALL of the following hold:
 *   - it belongs to the student's own programme,
 *   - Academic Records has sequenced it (Course.semesterLevel is set —
 *     courses with no semesterLevel are simply left out, never guessed),
 *   - the student has not already completed-and-passed it,
 *   - the student is not already enrolled in it,
 *   - every one of its prerequisite courses has been completed-and-passed.
 *
 * Only the lowest not-yet-satisfied semesterLevel is assigned at a time,
 * so a student is never registered two years ahead of where they stand.
 */
export async function computeAutoAssignableCourses(studentProfile) {
  if (!studentProfile?.programId || !studentProfile?.userId) return [];

  const [allCourses, grades, enrollments] = await Promise.all([
    prisma.course.findMany({
      where: { programId: studentProfile.programId },
      include: { prerequisites: { select: { id: true, titleEn: true, courseCode: true } } },
    }),
    prisma.grade.findMany({
      where: { studentId: studentProfile.userId },
      select: { courseId: true, final: true },
    }),
    prisma.enrollment.findMany({
      where: { userId: studentProfile.userId },
      select: { courseId: true },
    }),
  ]);

  const passedCourseIds = new Set(
    grades
      .filter((g) => g.final != null && gradeLetter(g.final) !== "F")
      .map((g) => g.courseId)
  );
  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));

  // Courses Academic Records hasn't sequenced yet are never auto-assigned.
  const sequenced = allCourses.filter((c) => c.semesterLevel != null);

  const eligible = sequenced
    .filter((course) => !passedCourseIds.has(course.id))
    .filter((course) => !enrolledCourseIds.has(course.id))
    .map((course) => {
      const unmetPrerequisites = course.prerequisites.filter(
        (p) => !passedCourseIds.has(p.id)
      );
      return { course, unmetPrerequisites };
    })
    .filter((entry) => entry.unmetPrerequisites.length === 0)
    .map((entry) => entry.course);

  if (eligible.length === 0) return [];

  const nextLevel = Math.min(...eligible.map((c) => c.semesterLevel));
  return eligible.filter((c) => c.semesterLevel === nextLevel);
}

/**
 * Actually enrolls a student in every course computeAutoAssignableCourses
 * returns for them — real Enrollment rows, not a UI-only projection.
 * Idempotent — re-running it for a student already at the right level
 * creates nothing new.
 */
export async function autoAssignCoursesForStudent(studentProfile) {
  const courses = await computeAutoAssignableCourses(studentProfile);
  const created = [];

  for (const course of courses) {
    const enrollment = await prisma.enrollment.upsert({
      where: {
        userId_courseId: { userId: studentProfile.userId, courseId: course.id },
      },
      update: {},
      create: {
        id: crypto.randomUUID(),
        userId: studentProfile.userId,
        courseId: course.id,
        status: "APPROVED",
      },
    });
    created.push({ enrollment, course });
  }

  return created;
}

/**
 * Runs auto-assignment for every active student in a given programme (or
 * every active student across all programmes when programId is omitted).
 * Used by the Academic Records / Registry batch action at the start of a
 * term — see app/api/admin/academic-records/auto-assign.
 */
export async function autoAssignCoursesForProgram(programId) {
  const students = await prisma.studentProfile.findMany({
    where: {
      status: "ACTIVE",
      ...(programId ? { programId } : {}),
    },
  });

  const results = [];
  for (const student of students) {
    const created = await autoAssignCoursesForStudent(student);
    if (created.length > 0) {
      results.push({ studentId: student.id, studentNo: student.studentNo, assigned: created.map((c) => c.course) });
    }
  }
  return results;
}
