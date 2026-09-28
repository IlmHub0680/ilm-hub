import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      where: {
        status: "PUBLISHED",
      },
      orderBy: [
        { isFeatured: "desc" },
        { createdAt: "desc" },
      ],
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
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      books: books.map((book) => ({
        id: book.id,
        slug: book.slug,
        title: book.titleEn,
        titleAr: book.titleAr,
        arabicTitle: book.titleAr,
        description: book.descriptionEn,
        descriptionAr: book.descriptionAr,
        price: Number(book.priceUSD),
        priceUSD: Number(book.priceUSD),
        currency: "USD",

        image: book.coverImageUrl || null,
        coverImageUrl: book.coverImageUrl || null,

        // Model 28 fix: r2FileKey is a raw Cloudflare R2 object storage
        // path -- it must never reach an unauthenticated public listing
        // endpoint (rule #9). The storefront only ever needed to know
        // *whether* a digital copy exists, which digitalAvailable
        // already covers; the real, protected download flow (which
        // performs its own ownership/entitlement check before ever
        // touching this key) lives at /api/downloads/[orderId]/[bookId].
        digitalAvailable: Boolean(book.r2FileKey),

        author: book.author
          ? {
              id: book.author.id,
              name: book.author.name,
            }
          : null,

        category: book.category
          ? {
              id: book.category.id,
              nameEn: book.category.nameEn,
              nameAr: book.category.nameAr,
              slug: book.category.slug,
            }
          : null,

        isFeatured: book.isFeatured,
        isNewRelease: book.isNewRelease,
        status: book.status,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Public bookstore API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load bookstore books.",
      },
      { status: 500 }
    );
  }
}
