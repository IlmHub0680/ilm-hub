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

export async function POST(request, { params }) {
  try {
    await requireAdmin();

    const { id } = await params;

    const subscription = await prisma.userMediaSubscription.findUnique({
      where: { id },
      include: { plan: true },
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: "Subscription not found." },
        { status: 404 }
      );
    }

    if (subscription.paidAmount === null) {
      return NextResponse.json(
        {
          success: false,
          error: "This subscription has not been paid for yet and cannot be activated.",
        },
        { status: 400 }
      );
    }

    if (subscription.status === "ACTIVE") {
      return NextResponse.json({
        success: true,
        message: "Subscription is already active.",
        subscription: { id: subscription.id, expiresAt: subscription.expiresAt },
      });
    }

    const startedAt = new Date();
    const expiresAt = new Date(
      startedAt.getTime() + subscription.plan.durationDays * 24 * 60 * 60 * 1000
    );

    const updated = await prisma.userMediaSubscription.update({
      where: { id },
      data: { status: "ACTIVE", startedAt, expiresAt },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription activated.",
      subscription: { id: updated.id, expiresAt: updated.expiresAt },
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

    console.error("ADMIN MEDIA SUBSCRIPTION ACTIVATE ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to activate subscription." },
      { status: 500 }
    );
  }
}
