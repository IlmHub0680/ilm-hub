import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    await requireModulePermission("STUDENT_MATTERS", "view");

    const excuses = await prisma.absenceExcuse.findMany({
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
        course: { select: { titleEn: true, courseCode: true } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({
      excuses: excuses.map((e) => ({
        id: e.id,
        status: e.status,
        studentName: e.student.user.name,
        studentEmail: e.student.user.email,
        course: e.course.titleEn,
        courseCode: e.course.courseCode,
        type: e.type,
        absenceDate: e.absenceDate,
        reason: e.reason,
        reviewNote: e.reviewNote,
        createdAt: e.createdAt,
      })),
    });
  } catch (error) {
    console.error("Student Affairs absence excuses GET error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Student Affairs access required", 403);

    return errorResponse("Failed to fetch absence excuses", 500);
  }
}
