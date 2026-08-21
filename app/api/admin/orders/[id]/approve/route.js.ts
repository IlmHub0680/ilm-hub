import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { resend } from "@/lib/resend";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    /*
     * Only authenticated administrators may approve payments.
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

    const orderId = params.id?.trim();

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: "Order ID is required.",
        },
        { status: 400 }
      );
    }

    /*
     * Load the order before changing anything.
     */
    const existingOrder = await prisma.order.findUnique({
      where: {
        id: orderId,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        items: {
          include: {
            book: {
              select: {
                id: true,
                titleEn: true,
                titleAr: true,
                priceUSD: true,
              },
            },
          },
        },

        receipt: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Do not approve an order that has already been activated
     * or completed.
     */
    if (
      existingOrder.status === "ACTIVATED" ||
      existingOrder.status === "COMPLETED"
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
     * Only orders that have reached an appropriate payment-review
     * stage can be approved.
     */
    const approvableStatuses = [
      "PAYMENT_SUBMITTED",
      "UNDER_REVIEW",
      "PENDING_ADMIN_APPROVAL",
      "APPROVED",
    ] as const;

    if (
      !approvableStatuses.includes(
        existingOrder.status as (typeof approvableStatuses)[number]
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `This order cannot be approved from its current status: ${existingOrder.status}.`,
        },
        { status: 409 }
      );
    }

    /*
     * Use a transaction so the order activation and receipt creation
     * are handled together.
     */
    const result = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: {
          id: existingOrder.id,
        },

        data: {
          status: "ACTIVATED",
        },

        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          items: {
            include: {
              book: {
                select: {
                  id: true,
                  titleEn: true,
                  titleAr: true,
                  priceUSD: true,
                },
              },
            },
          },
        },
      });

      /*
       * Create one receipt for the order.
       *
       * Because Receipt.orderId is unique, we use upsert so the
       * operation remains safe if a receipt already exists.
       */
      const receipt = await tx.receipt.upsert({
        where: {
          orderId: updatedOrder.id,
        },

        update: {},

        create: {
          receiptNo: `REC-${Date.now()}-${Math.floor(
            1000 + Math.random() * 9000
          )}`,

          orderId: updatedOrder.id,

          pdfUrl: `/api/receipts/${updatedOrder.id}`,
        },
      });

      await tx.notification.create({
        data: {
          userId: updatedOrder.userId,

          title: "Payment approved",

          message: `Your payment for order ${updatedOrder.orderNumber} has been verified. Your purchased books are now available for download.`,
        },
      });

      return {
        updatedOrder,
        receipt,
      };
    });

    /*
     * Send the email after the database transaction succeeds.
     *
     * An email failure should not undo a successful payment approval.
     */
    try {
      await resend.emails.send({
        from:
          "IlmHub <info@ilmhub.org>",

        to: [result.updatedOrder.user.email],

        subject: `Payment approved - Order #${result.updatedOrder.orderNumber}`,

        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Assalamu Alaikum ${result.updatedOrder.user.name},</h2>

            <p>
              Your payment for order
              <strong>#${result.updatedOrder.orderNumber}</strong>
              has been verified.
            </p>

            <p>
              Your purchased books are now available for download
              from your account.
            </p>

            <p>
              Thank you for your purchase.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      /*
       * Do not report the entire approval as failed because of an
       * email problem. The order and receipt have already been
       * successfully processed.
       */
      console.error(
        "Order approval email error:",
        emailError
      );
    }

    return NextResponse.json(
      {
        success: true,

        message:
          "Payment approved and order activated successfully.",

        data: {
          order: result.updatedOrder,
          receipt: result.receipt,
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

    console.error("Order approval error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to approve the order.",
      },
      { status: 500 }
    );
  }
}
