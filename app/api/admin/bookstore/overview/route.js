import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/*
 * Real, database-backed stats for the Bookstore admin overview page
 * (app/admin/dashboard/AdminDashboardContent.tsx, rendered at
 * /admin/bookstore). Every figure here is computed from Order/Payment/
 * Book/ManuscriptSubmission rows — nothing is hardcoded or estimated.
 *
 * Note on revenue: Order.totalUSD is always the book price in USD
 * regardless of what currency the customer actually paid in, so it is
 * the only sound common unit to sum across orders that were charged in
 * different currencies (USD via Stripe, GHS via Paystack mobile money).
 * Summing paidAmount directly would silently mix currencies together.
 */
export async function GET() {
  try {
    await requireAdmin();

    const REVIEW_STATUSES = [
      "ORDER_PLACED",
      "PAYMENT_SUBMITTED",
      "UNDER_REVIEW",
      "PENDING_ADMIN_APPROVAL",
    ];

    const [
      orderCount,
      paidOrdersForRevenue,
      pendingApprovalCount,
      awaitingPaymentCount,
      activatedCount,
      publishedBooksCount,
      pendingBooksCount,
      pendingSubmissionsCount,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),

      prisma.order.findMany({
        where: { paymentStatus: "PAID" },
        select: { totalUSD: true },
      }),

      prisma.order.count({
        where: {
          paymentStatus: "PAID",
          status: { in: REVIEW_STATUSES },
        },
      }),

      prisma.order.count({
        where: {
          paymentStatus: { not: "PAID" },
          status: { notIn: ["REJECTED"] },
        },
      }),

      prisma.order.count({
        where: { status: { in: ["ACTIVATED", "COMPLETED"] } },
      }),

      prisma.book.count({ where: { status: "PUBLISHED" } }),

      prisma.book.count({ where: { status: "PENDING_REVIEW" } }),

      prisma.manuscriptSubmission.count({
        where: {
          status: {
            in: [
              "SUBMITTED",
              "UNDER_REVIEW",
              "QUOTE_GENERATED",
              "QUOTE_ACCEPTED",
              "IN_PRODUCTION",
            ],
          },
        },
      }),

      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          orderNumber: true,
          totalUSD: true,
          currencyCode: true,
          paymentStatus: true,
          status: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
        },
      }),
    ]);

    const totalRevenueUSD = paidOrdersForRevenue.reduce(
      (sum, o) => sum + Number(o.totalUSD || 0),
      0
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenueUSD,
        paidOrderCount: paidOrdersForRevenue.length,
        orderCount,
        pendingApprovalCount,
        awaitingPaymentCount,
        activatedCount,
        publishedBooksCount,
        pendingBooksCount,
        pendingSubmissionsCount,
      },
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        totalUSD: Number(o.totalUSD),
        currencyCode: o.currencyCode,
        paymentStatus: o.paymentStatus,
        status: o.status,
        createdAt: o.createdAt,
        customerName: o.user?.name || o.user?.email || "Customer",
      })),
    });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Sign in required." },
        { status: 401 }
      );
    }
    if (error?.message === "FORBIDDEN") {
      return NextResponse.json(
        { success: false, error: "Administrator access is required." },
        { status: 403 }
      );
    }

    console.error("BOOKSTORE ADMIN OVERVIEW ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load bookstore overview." },
      { status: 500 }
    );
  }
}
