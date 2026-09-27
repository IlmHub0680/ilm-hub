import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";
import { logAudit } from "@/lib/auditLog";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireModulePermission("EXAMINATIONS", "edit");

    const { id } = await params;
    const body = await request.json();
    const action = typeof body.action === "string" ? body.action : "";
    const responseNote =
      typeof body.responseNote === "string" && body.responseNote.trim()
        ? body.responseNote.trim()
        : undefined;

    const existing = await prisma.request.findUnique({ where: { id } });

    if (!existing || existing.type !== "GRADE_APPEAL") {
      return errorResponse("Grade appeal not found", 404);
    }

    if (existing.status === "APPROVED" || existing.status === "REJECTED") {
      return errorResponse(`Appeal is already ${existing.status.toLowerCase()}`, 409);
    }

    const statusMap: Record<string, string> = {
      review: "UNDER_REVIEW",
      approve: "APPROVED",
      reject: "REJECTED",
    };

    const nextStatus = statusMap[action];

    if (!nextStatus) {
      return errorResponse("Unknown action", 400);
    }

    const updated = await prisma.request.update({
      where: { id },
      data: {
        status: nextStatus as any,
        responseNote,
        resolvedAt: nextStatus === "APPROVED" || nextStatus === "REJECTED" ? new Date() : undefined,
      },
    });

    // Model 19/audit brief -- Examinations Officer actions on an appeal
    // affecting an official result are auditable, same category/helper
    // already used for graduation clearance and (as of this session)
    // transcript issuance/rejection. Never blocks the transition above
    // if the write itself fails -- see logAudit's own doc comment.
    await logAudit({
      actor,
      action:
        nextStatus === "APPROVED"
          ? "GRADE_APPEAL_APPROVED"
          : nextStatus === "REJECTED"
          ? "GRADE_APPEAL_REJECTED"
          : "GRADE_APPEAL_UNDER_REVIEW",
      category: "ACADEMIC_RECORD_ADJUSTMENT",
      targetType: "Request",
      targetId: id,
      summary: `Grade appeal ${id} moved to ${nextStatus}${responseNote ? ` — ${responseNote}` : ""}`,
      metadata: { previousStatus: existing.status, nextStatus, responseNote },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Grade appeal update error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Examinations edit access required", 403);

    return errorResponse("Failed to update grade appeal", 500);
  }
}
