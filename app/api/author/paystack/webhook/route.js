import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

// Server-to-server confirmation of an author application-fee payment,
// mirroring app/api/admissions/paystack/webhook/route.js — defense in
// depth alongside the client-driven /verify route (Paystack can retry
// the same event, and a user may never return to the callback URL).

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function verifySignature(body, signature, secret) {
  const hash = crypto.createHmac('sha512', secret).update(body).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(hash, 'utf8'), Buffer.from(signature, 'utf8'));
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

    let validSignature = false;

    try {
      validSignature = verifySignature(rawBody, signature, secretKey);
    } catch {
      validSignature = false;
    }

    if (!validSignature) {
      console.error('Invalid Paystack webhook signature.');
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

    // Only successful charges carrying our AUTH- reference prefix
    // belong to author application-fee payments; anything else
    // (student admissions, bookstore orders, staff payroll, etc.
    // sharing the same Paystack account/webhook URL) is ignored here.
    if (event.event !== 'charge.success') {
      return Response.json({ received: true, ignored: true, event: event.event || null });
    }

    const transaction = event.data;

    if (!transaction) {
      return Response.json(
        { success: false, error: 'Paystack transaction data is missing.' },
        { status: 400 }
      );
    }

    if (transaction.status !== 'success') {
      return Response.json({ received: true, ignored: true });
    }

    const reference =
      typeof transaction.reference === 'string' ? transaction.reference.trim() : '';

    if (!reference || !reference.startsWith('AUTH-')) {
      return Response.json({ received: true, ignored: true, reason: 'Not an author payment reference.' });
    }

    const payment = await prisma.authorPayment.findFirst({
      where: { gateway: 'PAYSTACK', gatewayReference: reference },
      include: { admission: true },
    });

    if (!payment) {
      console.error('Paystack author payment not found:', reference);

      // Return 200 so Paystack does not endlessly retry a
      // transaction that does not belong to an author application.
      return Response.json({ received: true, ignored: true, reason: 'Author payment not found.' });
    }

    // Idempotency: Paystack can deliver the same webhook more than once.
    if (payment.status === 'PAID' && payment.admission.status !== 'PENDING') {
      return Response.json({
        received: true,
        success: true,
        alreadyProcessed: true,
        admissionId: payment.admissionId,
      });
    }

    const receivedAmount = Number(transaction.amount || 0) / 100;
    const expectedAmount = Number(payment.amount);
    const receivedCurrency = String(transaction.currency || '').toUpperCase();
    const expectedCurrency = String(payment.currencyCode || '').toUpperCase();

    const amountsMatch =
      Number.isFinite(receivedAmount) && Math.abs(receivedAmount - expectedAmount) < 0.01;
    const currenciesMatch = receivedCurrency === expectedCurrency;

    if (!amountsMatch || !currenciesMatch) {
      console.error('Paystack author payment mismatch:', {
        reference,
        admissionId: payment.admissionId,
        expectedAmount,
        receivedAmount,
        expectedCurrency,
        receivedCurrency,
      });

      await prisma.authorPayment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          transactionId: transaction.id ? String(transaction.id) : reference,
        },
      });

      return Response.json(
        { success: false, error: 'Payment amount or currency does not match the application fee.' },
        { status: 409 }
      );
    }

    const paidAt = transaction.paid_at ? new Date(transaction.paid_at) : new Date();

    await prisma.$transaction(async (tx) => {
      const currentPayment = await tx.authorPayment.findUnique({ where: { id: payment.id } });
      const currentAdmission = await tx.authorAdmission.findUnique({
        where: { id: payment.admissionId },
      });

      if (!currentPayment || !currentAdmission) {
        throw new Error('Author payment or application no longer exists.');
      }

      // Another webhook/request may have completed this while this
      // transaction was running.
      if (currentPayment.status === 'PAID' && currentAdmission.status !== 'PENDING') {
        return;
      }

      await tx.authorPayment.update({
        where: { id: currentPayment.id },
        data: {
          status: 'PAID',
          gatewayReference: reference,
          transactionId: transaction.id ? String(transaction.id) : reference,
          paidAt,
        },
      });

      await tx.authorAdmission.update({
        where: { id: currentAdmission.id },
        data: { status: 'PAID' },
      });
    });

    return Response.json({
      received: true,
      success: true,
      admissionId: payment.admissionId,
      reference,
      status: 'PAID',
    });
  } catch (error) {
    console.error('Author Paystack webhook error:', error);

    return Response.json({ success: false, error: 'Author Paystack webhook failed.' }, { status: 500 });
  }
}
