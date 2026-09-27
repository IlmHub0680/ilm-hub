import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireModulePermission("EXAMINATIONS", "view");

    const appeals = await prisma.request.findMany({
      where: { type: "GRADE_APPEAL" },
      include: {
        student: { include: { user: { select: { name: true } } } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({
      appeals: appeals.map((a) => ({
        id: a.id,
        status: a.status,
        details: a.details,
        responseNote: a.responseNote,
        createdAt: a.createdAt,
        studentName: a.student.user.name,
        studentNo: a.student.studentNo,
      })),
    });
  } catch (error) {
    console.error("Grade appeals GET error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Examinations access required" }, { status: 403 });
    }

    return NextResponse.json({ error: "Failed to fetch grade appeals" }, { status: 500 });
  }
}
