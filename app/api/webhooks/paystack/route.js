import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/*
 * Server-to-server confirmation for bookstore Paystack (mobile money)
 * payments — mirrors the same HMAC-SHA512 verification pattern already
 * proven in app/api/admissions/paystack/webhook/route.js, and the same
 * Order/Payment update shape already proven in
 * app/api/webhooks/stripe/route.js.
 *
 * This exists so a bookstore payment can be confirmed even if the
 * customer's browser never returns to /checkout/success (closed tab,
 * lost connection, etc.) — the client-side PaystackVerification poll is
 * a convenience, not the only path to a PAID order.
 *
 * Register this URL (`<APP_URL>/api/webhooks/paystack`) in the Paystack
 * dashboard's webhook settings.
 */
function verifySignature(body, signature, secret) {
  const hash = crypto
    .createHmac('sha512', secret)
    .update(body)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'utf8'),
      Buffer.from(signature, 'utf8')
    );
  } catch {
    return false;
  }
}

export async function POST(request) {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error('PAYSTACK_SECRET_KEY is missing.');
      return Response.json(
        { success: false, error: 'Paystack is not configured.' },
        { status: 500 }
      );
    }

    const rawBody = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!signature) {
      return Response.json(
        { success: false, error: 'Missing Paystack signature.' },
        { status: 400 }
      );
    }

    if (!verifySignature(rawBody, signature, secretKey)) {
      console.error('Invalid Paystack (bookstore) webhook signature.');
      return Response.json(
        { success: false, error: 'Invalid webhook signature.' },
        { status: 401 }
      );
    }

    let event;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return Response.json(
        { success: false, error: 'Invalid webhook payload.' },
        { status: 400 }
      );
    }

    if (event.event !== 'charge.success') {
      return Response.json({ received: true, ignored: true, event: event.event || null });
    }

    const transaction = event.data;

    if (!transaction || transaction.status !== 'success') {
      return Response.json({ received: true, ignored: true });
    }

    const reference =
      typeof transaction.reference === 'string' ? transaction.reference.trim() : '';

    if (!reference) {
      return Response.json(
        { success: false, error: 'Paystack transaction reference is missing.' },
        { status: 400 }
      );
    }

    /*
     * This reference is a bookstore order's Paystack reference only if
     * a Payment row was tagged with it at checkout — an admission
     * payment (or anything else) using the shared /api/webhooks
     * namespace would simply not match here and gets ignored below.
     */
    const payment = await prisma.payment.findFirst({
      where: {
        gateway: 'PAYSTACK',
        gatewayReference: reference,
      },
      include: { order: true },
    });

    if (!payment || !payment.order) {
      return Response.json({
        received: true,
        ignored: true,
        reason: 'No bookstore order found for this reference.',
      });
    }

    const order = payment.order;

    if (order.paymentStatus === 'PAID') {
      return Response.json({
        received: true,
        success: true,
        alreadyProcessed: true,
        orderId: order.id,
      });
    }

    if (order.paymentGateway && order.paymentGateway !== 'PAYSTACK') {
      console.error('PAYSTACK (bookstore) GATEWAY MISMATCH:', {
        orderId: order.id,
        paymentGateway: order.paymentGateway,
      });
      return Response.json(
        { success: false, error: 'Payment gateway does not match the order.' },
        { status: 409 }
      );
    }

    const receivedAmount = Number(transaction.amount || 0) / 100;
    const expectedAmount = Number(payment.amount);

    const receivedCurrency = String(transaction.currency || '').toUpperCase();
    const expectedCurrency = String(payment.currencyCode || '').toUpperCase();

    const amountsMatch =
      Number.isFinite(receivedAmount) &&
      Number.isFinite(expectedAmount) &&
      Math.abs(receivedAmount - expectedAmount) < 0.01;

    const currenciesMatch = receivedCurrency === expectedCurrency;

    if (!amountsMatch || !currenciesMatch) {
      console.error('PAYSTACK (bookstore) AMOUNT/CURRENCY MISMATCH:', {
        orderId: order.id,
        reference,
        expectedAmount,
        receivedAmount,
        expectedCurrency,
        receivedCurrency,
      });

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          transactionId: transaction.id ? String(transaction.id) : reference,
        },
      });

      return Response.json(
        { success: false, error: 'Payment amount or currency does not match the order.' },
        { status: 409 }
      );
    }

    const paidAt = transaction.paid_at ? new Date(transaction.paid_at) : new Date();

    const result = await prisma.$transaction(async (tx) => {
      const currentOrder = await tx.order.findUnique({ where: { id: order.id } });

      if (!currentOrder) {
        throw new Error('Order no longer exists.');
      }

      if (currentOrder.paymentStatus === 'PAID') {
        return { order: currentOrder, alreadyProcessed: true };
      }

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          gatewayReference: reference,
          transactionId: transaction.id ? String(transaction.id) : reference,
          paidAt,
        },
      });

      const updatedOrder = await tx.order.update({
        where: { id: currentOrder.id },
        data: {
          paymentGateway: 'PAYSTACK',
          paymentStatus: 'PAID',
          paidAmount: receivedAmount,
          paymentRef: reference,
          paidAt,
          status: 'PENDING_ADMIN_APPROVAL',
        },
      });

      return { order: updatedOrder, alreadyProcessed: false };
    });

    if (result.alreadyProcessed) {
      return Response.json({
        received: true,
        success: true,
        alreadyProcessed: true,
        orderId: result.order.id,
      });
    }

    console.log('PAYSTACK (bookstore) PAYMENT CONFIRMED:', {
      orderId: result.order.id,
      reference,
      paymentStatus: result.order.paymentStatus,
      status: result.order.status,
    });

    return Response.json({
      received: true,
      success: true,
      orderId: result.order.id,
      paymentStatus: result.order.paymentStatus,
      status: result.order.status,
      paymentReference: result.order.paymentRef,
    });
  } catch (error) {
    console.error('Bookstore Paystack webhook error:', error);
    return Response.json(
      { success: false, error: 'Bookstore Paystack webhook failed.' },
      { status: 500 }
    );
  }
}
