import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// Resolves the faculty this signed-in Dean actually leads (Faculty.deanId
// === their own StaffProfile.id — the same real ownership check already
// used by app/api/dean/portal). SUPER_ADMIN/ADMIN may act on any faculty
// via facultyId in the request body instead.
async function resolveOwnFaculty(user) {
  const staff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });

  if (!staff) return null;

  return prisma.faculty.findUnique({ where: { deanId: staff.id } });
}

export async function GET() {
  try {
    const user = await requireUser();
    await requireModulePermission("FACULTY_MATTERS", "view");

    const faculty = await resolveOwnFaculty(user);

    if (!faculty && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return errorResponse("You are not currently assigned as Dean of a faculty.", 403);
    }

    const departments = await prisma.department.findMany({
      where: faculty ? { facultyId: faculty.id } : {},
      include: {
        head: { include: { user: { select: { name: true } } } },
        _count: { select: { programs: true, staff: true, students: true } },
      },
      orderBy: { nameEn: "asc" },
    });

    return NextResponse.json({ success: true, data: departments });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Faculty Matters access required", 403);

    console.error("Dean departments GET error:", error);
    return errorResponse("Failed to load departments", 500);
  }
}

// Creates a new Department — a real, standing academic unit, not a
// disposable one, so this is scoped to the Dean's own faculty (a Dean
// cannot create a department in someone else's faculty). Admin/Super
// Admin may create one in any faculty by passing facultyId explicitly.
export async function POST(request) {
  try {
    const user = await requireUser();
    await requireModulePermission("FACULTY_MATTERS", "edit");

    const body = await request.json();

    const ownFaculty = await resolveOwnFaculty(user);
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    let facultyId = ownFaculty?.id || null;

    if (isAdmin && body.facultyId) {
      facultyId = String(body.facultyId);
    }

    if (!facultyId) {
      return errorResponse(
        "You are not currently assigned as Dean of a faculty, so you cannot create a department.",
        403
      );
    }

    const nameEn = String(body.nameEn || "").trim();
    const nameAr = String(body.nameAr || "").trim();
    const code = String(body.code || "").trim().toUpperCase();

    if (!nameEn || !nameAr || !code) {
      return errorResponse("English name, Arabic name and code are required.", 400);
    }

    const existing = await prisma.department.findUnique({ where: { code } });

    if (existing) {
      return errorResponse(`A department with the code "${code}" already exists.`, 409);
    }

    const department = await prisma.department.create({
      data: {
        facultyId,
        nameEn,
        nameAr,
        code,
        description: body.description ? String(body.description).slice(0, 1000) : null,
        isActive: body.isActive !== false,
      },
    });

    return NextResponse.json({ success: true, data: department }, { status: 201 });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Faculty Matters edit access required", 403);

    console.error("Dean departments POST error:", error);
    return errorResponse("Failed to create this department.", 500);
  }
}
