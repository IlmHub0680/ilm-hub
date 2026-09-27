import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

// Model 32 §4 -- raise a refund request against a real Order. Finance
// staff log a refund here (e.g. on a buyer's phoned-in or emailed
// request); this never touches the Order/Payment records themselves --
// see [id]/route.js for how a request is later resolved.
export async function POST(request) {
  try {
    const user = await requireModulePermission("FINANCE_FEES", "edit");

    const body = await request.json();
    const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
    const amountUSD = Number(body.amountUSD);
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";

    if (!orderId || !Number.isFinite(amountUSD) || amountUSD <= 0 || !reason) {
      return errorResponse("Order, a valid amount, and a reason are required", 400);
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return errorResponse("Order not found", 404);

    const refundRequest = await prisma.refundRequest.create({
      data: { orderId, requestedById: user.id, amountUSD, reason },
    });

    return NextResponse.json({ success: true, data: refundRequest }, { status: 201 });
  } catch (error) {
    console.error("Refund request POST error:", error);
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Finance edit access required", 403);
    return errorResponse("Failed to raise refund request", 500);
  }
}
