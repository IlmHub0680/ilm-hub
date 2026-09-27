import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

// Admin-wide complaint inbox. Complaints can be addressed to any Unit
// or Department, so — unlike the per-office dashboards (Student
// Affairs, Academic Records, etc.) — this is a single cross-office
// view an Admin/Super Admin uses to triage, respond to, and transfer
// complaints between offices.
export async function GET() {
  try {
    await requireAdmin();

    const complaints = await prisma.request.findMany({
      where: { type: "COMPLAINT" },
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
        assignedStaff: { include: { user: { select: { name: true } } } },
        assignedUnit: { select: { id: true, nameEn: true, nameAr: true, type: true } },
        recipientDepartment: { select: { id: true, nameEn: true, nameAr: true } },
        activities: { orderBy: { createdAt: "asc" } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, data: complaints });
  } catch (error) {
    console.error("Admin complaints GET error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Admin access required", 403);

    return errorResponse("Failed to load complaints", 500);
  }
}
