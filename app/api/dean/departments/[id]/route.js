import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

async function resolveOwnFaculty(user) {
  const staff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });
  if (!staff) return null;
  return prisma.faculty.findUnique({ where: { deanId: staff.id } });
}

async function loadOwnedDepartment(user, id) {
  const department = await prisma.department.findUnique({ where: { id } });
  if (!department) return { department: null, allowed: false };

  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  if (isAdmin) return { department, allowed: true };

  const ownFaculty = await resolveOwnFaculty(user);
  return { department, allowed: !!ownFaculty && ownFaculty.id === department.facultyId };
}

export async function PUT(request, { params }) {
  try {
    const user = await requireUser();
    await requireModulePermission("FACULTY_MATTERS", "edit");

    const { id } = await params;
    const { department, allowed } = await loadOwnedDepartment(user, id);

    if (!department) return errorResponse("Department not found.", 404);
    if (!allowed) return errorResponse("This department belongs to a different faculty.", 403);

    const body = await request.json();
    const values = {};

    if (body.nameEn !== undefined) values.nameEn = String(body.nameEn).trim();
    if (body.nameAr !== undefined) values.nameAr = String(body.nameAr).trim();
    if (body.description !== undefined) {
      values.description = body.description ? String(body.description).slice(0, 1000) : null;
    }
    if (body.isActive !== undefined) values.isActive = Boolean(body.isActive);
    if (body.headId !== undefined) values.headId = body.headId || null;

    const updated = await prisma.department.update({ where: { id }, data: values });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Faculty Matters edit access required", 403);

    console.error("Dean department PUT error:", error);
    return errorResponse("Failed to update this department.", 500);
  }
}

// Deactivates rather than deletes — a Department carries real Programs,
// StaffProfiles and StudentProfiles, so removing the row outright would
// either orphan an institution's actual academic history or fail on a
// foreign key. isActive is the same reversible switch every list screen
// already filters on.
export async function DELETE(request, { params }) {
  try {
    const user = await requireUser();
    await requireModulePermission("FACULTY_MATTERS", "edit");

    const { id } = await params;
    const { department, allowed } = await loadOwnedDepartment(user, id);

    if (!department) return errorResponse("Department not found.", 404);
    if (!allowed) return errorResponse("This department belongs to a different faculty.", 403);

    const updated = await prisma.department.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Faculty Matters edit access required", 403);

    console.error("Dean department DELETE error:", error);
    return errorResponse("Failed to deactivate this department.", 500);
  }
}
