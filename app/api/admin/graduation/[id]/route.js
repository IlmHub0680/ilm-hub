import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";
import { generateGraduationDocuments } from "@/lib/graduationDocuments";
import { logAudit } from "@/lib/auditLog";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

const OPEN_STATUSES = ["APPLIED", "CLEARANCE_IN_PROGRESS", "CLEARED"];

// Every Unit.type that ever actually receives a GraduationClearance row
// (see CLEARANCE_UNIT_TYPES in app/api/student/graduation/route.js)
// mapped to the real institutional Module that office's own edit
// permission lives under. Only these four unit types are ever attached
// to a clearance, so only these four need an entry here.
const CLEARANCE_UNIT_MODULE = {
  LIBRARY: "LIBRARY_OPS",
  FINANCE: "FINANCE_FEES",
  ACADEMIC_ADMINISTRATION: "ACADEMIC_RECORDS",
  STUDENT_AFFAIRS: "STUDENT_MATTERS",
};

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const action = typeof body.action === "string" ? body.action : "";

    const application = await prisma.graduationApplication.findUnique({
      where: { id },
      include: { clearances: { include: { unit: true } } },
    });

    if (!application) {
      return errorResponse("Graduation application not found", 404);
    }

    if (action === "clear-unit") {
      if (!OPEN_STATUSES.includes(application.status)) {
        return errorResponse("This application is already decided; clearances can no longer be changed", 409);
      }

      const clearanceId = typeof body.clearanceId === "string" ? body.clearanceId : "";
      const clearanceStatus = typeof body.status === "string" ? body.status : "";
      const note = typeof body.note === "string" && body.note.trim() ? body.note.trim() : null;

      if (!["CLEARED", "FLAGGED"].includes(clearanceStatus)) {
        return errorResponse("A valid clearance decision is required", 400);
      }

      const clearance = application.clearances.find((c) => c.id === clearanceId);

      if (!clearance) {
        return errorResponse("Clearance item not found on this application", 404);
      }

      // Ownership: clearing this specific item belongs to whichever real
      // Unit it is tied to (Library, Finance, Academic Administration,
      // Student Affairs) -- never Admin directly. The calling staff
      // member must both hold edit permission on that unit's mapped
      // Module and actually belong to that exact Unit row -- module
      // permission alone is not enough, since two units can share a
      // module in principle and a staffer's authority is scoped to
      // their own office, not the module in the abstract.
      const requiredModule = CLEARANCE_UNIT_MODULE[clearance.unit.type];

      if (!requiredModule) {
        return errorResponse("This clearance's unit has no operational clearing office", 400);
      }

      const user = await requireModulePermission(requiredModule, "edit");

      const staff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });

      if (!staff || !staff.isActive || staff.unitId !== clearance.unitId) {
        return errorResponse("You are not a member of the unit responsible for this clearance", 403);
      }

      await prisma.graduationClearance.update({
        where: { id: clearanceId },
        data: {
          status: clearanceStatus,
          note,
          clearedByStaffId: staff.id,
          clearedAt: clearanceStatus === "CLEARED" ? new Date() : null,
        },
      });

      const refreshedClearances = await prisma.graduationClearance.findMany({
        where: { applicationId: id },
      });

      const allCleared = refreshedClearances.every((c) => c.status === "CLEARED");

      const updated = await prisma.graduationApplication.update({
        where: { id },
        data: { status: allCleared ? "CLEARED" : "CLEARANCE_IN_PROGRESS" },
      });

      await logAudit({
        actor: user,
        action: "GRADUATION_CLEARANCE_DECIDED",
        category: "ACADEMIC_RECORD_ADJUSTMENT",
        targetType: "GraduationApplication",
        targetId: id,
        summary: `${clearanceStatus === "CLEARED" ? "Cleared" : "Flagged"} clearance item for graduation application ${id}${note ? ` — ${note}` : ""}`,
        metadata: { clearanceId, clearanceStatus, note },
      });

      return NextResponse.json({ success: true, data: updated });
    }

    // approve / reject / complete are the Registrar's final authority
    // per the Academy's own documentation (Assessment, Grading &
    // Progression §8.4: "the Registrar's final approval moves the
    // application to COMPLETED"). Gated on the Registrar's real
    // module (ACADEMIC_RECORDS/edit, the same module
    // academic-records-dashboard itself is gated on) -- SUPER_ADMIN
    // still bypasses via requireModulePermission itself, matching
    // every other requireXxxEdit helper in lib/permissions.ts
    // (requireAdmissionsEdit etc.), but plain ADMIN gets no separate
    // bypass, since no such precedent exists for these operational
    // edit actions elsewhere in this codebase.
    if (action === "approve") {
      if (application.status !== "CLEARED") {
        return errorResponse("All clearances must be cleared before approval", 409);
      }

      const user = await requireModulePermission("ACADEMIC_RECORDS", "edit");

      const decisionNote =
        typeof body.decisionNote === "string" && body.decisionNote.trim()
          ? body.decisionNote.trim()
          : null;

      const updated = await prisma.graduationApplication.update({
        where: { id },
        data: { status: "APPROVED", decidedAt: new Date(), decisionNote },
      });

      await logAudit({
        actor: user,
        action: "GRADUATION_APPROVED",
        category: "ACADEMIC_RECORD_ADJUSTMENT",
        targetType: "GraduationApplication",
        targetId: id,
        summary: `Graduation approved for application ${id}${decisionNote ? ` — ${decisionNote}` : ""}`,
      });

      return NextResponse.json({ success: true, data: updated });
    }

    if (action === "reject") {
      const user = await requireModulePermission("ACADEMIC_RECORDS", "edit");

      const decisionNote =
        typeof body.decisionNote === "string" && body.decisionNote.trim()
          ? body.decisionNote.trim()
          : null;

      const updated = await prisma.graduationApplication.update({
        where: { id },
        data: { status: "REJECTED", decidedAt: new Date(), decisionNote },
      });

      await logAudit({
        actor: user,
        action: "GRADUATION_REJECTED",
        category: "ACADEMIC_RECORD_ADJUSTMENT",
        targetType: "GraduationApplication",
        targetId: id,
        summary: `Graduation rejected for application ${id}${decisionNote ? ` — ${decisionNote}` : ""}`,
      });

      return NextResponse.json({ success: true, data: updated });
    }

    if (action === "complete") {
      if (application.status !== "APPROVED") {
        return errorResponse("The application must be approved before it can be completed", 409);
      }

      const user = await requireModulePermission("ACADEMIC_RECORDS", "edit");

      const [updated] = await prisma.$transaction([
        prisma.graduationApplication.update({
          where: { id },
          data: { status: "COMPLETED" },
        }),
        prisma.studentProfile.update({
          where: { id: application.studentId },
          data: { status: "GRADUATED" },
        }),
      ]);

      await generateGraduationDocuments(id);

      await logAudit({
        actor: user,
        action: "GRADUATION_DOCUMENTS_FINALIZED",
        category: "DOCUMENT_FINALIZATION",
        targetType: "GraduationApplication",
        targetId: id,
        summary: `Graduation completed and Certificate/Statement of Completion generated for application ${id}`,
      });

      return NextResponse.json({ success: true, data: updated });
    }

    return errorResponse("Unknown action", 400);
  } catch (error) {
    console.error("Admin graduation update error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("You do not have permission to perform this action", 403);

    return errorResponse("Failed to update graduation application", 500);
  }
}
