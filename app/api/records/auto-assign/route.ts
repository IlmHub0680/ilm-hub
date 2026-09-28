import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";
import { autoAssignCoursesForProgram } from "@/lib/courseAssignment";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// Lists programmes (for the "which programme to run this for" picker) and
// how many of their courses are actually sequenced (semesterLevel set) —
// so Academic Records can see at a glance which programmes are ready for
// automatic assignment and which still need their curriculum sequenced.
export async function GET() {
  try {
    await requireModulePermission("ACADEMIC_RECORDS", "view");

    const programs = await prisma.program.findMany({
      where: { isActive: true },
      select: {
        id: true,
        nameEn: true,
        _count: { select: { courses: true, students: true } },
        courses: { select: { semesterLevel: true } },
      },
      orderBy: { nameEn: "asc" },
    });

    return NextResponse.json({
      programs: programs.map((p) => ({
        id: p.id,
        nameEn: p.nameEn,
        studentCount: p._count.students,
        courseCount: p._count.courses,
        sequencedCourseCount: p.courses.filter((c) => c.semesterLevel != null).length,
      })),
    });
  } catch (error) {
    console.error("Auto-assign GET error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Academic Records access required", 403);

    return errorResponse("Failed to load programmes", 500);
  }
}

// Actually runs automatic course assignment — real Enrollment rows,
// created only for students whose next-level courses (per the
// programme's sequenced curriculum and each course's prerequisites)
// they are not already enrolled in or have not already passed.
export async function POST(request: Request) {
  try {
    await requireModulePermission("ACADEMIC_RECORDS", "edit");

    const body = await request.json().catch(() => ({}));
    const programId = typeof body.programId === "string" && body.programId ? body.programId : undefined;

    const results = await autoAssignCoursesForProgram(programId);

    const totalAssigned = results.reduce((sum, r) => sum + r.assigned.length, 0);

    return NextResponse.json({
      success: true,
      studentsAffected: results.length,
      coursesAssigned: totalAssigned,
      details: results,
    });
  } catch (error) {
    console.error("Auto-assign POST error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Academic Records access required", 403);

    return errorResponse("Failed to run automatic course assignment", 500);
  }
}
