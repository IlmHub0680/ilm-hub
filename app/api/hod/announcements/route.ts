import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    await requireModulePermission("DEPARTMENT_MATTERS", "edit");

    const staff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });

    if (!staff) {
      return errorResponse("No staff profile found", 403);
    }

    const department = await prisma.department.findUnique({ where: { headId: staff.id } });

    if (!department) {
      return errorResponse("You are not assigned as Head of a department", 403);
    }

    const body = await request.json();

    const titleEn = typeof body.titleEn === "string" ? body.titleEn.trim() : "";
    const bodyEn = typeof body.bodyEn === "string" ? body.bodyEn.trim() : "";
    const titleAr = typeof body.titleAr === "string" && body.titleAr.trim() ? body.titleAr.trim() : titleEn;
    const bodyAr = typeof body.bodyAr === "string" && body.bodyAr.trim() ? body.bodyAr.trim() : bodyEn;

    if (!titleEn || !bodyEn) {
      return errorResponse("Title and body are required", 400);
    }

    const announcement = await prisma.announcement.create({
      data: {
        titleEn,
        titleAr,
        bodyEn,
        bodyAr,
        scope: "DEPARTMENT",
        departmentId: department.id,
        createdById: user.id,
      },
    });

    return NextResponse.json({ success: true, data: announcement });
  } catch (error) {
    console.error("HOD announcement POST error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Department Matters edit access required", 403);

    return errorResponse("Failed to publish announcement", 500);
  }
}
