import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const admin = await requireUser();

    if (
      admin.role !== 'ADMIN' &&
      admin.role !== 'SUPER_ADMIN'
    ) {
      return Response.json(
        {
          success: false,
          error: 'Administrator access is required.',
        },
        { status: 403 }
      );
    }

    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc',
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
                coverImageUrl: true,
              },
            },
          },
        },
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return Response.json({
      success: true,
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,

        user: order.user,

        totalUSD: Number(order.totalUSD),
        paidAmount: Number(order.paidAmount),

        currencyCode: order.currencyCode,
        exchangeRate: Number(order.exchangeRate),

        status: order.status,
        paymentStatus: order.paymentStatus,

        paymentMethod: order.paymentMethod,
        paymentGateway: order.paymentGateway,

        paymentRef: order.paymentRef,
        paymentProofUrl: order.paymentProofUrl,

        rejectionReason: order.rejectionReason,

        approvedAt: order.approvedAt,
        paidAt: order.paidAt,
        rejectedAt: order.rejectedAt,

        createdAt: order.createdAt,
        updatedAt: order.updatedAt,

        items: order.items.map((item) => ({
          id: item.id,
          bookId: item.bookId,
          priceUSD: Number(item.priceUSD),
          quantity: item.quantity,
          book: item.book,
        })),

        payments: order.payments.map((payment) => ({
          id: payment.id,
          gateway: payment.gateway,
          method: payment.method,
          status: payment.status,
          amount: Number(payment.amount),
          currencyCode: payment.currencyCode,
          exchangeRate: Number(payment.exchangeRate),
          gatewayReference:
            payment.gatewayReference,
          checkoutReference:
            payment.checkoutReference,
          transactionId:
            payment.transactionId,
          authorizationUrl:
            payment.authorizationUrl,
          paidAt: payment.paidAt,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
        })),
      })),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'UNAUTHORIZED'
    ) {
      return Response.json(
        {
          success: false,
          error: 'Authentication required.',
        },
        { status: 401 }
      );
    }

    console.error(
      'ADMIN ORDERS API ERROR:',
      error
    );

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to load orders.',
      },
      { status: 500 }
    );
  }
}
