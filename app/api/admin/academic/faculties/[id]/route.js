import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function PUT(request, { params }) {
  try {
    await requireAdmin();

    const { id } = await params;
    const existing = await prisma.faculty.findUnique({ where: { id } });

    if (!existing) {
      return errorResponse("Faculty not found.", 404);
    }

    const body = await request.json();
    const values = {};

    if (body.nameEn !== undefined) values.nameEn = String(body.nameEn).trim();
    if (body.nameAr !== undefined) values.nameAr = String(body.nameAr).trim();
    if (body.description !== undefined) {
      values.description = body.description ? String(body.description).slice(0, 1000) : null;
    }
    if (body.isActive !== undefined) values.isActive = Boolean(body.isActive);

    if (body.deanId !== undefined) {
      values.deanId = body.deanId || null;
    }

    const faculty = await prisma.faculty.update({ where: { id }, data: values });

    return NextResponse.json({ success: true, data: faculty });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Admin access required", 403);

    console.error("Admin faculty PUT error:", error);
    return errorResponse("Failed to update this faculty.", 500);
  }
}

// Faculties are never hard-deleted here — every Department, Program,
// StaffProfile and StudentProfile row references one, so removing it
// outright would either cascade-orphan an institution's real academic
// structure or fail on a foreign key. Deactivating is the safe,
// reversible equivalent (matches isActive already being the switch
// every list/detail screen in this app filters on).
export async function DELETE(request, { params }) {
  try {
    await requireAdmin();

    const { id } = await params;
    const existing = await prisma.faculty.findUnique({ where: { id } });

    if (!existing) {
      return errorResponse("Faculty not found.", 404);
    }

    const faculty = await prisma.faculty.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      data: faculty,
      message: "Faculty deactivated. Its departments and programmes are unaffected but the faculty itself no longer appears as active.",
    });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Admin access required", 403);

    console.error("Admin faculty DELETE error:", error);
    return errorResponse("Failed to deactivate this faculty.", 500);
  }
}
