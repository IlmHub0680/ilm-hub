import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { approvePayout, markPayoutPaid, rejectPayout } from "@/lib/royalty";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// Advances one payout through its lifecycle: approve (sign-off before
// payment), mark-paid (records a real reference, flips its ledger
// entries to PAID — the one place that happens), or reject (releases
// its reserved ledger entries back to the author's available balance).
export async function PATCH(request, { params }) {
  try {
    const admin = await requireAdmin();

    const { id } = await params;
    const body = await request.json();
    const action = typeof body.action === "string" ? body.action : "";

    let updated;

    if (action === "approve") {
      updated = await approvePayout(id);
    } else if (action === "mark-paid") {
      const reference = typeof body.reference === "string" ? body.reference.trim() : "";

      if (!reference) {
        return errorResponse("A payment reference is required to mark a payout as paid.", 400);
      }

      updated = await markPayoutPaid(id, { reference, processedByStaffId: admin.id });
    } else if (action === "reject") {
      updated = await rejectPayout(id, { note: body.note });
    } else {
      return errorResponse("Unknown action.", 400);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        status: updated.status,
        amountUSD: Number(updated.amountUSD),
        reference: updated.reference,
        processedAt: updated.processedAt,
      },
    });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Admin access required", 403);

    console.error("Admin royalty payout PATCH error:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Failed to update this payout.",
      400
    );
  }
}
