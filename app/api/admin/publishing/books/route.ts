import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ALLOWED_STATUSES = [
  "DRAFT",
  "PENDING_REVIEW",
  "APPROVED",
  "REJECTED",
  "PUBLISHED",
] as const;

type BookStatus = (typeof ALLOWED_STATUSES)[number];

async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    throw new Error("FORBIDDEN");
  }

  return user;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const requestedStatus = new URL(request.url)
      .searchParams
      .get("status")
      ?.trim()
      .toUpperCase();

    const status = ALLOWED_STATUSES.includes(
      requestedStatus as BookStatus
    )
      ? (requestedStatus as BookStatus)
      : undefined;

    const books = await prisma.book.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: {
            id: true,
            nameEn: true,
            nameAr: true,
            slug: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: books.map((book) => ({
        ...book,
        priceUSD: Number(book.priceUSD),
      })),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Administrator access is required.",
        },
        { status: 403 }
      );
    }

    console.error("Admin books GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load books.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();

    const titleEn = String(body.titleEn || "").trim();
    const titleAr = String(body.titleAr || "").trim();
    const descriptionEn = String(
      body.descriptionEn || ""
    ).trim();
    const descriptionAr = String(
      body.descriptionAr || ""
    ).trim();
    const categoryId = String(
      body.categoryId || ""
    ).trim();
    const coverImageUrl = String(
      body.coverImageUrl || ""
    ).trim();
    const r2FileKey = String(
      body.r2FileKey || ""
    ).trim();

    let slug = String(body.slug || "")
      .trim()
      .toLowerCase();

    if (!titleEn || !titleAr || !categoryId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "English title, Arabic title and category are required.",
        },
        { status: 400 }
      );
    }

    if (!slug) {
      slug = titleEn
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid book slug could not be generated.",
        },
        { status: 400 }
      );
    }

    const existingSlug = await prisma.book.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existingSlug) {
      return NextResponse.json(
        {
          success: false,
          error: "A book with this slug already exists.",
        },
        { status: 409 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: "Selected category was not found.",
        },
        { status: 404 }
      );
    }

    const priceUSD = Number(body.priceUSD || 0);

    if (!Number.isFinite(priceUSD) || priceUSD < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid book price.",
        },
        { status: 400 }
      );
    }

    const requestedStatus = String(
      body.status || "DRAFT"
    )
      .trim()
      .toUpperCase();

    const status = ALLOWED_STATUSES.includes(
      requestedStatus as BookStatus
    )
      ? (requestedStatus as BookStatus)
      : "DRAFT";

    const book = await prisma.book.create({
      data: {
        titleEn,
        titleAr,
        slug,
        descriptionEn,
        descriptionAr,
        priceUSD,
        coverImageUrl,
        r2FileKey,
        categoryId,
        authorId:
          String(body.authorId || "").trim() || null,
        sellerId:
          String(body.sellerId || "").trim() || null,
        isFeatured: Boolean(body.isFeatured),
        isNewRelease:
          body.isNewRelease !== false,
        status,
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...book,
          priceUSD: Number(book.priceUSD),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Administrator access is required.",
        },
        { status: 403 }
      );
    }

    console.error("Admin books POST error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to create book.",
      },
      { status: 500 }
    );
  }
}
