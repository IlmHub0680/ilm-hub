import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";
import { gradeLetter } from "@/lib/grading";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// Real, computed institutional KPIs (Model 11 §7) — every figure below
// is derived from existing data the platform already records, using
// the same conventions already used elsewhere (gradeLetter(final) for
// pass/fail, exactly as graduation eligibility and every transcript
// view already do — Assessment, Grading & Progression decision 58
// already names why this is Final-only, not the full weighted score).
// PLO achievement is deliberately not included: no PLO/CLO data exists
// to compute it from (Faculty, Staff & Academic Portals §9.5) — this
// endpoint does not invent a number for it.
export async function GET() {
  try {
    await requireModulePermission("QUALITY_ASSURANCE", "view");

    const [studentStatuses, currentTerm, grades, attendance, evaluationAgg, reviewRatings] = await Promise.all([
      prisma.studentProfile.findMany({ select: { status: true } }),
      prisma.academicTerm.findFirst({ where: { isCurrent: true } }),
      prisma.grade.findMany({ where: { final: { not: null } }, select: { final: true, courseId: true } }),
      prisma.attendance.findMany({ select: { totalClasses: true, absent: true } }),
      prisma.courseEvaluation.aggregate({
        _avg: { ratingOverall: true, ratingInstructor: true },
        _count: { _all: true },
      }),
      prisma.staffPerformanceReview.findMany({
        where: { status: { in: ["SUBMITTED", "ACKNOWLEDGED"] }, rating: { not: null } },
        select: { rating: true },
      }),
    ]);

    // --- Retention & completion: derived from real StudentStatus counts,
    // not a fabricated formula. Retention excludes students who left
    // without completing (WITHDRAWN/DISMISSED) from the pool of everyone
    // who was ever actually admitted (i.e., excludes APPLICANT, who never
    // became a student). Completion is measured only among students who
    // have reached a terminal outcome (GRADUATED, WITHDRAWN, or
    // DISMISSED) — students still actively studying are not yet counted
    // either way, since their outcome isn't known yet.
    const byStatus: Record<string, number> = {};
    for (const row of studentStatuses) byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;

    const everAdmitted = Object.entries(byStatus)
      .filter(([status]) => status !== "APPLICANT")
      .reduce((sum, [, count]) => sum + count, 0);
    const leftWithoutCompleting = (byStatus.WITHDRAWN ?? 0) + (byStatus.DISMISSED ?? 0);
    const retentionRate = everAdmitted > 0 ? 1 - leftWithoutCompleting / everAdmitted : null;

    const terminalOutcomes = (byStatus.GRADUATED ?? 0) + (byStatus.WITHDRAWN ?? 0) + (byStatus.DISMISSED ?? 0);
    const completionRate = terminalOutcomes > 0 ? (byStatus.GRADUATED ?? 0) / terminalOutcomes : null;

    // --- Progression: current-term academic standing distribution.
    const termRecords = currentTerm
      ? await prisma.termRecord.findMany({
          where: { termId: currentTerm.id },
          select: { standing: true },
        })
      : [];
    const standingCounts: Record<string, number> = {};
    for (const r of termRecords) standingCounts[r.standing] = (standingCounts[r.standing] ?? 0) + 1;
    const goodStanding = (standingCounts.GOOD_STANDING ?? 0) + (standingCounts.DEANS_LIST ?? 0);
    const atRisk = (standingCounts.PROBATION ?? 0) + (standingCounts.SUSPENDED ?? 0);
    const progressionRate = termRecords.length > 0 ? goodStanding / termRecords.length : null;

    // --- Assessment / course pass rate: same Final-only convention as
    // graduation eligibility and every transcript view already use.
    const byCourse = new Map<string, { pass: number; total: number }>();
    let totalPass = 0;
    for (const g of grades) {
      const passed = gradeLetter(g.final as number) !== "F";
      if (passed) totalPass += 1;
      const bucket = byCourse.get(g.courseId) ?? { pass: 0, total: 0 };
      bucket.total += 1;
      if (passed) bucket.pass += 1;
      byCourse.set(g.courseId, bucket);
    }
    const overallPassRate = grades.length > 0 ? totalPass / grades.length : null;
    const lowestPassingCourses = Array.from(byCourse.entries())
      .map(([courseId, b]) => ({ courseId, passRate: b.pass / b.total, gradedCount: b.total }))
      .filter((c) => c.gradedCount >= 5)
      .sort((a, b) => a.passRate - b.passRate)
      .slice(0, 5);

    // --- Attendance: cumulative per-student-per-course rate, averaged
    // institution-wide (Attendance has no termId — this is a running
    // total, not a single-term snapshot).
    const attendanceRates = attendance
      .filter((a) => a.totalClasses > 0)
      .map((a) => 1 - a.absent / a.totalClasses);
    const avgAttendanceRate =
      attendanceRates.length > 0 ? attendanceRates.reduce((s, v) => s + v, 0) / attendanceRates.length : null;

    // --- Instructor performance: two real, separate signals, not one
    // invented composite — a student-rated average and a formal-review
    // rating distribution. STAFF_PERFORMANCE_POINTS mirrors the ratings
    // already defined on StaffPerformanceReview, not a new scale.
    const RATING_POINTS: Record<string, number> = {
      NEEDS_IMPROVEMENT: 1,
      MEETS_EXPECTATIONS: 2,
      EXCEEDS_EXPECTATIONS: 3,
      OUTSTANDING: 4,
    };
    const avgReviewRating =
      reviewRatings.length > 0
        ? reviewRatings.reduce((s, r) => s + (RATING_POINTS[r.rating as string] ?? 0), 0) / reviewRatings.length
        : null;

    // Fill in course titles for the lowest-pass-rate list.
    const courseIds = lowestPassingCourses.map((c) => c.courseId);
    const courseNames: { id: string; titleEn: string; courseCode: string }[] = courseIds.length
      ? await prisma.course.findMany({
          where: { id: { in: courseIds } },
          select: { id: true, titleEn: true, courseCode: true },
        })
      : [];
    const courseNameMap = new Map<string, { id: string; titleEn: string; courseCode: string }>(
      courseNames.map((c) => [c.id, c])
    );

    return NextResponse.json({
      success: true,
      asOf: new Date().toISOString(),
      currentTerm: currentTerm ? { id: currentTerm.id, name: currentTerm.name } : null,
      retention: { rate: retentionRate, everAdmitted, leftWithoutCompleting },
      completion: { rate: completionRate, graduated: byStatus.GRADUATED ?? 0, terminalOutcomes },
      progression: {
        rate: progressionRate,
        goodStanding,
        atRisk,
        total: termRecords.length,
        scopedToCurrentTerm: !!currentTerm,
      },
      assessment: {
        overallPassRate,
        gradedCount: grades.length,
        lowestPassingCourses: lowestPassingCourses.map((c) => ({
          ...c,
          courseTitle: courseNameMap.get(c.courseId)?.titleEn ?? null,
          courseCode: courseNameMap.get(c.courseId)?.courseCode ?? null,
        })),
      },
      attendance: { avgRate: avgAttendanceRate, sampledCourses: attendanceRates.length },
      studentSatisfaction: {
        avgOverall: evaluationAgg._avg.ratingOverall,
        avgInstructor: evaluationAgg._avg.ratingInstructor,
        responseCount: evaluationAgg._count._all,
      },
      instructorPerformance: {
        avgStudentRating: evaluationAgg._avg.ratingInstructor,
        avgReviewRating,
        reviewCount: reviewRatings.length,
      },
      ploAchievement: null,
    });
  } catch (error: any) {
    console.error("QA KPIs GET error:", error);
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Forbidden", 403);
    return errorResponse("Failed to compute KPIs", 500);
  }
}
