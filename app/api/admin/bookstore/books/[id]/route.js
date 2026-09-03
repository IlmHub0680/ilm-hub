import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(request, { params }) {
  try {
    const admin = await requireUser();

    if (
      admin.role !== "ADMIN" &&
      admin.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Administrator access is required.",
        },
        { status: 403 }
      );
    }

    const bookId = params?.id?.trim();

    if (!bookId) {
      return NextResponse.json(
        {
          success: false,
          error: "Book ID is required.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const data = {};

    if (typeof body.titleEn === "string") {
      data.titleEn = body.titleEn.trim();
    }

    if (typeof body.titleAr === "string") {
      data.titleAr = body.titleAr.trim();
    }

    if (typeof body.descriptionEn === "string") {
      data.descriptionEn = body.descriptionEn.trim();
    }

    if (typeof body.descriptionAr === "string") {
      data.descriptionAr = body.descriptionAr.trim();
    }

    if (typeof body.slug === "string") {
      data.slug = body.slug.trim();
    }

    if (body.priceUSD !== undefined) {
      const price = Number(body.priceUSD);

      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid price.",
          },
          { status: 400 }
        );
      }

      data.priceUSD = price;
    }

    if (typeof body.coverImageUrl === "string") {
      data.coverImageUrl = body.coverImageUrl.trim();
    }

    if (typeof body.r2FileKey === "string") {
      data.r2FileKey = body.r2FileKey.trim();
    }

    if (body.isFeatured !== undefined) {
      data.isFeatured = Boolean(body.isFeatured);
    }

if (body.isPublished !== undefined) {
  data.isPublished = Boolean(body.isPublished);
}

    if (typeof body.categoryId === "string") {
      data.categoryId = body.categoryId.trim();
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No changes supplied.",
        },
        { status: 400 }
      );
    }

    const existingBook = await prisma.book.findUnique({
      where: {
        id: bookId,
      },
    });

    if (!existingBook) {
      return NextResponse.json(
        {
          success: false,
          error: "Book not found.",
        },
        { status: 404 }
      );
    }

    const updatedBook = await prisma.book.update({
      where: {
        id: bookId,
      },
      data,
      include: {
        category: true,
        author: {
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
      message: "Book updated successfully.",
      book: {
        ...updatedBook,
        priceUSD: Number(updatedBook.priceUSD),
      },
    });
  } catch (error) {
    console.error("ADMIN BOOKSTORE PATCH ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to update book.",
      },
      { status: 500 }
    );
  }
}
