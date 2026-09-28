import { NextResponse } from "next/server";
import { requireApprovedAuthor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PAID_ORDER_STATUSES = ["ACTIVATED", "COMPLETED"];

const STATUS_LABELS = {
  PENDING_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PUBLISHED: "Published",
  DRAFT: "Draft",
};

export async function GET() {
  try {
    const user = await requireApprovedAuthor();

    const books = await prisma.book.findMany({
      where: { authorId: user.id },
      include: {
        category: { select: { nameEn: true } },
        orderItems: {
          where: { order: { status: { in: PAID_ORDER_STATUSES } } },
          select: { quantity: true, priceUSD: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = books.map((book) => {
      const sales = book.orderItems.reduce((sum, item) => sum + item.quantity, 0);
      const revenue = book.orderItems.reduce(
        (sum, item) => sum + Number(item.priceUSD) * item.quantity,
        0
      );

      return {
        id: book.id,
        title: book.titleEn,
        publishDate: book.createdAt,
        status: STATUS_LABELS[book.status] || book.status,
        price: Number(book.priceUSD),
        category: book.category?.nameEn || "",
        sales,
        revenue,
        coverUrl: book.coverImageUrl,
      };
    });

    return NextResponse.json({ success: true, books: data });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { success: false, error: "Author access is required." },
        { status: 403 }
      );
    }

    if (error instanceof Error && error.message === "AUTHOR_NOT_APPROVED") {
      return NextResponse.json(
        {
          success: false,
          error: "Your author application has not been approved yet.",
          code: "AUTHOR_NOT_APPROVED",
        },
        { status: 403 }
      );
    }

    console.error("AUTHOR BOOKS GET ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to load your books." },
      { status: 500 }
    );
  }
}
