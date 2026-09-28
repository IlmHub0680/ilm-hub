import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const plans = await prisma.mediaSubscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { priceUSD: "asc" },
      select: {
        id: true,
        name: true,
        descriptionEn: true,
        priceUSD: true,
        durationDays: true,
      },
    });

    return NextResponse.json({
      success: true,
      plans: plans.map((p) => ({ ...p, priceUSD: Number(p.priceUSD) })),
    });
  } catch (error) {
    console.error("MEDIA LIBRARY PLANS (public) ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load subscription plans." },
      { status: 500 }
    );
  }
}
