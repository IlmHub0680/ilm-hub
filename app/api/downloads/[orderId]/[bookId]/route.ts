import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getR2PresignedUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      orderId: string;
      bookId: string;
    };
  }
) {
  try {
    /*
     * Use the same authentication system as our login route.
     */
    const user = await requireUser();

    /*
     * Make sure the URL parameters actually exist.
     */
    const orderId = params.orderId?.trim();
    const bookId = params.bookId?.trim();

    if (!orderId || !bookId) {
      return NextResponse.json(
        {
          success: false,
          error: "Order ID and book ID are required.",
        },
        { status: 400 }
      );
    }

    /*
     * Find the order belonging specifically to the logged-in user.
     *
     * Only ACTIVATED and COMPLETED orders can download books.
     *
     * We intentionally do NOT allow APPROVED here because the
     * approval process now moves the order to ACTIVATED.
     */
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id,
        status: {
          in: ["ACTIVATED", "COMPLETED"],
        },
      },

      include: {
        items: {
          include: {
            book: {
              select: {
                id: true,
                titleEn: true,
                titleAr: true,
                r2FileKey: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Download not authorized. Your payment may still be pending approval.",
        },
        { status: 403 }
      );
    }

    /*
     * Check that the requested book was actually purchased
     * in this specific order.
     */
    const orderItem = order.items.find(
      (item) => item.bookId === bookId
    );

    if (!orderItem) {
      return NextResponse.json(
        {
          success: false,
          error: "This book was not purchased in this order.",
        },
        { status: 404 }
      );
    }

    /*
     * Make sure the book has a storage key.
     */
    if (!orderItem.book.r2FileKey) {
      console.error(
        "Book is missing R2 file key:",
        orderItem.book.id
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "The book file is not currently available.",
        },
        { status: 500 }
      );
    }

    /*
     * Record the download attempt.
     */
    const forwardedFor =
      req.headers.get("x-forwarded-for");

    const realIp =
      forwardedFor?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    await prisma.downloadLog.create({
      data: {
        userId: user.id,
        orderId: order.id,
        bookId: orderItem.bookId,
        ipAddress: realIp,
      },
    });

    /*
     * Generate a temporary download URL.
     *
     * IMPORTANT:
     * Our current lib/r2.ts is only a placeholder URL generator.
     * We will replace it with the real Cloudflare R2 signing code
     * once the R2 bucket and credentials are configured.
     */
    const signedUrl = await getR2PresignedUrl(
      orderItem.book.r2FileKey,
      60
    );

    return NextResponse.json(
      {
        success: true,
        downloadUrl: signedUrl,
        expiresIn: 60,
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

    console.error("Book download error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to prepare the book download.",
      },
      { status: 500 }
    );
  }
}
