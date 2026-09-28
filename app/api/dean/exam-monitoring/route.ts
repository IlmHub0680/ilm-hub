import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const GRADE_FIELDS = ["quiz1", "quiz2", "assignment", "midterm", "final", "practical"] as const;
type GradeField = (typeof GRADE_FIELDS)[number];

function isGradeField(value: unknown): value is GradeField {
  return typeof value === "string" && (GRADE_FIELDS as readonly string[]).includes(value);
}

function guessBucket(examType: string): GradeField {
  if (examType === "MIDTERM") return "midterm";
  if (examType === "FINAL") return "final";
  if (examType === "QUIZ") return "quiz1";
  return "midterm";
}

// GET /api/dean/exam-monitoring -- gap #3: "Monitor examinations/results
// where permitted." READ-ONLY: Examinations is a different delegated
// owner (app/api/examinations/*), so this route only ever reads Exam /
// ExamResultSubmission / Grade -- it has no PATCH/POST, and the Dean
// gets no edit action anywhere in the UI backed by this route. Scoped
// to the Dean's own faculty via the course -> program -> department ->
// faculty chain (Course has no direct facultyId), same
// faculty-derivation and admin-fallback pattern as the rest of
// app/api/dean/*.
export async function GET() {
  try {
    const user = await requireUser();
    await requireModulePermission("FACULTY_MATTERS", "view");

    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    const staff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });

    if (!staff && !isAdmin) {
      return NextResponse.json({ error: "No staff profile found" }, { status: 403 });
    }

    const faculty = staff
      ? await prisma.faculty.findUnique({ where: { deanId: staff.id } })
      : null;

    if (!faculty && !isAdmin) {
      return NextResponse.json({
        faculty: null,
        message: "You are not currently assigned as Dean of a faculty.",
      });
    }

    // Course -> Program -> Faculty is the real chain (Course has no
    // direct facultyId); a course with no program at all cannot belong
    // to any faculty and is correctly excluded from a faculty-scoped
    // Dean's view.
    const courseScope = faculty ? { program: { facultyId: faculty.id } } : {};

    const exams = await prisma.exam.findMany({
      where: courseScope,
      include: {
        course: { select: { titleEn: true, courseCode: true, program: { select: { nameEn: true, department: { select: { nameEn: true } } } } } },
        term: { select: { name: true, code: true } },
        resultSubmission: true,
      },
      orderBy: { scheduledAt: "desc" },
      take: 300,
    });

    const scheduleCounts = {
      total: exams.length,
      upcoming: exams.filter((e) => new Date(e.scheduledAt) >= new Date()).length,
      past: exams.filter((e) => new Date(e.scheduledAt) < new Date()).length,
      byType: exams.reduce((acc: Record<string, number>, e: any) => {
        acc[e.examType] = (acc[e.examType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    const resultStatusCounts = exams.reduce((acc: Record<string, number>, e: any) => {
      const status = e.resultSubmission?.status ?? "PENDING";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Grade-distribution / pass-fail summary at the faculty level: for
    // every exam in scope, compare the enrolled count against how many
    // students already have a non-null value in the Grade bucket that
    // exam maps to -- the exact same real computation
    // app/api/examinations/results/route.ts already does per-exam,
    // aggregated here across the faculty's exams instead of shown one
    // exam at a time. This never writes to Grade or
    // ExamResultSubmission -- read-only monitoring only.
    let totalEnrolled = 0;
    let totalGraded = 0;

    const perCourseRows = await Promise.all(
      exams.map(async (exam) => {
        const targetGradeField = exam.resultSubmission?.targetGradeField && isGradeField(exam.resultSubmission.targetGradeField)
          ? exam.resultSubmission.targetGradeField
          : guessBucket(exam.examType);

        const [enrolledCount, gradeRows] = await Promise.all([
          prisma.enrollment.count({
            where: { courseId: exam.courseId, status: "APPROVED", user: { role: "STUDENT" } },
          }),
          prisma.grade.findMany({
            where: { courseId: exam.courseId, termId: exam.termId },
            select: { studentId: true, updatedAt: true, [targetGradeField]: true },
          }),
        ]);

        const latestByStudent = new Map<string, any>();
        for (const g of gradeRows) {
          const existing = latestByStudent.get(g.studentId);
          const existingTime = existing ? new Date(existing.updatedAt).getTime() : -Infinity;
          const time = g.updatedAt ? new Date(g.updatedAt).getTime() : -Infinity;
          if (!existing || time >= existingTime) {
            latestByStudent.set(g.studentId, g);
          }
        }

        let gradedCount = 0;
        for (const g of Array.from(latestByStudent.values())) {
          const value = (g as any)[targetGradeField];
          if (value !== null && value !== undefined) gradedCount += 1;
        }

        totalEnrolled += enrolledCount;
        totalGraded += gradedCount;

        return {
          examId: exam.id,
          courseTitle: exam.course.titleEn,
          courseCode: exam.course.courseCode,
          department: exam.course.program?.department?.nameEn ?? null,
          programme: exam.course.program?.nameEn ?? null,
          termName: exam.term.name,
          examType: exam.examType,
          scheduledAt: exam.scheduledAt,
          resultStatus: exam.resultSubmission?.status ?? "PENDING",
          enrolledCount,
          gradedCount,
        };
      })
    );

    return NextResponse.json({
      faculty: faculty ? { id: faculty.id, nameEn: faculty.nameEn } : null,
      scheduleCounts,
      resultStatusCounts,
      resultCompletion: {
        totalEnrolled,
        totalGraded,
        pendingCount: Math.max(totalEnrolled - totalGraded, 0),
      },
      exams: perCourseRows,
    });
  } catch (error) {
    console.error("Dean exam monitoring error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Faculty Matters access required" }, { status: 403 });
    }

    return NextResponse.json({ error: "Failed to load examinations monitoring data." }, { status: 500 });
  }
}
