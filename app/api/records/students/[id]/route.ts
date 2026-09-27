import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";
import { gradeLetter, latestGradeByCourse } from "@/lib/grading";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// GET /api/records/students/[id] -- one student's full academic
// record for the Registrar: current programme, enrolment history,
// every recorded grade (including finalization status, see the
// 20260926130000_grade_finalization migration), per-term academic
// standing, and current student status. Institution-wide (any
// student), gated the same as the search endpoint above it.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireModulePermission("ACADEMIC_RECORDS", "view");

    const { id } = await params;

    const student = await prisma.studentProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        faculty: { select: { nameEn: true } },
        department: { select: { nameEn: true } },
        program: { select: { nameEn: true, level: true, code: true } },
      },
    });

    if (!student) {
      return errorResponse("Student not found", 404);
    }

    const [enrollments, grades, termRecords] = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId: student.userId },
        include: { course: { select: { titleEn: true, courseCode: true, creditHours: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.grade.findMany({
        where: { studentId: student.userId },
        include: {
          course: { select: { titleEn: true, courseCode: true, creditHours: true } },
          term: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.termRecord.findMany({
        where: { studentId: student.id },
        include: { term: { select: { name: true, startDate: true } } },
        orderBy: { term: { startDate: "asc" } },
      }),
    ]);

    // Total earned/attempted credit hours, computed live from the
    // student's real course records -- a repeated course only counts
    // its most recent attempt toward earned credits.
    const latestGrades = Array.from(latestGradeByCourse(grades).values());
    const creditsEarned = latestGrades
      .filter((g) => g.final != null && gradeLetter(g.final) !== "F")
      .reduce((sum, g) => sum + (g.course?.creditHours || 0), 0);
    const creditsAttempted = latestGrades.reduce(
      (sum, g) => sum + (g.course?.creditHours || 0),
      0
    );

    return NextResponse.json({
      student: {
        id: student.id,
        studentNo: student.studentNo,
        name: student.user.name,
        email: student.user.email,
        status: student.status,
        level: student.level,
        admissionYear: student.admissionYear,
        studySession: student.studySession,
        faculty: student.faculty?.nameEn ?? null,
        department: student.department?.nameEn ?? null,
        programme: student.program
          ? { name: student.program.nameEn, level: student.program.level, code: student.program.code }
          : null,
      },
      credits: { earned: creditsEarned, attempted: creditsAttempted },
      enrollments: enrollments.map((e) => ({
        id: e.id,
        status: e.status,
        createdAt: e.createdAt,
        course: { title: e.course.titleEn, code: e.course.courseCode, creditHours: e.course.creditHours },
      })),
      grades: grades.map((g) => ({
        id: g.id,
        course: { title: g.course.titleEn, code: g.course.courseCode, creditHours: g.course.creditHours },
        term: g.term?.name ?? null,
        quiz1: g.quiz1,
        quiz2: g.quiz2,
        assignment: g.assignment,
        midterm: g.midterm,
        final: g.final,
        practical: g.practical,
        letter: g.final != null ? gradeLetter(g.final) : null,
        status: g.status,
        finalizedAt: g.finalizedAt,
      })),
      termRecords: termRecords.map((t) => ({
        id: t.id,
        term: t.term?.name ?? null,
        gpa: t.gpa,
        creditsAttempted: t.creditsAttempted,
        creditsEarned: t.creditsEarned,
        standing: t.standing,
      })),
    });
  } catch (error) {
    console.error("Records student detail error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Academic Records access required", 403);

    return errorResponse("Failed to load student record", 500);
  }
}
