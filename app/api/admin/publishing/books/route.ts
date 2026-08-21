import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET
 *
 * Returns books for the admin publishing area.
 *
 * Optional query:
 * ?status=PENDING_REVIEW
 * ?status=APPROVED
 * ?status=REJECTED
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);

    const requestedStatus =
      searchParams.get("status")?.trim() || "";

    const allowedStatuses = [
      "PENDING_REVIEW",
      "APPROVED",
      "REJECTED",
    ] as const;

    type AllowedStatus =
      (typeof allowedStatuses)[number];

    const status = allowedStatuses.includes(
      requestedStatus as AllowedStatus
    )
      ? (requestedStatus as AllowedStatus)
      : undefined;

    const books = await prisma.book.findMany({
      where: {
        ...(status
         ? {
          status,
        }
      : {}),
  },

      orderBy: {
        createdAt: "desc",
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

        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            authorStatus: true,
          },
        },

        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            authorStatus: true,
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

    return NextResponse.json(
      {
        success: true,
        data: books.map((book) => ({
          ...book,
          priceUSD: Number(book.priceUSD),
        })),
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
      "Admin publishing books error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load publishing books.",
      },
      { status: 500 }
    );
  }
}
