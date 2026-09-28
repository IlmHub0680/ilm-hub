import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireModulePermission("QUALITY_ASSURANCE", "view");

    const [
      studentCount,
      staffCount,
      programmeCount,
      courseCount,
      pendingReviewCount,
      programs,
      courses,
      departments,
      faculties,
    ] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.staffProfile.count({
        where: { isActive: true },
      }),
      prisma.program.count(),
      prisma.course.count(),
      prisma.qualityReview.count({
        where: { status: { in: ["SCHEDULED", "IN_PROGRESS"] } },
      }),
      prisma.program.findMany({
        select: { id: true, nameEn: true },
        orderBy: { nameEn: "asc" },
      }),
      prisma.course.findMany({
        select: { id: true, titleEn: true },
        orderBy: { titleEn: "asc" },
      }),
      prisma.department.findMany({
        select: { id: true, nameEn: true },
        orderBy: { nameEn: "asc" },
      }),
      prisma.faculty.findMany({
        select: { id: true, nameEn: true },
        orderBy: { nameEn: "asc" },
      }),
    ]);

    const [staff, openImprovementPlanCount, evaluationCount, evaluationAvg] = await Promise.all([
      prisma.staffProfile.findMany({
        where: { isActive: true, position: { isAcademic: true } },
        select: { id: true, user: { select: { name: true } } },
        orderBy: { user: { name: "asc" } },
      }),
      prisma.qualityReview.count({ where: { improvementStatus: { in: ["PENDING", "IN_PROGRESS"] } } }),
      prisma.courseEvaluation.count(),
      prisma.courseEvaluation.aggregate({ _avg: { ratingOverall: true } }),
    ]);

    return NextResponse.json({
      studentCount,
      staffCount,
      programmeCount,
      courseCount,
      pendingReviewCount,
      subjects: {
        programs,
        courses,
        departments,
        faculties,
        staff: staff.map((s) => ({ id: s.id, nameEn: s.user.name })),
      },
      openImprovementPlanCount,
      courseEvaluations: {
        count: evaluationCount,
        avgOverall: evaluationAvg._avg.ratingOverall,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    console.error("QA portal error:", error);

    return NextResponse.json(
      { error: "Failed to load QA data." },
      { status: 500 }
    );
  }
}
