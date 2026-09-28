import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// Faculty is the top of the academic hierarchy (Faculty -> Department ->
// Program -> Course), so creating one is Admin-only — there is no
// module above FACULTY_MATTERS for a Dean to be scoped to. A Dean's own
// FACULTY_MATTERS permission covers editing/creating within their own
// faculty (see app/api/dean/departments).
export async function GET() {
  try {
    await requireAdmin();

    const faculties = await prisma.faculty.findMany({
      include: {
        dean: { include: { user: { select: { name: true } } } },
        _count: { select: { departments: true, programs: true } },
      },
      orderBy: { nameEn: "asc" },
    });

    return NextResponse.json({ success: true, data: faculties });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Admin access required", 403);

    console.error("Admin faculties GET error:", error);
    return errorResponse("Failed to load faculties", 500);
  }
}

export async function POST(request) {
  try {
    await requireAdmin();

    const body = await request.json();

    const nameEn = String(body.nameEn || "").trim();
    const nameAr = String(body.nameAr || "").trim();
    const code = String(body.code || "").trim().toUpperCase();

    if (!nameEn || !nameAr || !code) {
      return errorResponse("English name, Arabic name and code are required.", 400);
    }

    const existing = await prisma.faculty.findUnique({ where: { code } });

    if (existing) {
      return errorResponse(`A faculty with the code "${code}" already exists.`, 409);
    }

    const faculty = await prisma.faculty.create({
      data: {
        nameEn,
        nameAr,
        code,
        description: body.description ? String(body.description).slice(0, 1000) : null,
        isActive: body.isActive !== false,
      },
    });

    return NextResponse.json({ success: true, data: faculty }, { status: 201 });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Admin access required", 403);

    console.error("Admin faculties POST error:", error);
    return errorResponse("Failed to create this faculty.", 500);
  }
}
