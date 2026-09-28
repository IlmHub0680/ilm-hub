import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function PATCH(request, { params }) {
  try {
    await requireAdmin();

    const id = String(params?.id || "").trim();
    const existing = await prisma.sponsor.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Sponsor not found", 404);
    }

    const body = await request.json();
    const data = {};

    if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
    if ("description" in body) data.description = typeof body.description === "string" && body.description.trim() ? body.description.trim() : null;
    if ("logoUrl" in body) data.logoUrl = typeof body.logoUrl === "string" && body.logoUrl.trim() ? body.logoUrl.trim() : null;
    if ("websiteUrl" in body) data.websiteUrl = typeof body.websiteUrl === "string" && body.websiteUrl.trim() ? body.websiteUrl.trim() : null;

    if ("amountUSD" in body) {
      if (body.amountUSD === null || body.amountUSD === "") {
        data.amountUSD = null;
      } else {
        const parsed = Number(body.amountUSD);
        if (Number.isNaN(parsed) || parsed < 0) {
          return errorResponse("Amount must be a valid non-negative number", 400);
        }
        data.amountUSD = parsed;
      }
    }

    if ("startDate" in body) {
      const startDate = typeof body.startDate === "string" && body.startDate ? new Date(body.startDate) : null;
      if (startDate && Number.isNaN(startDate.getTime())) return errorResponse("Invalid start date", 400);
      data.startDate = startDate;
    }

    if ("endDate" in body) {
      const endDate = typeof body.endDate === "string" && body.endDate ? new Date(body.endDate) : null;
      if (endDate && Number.isNaN(endDate.getTime())) return errorResponse("Invalid end date", 400);
      data.endDate = endDate;
    }

    if (typeof body.isPublic === "boolean") data.isPublic = body.isPublic;

    if (typeof body.status === "string") {
      if (body.status !== "ACTIVE" && body.status !== "INACTIVE") {
        return errorResponse("Status must be ACTIVE or INACTIVE", 400);
      }
      data.status = body.status;
    }

    if (Object.keys(data).length === 0) {
      return errorResponse("No changes supplied", 400);
    }

    const updated = await prisma.sponsor.update({ where: { id }, data });

    return NextResponse.json({
      success: true,
      sponsor: { ...updated, amountUSD: updated.amountUSD === null ? null : Number(updated.amountUSD) },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Administrator access is required.", 403);

    console.error("Admin sponsor PATCH error:", error);
    return errorResponse("Failed to update sponsor", 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();

    const id = String(params?.id || "").trim();
    const existing = await prisma.sponsor.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Sponsor not found", 404);
    }

    await prisma.sponsor.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Administrator access is required.", 403);

    console.error("Admin sponsor DELETE error:", error);
    return errorResponse("Failed to delete sponsor", 500);
  }
}
