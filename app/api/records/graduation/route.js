import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

// The Registrar's own real place for graduation work: Academic
// Administration's own clearance checklist item (scoped to the real
// Unit the calling staff member belongs to, same as Finance/Library),
// plus the Registrar's final-authority decision queue (CLEARED
// applications awaiting approve/reject, and APPROVED applications
// awaiting completion) -- per the Academy's own documentation, the
// Registrar's approval is what moves an application to COMPLETED.
export async function GET() {
  try {
    const user = await requireModulePermission("ACADEMIC_RECORDS", "view");

    const staff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });

    let clearances = [];

    if (staff?.unitId) {
      const unit = await prisma.unit.findUnique({ where: { id: staff.unitId } });

      if (unit && unit.type === "ACADEMIC_ADMINISTRATION") {
        clearances = await prisma.graduationClearance.findMany({
          where: { unitId: staff.unitId, status: { in: ["PENDING", "FLAGGED"] } },
          include: {
            application: {
              include: {
                student: { include: { user: { select: { name: true } } } },
                program: { select: { nameEn: true } },
              },
            },
          },
          orderBy: { createdAt: "asc" },
        });
      }
    }

    const decisions = await prisma.graduationApplication.findMany({
      where: { status: { in: ["CLEARED", "APPROVED"] } },
      include: {
        student: { include: { user: { select: { name: true } } } },
        program: { select: { nameEn: true } },
        clearances: {
          include: { unit: { select: { nameEn: true } } },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, clearances, decisions });
  } catch (error) {
    console.error("Records graduation GET error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Academic Records access required", 403);

    return errorResponse("Failed to load graduation data", 500);
  }
}
