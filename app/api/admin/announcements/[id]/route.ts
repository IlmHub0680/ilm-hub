import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.announcement.findUnique({ where: { id } });

    if (!existing || existing.scope !== "INSTITUTION") {
      return errorResponse("Announcement not found", 404);
    }

    const data: Record<string, unknown> = {};

    if (typeof body.isActive === "boolean") {
      data.isActive = body.isActive;
    }

    if (typeof body.titleEn === "string" && body.titleEn.trim()) {
      data.titleEn = body.titleEn.trim();
    }

    if (typeof body.bodyEn === "string" && body.bodyEn.trim()) {
      data.bodyEn = body.bodyEn.trim();
    }

    if (typeof body.titleAr === "string" && body.titleAr.trim()) {
      data.titleAr = body.titleAr.trim();
    }

    if (typeof body.bodyAr === "string" && body.bodyAr.trim()) {
      data.bodyAr = body.bodyAr.trim();
    }

    if ("expiresAt" in body) {
      const expiresAt =
        typeof body.expiresAt === "string" && body.expiresAt
          ? new Date(body.expiresAt)
          : null;

      if (expiresAt && Number.isNaN(expiresAt.getTime())) {
        return errorResponse("Invalid expiry date", 400);
      }

      data.expiresAt = expiresAt;
    }

    if (Object.keys(data).length === 0) {
      return errorResponse("No changes supplied", 400);
    }

    const updated = await prisma.announcement.update({ where: { id }, data });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Administrator access is required.", 403);

    console.error("Admin announcement PATCH error:", error);
    return errorResponse("Failed to update announcement", 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const existing = await prisma.announcement.findUnique({ where: { id } });

    if (!existing || existing.scope !== "INSTITUTION") {
      return errorResponse("Announcement not found", 404);
    }

    await prisma.announcement.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Administrator access is required.", 403);

    console.error("Admin announcement DELETE error:", error);
    return errorResponse("Failed to delete announcement", 500);
  }
}
