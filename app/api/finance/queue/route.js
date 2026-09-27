import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

// Model 32 §3/§4 -- Finance department work queue. Every count here is a
// live relational aggregate (no mocked or hardcoded numbers): overdue and
// pending student fees, orders whose payment needs manual verification,
// and open refund requests.
export async function GET() {
  try {
    await requireModulePermission("FINANCE_FEES", "view");

    const now = new Date();

    const [
      overdueFees,
      pendingFees,
      ordersUnderReview,
      paymentsUnderVerification,
      refundRequests,
      refundTotals,
    ] = await Promise.all([
      prisma.studentFee.findMany({
        where: { status: { in: ["PENDING", "PARTIAL"] }, dueDate: { lt: now } },
        include: {
          student: { include: { user: { select: { name: true, email: true } } } },
          term: { select: { name: true } },
        },
        orderBy: { dueDate: "asc" },
        take: 50,
      }),
      prisma.studentFee.count({ where: { status: { in: ["PENDING", "PARTIAL"] } } }),
      prisma.order.findMany({
        where: { status: { in: ["PAYMENT_SUBMITTED", "UNDER_REVIEW"] } },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "asc" },
        take: 50,
      }),
      prisma.payment.count({ where: { status: "UNDER_VERIFICATION" } }),
      prisma.refundRequest.findMany({
        where: { status: "PENDING" },
        include: {
          order: { select: { orderNumber: true, totalUSD: true } },
          requestedBy: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "asc" },
        take: 50,
      }),
      prisma.refundRequest.count({ where: { status: "PENDING" } }),
    ]);

    return NextResponse.json({
      overdueFees: overdueFees.map((f) => ({
        id: f.id,
        studentName: f.student.user.name,
        studentEmail: f.student.user.email,
        feeType: f.feeType,
        balanceUSD: f.amountUSD - f.paidUSD,
        status: f.status,
        dueDate: f.dueDate,
        term: f.term?.name ?? null,
      })),
      overdueFeeCount: overdueFees.length,
      pendingFeeCount: pendingFees,
      ordersNeedingVerification: ordersUnderReview.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        buyerName: o.user.name,
        buyerEmail: o.user.email,
        totalUSD: o.totalUSD,
        status: o.status,
        createdAt: o.createdAt,
      })),
      ordersNeedingVerificationCount: ordersUnderReview.length,
      paymentsUnderVerificationCount: paymentsUnderVerification,
      refundRequests: refundRequests.map((r) => ({
        id: r.id,
        orderNumber: r.order.orderNumber,
        requestedByName: r.requestedBy.name,
        requestedByEmail: r.requestedBy.email,
        amountUSD: r.amountUSD,
        reason: r.reason,
        createdAt: r.createdAt,
      })),
      refundRequestCount: refundTotals,
    });
  } catch (error) {
    console.error("Finance queue GET error:", error);
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Finance access required", 403);
    return errorResponse("Failed to load the finance work queue", 500);
  }
}
