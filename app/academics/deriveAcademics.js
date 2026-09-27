// Shared, pure derivations built on top of the /api/student/portal payload.
// Mirrors the equivalent logic in app/login/page.jsx so the dedicated
// /academics/* pages show exactly the same real data, just on their own
// routes instead of collapsed inline sections.

import { latestGradeByCourse } from '@/lib/grading';

export function getCurrentStudent(data) {
  if (!data) {
    return {
      name: '',
      studentId: '',
      enrolledProgramme: '',
      studyType: '',
      academicStatus: '',
      registeredCourses: [],
      grades: [],
      semesterGPA: null,
      cgpa: null,
      feeStatus: 'No fees on record',
    };
  }

  const totalFeeUSD = (data.fees || []).reduce(
    (sum, f) => sum + Number(f.amountUSD || 0),
    0
  );
  const totalPaidUSD = (data.fees || []).reduce(
    (sum, f) => sum + Number(f.paidUSD || 0),
    0
  );

  const feeStatus =
    totalFeeUSD === 0
      ? 'No fees on record'
      : totalPaidUSD >= totalFeeUSD
      ? 'Paid in Full'
      : totalPaidUSD > 0
      ? 'Partially Paid'
      : 'Unpaid';

  return {
    studentId: data.profile.studentId,
    name: data.profile.name,
    email: data.profile.email,
    enrolledProgramme: data.profile.enrolledProgramme,
    studyType: data.profile.studyType,
    academicStatus: data.profile.academicStatus,
    registeredCourses: (data.registeredCourses || []).map((c) => c.title),
    grades: (data.grades || []).map((g) => ({
      course: g.course,
      title: 'Final',
      score: g.final,
      grade: g.letter,
    })),
    semesterGPA: data.academicProgress?.semesterGPA ?? null,
    cgpa: data.academicProgress?.cgpa ?? null,
    feeStatus,
  };
}

export function getCoursePlanOverview(data) {
  if (!data?.programCurriculum) return [];

  // Real, per-course completion — a course counts as done only when an
  // actual Grade record with a final score exists for it, not merely
  // because the student isn't registered in it right now. Matching is
  // by course id (not title) so it can never be fooled by two courses
  // that happen to share a name.
  const registeredCourseIds = new Set(
    (data.registeredCourses || []).map((c) => c.id)
  );
  // A repeated course can list more than one attempt here now (see
  // lib/grading.js) -- take each course's most recently saved one as
  // its current outcome, same rule the server applies for GPA.
  const gradeByCourseId = latestGradeByCourse(data.grades || []);

  return data.programCurriculum.curriculum.map((course) => {
    const isCurrent = registeredCourseIds.has(course.id);
    const grade = gradeByCourseId.get(course.id);
    const hasFinalGrade = !!grade && grade.final != null;
    const passed = hasFinalGrade ? grade.letter !== 'F' : null;
    // A failed course still needs to be retaken before graduation, so it
    // stays "remaining" (with its last attempt shown for context) rather
    // than being counted as done — only a passing grade completes it.
    const isCompleted = !isCurrent && hasFinalGrade && passed;

    return {
      ...course,
      programme: data.programCurriculum.name,
      level: data.programCurriculum.level || 'Foundation Level',
      status: isCurrent ? 'current' : isCompleted ? 'completed' : 'remaining',
      grade: hasFinalGrade ? grade.letter : null,
      score: hasFinalGrade ? grade.final : null,
      passed,
      previouslyAttempted: !isCurrent && hasFinalGrade && !passed,
      termName: hasFinalGrade ? grade.termName || null : null,
    };
  });
}

export function getRemainingCourses(data) {
  return getCoursePlanOverview(data).filter((course) => course.status === 'remaining');
}

export function getCompletedCourses(data) {
  return getCoursePlanOverview(data).filter((course) => course.status === 'completed');
}

// Automatic academic level (year of study) progression. Computed live
// from real completed/passed courses against the programme's total
// curriculum size and official duration — never set by hand, and never
// advanced by a failed or incomplete course, since only genuinely
// passed courses are ever counted as "completed" (see
// getCoursePlanOverview above).
export function getAcademicLevelProgress(data) {
  const totalCourses = data?.programCurriculum?.curriculum?.length || 0;
  const durationYears = data?.programCurriculum?.durationYears || null;
  const passedCourses = getCompletedCourses(data).length;

  if (!totalCourses || !durationYears) {
    return {
      level: data?.profile?.level ?? null,
      durationYears,
      passedCourses,
      totalCourses,
      coursesPerLevel: null,
      computed: false,
    };
  }

  const coursesPerLevel = Math.ceil(totalCourses / durationYears);
  const computedLevel = Math.min(durationYears, Math.floor(passedCourses / coursesPerLevel) + 1);

  return {
    level: computedLevel,
    durationYears,
    passedCourses,
    totalCourses,
    coursesPerLevel,
    computed: true,
  };
}

export function getAcademicSemesters(data) {
  if (!data?.academicProgress?.history) return [];

  return data.academicProgress.history.map((h) => ({
    semester: h.term,
    gpa: h.gpa,
    standing: h.standing,
    // Already returned by the API (see academicProgress.history in
    // app/api/student/portal/route.js) but previously dropped here --
    // a plain pass-through, not a new computation.
    creditsAttempted: h.creditsAttempted,
    creditsEarned: h.creditsEarned,
  }));
}

export const STUDENT_PLAN = [
  'Complete current semester registration',
  'Attend all scheduled lectures',
  'Submit assignments before deadlines',
  'Prepare for midterm examinations',
  'Maintain attendance above the required level',
  'Prepare early for final examinations',
  'Consult academic supervisor when necessary',
];

// Maps the real StudentStatus enum (prisma/schema.prisma) to a
// readable label and a semantic tone. Mirrors the same mapping used
// on the main dashboard (app/login/page.jsx) so a student's status
// reads identically everywhere it appears.
export const STUDENT_STATUS_META = {
  APPLICANT: { label: 'Applicant', tone: 'neutral' },
  ADMITTED: { label: 'Admitted', tone: 'good' },
  ACTIVE: { label: 'Active', tone: 'good' },
  SUSPENDED: { label: 'Suspended', tone: 'danger' },
  DEFERRED: { label: 'Deferred', tone: 'warning' },
  GRADUATED: { label: 'Graduated', tone: 'good' },
  WITHDRAWN: { label: 'Withdrawn', tone: 'danger' },
  DISMISSED: { label: 'Dismissed', tone: 'danger' },
};

export const STATUS_TONE_STYLE = {
  good: { background: 'var(--success-tint)', color: 'var(--success)' },
  warning: { background: 'var(--warning-tint)', color: 'var(--warning)' },
  danger: { background: 'var(--danger-tint)', color: 'var(--danger)' },
  neutral: { background: 'var(--brand-tint)', color: 'var(--brand)' },
};

export function getAcademicStatusMeta(rawStatus) {
  return (
    STUDENT_STATUS_META[rawStatus] || {
      label: rawStatus || 'Not yet recorded',
      tone: 'neutral',
    }
  );
}

// Shared display metadata for Request.status (Prisma RequestStatus
// enum) used by every academic self-service feature that submits a
// Request: course add/drop, and the Communication & Complaints system.
export const REQUEST_STATUS_META = {
  SUBMITTED: { label: 'Submitted', tone: 'neutral' },
  UNDER_REVIEW: { label: 'Under Review', tone: 'warning' },
  APPROVED: { label: 'Approved', tone: 'good' },
  REJECTED: { label: 'Rejected', tone: 'danger' },
  COMPLETED: { label: 'Completed', tone: 'good' },
};

export function getRequestStatusMeta(status) {
  return (
    REQUEST_STATUS_META[status] || { label: status || 'Unknown', tone: 'neutral' }
  );
}

export const GRADING_SYSTEM = [
  ['95 - 100', 'A+', 'Exceptional'],
  ['90 - 94', 'A', 'Excellent'],
  ['85 - 89', 'B+', 'Very Good'],
  ['80 - 84', 'B', 'Good'],
  ['75 - 79', 'C+', 'Above Average'],
  ['70 - 74', 'C', 'Satisfactory'],
  ['65 - 69', 'D+', 'Below Average'],
  ['60 - 64', 'D', 'Minimum Pass'],
  ['0 - 59', 'F', 'Fail'],
];
