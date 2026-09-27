import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_CATEGORIES = [
  "SCHOLARLY_TALKS",
  "VIDEO_LESSONS",
  "AUDIO_RECORDINGS",
  "KHUTBAH",
  "POEMS",
  "MUTOON",
  "LECTURES",
];

const VALID_MEDIA_TYPES = ["VIDEO", "AUDIO"];

async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    throw new Error("FORBIDDEN");
  }

  return user;
}

function serializeItem(item) {
  return {
    ...item,
    priceUSD: item.priceUSD === null || item.priceUSD === undefined ? null : Number(item.priceUSD),
  };
}

export async function PATCH(request, { params }) {
  try {
    await requireAdmin();

    const itemId = params?.id?.trim();

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "Media item ID is required." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data = {};

    if (typeof body.titleEn === "string") data.titleEn = body.titleEn.trim();
    if (typeof body.titleAr === "string") data.titleAr = body.titleAr.trim();
    if (typeof body.descriptionEn === "string") data.descriptionEn = body.descriptionEn.trim();
    if (typeof body.descriptionAr === "string") data.descriptionAr = body.descriptionAr.trim();
    if (typeof body.slug === "string") data.slug = body.slug.trim();
    if (typeof body.mediaUrl === "string") data.mediaUrl = body.mediaUrl.trim();
    if (typeof body.thumbnailUrl === "string") data.thumbnailUrl = body.thumbnailUrl.trim() || null;
    if (typeof body.speaker === "string") data.speaker = body.speaker.trim() || null;

    if (typeof body.category === "string") {
      if (!VALID_CATEGORIES.includes(body.category)) {
        return NextResponse.json(
          { success: false, error: "Invalid media category." },
          { status: 400 }
        );
      }
      data.category = body.category;
    }

    if (typeof body.mediaType === "string") {
      if (!VALID_MEDIA_TYPES.includes(body.mediaType)) {
        return NextResponse.json(
          { success: false, error: "Invalid media type." },
          { status: 400 }
        );
      }
      data.mediaType = body.mediaType;
    }

    if (body.durationSec !== undefined) {
      const duration = Number(body.durationSec);
      if (!Number.isFinite(duration) || duration < 0) {
        return NextResponse.json(
          { success: false, error: "Invalid duration." },
          { status: 400 }
        );
      }
      data.durationSec = Math.trunc(duration);
    }

    if (body.isPublished !== undefined) data.isPublished = Boolean(body.isPublished);
    if (body.isFreePreview !== undefined) data.isFreePreview = Boolean(body.isFreePreview);
    if (body.requiresSubscription !== undefined) data.requiresSubscription = Boolean(body.requiresSubscription);

    if (body.priceUSD !== undefined) {
      if (body.priceUSD === null || body.priceUSD === "") {
        data.priceUSD = null;
      } else {
        const price = Number(body.priceUSD);
        if (!Number.isFinite(price) || price < 0) {
          return NextResponse.json(
            { success: false, error: "Invalid price." },
            { status: 400 }
          );
        }
        data.priceUSD = price;
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, error: "No changes supplied." },
        { status: 400 }
      );
    }

    const existing = await prisma.mediaItem.findUnique({ where: { id: itemId } });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Media item not found." },
        { status: 404 }
      );
    }

    const updated = await prisma.mediaItem.update({
      where: { id: itemId },
      data,
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Media item updated successfully.",
      item: serializeItem(updated),
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

    console.error("ADMIN MEDIA LIBRARY PATCH ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to update media item." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();

    const itemId = params?.id?.trim();

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "Media item ID is required." },
        { status: 400 }
      );
    }

    const existing = await prisma.mediaItem.findUnique({ where: { id: itemId } });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Media item not found." },
        { status: 404 }
      );
    }

    await prisma.mediaItem.delete({ where: { id: itemId } });

    return NextResponse.json({
      success: true,
      message: "Media item deleted successfully.",
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

    console.error("ADMIN MEDIA LIBRARY DELETE ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to delete media item." },
      { status: 500 }
    );
  }
}
