import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

// Orders in one of these states are the ones the Finance work queue
// lists under "Orders Awaiting Payment Verification" (see
// app/api/finance/queue/route.js). Confirming payment here is the
// manual equivalent of what the Stripe/Paystack webhooks and the
// Paystack client-verify route do automatically: it marks the order
// (and its Payment row) PAID and moves it to PENDING_ADMIN_APPROVAL so
// it next surfaces for admin activation (app/api/orders/[id]/approve),
// which grants book access. It never grants access itself.
const REVIEW_STATUSES = [
  "ORDER_PLACED",
  "PAYMENT_SUBMITTED",
  "UNDER_REVIEW",
  "PENDING_ADMIN_APPROVAL",
];

export async function POST(request, { params }) {
  try {
    await requireModulePermission("FINANCE_FEES", "edit");

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { payments: true },
    });

    if (!order) {
      return errorResponse("Order not found", 404);
    }

    if (order.paymentStatus === "PAID") {
      return errorResponse("This order's payment has already been confirmed", 409);
    }

    if (!REVIEW_STATUSES.includes(order.status)) {
      return errorResponse("This order is not currently awaiting payment verification", 409);
    }

    const now = new Date();

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const activated = await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          status: "PENDING_ADMIN_APPROVAL",
          paidAmount:
            Number(order.paidAmount) > 0
              ? order.paidAmount
              : Number(order.totalUSD) * Number(order.exchangeRate || 1),
          paidAt: order.paidAt || now,
        },
      });

      await tx.payment.updateMany({
        where: {
          orderId: order.id,
          status: { in: ["PENDING", "UNDER_VERIFICATION"] },
        },
        data: { status: "PAID", paidAt: now },
      });

      return activated;
    });

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error("Finance order payment verification error:", error);
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Finance edit access required", 403);
    return errorResponse("Failed to verify this order's payment", 500);
  }
}
