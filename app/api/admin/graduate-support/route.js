import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

// Admin inbox for post-graduation Graduate Assistant requests — modeled
// directly on the Communication & Complaints inbox
// (app/api/admin/complaints/route.js), just scoped to
// type = "GRADUATE_SUPPORT" instead of "COMPLAINT".
export async function GET() {
  try {
    await requireAdmin();

    const requests = await prisma.request.findMany({
      where: { type: "GRADUATE_SUPPORT" },
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
        assignedStaff: { include: { user: { select: { name: true } } } },
        assignedUnit: { select: { id: true, nameEn: true, nameAr: true, type: true } },
        recipientDepartment: { select: { id: true, nameEn: true, nameAr: true } },
        activities: { orderBy: { createdAt: "asc" } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    console.error("Admin graduate support GET error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Admin access required", 403);

    return errorResponse("Failed to load graduate support requests", 500);
  }
}
