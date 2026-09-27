import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Public, unauthenticated endpoint — the homepage's institution-wide
// announcements/notices strip. Only ever returns INSTITUTION-scope,
// active, non-expired announcements. No user data of any kind.
export async function GET() {
  try {
    const now = new Date();

    const announcements = await prisma.announcement.findMany({
      where: {
        scope: "INSTITUTION",
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      select: {
        id: true,
        titleEn: true,
        titleAr: true,
        bodyEn: true,
        bodyAr: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: "desc" },
      take: 6,
    });

    return NextResponse.json({ success: true, data: announcements });
  } catch (error) {
    console.error("Public announcements GET error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load announcements." },
      { status: 500 }
    );
  }
}
