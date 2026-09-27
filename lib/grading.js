// Canonical grading scale for the whole institution — the single
// source of truth every part of the app must agree with:
//   95-100 = A+   90-94 = A    85-89 = B+   80-84 = B   75-79 = C+
//   70-74  = C    65-69 = D+   60-64 = D    0-59  = F
//
// gradeLetter() turns a raw score into that letter; GRADE_POINTS turns
// a letter into the grade point used for GPA math on the institute's
// official 5.00-point scale — A+ tops out at 5.0, then each band
// steps down by 0.5 through the "+" bands down to D at 1.5, with F at
// 0.0. computeGpa() is the one real, credit-weighted calculation used
// for both Semester GPA and CGPA — nothing about a student's GPA is
// ever hand-entered; it's derived here from their actual final grades
// and each course's real credit hours every time it's requested.

export function gradeLetter(score) {
  if (score == null) return null;
  if (score >= 95) return "A+";
  if (score >= 90) return "A";
  if (score >= 85) return "B+";
  if (score >= 80) return "B";
  if (score >= 75) return "C+";
  if (score >= 70) return "C";
  if (score >= 65) return "D+";
  if (score >= 60) return "D";
  return "F";
}

// Institute's official 5.00-point GPA scale.
export const GRADE_POINTS = {
  "A+": 5.0,
  A: 4.5,
  "B+": 4.0,
  B: 3.5,
  "C+": 3.0,
  C: 2.5,
  "D+": 2.0,
  D: 1.5,
  F: 0.0,
};

// Maximum grade point on the institute's GPA/CGPA scale (5.00) — use
// this instead of hard-coding "4.0"/"4.00" anywhere GPA is displayed
// alongside its scale (e.g. "3.75 / 5.00").
export const MAX_GPA = 5.0;

export function gradeLetterToPoint(letter) {
  return GRADE_POINTS[letter] ?? null;
}

// A student can now have more than one Grade row for the same course
// -- one per attempt/term, so a repeat no longer erases the original
// (see the Grade model's studentId/courseId/termId key). Every place
// that needs "this course's current outcome" -- GPA, pass/fail,
// graduation eligibility -- reduces to one row per course first,
// picking the most recently saved attempt. That is exactly the rule
// that already applied when only one row could ever exist (a new
// grade always overwrote the old one); this just makes it explicit
// and independent of whatever order a query returns rows in, rather
// than destroying the superseded rows to enforce it.
export function latestGradeByCourse(grades) {
  const byCourse = new Map();
  for (const g of grades || []) {
    if (!g?.courseId) continue;
    const existing = byCourse.get(g.courseId);
    const existingTime = existing?.updatedAt ? new Date(existing.updatedAt).getTime() : -Infinity;
    const time = g?.updatedAt ? new Date(g.updatedAt).getTime() : -Infinity;
    if (!existing || time >= existingTime) {
      byCourse.set(g.courseId, g);
    }
  }
  return byCourse;
}

// courses: [{ letter, creditHours }]. Only courses with a real letter
// grade and positive credit hours count; returns null (not 0) when
// there is nothing gradeable yet, so the caller can show "N/A" rather
// than a misleading 0.00.
export function computeGpa(courses) {
  const graded = (courses || []).filter(
    (c) => c && GRADE_POINTS[c.letter] != null && c.creditHours > 0
  );

  if (graded.length === 0) return null;

  const totalCredits = graded.reduce((sum, c) => sum + c.creditHours, 0);
  const totalPoints = graded.reduce(
    (sum, c) => sum + GRADE_POINTS[c.letter] * c.creditHours,
    0
  );

  return Math.round((totalPoints / totalCredits) * 100) / 100;
}
