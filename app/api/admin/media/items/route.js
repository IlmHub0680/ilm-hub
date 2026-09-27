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

function createSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateUniqueSlug(title) {
  const baseSlug = createSlug(title);

  if (!baseSlug) {
    throw new Error("INVALID_TITLE");
  }

  let slug = baseSlug;
  let counter = 2;

  while (
    await prisma.mediaItem.findUnique({
      where: { slug },
      select: { id: true },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

function serializeItem(item) {
  return {
    ...item,
    priceUSD: item.priceUSD === null || item.priceUSD === undefined ? null : Number(item.priceUSD),
  };
}

export async function GET() {
  try {
    await requireAdmin();

    const items = await prisma.mediaItem.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      items: items.map(serializeItem),
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

    console.error("ADMIN MEDIA LIBRARY GET ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to load media items." },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const admin = await requireAdmin();

    const body = await req.json();

    const titleEn = typeof body.titleEn === "string" ? body.titleEn.trim() : "";
    const titleAr = typeof body.titleAr === "string" ? body.titleAr.trim() : "";
    const descriptionEn = typeof body.descriptionEn === "string" ? body.descriptionEn.trim() : "";
    const descriptionAr = typeof body.descriptionAr === "string" ? body.descriptionAr.trim() : "";
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const mediaType = typeof body.mediaType === "string" ? body.mediaType.trim() : "VIDEO";
    const mediaUrl = typeof body.mediaUrl === "string" ? body.mediaUrl.trim() : "";
    const thumbnailUrl = typeof body.thumbnailUrl === "string" ? body.thumbnailUrl.trim() : "";
    const speaker = typeof body.speaker === "string" ? body.speaker.trim() : "";
    const durationSec = Number.isFinite(Number(body.durationSec)) ? Math.max(0, Math.trunc(Number(body.durationSec))) : 0;
    const isFreePreview = Boolean(body.isFreePreview);
    const requiresSubscription = body.requiresSubscription === undefined ? true : Boolean(body.requiresSubscription);
    const isPublished = body.isPublished === undefined ? true : Boolean(body.isPublished);

    if (!titleEn || !titleAr || !descriptionEn || !descriptionAr || !category || !mediaUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            "English title, Arabic title, English description, Arabic description, category and media URL are required.",
        },
        { status: 400 }
      );
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { success: false, error: "Invalid media category." },
        { status: 400 }
      );
    }

    if (!VALID_MEDIA_TYPES.includes(mediaType)) {
      return NextResponse.json(
        { success: false, error: "Invalid media type." },
        { status: 400 }
      );
    }

    let priceUSD = null;
    if (body.priceUSD !== undefined && body.priceUSD !== null && body.priceUSD !== "") {
      const price = Number(body.priceUSD);
      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json(
          { success: false, error: "Invalid price." },
          { status: 400 }
        );
      }
      priceUSD = price;
    }

    const slug = await generateUniqueSlug(titleEn);

    const item = await prisma.mediaItem.create({
      data: {
        titleEn,
        titleAr,
        slug,
        descriptionEn,
        descriptionAr,
        category,
        mediaType,
        mediaUrl,
        thumbnailUrl: thumbnailUrl || null,
        speaker: speaker || null,
        durationSec,
        isFreePreview,
        requiresSubscription,
        isPublished,
        priceUSD,
        uploadedById: admin.id,
      },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(
      { success: true, message: "Media item created successfully.", item: serializeItem(item) },
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

    if (error instanceof Error && error.message === "INVALID_TITLE") {
      return NextResponse.json(
        { success: false, error: "A valid title is required." },
        { status: 400 }
      );
    }

    console.error("ADMIN MEDIA LIBRARY POST ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to create the media item." },
      { status: 500 }
    );
  }
}
