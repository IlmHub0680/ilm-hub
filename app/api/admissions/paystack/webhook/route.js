import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function verifySignature(body, signature, secret) {
  const hash = crypto
    .createHmac('sha512', secret)
    .update(body)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(hash, 'utf8'),
    Buffer.from(signature, 'utf8')
  );
}

// Paystack's dashboard only accepts a single account-wide webhook URL, so
// this admissions endpoint is the one registered with Paystack. If a
// successful charge's reference doesn't match an admission payment, we
// fall through and check whether it belongs to a donation instead, rather
// than requiring a second webhook URL Paystack has no way to call.
async function tryProcessDonation(transaction, reference) {
  const donation = await prisma.donation.findFirst({
    where: {
      gateway: 'PAYSTACK',
      gatewayReference: reference,
    },
  });

  if (!donation) {
    return null;
  }

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
}

export async function POST(request) {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error('PAYSTACK_SECRET_KEY is missing.');
      return Response.json(
        {
          success: false,
          error: 'Paystack is not configured.',
        },
        { status: 500 }
      );
    }

    const rawBody = await request.text();

    const signature =
      request.headers.get('x-paystack-signature');

    if (!signature) {
      return Response.json(
        {
          success: false,
          error: 'Missing Paystack signature.',
        },
        { status: 400 }
      );
    }

    let validSignature = false;

    try {
      validSignature = verifySignature(
        rawBody,
        signature,
        secretKey
      );
    } catch {
      validSignature = false;
    }

    if (!validSignature) {
      console.error(
        'Invalid Paystack webhook signature.'
      );

      return Response.json(
        {
          success: false,
          error: 'Invalid webhook signature.',
        },
        { status: 401 }
      );
    }

    let event;

    try {
      event = JSON.parse(rawBody);
    } catch {
      return Response.json(
        {
          success: false,
          error: 'Invalid webhook payload.',
        },
        { status: 400 }
      );
    }

    /*
     * We only need successful payments (admissions or donations).
     */
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
        {
          success: false,
          error: 'Paystack transaction data is missing.',
        },
        { status: 400 }
      );
    }

    if (transaction.status !== 'success') {
      return Response.json({
        received: true,
        ignored: true,
      });
    }

    const reference =
      typeof transaction.reference === 'string'
        ? transaction.reference.trim()
        : '';

    if (!reference) {
      return Response.json(
        {
          success: false,
          error: 'Paystack transaction reference is missing.',
        },
        { status: 400 }
      );
    }

    const payment =
      await prisma.admissionPayment.findFirst({
        where: {
          gateway: 'PAYSTACK',
          gatewayReference: reference,
        },
        include: {
          application: true,
        },
      });

    if (!payment) {
      // Not an admission payment -- this single URL also receives
      // donation charges, since Paystack only allows one webhook URL
      // per account. Check donations before giving up.
      const donationResult = await tryProcessDonation(transaction, reference);

      if (donationResult) {
        return donationResult;
      }

      console.error(
        'Paystack payment not found for admission or donation:',
        reference
      );

      /*
       * Return 200 so Paystack does not endlessly retry
       * a transaction that does not belong to either.
       */
      return Response.json({
        received: true,
        ignored: true,
        reason: 'No matching admission payment or donation.',
      });
    }

    /*
     * Idempotency:
     * Paystack can deliver the same webhook more than once.
     */
    if (
      payment.status === 'PAID' &&
      payment.application.status === 'PAID'
    ) {
      return Response.json({
        received: true,
        success: true,
        alreadyProcessed: true,
        applicationId: payment.applicationId,
        applicationNumber:
          payment.application.applicationNumber,
      });
    }

    const receivedAmount =
      Number(transaction.amount || 0) / 100;

    const expectedAmount =
      Number(payment.amount);

    const receivedCurrency =
      String(
        transaction.currency || ''
      ).toUpperCase();

    const expectedCurrency =
      String(
        payment.currencyCode || ''
      ).toUpperCase();

    const amountsMatch =
      Number.isFinite(receivedAmount) &&
      Math.abs(
        receivedAmount - expectedAmount
      ) < 0.01;

    const currenciesMatch =
      receivedCurrency === expectedCurrency;

    if (
      !amountsMatch ||
      !currenciesMatch
    ) {
      console.error(
        'Paystack admission payment mismatch:',
        {
          reference,
          applicationId:
            payment.applicationId,
          expectedAmount,
          receivedAmount,
          expectedCurrency,
          receivedCurrency,
        }
      );

      await prisma.admissionPayment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: 'FAILED',
          transactionId:
            transaction.id
              ? String(transaction.id)
              : reference,
        },
      });

      return Response.json(
        {
          success: false,
          error:
            'Payment amount or currency does not match the application fee.',
        },
        { status: 409 }
      );
    }

    const paidAt =
      transaction.paid_at
        ? new Date(transaction.paid_at)
        : new Date();

    await prisma.$transaction(
      async (tx) => {
        const currentPayment =
          await tx.admissionPayment.findUnique({
            where: {
              id: payment.id,
            },
          });

        const currentApplication =
          await tx.admissionApplication.findUnique({
            where: {
              id: payment.applicationId,
            },
          });

        if (
          !currentPayment ||
          !currentApplication
        ) {
          throw new Error(
            'Admission payment or application no longer exists.'
          );
        }

        /*
         * Another webhook/request may have completed
         * the payment while this transaction was running.
         */
        if (
          currentPayment.status === 'PAID' &&
          currentApplication.status === 'PAID'
        ) {
          return;
        }

        await tx.admissionPayment.update({
          where: {
            id: currentPayment.id,
          },
          data: {
            status: 'PAID',
            gatewayReference: reference,
            transactionId:
              transaction.id
                ? String(transaction.id)
                : reference,
            paidAt,
          },
        });

        await tx.admissionApplication.update({
          where: {
            id: currentApplication.id,
          },
          data: {
            status: 'PAID',
            paidAt,
          },
        });
      }
    );

    return Response.json({
      received: true,
      success: true,
      applicationId:
        payment.applicationId,
      applicationNumber:
        payment.application.applicationNumber,
      reference,
      status: 'PAID',
    });
  } catch (error) {
    console.error(
      'Admission Paystack webhook error:',
      error
    );

    return Response.json(
      {
        success: false,
        error:
          'Admission Paystack webhook failed.',
      },
      { status: 500 }
    );
  }
}
