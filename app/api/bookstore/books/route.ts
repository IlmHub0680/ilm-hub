import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const featured = searchParams.get("featured");
    const newRelease = searchParams.get("newRelease");

    const books = await prisma.book.findMany({
      where: {
        // Only approved books are visible in the public bookstore.
        status: "APPROVED",

        ...(search
          ? {
              OR: [
                {
                  titleEn: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  titleAr: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  descriptionEn: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  descriptionAr: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),

        ...(category
          ? {
              category: {
                slug: category,
              },
            }
          : {}),

        ...(featured === "true"
          ? {
              isFeatured: true,
            }
          : {}),

        ...(newRelease === "true"
          ? {
              isNewRelease: true,
            }
          : {}),
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
        isFeatured: true,
        isNewRelease: true,
        createdAt: true,

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

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: books,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Bookstore books error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load bookstore books.",
      },
      { status: 500 }
    );
  }
}