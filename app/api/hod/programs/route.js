import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const PROGRAM_LEVELS = [
  "CERTIFICATE",
  "DIPLOMA",
  "UNDERGRADUATE",
  "POSTGRADUATE",
  "MASTERS",
  "DOCTORATE",
  "SHORT_COURSE",
];

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// Resolves the department this signed-in Head of Department actually
// leads (Department.headId === their own StaffProfile.id — the same
// real ownership check already used by app/api/hod/portal).
async function resolveOwnDepartment(user) {
  const staff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });
  if (!staff) return null;
  return prisma.department.findUnique({ where: { headId: staff.id }, include: { faculty: true } });
}

export async function GET() {
  try {
    const user = await requireUser();
    await requireModulePermission("DEPARTMENT_MATTERS", "view");

    const department = await resolveOwnDepartment(user);

    if (!department && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return errorResponse("You are not currently assigned as Head of a department.", 403);
    }

    const programs = await prisma.program.findMany({
      where: department ? { departmentId: department.id } : {},
      include: {
        coordinator: { include: { user: { select: { name: true } } } },
        _count: { select: { courses: true, students: true } },
      },
      orderBy: { nameEn: "asc" },
    });

    return NextResponse.json({ success: true, data: programs });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Department Matters access required", 403);

    console.error("HoD programs GET error:", error);
    return errorResponse("Failed to load programmes", 500);
  }
}

// Creates a new Program (degree/certificate) within the HoD's own
// department — the "study plan" a Programme Coordinator will later
// populate with courses. Admin/Super Admin may create one in any
// department by passing departmentId explicitly.
export async function POST(request) {
  try {
    const user = await requireUser();
    await requireModulePermission("DEPARTMENT_MATTERS", "edit");

    const body = await request.json();

    const ownDepartment = await resolveOwnDepartment(user);
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    let department = ownDepartment;

    if (isAdmin && body.departmentId) {
      department = await prisma.department.findUnique({ where: { id: String(body.departmentId) } });
    }

    if (!department) {
      return errorResponse(
        "You are not currently assigned as Head of a department, so you cannot create a programme.",
        403
      );
    }

    const nameEn = String(body.nameEn || "").trim();
    const nameAr = String(body.nameAr || "").trim();
    const code = String(body.code || "").trim().toUpperCase();
    const level = String(body.level || "").trim().toUpperCase();

    if (!nameEn || !nameAr || !code) {
      return errorResponse("English name, Arabic name and code are required.", 400);
    }

    if (!PROGRAM_LEVELS.includes(level)) {
      return errorResponse(`Level must be one of: ${PROGRAM_LEVELS.join(", ")}.`, 400);
    }

    const existing = await prisma.program.findUnique({ where: { code } });

    if (existing) {
      return errorResponse(`A programme with the code "${code}" already exists.`, 409);
    }

    let coordinatorId = null;

    if (body.coordinatorId) {
      const coordinatorStaff = await prisma.staffProfile.findUnique({
        where: { id: String(body.coordinatorId) },
      });

      if (!coordinatorStaff) {
        return errorResponse("The selected coordinator could not be found.", 400);
      }

      coordinatorId = coordinatorStaff.id;
    }

    const program = await prisma.program.create({
      data: {
        departmentId: department.id,
        facultyId: department.facultyId,
        nameEn,
        nameAr,
        code,
        level,
        descriptionEn: body.descriptionEn ? String(body.descriptionEn).slice(0, 2000) : null,
        descriptionAr: body.descriptionAr ? String(body.descriptionAr).slice(0, 2000) : null,
        durationYears: body.durationYears ? Number(body.durationYears) : null,
        isActive: body.isActive !== false,
        // A brand-new programme starts as a real DRAFT (Model 11) — see
        // the matching Course comment above for why existing rows keep
        // the APPROVED default instead.
        approvalStatus: "DRAFT",
        coordinatorId,
      },
    });

    return NextResponse.json({ success: true, data: program }, { status: 201 });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Department Matters edit access required", 403);

    console.error("HoD programs POST error:", error);
    return errorResponse("Failed to create this programme.", 500);
  }
}
