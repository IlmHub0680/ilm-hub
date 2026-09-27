import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

const VALID_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

// A resolved/closed ticket can be reopened, but not forever: at most
// MAX_REOPENS times, and only within REOPEN_WINDOW_DAYS of when it was
// last resolved/closed -- an old, long-settled ticket should become a
// new ticket instead of being resurrected.
const MAX_REOPENS = 2;
const REOPEN_WINDOW_DAYS = 14;

export async function POST(request, { params }) {
  try {
    const user = await requireModulePermission("ICT_OPS", "edit");

    const { id } = await params;
    const body = await request.json();
    const status =
      typeof body.status === "string" ? body.status : "";
    const assignToSelf = body.assignToSelf === true;
    const escalate = body.escalate === true;
    const deescalate = body.deescalate === true;
    const priority =
      typeof body.priority === "string" ? body.priority : "";
    const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

    const existing = await prisma.iCTTicket.findUnique({ where: { id } });

    if (!existing) {
      return errorResponse("Ticket not found", 404);
    }

    const data = {};
    let touchedStatus = false;

    if (status === "REOPEN") {
      if (existing.status !== "RESOLVED" && existing.status !== "CLOSED") {
        return errorResponse("Only a resolved or closed ticket can be reopened", 409);
      }

      if (existing.reopenedCount >= MAX_REOPENS) {
        return errorResponse(`This ticket has already been reopened ${MAX_REOPENS} times`, 409);
      }

      const resolvedAt = existing.resolvedAt ? new Date(existing.resolvedAt) : null;
      const windowMs = REOPEN_WINDOW_DAYS * 24 * 60 * 60 * 1000;

      if (resolvedAt && Date.now() - resolvedAt.getTime() > windowMs) {
        return errorResponse(
          `This ticket was resolved more than ${REOPEN_WINDOW_DAYS} days ago; raise a new ticket instead`,
          409
        );
      }

      data.status = "REOPENED";
      data.resolvedAt = null;
      data.reopenedCount = existing.reopenedCount + 1;
      data.lastReopenedAt = new Date();
      touchedStatus = true;
    } else if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return errorResponse("A valid status is required", 400);
      }

      data.status = status;
      data.resolvedAt =
        status === "RESOLVED" || status === "CLOSED" ? new Date() : existing.resolvedAt;
      touchedStatus = true;
    }

    if (assignToSelf) {
      const staff = await prisma.staffProfile.findUnique({
        where: { userId: user.id },
      });

      if (staff) {
        data.assignedStaffId = staff.id;
      }
    }

    if (priority) {
      if (!VALID_PRIORITIES.includes(priority)) {
        return errorResponse("A valid priority is required", 400);
      }
      data.priority = priority;
    }

    if (escalate) {
      data.escalated = true;
      data.escalatedAt = new Date();
    } else if (deescalate) {
      data.escalated = false;
    }

    // First-response tracking: set the very first time a staffer
    // actually engages this ticket -- moving it off its initial OPEN
    // state (or off REOPENED, since a reopened ticket needs a fresh
    // response too) is the natural hook, same trigger point notes use
    // below. Never overwritten once set.
    if (
      !existing.firstRespondedAt &&
      touchedStatus &&
      (existing.status === "OPEN" || existing.status === "REOPENED") &&
      data.status !== existing.status
    ) {
      data.firstRespondedAt = new Date();
    }

    if (Object.keys(data).length === 0) {
      return errorResponse("No changes were provided", 400);
    }

    const updated = await prisma.iCTTicket.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Update ICT ticket error:", error);

    if (error?.message === "UNAUTHORIZED") {
      return errorResponse("Unauthorized", 401);
    }

    if (error?.message === "FORBIDDEN") {
      return errorResponse("ICT edit access required", 403);
    }

    return errorResponse("Failed to update ticket", 500);
  }
}
