import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

// Cross-office admin view of every graduation application, since
// clearance is gathered from several offices (Library, Finance,
// Academic Administration, Student Affairs) at once — mirrors the
// same single-inbox pattern used for /admin/complaints.
export async function GET() {
  try {
    await requireAdmin();

    const applications = await prisma.graduationApplication.findMany({
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
        program: { select: { nameEn: true, level: true } },
        clearances: {
          include: {
            unit: { select: { nameEn: true, nameAr: true, type: true } },
            clearedByStaff: { include: { user: { select: { name: true } } } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, data: applications });
  } catch (error) {
    console.error("Admin graduation GET error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Admin access required", 403);

    return errorResponse("Failed to load graduation applications", 500);
  }
}
