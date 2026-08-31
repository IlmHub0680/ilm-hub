import Stripe from 'stripe';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is missing.');
  }

  return new Stripe(key);
}

function getWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is missing.');
  }

  return secret;
}

export async function POST(request) {
  try {
    const stripe = getStripe();

    // IMPORTANT:
    // Stripe signature verification requires the raw request body.
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return Response.json(
        {
          success: false,
          error: 'Missing Stripe signature.',
        },
        { status: 400 }
      );
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        getWebhookSecret()
      );
    } catch (error) {
      console.error(
        'STRIPE SIGNATURE VERIFICATION FAILED:',
        error
      );

      return Response.json(
        {
          success: false,
          error: 'Invalid webhook signature.',
        },
        { status: 400 }
      );
    }

    /*
     * ========================================================
     * ONLY PROCESS COMPLETED CHECKOUT SESSIONS
     * ========================================================
     */

    if (event.type !== 'checkout.session.completed') {
      return Response.json({
        received: true,
        ignored: true,
      });
    }

    const session = event.data.object;

    if (session.payment_status !== 'paid') {
      return Response.json({
        received: true,
        ignored: true,
      });
    }

    /*
     * ========================================================
     * GET ORDER ID FROM STRIPE METADATA
     * ========================================================
     */

    const orderId =
      session.metadata?.orderId ||
      session.metadata?.order_id;

    if (!orderId) {
      return Response.json(
        {
          success: false,
          error:
            'Order ID is missing from Stripe metadata.',
        },
        { status: 400 }
      );
    }

    /*
     * ========================================================
     * FIND ORDER
     * ========================================================
     */

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        payments: true,
      },
    });

    if (!order) {
      console.error(
        'STRIPE ORDER NOT FOUND:',
        orderId
      );

      return Response.json(
        {
          success: false,
          error: 'Order not found.',
        },
        { status: 404 }
      );
    }

    /*
     * ========================================================
     * IDEMPOTENCY
     *
     * Stripe can send the same webhook more than once.
     * Never process an already-paid order again.
     * ========================================================
     */

    if (order.paymentStatus === 'PAID') {
      return Response.json({
        received: true,
        success: true,
        alreadyProcessed: true,
        orderId: order.id,
      });
    }

    /*
     * ========================================================
     * VERIFY PAYMENT GATEWAY
     * ========================================================
     */

    if (
      order.paymentGateway &&
      order.paymentGateway !== 'STRIPE'
    ) {
      console.error(
        'STRIPE PAYMENT GATEWAY MISMATCH:',
        {
          orderId: order.id,
          paymentGateway: order.paymentGateway,
        }
      );

      return Response.json(
        {
          success: false,
          error:
            'Payment gateway does not match the order.',
        },
        { status: 409 }
      );
    }

    /*
     * ========================================================
     * VERIFY CURRENCY
     * ========================================================
     */

    const stripeCurrency =
      String(
        session.currency || ''
      ).toUpperCase();

    const orderCurrency =
      String(
        order.currencyCode || ''
      ).toUpperCase();

    if (
      stripeCurrency !== 'USD' ||
      orderCurrency !== 'USD'
    ) {
      console.error(
        'STRIPE CURRENCY MISMATCH:',
        {
          orderId: order.id,
          stripeCurrency,
          orderCurrency,
        }
      );

      return Response.json(
        {
          success: false,
          error:
            'Payment currency does not match the order.',
        },
        { status: 409 }
      );
    }

    /*
     * ========================================================
     * VERIFY PAYMENT AMOUNT
     * ========================================================
     */

    const orderTotal = Number(
      order.totalUSD
    );

    const expectedAmount = Math.round(
      orderTotal * 100
    );

    const receivedAmount = Number(
      session.amount_total
    );

    if (
      !Number.isFinite(orderTotal) ||
      orderTotal <= 0 ||
      !Number.isFinite(receivedAmount) ||
      receivedAmount !== expectedAmount
    ) {
      console.error(
        'STRIPE AMOUNT MISMATCH:',
        {
          orderId: order.id,
          orderTotal,
          expectedAmount,
          receivedAmount,
        }
      );

      return Response.json(
        {
          success: false,
          error:
            'Payment amount does not match the order.',
        },
        { status: 409 }
      );
    }

    /*
     * ========================================================
     * PAYMENT DETAILS
     * ========================================================
     */

    const paymentIntent =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : null;

    const paidAt = new Date();

    /*
     * ========================================================
     * ATOMIC DATABASE UPDATE
     * ========================================================
     */

    const result = await prisma.$transaction(
      async (tx) => {
        const currentOrder =
          await tx.order.findUnique({
            where: {
              id: order.id,
            },
          });

        if (!currentOrder) {
          throw new Error(
            'Order not found.'
          );
        }

        /*
         * Protect against duplicate webhook processing.
         */
        if (
          currentOrder.paymentStatus === 'PAID'
        ) {
          return {
            order: currentOrder,
            payment: null,
            alreadyProcessed: true,
          };
        }

        /*
         * Find the existing payment belonging to
         * this order instead of assuming the payment
         * primary key is the Stripe session ID.
         */
        let payment =
          currentOrder.paymentRef
            ? await tx.payment.findFirst({
                where: {
                  orderId: currentOrder.id,
                  checkoutReference:
                    currentOrder.paymentRef,
                },
              })
            : null;

        /*
         * If the original payment cannot be found,
         * fall back to the order's payment records.
         */
        if (!payment) {
          payment =
            await tx.payment.findFirst({
              where: {
                orderId: currentOrder.id,
                gateway: 'STRIPE',
              },
              orderBy: {
                createdAt: 'desc',
              },
            });
        }

        if (payment) {
          payment =
            await tx.payment.update({
              where: {
                id: payment.id,
              },
              data: {
                status: 'PAID',
                gatewayReference:
                  session.id,
                checkoutReference:
                  session.id,
                transactionId:
                  paymentIntent,
                authorizationUrl:
                  session.url || null,
                amount: orderTotal,
                currencyCode: 'USD',
                exchangeRate:
                  currentOrder.exchangeRate,
                paidAt,
                updatedAt: paidAt,
              },
            });
        } else {
          payment =
            await tx.payment.create({
              data: {
                orderId:
                  currentOrder.id,
                gateway: 'STRIPE',
                method:
                  currentOrder.paymentMethod,
                status: 'PAID',
                amount: orderTotal,
                currencyCode: 'USD',
                exchangeRate:
                  currentOrder.exchangeRate,
                gatewayReference:
                  session.id,
                checkoutReference:
                  session.id,
                transactionId:
                  paymentIntent,
                authorizationUrl:
                  session.url || null,
                paidAt,
              },
            });
        }

        /*
         * Mark the order as paid and move it to
         * admin approval.
         */
        const updatedOrder =
          await tx.order.update({
            where: {
              id: currentOrder.id,
            },
            data: {
              paymentGateway:
                'STRIPE',
              paymentStatus:
                'PAID',
              paidAmount:
                orderTotal,
              paymentRef:
                session.id,
              paidAt,
              status:
                'PENDING_ADMIN_APPROVAL',
            },
          });

        return {
          order: updatedOrder,
          payment,
          alreadyProcessed: false,
        };
      }
    );

    /*
     * ========================================================
     * RESPONSE
     * ========================================================
     */

    if (result.alreadyProcessed) {
      return Response.json({
        received: true,
        success: true,
        alreadyProcessed: true,
        orderId: result.order.id,
      });
    }

    console.log(
      'STRIPE PAYMENT CONFIRMED:',
      {
        orderId:
          result.order.id,
        sessionId:
          session.id,
        paymentStatus:
          result.order.paymentStatus,
        status:
          result.order.status,
      }
    );

    return Response.json({
      received: true,
      success: true,
      orderId:
        result.order.id,
      paymentStatus:
        result.order.paymentStatus,
      status:
        result.order.status,
      paymentReference:
        result.order.paymentRef,
    });
  } catch (error) {
    console.error(
      'STRIPE WEBHOOK ERROR:',
      error
    );

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Webhook processing failed.',
      },
      { status: 500 }
    );
  }
}
