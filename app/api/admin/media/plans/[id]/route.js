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

export async function PATCH(request, { params }) {
  try {
    await requireAdmin();

    const planId = params?.id?.trim();

    if (!planId) {
      return NextResponse.json(
        { success: false, error: "Plan ID is required." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data = {};

    if (typeof body.name === "string") data.name = body.name.trim();
    if (typeof body.descriptionEn === "string") data.descriptionEn = body.descriptionEn.trim() || null;
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    if (body.priceUSD !== undefined) {
      const price = Number(body.priceUSD);
      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json(
          { success: false, error: "Invalid plan price." },
          { status: 400 }
        );
      }
      data.priceUSD = price;
    }

    if (body.durationDays !== undefined) {
      const duration = Number(body.durationDays);
      if (!Number.isFinite(duration) || duration < 1) {
        return NextResponse.json(
          { success: false, error: "Invalid plan duration." },
          { status: 400 }
        );
      }
      data.durationDays = Math.trunc(duration);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, error: "No changes supplied." },
        { status: 400 }
      );
    }

    const existing = await prisma.mediaSubscriptionPlan.findUnique({ where: { id: planId } });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Subscription plan not found." },
        { status: 404 }
      );
    }

    const updated = await prisma.mediaSubscriptionPlan.update({
      where: { id: planId },
      data,
    });

    return NextResponse.json({
      success: true,
      message: "Subscription plan updated successfully.",
      plan: serializePlan(updated),
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

    console.error("ADMIN MEDIA PLAN PATCH ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to update the subscription plan." },
      { status: 500 }
    );
  }
}
