import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireUser();

    const subscription = await prisma.userMediaSubscription.findFirst({
      where: { userId: user.id, status: "ACTIVE", expiresAt: { gt: new Date() } },
      orderBy: { expiresAt: "desc" },
      include: { plan: { select: { name: true } } },
    });

    return NextResponse.json({
      success: true,
      subscription: subscription
        ? {
            id: subscription.id,
            planName: subscription.plan.name,
            expiresAt: subscription.expiresAt,
            startedAt: subscription.startedAt,
          }
        : null,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }

    console.error("MY MEDIA SUBSCRIPTION ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load your subscription." },
      { status: 500 }
    );
  }
}
