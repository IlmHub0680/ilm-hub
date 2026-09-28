import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

// Library's own real place to clear its graduation-clearance
// checklist item -- scoped to the Unit(s) of type LIBRARY the calling
// staff member actually belongs to, never every LIBRARY unit in the
// institution and never any other office's clearance items.
export async function GET() {
  try {
    const user = await requireModulePermission("LIBRARY_OPS", "view");

    const staff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });

    if (!staff || !staff.unitId) {
      return NextResponse.json({ success: true, data: [] });
    }

    const unit = await prisma.unit.findUnique({ where: { id: staff.unitId } });

    if (!unit || unit.type !== "LIBRARY") {
      return NextResponse.json({ success: true, data: [] });
    }

    const clearances = await prisma.graduationClearance.findMany({
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

    return NextResponse.json({ success: true, data: clearances });
  } catch (error) {
    console.error("Library graduation clearances GET error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Library access required", 403);

    return errorResponse("Failed to load graduation clearances", 500);
  }
}
