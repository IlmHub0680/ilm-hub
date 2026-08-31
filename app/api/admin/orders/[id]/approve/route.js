import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request, { params }) {
  try {
    const orderId = String(params?.id || '').trim();

    if (!orderId) {
      return Response.json(
        {
          success: false,
          error: 'Order ID is required.',
        },
        { status: 400 }
      );
    }

    /*
     * --------------------------------
     * AUTHENTICATION
     * --------------------------------
     *
     * Replace this section with your
     * existing Prisma-based auth helper
     * if your project already has one.
     *
     * For now this expects the authenticated
     * user ID from your auth system.
     */

    const userId =
      request.headers.get('x-user-id')?.trim() || '';

    if (!userId) {
      return Response.json(
        {
          success: false,
          error: 'Authentication required.',
        },
        { status: 401 }
      );
    }

    /*
     * --------------------------------
     * CHECK ADMIN
     * --------------------------------
     */

    const adminUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!adminUser) {
      return Response.json(
        {
          success: false,
          error: 'User not found.',
        },
        { status: 401 }
      );
    }

    if (
      adminUser.role !== 'ADMIN' &&
      adminUser.role !== 'SUPER_ADMIN'
    ) {
      return Response.json(
        {
          success: false,
          error: 'Administrator access is required.',
        },
        { status: 403 }
      );
    }

    /*
     * --------------------------------
     * LOAD ORDER
     * --------------------------------
     */

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: {
          select: {
            id: true,
            orderId: true,
            bookId: true,
            priceUSD: true,
            quantity: true,
          },
        },
      },
    });

    if (!order) {
      return Response.json(
        {
          success: false,
          error: 'Order not found.',
        },
        { status: 404 }
      );
    }

    /*
     * --------------------------------
     * PAYMENT MUST BE PAID
     * --------------------------------
     */

    if (order.paymentStatus !== 'PAID') {
      return Response.json(
        {
          success: false,
          error:
            'This order cannot be approved because payment has not been confirmed.',
        },
        { status: 409 }
      );
    }

    /*
     * --------------------------------
     * PREVENT DUPLICATE APPROVAL
     * --------------------------------
     */

    if (
      order.status === 'APPROVED' ||
      order.status === 'ACTIVATED' ||
      order.status === 'COMPLETED'
    ) {
      return Response.json(
        {
          success: false,
          error: 'This order has already been approved.',
        },
        { status: 409 }
      );
    }

    /*
     * --------------------------------
     * ORDER MUST CONTAIN BOOKS
     * --------------------------------
     */

    if (!order.items || order.items.length === 0) {
      return Response.json(
        {
          success: false,
          error: 'This order contains no books.',
        },
        { status: 409 }
      );
    }

    const validItems = order.items.filter(
      (item) => Boolean(item.bookId)
    );

    if (validItems.length === 0) {
      return Response.json(
        {
          success: false,
          error: 'No valid books were found in this order.',
        },
        { status: 409 }
      );
    }

    /*
     * --------------------------------
     * APPROVE + CREATE ACCESS
     * --------------------------------
     */

    const now = new Date();

    await prisma.$transaction(async (tx) => {
      for (const item of validItems) {
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

      await tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: 'APPROVED',
          approvedAt: now,
        },
      });
    });

    /*
     * --------------------------------
     * SUCCESS
     * --------------------------------
     */

    console.log('ORDER APPROVED:', {
      orderId: order.id,
      userId: order.userId,
      approvedBy: adminUser.id,
      itemCount: validItems.length,
    });

    return Response.redirect(
      new URL(
        '/admin/orders?approved=1',
        request.url
      )
    );
  } catch (error) {
    console.error(
      'Admin order approval error:',
      error
    );

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to approve the order.',
      },
      {
        status: 500,
      }
    );
  }
}
