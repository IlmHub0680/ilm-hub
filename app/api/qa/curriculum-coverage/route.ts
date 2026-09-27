import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// Curriculum review architecture (Model 30 §4): for each active
// programme, how many of its approved PLOs are actually reached by at
// least one course, and which of its courses record no learning
// outcomes or no assessment method at all. This is a read-only
// coverage report over the real PLO/CLO tables added for §6 -- it
// flags gaps for a human reviewer, it does not invent a pass/fail
// judgement about the curriculum.
export async function GET() {
  try {
    await requireModulePermission("QUALITY_ASSURANCE", "view");

    const programs = await prisma.program.findMany({
      where: { isActive: true },
      select: {
        id: true,
        nameEn: true,
        learningOutcomes: {
          select: {
            id: true,
            code: true,
            isActive: true,
            _count: { select: { courseLearningOutcomes: true } },
          },
        },
        courses: {
          where: { isPublished: true },
          select: {
            id: true,
            titleEn: true,
            courseCode: true,
            learningOutcomes: { select: { id: true, assessmentMethods: true } },
          },
        },
      },
      orderBy: { nameEn: "asc" },
    });

    const report = programs.map((program) => {
      const activeOutcomes = program.learningOutcomes.filter((o) => o.isActive);
      const unreachedOutcomes = activeOutcomes.filter((o) => o._count.courseLearningOutcomes === 0);

      const coursesWithNoOutcomes = program.courses.filter((c) => c.learningOutcomes.length === 0);
      const coursesWithNoAssessmentMethod = program.courses.filter(
        (c) => c.learningOutcomes.length > 0 && c.learningOutcomes.every((o) => !o.assessmentMethods)
      );

      return {
        programId: program.id,
        programName: program.nameEn,
        outcomeCount: activeOutcomes.length,
        unreachedOutcomes: unreachedOutcomes.map((o) => ({ id: o.id, code: o.code })),
        courseCount: program.courses.length,
        coursesWithNoOutcomes: coursesWithNoOutcomes.map((c) => ({
          id: c.id, title: c.titleEn, code: c.courseCode,
        })),
        coursesWithNoAssessmentMethod: coursesWithNoAssessmentMethod.map((c) => ({
          id: c.id, title: c.titleEn, code: c.courseCode,
        })),
      };
    });

    return NextResponse.json({ success: true, data: report });
  } catch (error: any) {
    console.error("GET curriculum coverage report error:", error);
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("QA access required", 403);
    return errorResponse("Failed to build curriculum coverage report", 500);
  }
}
