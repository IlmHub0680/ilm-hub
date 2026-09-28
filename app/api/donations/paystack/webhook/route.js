import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

// Mirrors app/api/admissions/paystack/webhook/route.js exactly --
// same signature verification, same idempotency approach -- but
// against Donation directly (no separate parent record to keep in
// sync with).

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function verifySignature(body, signature, secret) {
  const hash = crypto.createHmac('sha512', secret).update(body).digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(hash, 'utf8'),
    Buffer.from(signature, 'utf8')
  );
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
      console.error('Invalid Paystack donation webhook signature.');

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
      return Response.json({
        received: true,
        ignored: true,
        event: event.event || null,
      });
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

    if (!reference) {
      return Response.json(
        { success: false, error: 'Paystack transaction reference is missing.' },
        { status: 400 }
      );
    }

    const donation = await prisma.donation.findFirst({
      where: {
        gateway: 'PAYSTACK',
        gatewayReference: reference,
      },
    });

    if (!donation) {
      console.error('Paystack donation not found:', reference);

      // Return 200 so Paystack does not endlessly retry a
      // transaction that does not belong to a donation.
      return Response.json({
        received: true,
        ignored: true,
        reason: 'Donation not found.',
      });
    }

    // Idempotency: Paystack can deliver the same webhook more than once.
    if (donation.status === 'PAID') {
      return Response.json({
        received: true,
        success: true,
        alreadyProcessed: true,
        donationId: donation.id,
      });
    }

    const receivedAmount = Number(transaction.amount || 0) / 100;
    const expectedAmount = Number(donation.amount);
    const receivedCurrency = String(transaction.currency || '').toUpperCase();
    const expectedCurrency = String(donation.currencyCode || '').toUpperCase();

    const amountsMatch =
      Number.isFinite(receivedAmount) && Math.abs(receivedAmount - expectedAmount) < 0.01;
    const currenciesMatch = receivedCurrency === expectedCurrency;

    if (!amountsMatch || !currenciesMatch) {
      console.error('Paystack donation payment mismatch:', {
        reference,
        donationId: donation.id,
        expectedAmount,
        receivedAmount,
        expectedCurrency,
        receivedCurrency,
      });

      await prisma.donation.update({
        where: { id: donation.id },
        data: {
          status: 'FAILED',
          transactionId: transaction.id ? String(transaction.id) : reference,
        },
      });

      return Response.json(
        {
          success: false,
          error: 'Payment amount or currency does not match the donation.',
        },
        { status: 409 }
      );
    }

    const paidAt = transaction.paid_at ? new Date(transaction.paid_at) : new Date();

    await prisma.$transaction(async (tx) => {
      const current = await tx.donation.findUnique({ where: { id: donation.id } });

      if (!current) {
        throw new Error('Donation no longer exists.');
      }

      // Another webhook/request may have completed the donation
      // while this transaction was running.
      if (current.status === 'PAID') {
        return;
      }

      await tx.donation.update({
        where: { id: current.id },
        data: {
          status: 'PAID',
          gatewayReference: reference,
          transactionId: transaction.id ? String(transaction.id) : reference,
          paidAt,
        },
      });
    });

    return Response.json({
      received: true,
      success: true,
      donationId: donation.id,
      reference,
      status: 'PAID',
    });
  } catch (error) {
    console.error('Donation Paystack webhook error:', error);

    return Response.json(
      { success: false, error: 'Donation Paystack webhook failed.' },
      { status: 500 }
    );
  }
}
