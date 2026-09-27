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

function serializePlan(plan) {
  return { ...plan, priceUSD: Number(plan.priceUSD) };
}

export async function GET() {
  try {
    await requireAdmin();

    const plans = await prisma.mediaSubscriptionPlan.findMany({
      orderBy: { priceUSD: "asc" },
    });

    return NextResponse.json({ success: true, plans: plans.map(serializePlan) });
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

    console.error("ADMIN MEDIA PLANS GET ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to load subscription plans." },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await requireAdmin();

    const body = await req.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const descriptionEn = typeof body.descriptionEn === "string" ? body.descriptionEn.trim() : "";
    const priceUSD = Number(body.priceUSD);
    const durationDays = Number.isFinite(Number(body.durationDays)) ? Math.trunc(Number(body.durationDays)) : 30;
    const isActive = body.isActive === undefined ? true : Boolean(body.isActive);

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Plan name is required." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(priceUSD) || priceUSD < 0) {
      return NextResponse.json(
        { success: false, error: "Invalid plan price." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(durationDays) || durationDays < 1) {
      return NextResponse.json(
        { success: false, error: "Invalid plan duration." },
        { status: 400 }
      );
    }

    const plan = await prisma.mediaSubscriptionPlan.create({
      data: {
        name,
        descriptionEn: descriptionEn || null,
        priceUSD,
        durationDays,
        isActive,
      },
    });

    return NextResponse.json(
      { success: true, message: "Subscription plan created successfully.", plan: serializePlan(plan) },
      { status: 201 }
    );
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

    console.error("ADMIN MEDIA PLANS POST ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to create the subscription plan." },
      { status: 500 }
    );
  }
}
