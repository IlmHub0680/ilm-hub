import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request, { params }) {
  try {
    const admin = await requireAdmin();

    const orderId = String(params?.id || "").trim();

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: "Order ID is required.",
        },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
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
          error: "Order not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Payment must be confirmed before access is granted.
     */
    if (order.paymentStatus !== "PAID") {
      return NextResponse.json(
        {
          success: false,
          error:
            "This order cannot be activated because payment has not been confirmed.",
        },
        { status: 409 }
      );
    }

    /*
     * Already activated.
     */
    if (
      order.status === "ACTIVATED" ||
      order.status === "COMPLETED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "This order has already been activated.",
        },
        { status: 409 }
      );
    }

    /*
     * Already approved is treated as a duplicate action.
     */
    if (order.status === "APPROVED") {
      return NextResponse.json(
        {
          success: false,
          error: "This order has already been approved.",
        },
        { status: 409 }
      );
    }

    /*
     * Only payment-review states can be activated.
     */
    const reviewStatuses = [
      "ORDER_PLACED",
      "PAYMENT_SUBMITTED",
      "UNDER_REVIEW",
      "PENDING_ADMIN_APPROVAL",
    ];

    if (!reviewStatuses.includes(order.status)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This order is not currently awaiting payment approval.",
          currentStatus: order.status,
        },
        { status: 409 }
      );
    }

    if (!order.items || order.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "This order contains no books.",
        },
        { status: 409 }
      );
    }

    const invalidItem = order.items.find(
      (item) => !item.book
    );

    if (invalidItem) {
      return NextResponse.json(
        {
          success: false,
          error:
            "One or more books in this order could not be found.",
        },
        { status: 409 }
      );
    }

    const now = new Date();

    const updatedOrder = await prisma.$transaction(
      async (tx) => {
        /*
         * Grant access to every purchased book.
         */
        for (const item of order.items) {
          await tx.bookAccess.upsert({
            where: {
              userId_bookId_orderId: {
                userId: order.userId,
                bookId: item.bookId,
                orderId: order.id,
              },
            },

            create: {
              userId: order.userId,
              bookId: item.bookId,
              orderId: order.id,
              approvedAt: now,
              revokedAt: null,
            },

            update: {
              approvedAt: now,
              revokedAt: null,
            },
          });
        }

        /*
         * ACTIVATED is the only successful access state.
         * This matches the download endpoint.
         */
        return tx.order.update({
          where: {
            id: order.id,
          },

          data: {
            status: "ACTIVATED",
            approvedAt: now,
            paidAt: order.paidAt || now,
            paidAmount:
              Number(order.paidAmount) > 0
                ? order.paidAmount
                : order.totalUSD,
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
      }
    );

    console.log("ORDER ACTIVATED:", {
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      userId: updatedOrder.userId,
      approvedBy: admin.id,
      itemCount: updatedOrder.items.length,
    });

    /*
     * Redirect back to the admin order list.
     */
    return NextResponse.redirect(
      new URL("/admin/orders?approved=1", request.url)
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

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Administrator access is required.",
        },
        { status: 403 }
      );
    }

    console.error("ORDER APPROVAL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to activate the order.",
      },
      { status: 500 }
    );
  }
}
