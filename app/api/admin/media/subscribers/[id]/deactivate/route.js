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

// The counterpart to .../activate — lets an Admin cancel an active (or
// still-pending) media subscription. This is the real, server-side
// enforcement point: every media route re-checks `status: "ACTIVE"` and
// `expiresAt` before granting access, so setting status to CANCELLED here
// immediately and permanently revokes that access everywhere it's checked.
export async function POST(request, { params }) {
  try {
    await requireAdmin();

    const { id } = await params;

    const subscription = await prisma.userMediaSubscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: "Subscription not found." },
        { status: 404 }
      );
    }

    if (subscription.status === "CANCELLED") {
      return NextResponse.json({
        success: true,
        message: "Subscription is already cancelled.",
        subscription: { id: subscription.id, status: subscription.status },
      });
    }

    const updated = await prisma.userMediaSubscription.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription cancelled.",
      subscription: { id: updated.id, status: updated.status },
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

    console.error("ADMIN MEDIA SUBSCRIPTION DEACTIVATE ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to cancel subscription." },
      { status: 500 }
    );
  }
}
