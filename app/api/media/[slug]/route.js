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

export async function GET(request, { params }) {
  try {
    const slug = params?.slug?.trim();

    if (!slug) {
      return NextResponse.json({ success: false, error: "Media item is required." }, { status: 400 });
    }

    const item = await prisma.mediaItem.findUnique({
      where: { slug },
    });

    if (!item || !item.isPublished) {
      return NextResponse.json({ success: false, error: "Media item not found." }, { status: 404 });
    }

    const user = await getCurrentUser();
    const subscribed = await hasActiveSubscription(user?.id);
    const unlocked = item.isFreePreview || !item.requiresSubscription || subscribed;

    const base = {
      id: item.id,
      titleEn: item.titleEn,
      titleAr: item.titleAr,
      slug: item.slug,
      descriptionEn: item.descriptionEn,
      descriptionAr: item.descriptionAr,
      category: item.category,
      mediaType: item.mediaType,
      thumbnailUrl: item.thumbnailUrl,
      speaker: item.speaker,
      durationSec: item.durationSec,
      isFreePreview: item.isFreePreview,
      requiresSubscription: item.requiresSubscription,
      priceUSD: item.priceUSD === null ? null : Number(item.priceUSD),
      locked: !unlocked,
    };

    if (unlocked) {
      // Security audit fix -- the raw stored mediaUrl is never sent to
      // the client anymore (it could be copied and shared/hotlinked
      // indefinitely, bypassing this subscription check entirely).
      // Instead the client is pointed at /api/media/stream/[slug],
      // which re-verifies this same access rule on every single
      // request for the media bytes and never exposes the real
      // storage location -- see that route's own comment for the full
      // explanation.
      base.mediaUrl = `/api/media/stream/${item.slug}`;
    }

    return NextResponse.json({ success: true, item: base, subscribed });
  } catch (error) {
    console.error("MEDIA LIBRARY ITEM ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load this media item." },
      { status: 500 }
    );
  }
}
