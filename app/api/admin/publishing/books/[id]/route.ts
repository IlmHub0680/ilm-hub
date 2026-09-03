import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const STATUSES = [
  "DRAFT",
  "PENDING_REVIEW",
  "APPROVED",
  "REJECTED",
  "PUBLISHED",
] as const;

type BookStatus = (typeof STATUSES)[number];

async function requireAdmin() {
  const user = await requireUser();

  if (
    user.role !== "ADMIN" &&
    user.role !== "SUPER_ADMIN"
  ) {
    throw new Error("FORBIDDEN");
  }

  return user;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const id = params.id?.trim();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Book ID is required." },
        { status: 400 }
      );
    }

    const book = await prisma.book.findUnique({
      where: { id },
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

    if (!book) {
      return NextResponse.json(
        { success: false, error: "Book not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...book,
        priceUSD: Number(book.priceUSD),
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        { success: false, error: "Administrator access is required." },
        { status: 403 }
      );
    }

    console.error("Admin get book error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to load book." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();

    const id = params.id?.trim();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Book ID is required." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const existing = await prisma.book.findUnique({
      where: { id },
      select: {
        id: true,
        titleEn: true,
        status: true,
        authorId: true,
        sellerId: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Book not found." },
        { status: 404 }
      );
    }

    const data: Record<string, unknown> = {};

    if (typeof body.titleEn === "string") {
      const value = body.titleEn.trim();

      if (!value) {
        return NextResponse.json(
          { success: false, error: "English title cannot be empty." },
          { status: 400 }
        );
      }

      data.titleEn = value;
    }

    if (typeof body.titleAr === "string") {
      const value = body.titleAr.trim();

      if (!value) {
        return NextResponse.json(
          { success: false, error: "Arabic title cannot be empty." },
          { status: 400 }
        );
      }

      data.titleAr = value;
    }

    if (typeof body.slug === "string") {
      const value = body.slug.trim();

      if (!value) {
        return NextResponse.json(
          { success: false, error: "Slug cannot be empty." },
          { status: 400 }
        );
      }

      data.slug = value;
    }

    if (typeof body.descriptionEn === "string") {
      data.descriptionEn = body.descriptionEn.trim();
    }

    if (typeof body.descriptionAr === "string") {
      data.descriptionAr = body.descriptionAr.trim();
    }

    if (body.priceUSD !== undefined) {
      const price = Number(body.priceUSD);

      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json(
          { success: false, error: "Invalid price." },
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

    if (typeof body.categoryId === "string") {
      const categoryId = body.categoryId.trim();

      if (!categoryId) {
        return NextResponse.json(
          { success: false, error: "Category is required." },
          { status: 400 }
        );
      }

      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { id: true },
      });

      if (!category) {
        return NextResponse.json(
          { success: false, error: "Category not found." },
          { status: 404 }
        );
      }

      data.categoryId = categoryId;
    }

    if (typeof body.authorId === "string") {
      data.authorId = body.authorId.trim() || null;
    }

    if (typeof body.sellerId === "string") {
      data.sellerId = body.sellerId.trim() || null;
    }

    if (typeof body.isFeatured === "boolean") {
      data.isFeatured = body.isFeatured;
    }

    if (typeof body.isNewRelease === "boolean") {
      data.isNewRelease = body.isNewRelease;
    }

    if (typeof body.status === "string") {
      const requestedStatus =
        body.status.trim().toUpperCase();

      if (
        !STATUSES.includes(
          requestedStatus as BookStatus
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid book status.",
            allowedStatuses: STATUSES,
          },
          { status: 400 }
        );
      }

      const nextStatus =
        requestedStatus as BookStatus;

      /*
       * Publishing is an explicit administrator action.
       */
      if (
        nextStatus === "PUBLISHED" &&
        existing.status !== "PUBLISHED"
      ) {
        data.status = "PUBLISHED";
      } else {
        data.status = nextStatus;
      }
    }

    const book = await prisma.book.update({
      where: { id },
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
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (
      typeof body.status === "string" &&
      body.status.trim().toUpperCase() === "APPROVED" &&
      existing.status === "PENDING_REVIEW"
    ) {
      const notificationUserId =
        existing.authorId ||
        existing.sellerId;

      if (notificationUserId) {
        await prisma.notification.create({
          data: {
            userId: notificationUserId,
            title: "Book approved",
            message: `Your book "${existing.titleEn}" has been approved. It is now ready for publication.`,
          },
        });
      }
    }

    if (
      typeof body.status === "string" &&
      body.status.trim().toUpperCase() === "REJECTED" &&
      existing.status === "PENDING_REVIEW"
    ) {
      const notificationUserId =
        existing.authorId ||
        existing.sellerId;

      if (notificationUserId) {
        await prisma.notification.create({
          data: {
            userId: notificationUserId,
            title: "Book rejected",
            message: `Your book "${existing.titleEn}" was not approved for publication.`,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Book updated successfully.",
      data: {
        ...book,
        priceUSD: Number(book.priceUSD),
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        { success: false, error: "Administrator access is required." },
        { status: 403 }
      );
    }

    console.error("Admin update book error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to update book.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const id = params.id?.trim();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Book ID is required." },
        { status: 400 }
      );
    }

    const existing = await prisma.book.findUnique({
      where: { id },
      select: {
        id: true,
        titleEn: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Book not found." },
        { status: 404 }
      );
    }

    await prisma.book.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `"${existing.titleEn}" was deleted successfully.`,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        { success: false, error: "Administrator access is required." },
        { status: 403 }
      );
    }

    console.error("Admin delete book error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to delete book. It may already be referenced by an order.",
      },
      { status: 409 }
    );
  }
}
