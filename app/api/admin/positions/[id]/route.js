import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/auditLog";

export const dynamic = "force-dynamic";

const VALID_MODULES = new Set([
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
]);

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// PATCH updates a position's own fields and/or its permission matrix
// in one request. No DELETE here — deactivate via isActive instead,
// the same "never hard-delete, use a status flag" pattern already
// used for StaffProfile elsewhere in this codebase, so a deactivated
// position's history (who held it, when) is never lost.
export async function PATCH(request, { params }) {
  try {
    const actor = await requireAdmin();
    const { id } = await params;

    const existing = await prisma.position.findUnique({
      where: { id },
      include: { permissions: true },
    });
    if (!existing) {
      return errorResponse("Position not found.", 404);
    }

    const body = await request.json();
    const data = {};
    const fieldChanges = [];

    if (Object.prototype.hasOwnProperty.call(body, "nameEn")) {
      const v = typeof body.nameEn === "string" ? body.nameEn.trim() : "";
      if (!v) return errorResponse("English name cannot be empty.", 400);
      if (v !== existing.nameEn) fieldChanges.push(`name "${existing.nameEn}" → "${v}"`);
      data.nameEn = v;
    }
    if (Object.prototype.hasOwnProperty.call(body, "nameAr")) {
      const v = typeof body.nameAr === "string" ? body.nameAr.trim() : "";
      if (!v) return errorResponse("Arabic name cannot be empty.", 400);
      data.nameAr = v;
    }
    if (Object.prototype.hasOwnProperty.call(body, "description")) {
      data.description = typeof body.description === "string" ? body.description.trim() || null : null;
    }
    if (Object.prototype.hasOwnProperty.call(body, "isAcademic")) {
      data.isAcademic = Boolean(body.isAcademic);
    }
    if (Object.prototype.hasOwnProperty.call(body, "isActive")) {
      data.isActive = Boolean(body.isActive);
      if (data.isActive !== existing.isActive) {
        fieldChanges.push(data.isActive ? "reactivated" : "deactivated");
      }
    }

    // Permission matrix: [{ module, canView, canEdit }, ...] — upserts
    // one row per module named. Every write here is audit-logged with
    // exactly what changed, per Model 26 rule #11.
    const permissionChanges = [];
    if (Array.isArray(body?.permissions)) {
      for (const entry of body.permissions) {
        if (!entry || !VALID_MODULES.has(entry.module)) continue;
        const canView = Boolean(entry.canView);
        const canEdit = Boolean(entry.canEdit);
        const before = existing.permissions.find((p) => p.module === entry.module);
        if (before && before.canView === canView && before.canEdit === canEdit) continue;

        await prisma.positionPermission.upsert({
          where: { positionId_module: { positionId: id, module: entry.module } },
          update: { canView, canEdit },
          create: { positionId: id, module: entry.module, canView, canEdit },
        });

        permissionChanges.push(
          `${entry.module}: ${before ? `(view:${before.canView},edit:${before.canEdit})` : "(none)"} → (view:${canView},edit:${canEdit})`
        );
      }
    }

    const position = Object.keys(data).length > 0
      ? await prisma.position.update({ where: { id }, data })
      : existing;

    if (fieldChanges.length > 0 || permissionChanges.length > 0) {
      await logAudit({
        actor,
        action: "POSITION_PERMISSIONS_UPDATED",
        category: "OTHER",
        targetType: "Position",
        targetId: id,
        summary: `Position "${existing.nameEn}" updated${fieldChanges.length ? ` — ${fieldChanges.join(", ")}` : ""}${permissionChanges.length ? ` — permissions changed: ${permissionChanges.join("; ")}` : ""}`,
        metadata: { fieldChanges, permissionChanges },
      });
    }

    const refreshed = await prisma.position.findUnique({ where: { id }, include: { permissions: true } });

    return NextResponse.json({ success: true, data: refreshed });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Admin access required", 403);
    if (error?.code === "P2002") return errorResponse("A position with that name or code already exists.", 409);
    console.error("PATCH admin position error:", error);
    return errorResponse("Failed to update position", 500);
  }
}
