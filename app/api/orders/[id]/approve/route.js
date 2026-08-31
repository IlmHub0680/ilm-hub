import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
  request,
  { params }
) {
  try {
    /*
     * --------------------------------
     * AUTHENTICATE ADMIN
     * --------------------------------
     */

    const admin = await requireUser();

    if (
      admin.role !== 'ADMIN' &&
      admin.role !== 'SUPER_ADMIN'
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Administrator access is required.',
        },
        { status: 403 }
      );
    }

    /*
     * --------------------------------
     * VALIDATE ORDER ID
     * --------------------------------
     */

    const orderId =
      params?.id?.trim();

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Order ID is required.',
        },
        { status: 400 }
      );
    }

    /*
     * --------------------------------
     * LOAD ORDER
     * --------------------------------
     *
     * Prisma is the source of truth.
     */

    const order =
      await prisma.order.findUnique({
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
          error: 'Order not found.',
        },
        { status: 404 }
      );
    }

    /*
     * --------------------------------
     * PAYMENT CHECK
     * --------------------------------
     *
     * Your Prisma schema does not have a
     * separate payment_status column.
     *
     * The payment lifecycle is represented
     * by Order.status.
     *
     * PAYMENT_SUBMITTED means the customer
     * has submitted payment information and
     * the order is awaiting review.
     *
     * UNDER_REVIEW and PENDING_ADMIN_APPROVAL
     * are also valid review states.
     *
     * Do not approve an unpaid/new order.
     */

    const payableReviewStatuses = [
      'PAYMENT_SUBMITTED',
      'UNDER_REVIEW',
      'PENDING_ADMIN_APPROVAL',
    ];

    if (
      !payableReviewStatuses.includes(
        order.status
      )
    ) {
      if (
        order.status === 'ACTIVATED' ||
        order.status === 'COMPLETED'
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              'This order has already been activated.',
          },
          { status: 409 }
        );
      }

      if (
        order.status === 'APPROVED'
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              'This order has already been approved.',
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error:
            'This order is not currently awaiting payment approval.',
          currentStatus:
            order.status,
        },
        { status: 409 }
      );
    }

    /*
     * --------------------------------
     * VERIFY ORDER ITEMS
     * --------------------------------
     */

    if (
      !order.items ||
      order.items.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'This order contains no books.',
        },
        { status: 409 }
      );
    }

    /*
     * Every purchased book must still exist.
     */

    const invalidItem =
      order.items.find(
        (item) => !item.book
      );

    if (invalidItem) {
      return NextResponse.json(
        {
          success: false,
          error:
            'One or more books in this order could not be found.',
        },
        { status: 409 }
      );
    }

    /*
     * --------------------------------
     * ACTIVATE ORDER
     * --------------------------------
     *
     * ACTIVATED is the state recognized by
     * the current download endpoint.
     */

    const updatedOrder =
      await prisma.order.update({
        where: {
          id: orderId,
        },

        data: {
          status: 'ACTIVATED',
        },

        include: {
          items: {
            include: {
              book: {
                select: {
                  id: true,
                  titleEn: true,
                  titleAr: true,
                  slug: true,
                  coverImageUrl: true,
                  r2FileKey: true,
                },
              },
            },
          },
        },
      });

    /*
     * --------------------------------
     * SUCCESS
     * --------------------------------
     */

    console.log(
      'ORDER ACTIVATED:',
      {
        orderId:
          updatedOrder.id,

        orderNumber:
          updatedOrder.orderNumber,

        userId:
          updatedOrder.userId,

        approvedBy:
          admin.id,

        itemCount:
          updatedOrder.items.length,
      }
    );

    return NextResponse.json(
      {
        success: true,

        message:
          'Payment approved. The order has been activated and the customer can now download the purchased books.',

        order: {
          id:
            updatedOrder.id,

          orderNumber:
            updatedOrder.orderNumber,

          status:
            updatedOrder.status,

          totalUSD:
            Number(
              updatedOrder.totalUSD
            ),

          paidAmount:
            Number(
              updatedOrder.paidAmount
            ),

          currencyCode:
            updatedOrder.currencyCode,

          paymentMethod:
            updatedOrder.paymentMethod,

          paymentRef:
            updatedOrder.paymentRef,

          createdAt:
            updatedOrder.createdAt,

          updatedAt:
            updatedOrder.updatedAt,

          items:
            updatedOrder.items.map(
              (item) => ({
                id:
                  item.id,

                bookId:
                  item.bookId,

                priceUSD:
                  Number(
                    item.priceUSD
                  ),

                quantity:
                  item.quantity,

                book:
                  item.book,
              })
            ),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'UNAUTHORIZED'
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Authentication required.',
        },
        { status: 401 }
      );
    }

    console.error(
      'Admin order approval error:',
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          'Unable to approve the order.',
      },
      { status: 500 }
    );
  }
}
