import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// GET /api/records/students?q=... -- institution-wide student search
// for the Registrar (Academic Records), by name, student number, or
// programme name. Unlike the Instructor's roster (scoped to their own
// courses) or the Advisor's advisee list (scoped to their own
// advisees), Academic Records can look up ANY student on record, so
// this deliberately has no ownership filter beyond the module gate
// itself.
export async function GET(request: Request) {
  try {
    await requireModulePermission("ACADEMIC_RECORDS", "view");

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();

    const students = await prisma.studentProfile.findMany({
      where: q
        ? {
            OR: [
              { studentNo: { contains: q, mode: "insensitive" } },
              { user: { name: { contains: q, mode: "insensitive" } } },
              { user: { email: { contains: q, mode: "insensitive" } } },
              { program: { nameEn: { contains: q, mode: "insensitive" } } },
            ],
          }
        : undefined,
      include: {
        user: { select: { name: true, email: true } },
        program: { select: { nameEn: true, level: true } },
      },
      orderBy: { studentNo: "asc" },
      take: 50,
    });

    return NextResponse.json({
      students: students.map((s) => ({
        id: s.id,
        studentNo: s.studentNo,
        name: s.user.name,
        email: s.user.email,
        programme: s.program?.nameEn ?? null,
        level: s.level,
        status: s.status,
      })),
    });
  } catch (error) {
    console.error("Records students search error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Academic Records access required", 403);

    return errorResponse("Failed to search students", 500);
  }
}
