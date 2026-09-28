import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function hasActiveSubscription(userId) {
  if (!userId) return false;
  const active = await prisma.userMediaSubscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      expiresAt: { gt: new Date() },
    },
    select: { id: true },
  });
  return Boolean(active);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = (searchParams.get("search") || searchParams.get("q") || "").trim();

    const user = await getCurrentUser();
    const subscribed = await hasActiveSubscription(user?.id);

    const searchClause = search
      ? {
          OR: [
            { titleEn: { contains: search, mode: "insensitive" } },
            { titleAr: { contains: search, mode: "insensitive" } },
            { descriptionEn: { contains: search, mode: "insensitive" } },
            { descriptionAr: { contains: search, mode: "insensitive" } },
            { speaker: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const items = await prisma.mediaItem.findMany({
      where: {
        isPublished: true,
        ...(category ? { category } : {}),
        ...searchClause,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        titleEn: true,
        titleAr: true,
        slug: true,
        descriptionEn: true,
        descriptionAr: true,
        category: true,
        mediaType: true,
        thumbnailUrl: true,
        speaker: true,
        durationSec: true,
        isFreePreview: true,
        requiresSubscription: true,
        priceUSD: true,
        createdAt: true,
        // mediaUrl is intentionally excluded here — only sent once access is confirmed.
      },
    });

    const data = items.map((item) => {
      const unlocked = item.isFreePreview || !item.requiresSubscription || subscribed;
      return {
        ...item,
        priceUSD: item.priceUSD === null ? null : Number(item.priceUSD),
        locked: !unlocked,
      };
    });

    return NextResponse.json({ success: true, items: data, subscribed });
  } catch (error) {
    console.error("MEDIA LIBRARY LIST ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load the media." },
      { status: 500 }
    );
  }
}
