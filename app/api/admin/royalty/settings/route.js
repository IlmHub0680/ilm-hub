import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { getOrCreateRoyaltySettings, PLATFORM_DEFAULT_RATE_PCT } from "@/lib/royalty";

export const dynamic = "force-dynamic";

const SETTINGS_ID = "default-royalty-settings";

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

function serialize(settings) {
  return {
    defaultRatePct: Number(settings.defaultRatePct),
    isActive: settings.isActive,
    effectiveDate: settings.effectiveDate
      ? settings.effectiveDate.toISOString().slice(0, 10)
      : "",
    description: settings.description || "",
    updatedAt: settings.updatedAt,
  };
}

export async function GET() {
  try {
    await requireAdmin();

    const settings = await getOrCreateRoyaltySettings();

    return NextResponse.json({ success: true, data: serialize(settings) });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Admin access required", 403);

    console.error("Admin royalty settings GET error:", error);
    return errorResponse("Failed to load royalty settings", 500);
  }
}

export async function PUT(request) {
  try {
    await requireAdmin();

    const body = await request.json();

    const defaultRatePct = Number(body.defaultRatePct);

    if (!Number.isFinite(defaultRatePct) || defaultRatePct < 0 || defaultRatePct > 100) {
      return errorResponse("Default royalty rate must be a number between 0 and 100.", 400);
    }

    const values = {
      defaultRatePct,
      isActive: Boolean(body.isActive),
      description: body.description ? String(body.description).slice(0, 500) : null,
    };

    if (body.effectiveDate) {
      const effectiveDate = new Date(body.effectiveDate);

      if (Number.isNaN(effectiveDate.getTime())) {
        return errorResponse("Effective date is invalid.", 400);
      }

      values.effectiveDate = effectiveDate;
    } else {
      values.effectiveDate = new Date();
    }

    const settings = await prisma.royaltySettings.upsert({
      where: { id: SETTINGS_ID },
      update: values,
      create: { id: SETTINGS_ID, defaultRatePct: PLATFORM_DEFAULT_RATE_PCT, ...values },
    });

    return NextResponse.json({ success: true, data: serialize(settings) });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Admin access required", 403);

    console.error("Admin royalty settings PUT error:", error);
    return errorResponse("Failed to save royalty settings", 500);
  }
}
