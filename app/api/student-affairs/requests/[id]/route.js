import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

const ACTION_TRANSITIONS = {
  claim: { from: ["SUBMITTED"], to: "UNDER_REVIEW", assign: true, resolve: false },
  approve: { from: ["SUBMITTED", "UNDER_REVIEW"], to: "APPROVED", assign: true, resolve: true },
  reject: { from: ["SUBMITTED", "UNDER_REVIEW"], to: "REJECTED", assign: true, resolve: true },
  complete: { from: ["APPROVED"], to: "COMPLETED", assign: true, resolve: true },
};

// Request rows are shared across three domains (Student Affairs,
// Records/TRANSCRIPT, Examinations/GRADE_APPEAL -- see the RequestType
// enum). The list route already excludes those two types
// (see app/api/student-affairs/requests/route.js), but this PATCH route
// previously trusted the :id alone and never re-checked the row's own
// type, so a Student Affairs Officer could action ANY Request by id,
// including a transcript request or a grade appeal that belongs to a
// different delegated owner entirely. Keep this list in sync with that
// list route's own notIn filter.
const OUT_OF_SCOPE_TYPES = ["TRANSCRIPT", "GRADE_APPEAL"];

const CLOSED_STATUSES = ["COMPLETED", "REJECTED"];

export async function PATCH(request, { params }) {
  try {
    const user = await requireModulePermission("STUDENT_MATTERS", "edit");

    const { id } = await params;
    const body = await request.json();

    const action = typeof body.action === "string" ? body.action : "";
    const responseNote =
      typeof body.responseNote === "string" && body.responseNote.trim()
        ? body.responseNote.trim()
        : undefined;

    const existing = await prisma.request.findUnique({
      where: { id },
      include: {
        assignedUnit: { select: { nameEn: true } },
        recipientDepartment: { select: { nameEn: true } },
      },
    });

    if (!existing) {
      return errorResponse("Request not found", 404);
    }

    if (OUT_OF_SCOPE_TYPES.includes(existing.type)) {
      return errorResponse(
        "This request belongs to a different domain and cannot be actioned from Student Affairs",
        403
      );
    }

    const staff = await prisma.staffProfile.findUnique({
      where: { userId: user.id },
    });

    const currentLabel = existing.assignedUnit?.nameEn || existing.recipientDepartment?.nameEn || "";

    // transfer/respond: absorbed from the admin Complaints/Graduate
    // Support routes (app/api/admin/complaints/[id]/route.js and
    // app/api/admin/graduate-support/[id]/route.js), which duplicated
    // this same operational authority under a bare requireAdmin() gate
    // instead of Student Affairs' own module-permission gate. Available
    // for every in-scope request type this route handles, not just
    // Complaint/Graduate Support -- transferring a request to a
    // different Unit/Department is meaningful for any of them (e.g.
    // rerouting a leave-of-absence request to the right office). Both
    // write a RequestActivity row, same fields the admin routes wrote.
    if (action === "transfer") {
      if (CLOSED_STATUSES.includes(existing.status)) {
        return errorResponse(`This request is already closed (${existing.status.toLowerCase()})`, 409);
      }

      const recipientType = typeof body.recipientType === "string" ? body.recipientType : "";
      const recipientId = typeof body.recipientId === "string" ? body.recipientId : "";
      const note = typeof body.note === "string" && body.note.trim() ? body.note.trim() : null;

      if (!["unit", "department"].includes(recipientType) || !recipientId) {
        return errorResponse("Please choose who to transfer this request to", 400);
      }

      let newLabel = "";
      const data = { assignedUnitId: null, recipientDepartmentId: null };

      if (recipientType === "unit") {
        const unit = await prisma.unit.findUnique({ where: { id: recipientId } });
        if (!unit || !unit.isActive) return errorResponse("The selected recipient is not available", 400);
        data.assignedUnitId = unit.id;
        newLabel = unit.nameEn;
      } else {
        const department = await prisma.department.findUnique({ where: { id: recipientId } });
        if (!department || !department.isActive) return errorResponse("The selected recipient is not available", 400);
        data.recipientDepartmentId = department.id;
        newLabel = department.nameEn;
      }

      if (existing.status === "SUBMITTED") {
        data.status = "UNDER_REVIEW";
      }

      const [updated] = await prisma.$transaction([
        prisma.request.update({ where: { id }, data }),
        prisma.requestActivity.create({
          data: {
            requestId: id,
            action: "Transferred",
            fromLabel: currentLabel,
            toLabel: newLabel,
            fromStatus: existing.status,
            toStatus: data.status || existing.status,
            note,
            actorLabel: user.name,
          },
        }),
      ]);

      return NextResponse.json({ success: true, data: updated });
    }

    if (action === "respond") {
      if (CLOSED_STATUSES.includes(existing.status)) {
        return errorResponse(`This request is already closed (${existing.status.toLowerCase()})`, 409);
      }

      const note = typeof body.responseNote === "string" ? body.responseNote.trim() : "";

      if (!note) {
        return errorResponse("Please write a response before sending it", 400);
      }

      const data = { responseNote: note };
      if (existing.status === "SUBMITTED") data.status = "UNDER_REVIEW";
      if (data.status && staff && !existing.assignedStaffId) {
        data.assignedStaffId = staff.id;
      }

      const [updated] = await prisma.$transaction([
        prisma.request.update({ where: { id }, data }),
        prisma.requestActivity.create({
          data: {
            requestId: id,
            action: "Responded",
            note,
            fromStatus: existing.status,
            toStatus: data.status || existing.status,
            toLabel: currentLabel,
            actorLabel: user.name,
          },
        }),
      ]);

      return NextResponse.json({ success: true, data: updated });
    }

    const transition = ACTION_TRANSITIONS[action];

    if (!transition) {
      return errorResponse("Unknown action", 400);
    }

    if (!transition.from.includes(existing.status)) {
      return errorResponse(
        `Cannot ${action} a request that is currently ${existing.status}`,
        409
      );
    }

    const data = {
      status: transition.to,
    };

    if (transition.assign && staff && !existing.assignedStaffId) {
      data.assignedStaffId = staff.id;
    }

    if (transition.resolve) {
      data.resolvedAt = new Date();
    }

    if (responseNote !== undefined) {
      data.responseNote = responseNote;
    }

    // Same RequestActivity audit trail the admin routes wrote for every
    // transition -- this route previously updated `status` with no
    // activity history at all.
    const activityAction =
      action === "claim" ? "Assigned" : action === "approve" ? "Approved" : "Closed";

    const [updated] = await prisma.$transaction([
      prisma.request.update({
        where: { id },
        data,
      }),
      prisma.requestActivity.create({
        data: {
          requestId: id,
          action: activityAction,
          fromStatus: existing.status,
          toStatus: transition.to,
          toLabel: currentLabel,
          note: responseNote || null,
          actorLabel: user.name,
        },
      }),
    ]);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Student Affairs request update error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Student Affairs edit access required", 403);

    return errorResponse("Failed to update request", 500);
  }
}
