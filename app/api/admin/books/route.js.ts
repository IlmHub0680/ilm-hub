import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
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

    const books = await prisma.book.findMany({
      where: {
        status: {
          in: ["PENDING_REVIEW", "APPROVED", "REJECTED"],
        },
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
            authorStatus: true,
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

    console.error("Admin books error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load books for administration.",
      },
      { status: 500 }
    );
  }
}
