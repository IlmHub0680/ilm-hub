import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

const VALID_STATUSES = ["PENDING", "APPROVED", "REJECTED", "PROCESSED"];

// PATCH: resolve a refund request. PROCESSED records that Finance
// confirms the money was actually returned via the gateway -- this
// endpoint never calls Stripe/Paystack itself, keeping high-security
// payment mutations server-side and manual per Model 31 §7.
export async function PATCH(
  request,
  { params }
) {
  try {
    const user = await requireModulePermission("FINANCE_FEES", "edit");
    const staff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });
    if (!staff) return errorResponse("No staff profile found for this account", 403);

    const { id } = await params;
    const existing = await prisma.refundRequest.findUnique({ where: { id } });
    if (!existing) return errorResponse("Refund request not found", 404);

    const body = await request.json();
    const status = typeof body.status === "string" ? body.status : "";
    const resolutionNote = typeof body.resolutionNote === "string" ? body.resolutionNote.trim() || null : null;

    if (!VALID_STATUSES.includes(status)) {
      return errorResponse("A valid status is required", 400);
    }

    const isResolving = status !== "PENDING";

    const updated = await prisma.refundRequest.update({
      where: { id },
      data: {
        status,
        resolutionNote,
        resolvedById: isResolving ? staff.id : null,
        resolvedAt: isResolving ? new Date() : null,
      },
    });

    if (status === "PROCESSED") {
      await prisma.payment.updateMany({
        where: { orderId: existing.orderId, status: "PAID" },
        data: { status: "REFUNDED" },
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Refund request PATCH error:", error);
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Finance edit access required", 403);
    return errorResponse("Failed to update refund request", 500);
  }
}
