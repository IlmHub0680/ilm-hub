import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/auditLog";

export const dynamic = "force-dynamic";

const ALL_MODULES = [
  "STUDENT_MATTERS",
  "ACADEMIC_RECORDS",
  "FACULTY_MATTERS",
  "DEPARTMENT_MATTERS",
  "PROGRAM_MATTERS",
  "COURSES_GRADES",
  "EXAMINATIONS",
  "FINANCE_FEES",
  "FINANCE_PAYROLL",
  "LIBRARY_OPS",
  "ICT_OPS",
  "ADMISSIONS",
  "QUALITY_ASSURANCE",
  "OTHER_ADMIN",
];

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// Model 26 addendum: Position and PositionPermission management had no
// admin surface at all before this -- every position and every module
// permission was set directly in the database. This is the genuinely
// missing piece; the RBAC matrix itself (Position -> PositionPermission
// -> Module, enforced via requireModulePermission) was already solid
// and is completely untouched here.
export async function GET() {
  try {
    await requireAdmin();

    const positions = await prisma.position.findMany({
      include: {
        permissions: true,
        staff: { select: { id: true, isActive: true } },
      },
      orderBy: { nameEn: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: positions.map((p) => ({
        id: p.id,
        nameEn: p.nameEn,
        nameAr: p.nameAr,
        code: p.code,
        description: p.description,
        isAcademic: p.isAcademic,
        isActive: p.isActive,
        activeStaffCount: p.staff.filter((s) => s.isActive).length,
        permissions: ALL_MODULES.map((module) => {
          const existing = p.permissions.find((perm) => perm.module === module);
          return { module, canView: existing?.canView ?? false, canEdit: existing?.canEdit ?? false };
        }),
      })),
      modules: ALL_MODULES,
    });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Admin access required", 403);
    console.error("GET admin positions error:", error);
    return errorResponse("Failed to load positions", 500);
  }
}

export async function POST(request) {
  try {
    const actor = await requireAdmin();

    const body = await request.json();
    const nameEn = typeof body?.nameEn === "string" ? body.nameEn.trim() : "";
    const nameAr = typeof body?.nameAr === "string" ? body.nameAr.trim() : "";
    const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
    const description = typeof body?.description === "string" ? body.description.trim() || null : null;
    const isAcademic = Boolean(body?.isAcademic);

    if (!nameEn || !nameAr || !code) {
      return errorResponse("English name, Arabic name, and a code are required.", 400);
    }

    const position = await prisma.position.create({
      data: {
        nameEn,
        nameAr,
        code,
        description,
        isAcademic,
        // Every module gets an explicit row (defaulted to no access) so
        // the permission matrix is always complete for this position --
        // least privilege by default, per Model 26 rule #12.
        permissions: {
          create: ALL_MODULES.map((module) => ({ module, canView: false, canEdit: false })),
        },
      },
      include: { permissions: true },
    });

    await logAudit({
      actor,
      action: "POSITION_CREATED",
      category: "OTHER",
      targetType: "Position",
      targetId: position.id,
      summary: `Created position "${position.nameEn}" (${position.code}) with no permissions granted by default`,
    });

    return NextResponse.json({ success: true, data: position });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Admin access required", 403);
    if (error?.code === "P2002") return errorResponse("A position with that name or code already exists.", 409);
    console.error("POST admin positions error:", error);
    return errorResponse("Failed to create position", 500);
  }
}
