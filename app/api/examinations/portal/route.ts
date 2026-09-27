import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireModulePermission("EXAMINATIONS", "view");

    const [upcomingExams, pendingAppeals, courses, terms] = await Promise.all([
      prisma.exam.count({ where: { scheduledAt: { gte: new Date() } } }),
      prisma.request.count({
        where: { type: "GRADE_APPEAL", status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
      }),
      prisma.course.findMany({
        select: { id: true, titleEn: true },
        orderBy: { titleEn: "asc" },
      }),
      prisma.academicTerm.findMany({
        select: { id: true, name: true, code: true, isCurrent: true },
        orderBy: { startDate: "desc" },
      }),
    ]);

    return NextResponse.json({
      upcomingExams,
      pendingAppeals,
      subjects: { courses, terms },
    });
  } catch (error) {
    console.error("Examinations portal error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Examinations access required" }, { status: 403 });
    }

    return NextResponse.json({ error: "Failed to load Examinations data." }, { status: 500 });
  }
}
