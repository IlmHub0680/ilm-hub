import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// Resolving or dismissing a case follows the same escalation the
// drafted policy in Course Specifications already described: a MINOR
// case (typically resubmission or a grade penalty) is the reporting
// instructor's own call; a MAJOR case (repeat or severe) requires the
// Head of Department, matching "escalates to the Head of Department"
// exactly. standingActionTaken is only ever set true here — it never
// runs the AcademicStanding transition itself, which stays the
// existing Academic Records process; it is a record that this case is
// the reason that separate process was engaged.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const existing = await prisma.integrityCase.findUnique({ where: { id } });
    if (!existing) return errorResponse("Case not found.", 404);
    if (existing.status === "RESOLVED" || existing.status === "DISMISSED") {
      return errorResponse("This case has already been closed.", 409);
    }

    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    const staff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });

    let authorized = isAdmin;
    if (!authorized && existing.severity === "MINOR" && staff && staff.id === existing.reportedById) {
      authorized = true;
    }
    if (!authorized) {
      try {
        await requireModulePermission("DEPARTMENT_MATTERS", "edit");
        authorized = true;
      } catch {
        // not a Head of Department either
      }
    }
    if (!authorized) {
      return errorResponse(
        existing.severity === "MAJOR"
          ? "A major case requires Head of Department approval to resolve."
          : "Only the reporting staff member (or a Head of Department) may resolve this case.",
        403
      );
    }

    const body = await request.json();
    const action = body.action;
    if (action !== "resolve" && action !== "dismiss" && action !== "start_review") {
      return errorResponse("action must be 'resolve', 'dismiss', or 'start_review'.", 400);
    }

    if (!staff && !isAdmin) {
      return errorResponse("A staff profile is required to record this decision.", 403);
    }

    if (action === "start_review") {
      if (existing.status !== "REPORTED") {
        return errorResponse("Only a newly reported case can be moved to under review.", 409);
      }
      const updated = await prisma.integrityCase.update({
        where: { id },
        data: { status: "UNDER_REVIEW" },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === "dismiss") {
      const updated = await prisma.integrityCase.update({
        where: { id },
        data: {
          status: "DISMISSED",
          resolvedById: staff?.id ?? existing.reportedById,
          resolvedAt: new Date(),
        },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    const sanction = typeof body.sanction === "string" ? body.sanction.trim() : "";
    if (!sanction) {
      return errorResponse("A sanction is required to resolve a case (state what was actually applied).", 400);
    }

    const updated = await prisma.integrityCase.update({
      where: { id },
      data: {
        status: "RESOLVED",
        sanction,
        standingActionTaken: Boolean(body.standingActionTaken),
        resolvedById: staff?.id ?? existing.reportedById,
        resolvedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Integrity case PATCH error:", error);
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    return errorResponse("Failed to record this decision", 500);
  }
}
