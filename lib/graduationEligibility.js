// Server-authoritative graduation eligibility computation — the single
// source of truth for "is this student eligible to apply for
// graduation, and if not, why not". Mirrors the same real-completion
// logic already shown to students on their Academic Progress pages
// (app/academics/deriveAcademics.js: getCoursePlanOverview /
// getAcademicLevelProgress) so a student is never told two different
// things about the same requirement — but this copy runs on the
// server and is what actually gates GraduationApplication creation,
// not just what the UI happens to render. A disabled button in the
// browser is cosmetic; this is the real check (see
// app/api/student/graduation/route.js POST).
//
// Checks, matching the institute's stated graduation requirements:
//   - Academic status allows graduation (not suspended/withdrawn/dismissed)
//   - Assigned to a programme with a configured course curriculum
//   - Passed every required course in that curriculum (a failed course
//     still counts as outstanding until retaken and passed)
//   - Earned every required credit hour of that curriculum
//   - Completed all required academic levels (year of study), using the
//     exact same level-progression formula shown on the student's own
//     Academic Progress page

import { prisma } from "@/lib/prisma";
import { gradeLetter, latestGradeByCourse } from "@/lib/grading";

const BLOCKED_STATUSES = ["SUSPENDED", "WITHDRAWN", "DISMISSED"];

export async function computeGraduationEligibility(studentProfileId) {
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentProfileId },
    include: {
      program: { include: { courses: true } },
    },
  });

  if (!student) {
    return { eligible: false, reasons: ["Student profile not found."], details: null };
  }

  const reasons = [];

  if (BLOCKED_STATUSES.includes(student.status)) {
    reasons.push(
      "Your current academic status does not allow a graduation application. Please contact Student Affairs."
    );
  }

  if (!student.program) {
    reasons.push("You are not currently assigned to a programme. Please contact Academic Administration.");
    return { eligible: false, reasons, details: null };
  }

  const program = student.program;
  const curriculum = program.courses || [];

  if (curriculum.length === 0) {
    reasons.push(
      "Your programme's course requirements have not been fully configured yet. Please contact the Registrar."
    );
    return { eligible: false, reasons, details: { programName: program.nameEn } };
  }

  const requiredCreditHours = curriculum.reduce((sum, c) => sum + (c.creditHours || 0), 0);

  const grades = await prisma.grade.findMany({
    where: {
      studentId: student.userId,
      courseId: { in: curriculum.map((c) => c.id) },
    },
  });

  // A repeated course can now have more than one Grade row (one per
  // attempt/term) -- reduce to each course's most recently saved
  // attempt before deciding pass/fail, so a student who failed and
  // later passed a retake is correctly read as having passed.
  const gradeByCourseId = latestGradeByCourse(grades);

  let passedCount = 0;
  let passedCreditHours = 0;
  const remainingCourses = [];

  for (const course of curriculum) {
    const grade = gradeByCourseId.get(course.id);
    const hasFinal = !!grade && grade.final != null;
    const letter = hasFinal ? gradeLetter(grade.final) : null;
    const passed = hasFinal && letter !== "F";

    if (passed) {
      passedCount += 1;
      passedCreditHours += course.creditHours || 0;
    } else {
      remainingCourses.push({
        id: course.id,
        code: course.courseCode,
        title: course.titleEn,
        status: hasFinal ? "failed" : "not_taken",
      });
    }
  }

  const totalCourses = curriculum.length;
  const durationYears = program.durationYears || null;
  const coursesPerLevel = durationYears ? Math.ceil(totalCourses / durationYears) : null;
  const computedLevel = coursesPerLevel
    ? Math.min(durationYears, Math.floor(passedCount / coursesPerLevel) + 1)
    : null;

  const allCoursesPassed = remainingCourses.length === 0;
  const creditHoursMet = passedCreditHours >= requiredCreditHours;
  const levelsCompleted = durationYears ? computedLevel >= durationYears : allCoursesPassed;

  if (!allCoursesPassed) {
    const preview = remainingCourses
      .slice(0, 5)
      .map((c) => c.code)
      .join(", ");
    reasons.push(
      `You still have ${remainingCourses.length} required course${
        remainingCourses.length === 1 ? "" : "s"
      } to pass: ${preview}${remainingCourses.length > 5 ? ", …" : ""}.`
    );
  }

  if (allCoursesPassed && !creditHoursMet) {
    reasons.push(
      `You have earned ${passedCreditHours} of ${requiredCreditHours} required credit hours.`
    );
  }

  if (allCoursesPassed && durationYears && !levelsCompleted) {
    reasons.push(
      `You have not yet completed all required academic levels (currently Level ${computedLevel} of ${durationYears}).`
    );
  }

  const eligible = reasons.length === 0;

  return {
    eligible,
    reasons,
    details: {
      programName: program.nameEn,
      totalCourses,
      passedCourses: passedCount,
      requiredCreditHours,
      passedCreditHours,
      level: computedLevel,
      durationYears,
      remainingCourses,
    },
  };
}
