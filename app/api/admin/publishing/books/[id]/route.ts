import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ALLOWED_STATUSES = [
  "APPROVED",
  "REJECTED",
] as const;

type BookReviewStatus = (typeof ALLOWED_STATUSES)[number];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    /*
     * Only administrators can approve or reject books.
     */
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

    const body = await request.json();

    const requestedStatus =
      typeof body.status === "string"
        ? body.status.trim().toUpperCase()
        : "";

    if (
      !ALLOWED_STATUSES.includes(
        requestedStatus as BookReviewStatus
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid book status. Use APPROVED or REJECTED.",
          allowedStatuses: ALLOWED_STATUSES,
        },
        { status: 400 }
      );
    }

    const status =
      requestedStatus as BookReviewStatus;

    /*
     * Find the book before changing its status.
     */
    const existingBook = await prisma.book.findUnique({
      where: {
        id: bookId,
      },

      select: {
        id: true,
        titleEn: true,
        titleAr: true,
        status: true,
        authorId: true,
        sellerId: true,

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
     * Prevent unnecessary duplicate approval/rejection.
     */
    if (existingBook.status === status) {
      return NextResponse.json(
        {
          success: false,
          error: `This book is already ${status.toLowerCase()}.`,
        },
        { status: 409 }
      );
    }

    /*
     * Only books waiting for review should normally be
     * approved or rejected.
     *
     * This prevents an already approved book from being
     * accidentally changed back to rejected.
     */
    if (existingBook.status !== "PENDING_REVIEW") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only books with PENDING_REVIEW status can be approved or rejected.",
          currentStatus: existingBook.status,
        },
        { status: 409 }
      );
    }

    /*
     * Update the book status.
     */
    const updatedBook = await prisma.book.update({
      where: {
        id: bookId,
      },

      data: {
        status,
      },

      select: {
        id: true,
        titleEn: true,
        titleAr: true,
        slug: true,
        priceUSD: true,
        coverImageUrl: true,
        isFeatured: true,
        isNewRelease: true,
        status: true,
        createdAt: true,
        updatedAt: true,

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

        category: {
          select: {
            id: true,
            nameEn: true,
            nameAr: true,
            slug: true,
          },
        },
      },
    });

    /*
     * Notify the author when an author is attached to the book.
     */
    const notificationUserId =
      existingBook.authorId ||
      existingBook.sellerId;

    if (notificationUserId) {
      const notificationTitle =
        status === "APPROVED"
          ? "Book approved"
          : "Book rejected";

      const notificationMessage =
        status === "APPROVED"
          ? `Your book "${existingBook.titleEn}" has been approved and can now appear in the marketplace.`
          : `Your book "${existingBook.titleEn}" was not approved for publication.`;

      await prisma.notification.create({
        data: {
          userId: notificationUserId,
          title: notificationTitle,
          message: notificationMessage,
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

        data: {
          ...updatedBook,
          priceUSD: Number(updatedBook.priceUSD),
        },
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
        error:
          "Unable to update the book publishing status.",
      },
      { status: 500 }
    );
  }
}
