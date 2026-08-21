import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function isValidUrl(value: string) {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateUniqueSlug(title: string) {
  const baseSlug = createSlug(title);

  if (!baseSlug) {
    throw new Error("INVALID_TITLE");
  }

  let slug = baseSlug;
  let counter = 2;

  while (
    await prisma.book.findUnique({
      where: { slug },
      select: { id: true },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();

    if (
      user.role !== "ADMIN" &&
      user.role !== "SUPER_ADMIN" &&
      user.role !== "AUTHOR"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "You are not authorized to upload books.",
        },
        { status: 403 }
      );
    }

    if (
      user.role === "AUTHOR" &&
      user.authorStatus !== "APPROVED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Your author account must be approved before you can upload books.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    const titleEn =
      typeof body.titleEn === "string"
        ? body.titleEn.trim()
        : "";

    const titleAr =
      typeof body.titleAr === "string"
        ? body.titleAr.trim()
        : "";

    const descriptionEn =
      typeof body.descriptionEn === "string"
        ? body.descriptionEn.trim()
        : "";

    const descriptionAr =
      typeof body.descriptionAr === "string"
        ? body.descriptionAr.trim()
        : "";

    const categoryId =
      typeof body.categoryId === "string"
        ? body.categoryId.trim()
        : "";

    const coverImageUrl =
      typeof body.coverImageUrl === "string"
        ? body.coverImageUrl.trim()
        : "";

    const r2FileKey =
      typeof body.r2FileKey === "string"
        ? body.r2FileKey.trim()
        : "";

    const priceUSD = Number(body.priceUSD);

    if (
      !titleEn ||
      !titleAr ||
      !descriptionEn ||
      !descriptionAr ||
      !categoryId ||
      !coverImageUrl ||
      !r2FileKey
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "English title, Arabic title, English description, Arabic description, category, cover image URL and book file key are required.",
        },
        { status: 400 }
      );
    }

    if (titleEn.length < 2 || titleAr.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "Book titles must contain at least 2 characters.",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(priceUSD) || priceUSD < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Book price must be a valid amount of 0 or greater.",
        },
        { status: 400 }
      );
    }

    if (priceUSD > 1000000) {
      return NextResponse.json(
        {
          success: false,
          error: "Book price exceeds the allowed maximum.",
        },
        { status: 400 }
      );
    }

    if (!isValidUrl(coverImageUrl)) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid cover image URL is required.",
        },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
      },
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

    let authorId: string | null = null;

    /*
     * Authors can only upload books under their own author account.
     * They cannot submit a book under another author's identity.
     */
    if (user.role === "AUTHOR") {
      authorId = user.id;
    }

    /*
     * Administrators may optionally specify the actual author.
     * This allows an administrator to publish a book on behalf
     * of a registered author.
     */
    if (
      user.role === "ADMIN" ||
      user.role === "SUPER_ADMIN"
    ) {
      const requestedAuthorId =
        typeof body.authorId === "string"
          ? body.authorId.trim()
          : "";

      if (requestedAuthorId) {
        const author = await prisma.user.findUnique({
          where: {
            id: requestedAuthorId,
          },
          select: {
            id: true,
            role: true,
            authorStatus: true,
          },
        });

        if (!author || author.role !== "AUTHOR") {
          return NextResponse.json(
            {
              success: false,
              error: "Selected author was not found.",
            },
            { status: 404 }
          );
        }

        if (author.authorStatus !== "APPROVED") {
          return NextResponse.json(
            {
              success: false,
              error: "The selected author has not been approved.",
            },
            { status: 400 }
          );
        }

        authorId = author.id;
      }
    }

    const slug = await generateUniqueSlug(titleEn);

    /*
     * Administrator uploads are trusted and can be published
     * immediately.
     *
     * Author uploads must be reviewed by an administrator first.
     */
    const status =
      user.role === "ADMIN" ||
      user.role === "SUPER_ADMIN"
        ? "APPROVED"
        : "PENDING_REVIEW";

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
        authorId,
        sellerId: user.id,
        status,
      },
      select: {
        id: true,
        titleEn: true,
        titleAr: true,
        slug: true,
        descriptionEn: true,
        descriptionAr: true,
        priceUSD: true,
        coverImageUrl: true,
        r2FileKey: true,
        categoryId: true,
        authorId: true,
        sellerId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            nameEn: true,
            nameAr: true,
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
            role: true,
          },
        },
      },
    });

    /*
     * Notify the author when their submission requires review.
     */
    if (user.role === "AUTHOR") {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Book submitted for review",
          message: `Your book "${book.titleEn}" has been submitted and is awaiting administrator review.`,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message:
          status === "APPROVED"
            ? "Book published successfully."
            : "Book submitted successfully and is awaiting administrator review.",
        data: {
          book,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json(
          {
            success: false,
            error: "Authentication required.",
          },
          { status: 401 }
        );
      }

      if (error.message === "INVALID_TITLE") {
        return NextResponse.json(
          {
            success: false,
            error: "A valid book title is required.",
          },
          { status: 400 }
        );
      }
    }

    console.error("Book upload error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to create the book.",
      },
      { status: 500 }
    );
  }
}
