import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ALLOWED_STATUSES = [
  "APPROVED",
  "REJECTED",
] as const;

type BookReviewStatus = (typeof ALLOWED_STATUSES)[number];

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser();

    if (
      user.role !== "ADMIN" &&
      user.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Administrator access is required.",
        },
        { status: 403 }
      );
    }

    const bookId = params.id?.trim();

    if (!bookId) {
      return NextResponse.json(
        {
          success: false,
          error: "Book ID is required.",
        },
        { status: 400 }
      );
    }

    const body = await req.json();

    const status =
      typeof body.status === "string"
        ? body.status.trim().toUpperCase()
        : "";

    if (
      !ALLOWED_STATUSES.includes(
        status as BookReviewStatus
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid book status.",
          allowedStatuses: ALLOWED_STATUSES,
        },
        { status: 400 }
      );
    }

    const existingBook = await prisma.book.findUnique({
      where: {
        id: bookId,
      },
      select: {
        id: true,
        titleEn: true,
        status: true,
        authorId: true,
        sellerId: true,
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

    /*
     * Only books awaiting review should be approved or rejected
     * through this review endpoint.
     */
    if (existingBook.status !== "PENDING_REVIEW") {
      return NextResponse.json(
        {
          success: false,
          error: `This book is already ${existingBook.status.toLowerCase().replace("_", " ")}.`,
        },
        { status: 409 }
      );
    }

    const updatedBook = await prisma.book.update({
      where: {
        id: bookId,
      },

      data: {
        status: status as BookReviewStatus,
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
        isFeatured: true,
        isNewRelease: true,
        status: true,
        createdAt: true,
        updatedAt: true,

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

    /*
     * Notify the author when their book has been reviewed.
     */
    if (existingBook.authorId) {
      await prisma.notification.create({
        data: {
          userId: existingBook.authorId,
          title:
            status === "APPROVED"
              ? "Book approved"
              : "Book submission rejected",

          message:
            status === "APPROVED"
              ? `Your book "${existingBook.titleEn}" has been approved and is now available in the bookstore.`
              : `Your book "${existingBook.titleEn}" was not approved for publication at this time.`,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,

        message:
          status === "APPROVED"
            ? "Book approved successfully."
            : "Book rejected successfully.",

        data: updatedBook,
      },
      { status: 200 }
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

    console.error(
      "Admin book review error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to update book status.",
      },
      { status: 500 }
    );
  }
}
