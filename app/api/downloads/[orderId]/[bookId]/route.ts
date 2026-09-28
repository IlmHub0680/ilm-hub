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
     * Real, server-side entitlement check. Order status alone is not
     * enough — an Admin can deactivate a specific book's access without
     * changing the order itself, and that must be enforced here, not just
     * hidden in the UI. A missing BookAccess row is treated the same as a
     * revoked one: access was never (or is no longer) granted.
     */
    const access = await prisma.bookAccess.findUnique({
      where: {
        userId_bookId_orderId: {
          userId: user.id,
          bookId,
          orderId: order.id,
        },
      },
    });

    if (!access || access.revokedAt) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Download access for this book is not currently active. Please contact the Bookstore for assistance.",
        },
        { status: 403 }
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
     * Generate a temporary, signed Cloudflare R2 download URL. Requires
     * R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET_NAME
     * to be configured in the environment (see lib/r2.ts).
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
