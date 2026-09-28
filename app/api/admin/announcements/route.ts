import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET() {
  try {
    await requireAdmin();

    const announcements = await prisma.announcement.findMany({
      where: { scope: "INSTITUTION" },
      include: { createdBy: { select: { name: true } } },
      orderBy: { publishedAt: "desc" },
    });

    return NextResponse.json({ success: true, data: announcements });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Administrator access is required.", 403);

    console.error("Admin announcements GET error:", error);
    return errorResponse("Failed to load announcements", 500);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();

    const body = await request.json();

    const titleEn = typeof body.titleEn === "string" ? body.titleEn.trim() : "";
    const bodyEn = typeof body.bodyEn === "string" ? body.bodyEn.trim() : "";
    const titleAr = typeof body.titleAr === "string" && body.titleAr.trim() ? body.titleAr.trim() : titleEn;
    const bodyAr = typeof body.bodyAr === "string" && body.bodyAr.trim() ? body.bodyAr.trim() : bodyEn;

    const expiresAt =
      typeof body.expiresAt === "string" && body.expiresAt
        ? new Date(body.expiresAt)
        : null;

    if (!titleEn || !bodyEn) {
      return errorResponse("Title and body are required", 400);
    }

    if (expiresAt && Number.isNaN(expiresAt.getTime())) {
      return errorResponse("Invalid expiry date", 400);
    }

    const announcement = await prisma.announcement.create({
      data: {
        titleEn,
        titleAr,
        bodyEn,
        bodyAr,
        scope: "INSTITUTION",
        expiresAt,
        createdById: admin.id,
      },
    });

    return NextResponse.json({ success: true, data: announcement }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Administrator access is required.", 403);

    console.error("Admin announcements POST error:", error);
    return errorResponse("Failed to publish announcement", 500);
  }
}
