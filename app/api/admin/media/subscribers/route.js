import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    throw new Error("FORBIDDEN");
  }

  return user;
}

export async function GET() {
  try {
    await requireAdmin();

    const subscriptions = await prisma.userMediaSubscription.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        plan: { select: { id: true, name: true, priceUSD: true, durationDays: true } },
      },
      take: 300,
    });

    const now = new Date();

    const data = subscriptions.map((s) => {
      const paidAmount = s.paidAmount === null ? null : Number(s.paidAmount);

      // Media subscriptions are not auto-activated on payment: an admin
      // must release access from this view (see the /activate route).
      // A PENDING row with a recorded payment is "paid, awaiting approval"
      // rather than "never paid" — surface that distinction explicitly.
      const awaitingApproval = s.status === "PENDING" && paidAmount !== null;

      return {
        id: s.id,
        status:
          s.status === "ACTIVE" && s.expiresAt < now ? "EXPIRED" : s.status,
        awaitingApproval,
        startedAt: s.startedAt,
        expiresAt: s.expiresAt,
        paidAmount,
        paymentGateway: s.paymentGateway,
        paymentRef: s.paymentRef,
        user: s.user,
        plan: { ...s.plan, priceUSD: Number(s.plan.priceUSD) },
      };
    });

    const revenue = data
      .filter((s) => s.paidAmount !== null)
      .reduce((sum, s) => sum + s.paidAmount, 0);

    const activeCount = data.filter((s) => s.status === "ACTIVE").length;
    const awaitingApprovalCount = data.filter((s) => s.awaitingApproval).length;

    return NextResponse.json({
      success: true,
      subscriptions: data,
      summary: {
        total: data.length,
        active: activeCount,
        awaitingApproval: awaitingApprovalCount,
        revenueUSD: revenue,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { success: false, error: "Administrator access is required." },
        { status: 403 }
      );
    }

    console.error("ADMIN MEDIA SUBSCRIBERS GET ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to load subscribers." },
      { status: 500 }
    );
  }
}
