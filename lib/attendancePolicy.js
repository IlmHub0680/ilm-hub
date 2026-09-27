// Institute Attendance Policy — standing thresholds.
//
// This is the single source of truth for attendance standing, used by
// both the Instructor Attendance view and the Student Attendance
// Record page, so a student's status always reads the same way no
// matter which side of the system displays it.
//
// The Attendance model stores a cumulative per-course tally for each
// student: totalClasses (sessions held so far), attended (present),
// late, and absent. A late arrival still counts as classroom
// attendance for standing purposes (the student was present for the
// session), so "absence" below is only true absences:
//   absenceRate = absent / totalClasses
//
// The institute's existing, already-enforced academic regulation is
// that a student who reaches 25% absence in a course fails that
// course and must repeat it (see the FAIL_THRESHOLD previously
// hard-coded in the student Attendance Record page). That 25% line is
// kept here as the authoritative floor, with graduated warning tiers
// below it so a student's standing visibly deteriorates in the
// run-up to that hard limit rather than jumping straight from "fine"
// to "failing":
//
//   0%   – 4.9%   absence   Good Standing        — excellent attendance
//   5%   – 9.9%   absence   Normal               — within institute expectations
//   10%  – 14.9%  absence   Attendance Warning   — first formal warning tier
//   15%  – 19.9%  absence   Nearing Danger       — approaching the 25% limit
//   20%  – 24.9%  absence   Critical             — one or two more absences from failing
//   >=25%         absence   At Risk              — has reached/passed the 25% limit;
//                                                   fails the course and must repeat it
//
// A course with no sessions recorded yet has no rate to compute and
// is reported as "Not Started" rather than defaulting into any tier.
export const ATTENDANCE_FAIL_THRESHOLD_PERCENT = 25;

export const ATTENDANCE_STATUS = {
  NOT_STARTED: "Not Started",
  GOOD_STANDING: "Good Standing",
  NORMAL: "Normal",
  WARNING: "Attendance Warning",
  NEARING_DANGER: "Nearing Danger",
  CRITICAL: "Critical",
  AT_RISK: "At Risk",
};

// Tone for UI badges: used by both the instructor and student views so
// the same status always renders with the same visual weight.
export const ATTENDANCE_STATUS_TONE = {
  [ATTENDANCE_STATUS.NOT_STARTED]: "neutral",
  [ATTENDANCE_STATUS.GOOD_STANDING]: "success",
  [ATTENDANCE_STATUS.NORMAL]: "success",
  [ATTENDANCE_STATUS.WARNING]: "warning",
  [ATTENDANCE_STATUS.NEARING_DANGER]: "warning",
  [ATTENDANCE_STATUS.CRITICAL]: "danger",
  [ATTENDANCE_STATUS.AT_RISK]: "danger",
};

/**
 * Computes the absence rate, attendance rate, and standing status for
 * one student/course attendance record.
 *
 * @param {number} totalClasses
 * @param {number} attended
 * @param {number} late
 * @param {number} [absent] optional; derived as totalClasses - attended - late when omitted
 * @returns {{ rate: number|null, absenceRate: number|null, status: string, failed: boolean }}
 */
export function computeAttendanceStatus(totalClasses, attended, late = 0, absent) {
  if (!totalClasses || totalClasses <= 0) {
    return { rate: null, absenceRate: null, status: ATTENDANCE_STATUS.NOT_STARTED, failed: false };
  }

  const effectiveAbsent =
    typeof absent === "number" ? absent : Math.max(totalClasses - (attended || 0) - (late || 0), 0);
  const absenceRate = (effectiveAbsent / totalClasses) * 100;
  const attendanceRate = 100 - absenceRate;

  let status;
  if (absenceRate >= ATTENDANCE_FAIL_THRESHOLD_PERCENT) status = ATTENDANCE_STATUS.AT_RISK;
  else if (absenceRate >= 20) status = ATTENDANCE_STATUS.CRITICAL;
  else if (absenceRate >= 15) status = ATTENDANCE_STATUS.NEARING_DANGER;
  else if (absenceRate >= 10) status = ATTENDANCE_STATUS.WARNING;
  else if (absenceRate >= 5) status = ATTENDANCE_STATUS.NORMAL;
  else status = ATTENDANCE_STATUS.GOOD_STANDING;

  return {
    rate: Math.round(attendanceRate * 10) / 10,
    absenceRate: Math.round(absenceRate * 10) / 10,
    status,
    failed: absenceRate >= ATTENDANCE_FAIL_THRESHOLD_PERCENT,
  };
}
