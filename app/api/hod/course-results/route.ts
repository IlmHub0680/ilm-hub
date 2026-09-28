import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const GRADE_FIELDS = ["quiz1", "quiz2", "assignment", "midterm", "final", "practical"] as const;

// GET /api/hod/course-results -- gap #2: "Review course results" /
// "Review assessment/grading activity" as a read-only, department-
// scoped view of grade completion and distribution per course. Built
// directly from the real Grade rows an instructor enters through
// app/api/instructor/portal/grades/route.js -- the same
// status/finalizedAt fields added earlier this session drive the
// "how much grading is actually done/locked in" figures here. This
// route has no PATCH/POST: it is visibility only, department Heads do
// not edit grades (that stays the Instructor's own workflow, corrected
// only through the Registrar's GradeCorrection process). Same
// department-derivation pattern as the rest of app/api/hod/*.
export async function GET() {
  try {
    const user = await requireUser();
    await requireModulePermission("DEPARTMENT_MATTERS", "view");

    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    const staff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });

    if (!staff && !isAdmin) {
      return NextResponse.json({ error: "No staff profile found" }, { status: 403 });
    }

    const department = staff
      ? await prisma.department.findUnique({ where: { headId: staff.id } })
      : null;

    if (!department && !isAdmin) {
      return NextResponse.json({
        department: null,
        message: "You are not currently assigned as Head of a department.",
      });
    }

    // Course has no direct departmentId -- only through its programme,
    // exactly as app/api/hod/portal/route.ts already scopes courses.
    const courseScope = department ? { program: { departmentId: department.id } } : {};

    const courses = await prisma.course.findMany({
      where: courseScope,
      select: {
        id: true,
        titleEn: true,
        courseCode: true,
        program: { select: { nameEn: true } },
        grades: {
          select: {
            studentId: true,
            status: true,
            finalizedAt: true,
            updatedAt: true,
            quiz1: true,
            quiz2: true,
            assignment: true,
            midterm: true,
            final: true,
            practical: true,
          },
        },
      },
      orderBy: { courseCode: "asc" },
    });

    const rows = await Promise.all(
      courses.map(async (course) => {
        const enrolledCount = await prisma.enrollment.count({
          where: { courseId: course.id, status: "APPROVED", user: { role: "STUDENT" } },
        });

        // One row per attempt is possible (repeat course); take each
        // student's most recently updated Grade row, same tie-break
        // used elsewhere in this codebase (e.g.
        // app/api/examinations/results/route.ts) so this always
        // reflects the current, not a stale earlier attempt.
        const latestByStudent = new Map<string, (typeof course.grades)[number]>();
        for (const g of course.grades) {
          const existing = latestByStudent.get(g.studentId);
          const existingTime = existing?.updatedAt ? new Date(existing.updatedAt).getTime() : -Infinity;
          const time = g.updatedAt ? new Date(g.updatedAt).getTime() : -Infinity;
          if (!existing || time >= existingTime) {
            latestByStudent.set(g.studentId, g);
          }
        }

        const latestRows = Array.from(latestByStudent.values());
        const finalizedCount = latestRows.filter((g) => g.status === "FINALIZED").length;
        const draftCount = latestRows.filter((g) => g.status === "DRAFT").length;

        // "Grading activity" completion: of the enrolled students, how
        // many have at least one non-null assessment component
        // recorded at all (any bucket), a real proxy for "grading has
        // started for this student" without assuming a specific
        // component is required by every course.
        let anyComponentRecorded = 0;
        for (const g of latestRows) {
          const hasAny = GRADE_FIELDS.some((f) => (g as any)[f] !== null && (g as any)[f] !== undefined);
          if (hasAny) anyComponentRecorded += 1;
        }

        // Simple, real grade-distribution summary at the course level:
        // average of whichever numeric components are actually
        // recorded (no invented weighting formula -- the same
        // "component average, not a policy-defined final grade"
        // caution this codebase already applies elsewhere, e.g.
        // Grade.practical's own comment).
        const componentAverages: Record<string, number | null> = {};
        for (const field of GRADE_FIELDS) {
          const values = latestRows
            .map((g) => (g as any)[field])
            .filter((v): v is number => typeof v === "number");
          componentAverages[field] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
        }

        return {
          courseId: course.id,
          courseTitle: course.titleEn,
          courseCode: course.courseCode,
          programme: course.program?.nameEn ?? null,
          enrolledCount,
          gradedStudentCount: latestRows.length,
          anyComponentRecorded,
          finalizedCount,
          draftCount,
          componentAverages,
        };
      })
    );

    return NextResponse.json({
      department: department ? { id: department.id, nameEn: department.nameEn } : null,
      gradeFields: GRADE_FIELDS,
      courses: rows,
    });
  } catch (error) {
    console.error("HOD course results error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Department Matters access required" }, { status: 403 });
    }

    return NextResponse.json({ error: "Failed to load department course results." }, { status: 500 });
  }
}
