import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY is missing.'
    );
  }

  return new Stripe(key);
}

export async function POST(request) {
  try {
    const body = await request.json();

    const sessionId =
      typeof body.sessionId === 'string'
        ? body.sessionId.trim()
        : '';

    if (!sessionId) {
      return json(
        {
          success: false,
          error:
            'Stripe session ID is required.',
        },
        400
      );
    }

    const stripe =
      getStripe();

    const session =
      await stripe.checkout.sessions.retrieve(
        sessionId
      );

    if (
      session.payment_status !== 'paid'
    ) {
      return json(
        {
          success: false,
          error:
            'Stripe payment has not been completed.',
        },
        400
      );
    }

    const applicationId =
      session.metadata?.admissionApplicationId ||
      session.metadata?.applicationId;

    if (!applicationId) {
      return json(
        {
          success: false,
          error:
            'Admission application ID is missing from Stripe session.',
        },
        400
      );
    }

    const application =
      await prisma.admissionApplication.findUnique({
        where: {
          id: applicationId,
        },

        include: {
          payment: true,
        },
      });

    if (!application) {
      return json(
        {
          success: false,
          error:
            'Admission application not found.',
        },
        404
      );
    }

    const amountReceived =
      Number(session.amount_total || 0) / 100;

    const expectedAmount =
      Number(application.admissionFee);

    const currency =
      String(
        session.currency || ''
      ).toUpperCase();

    if (
      currency !==
      String(
        application.currencyCode
      ).toUpperCase()
    ) {
      return json(
        {
          success: false,
          error:
            'Payment currency does not match the admission fee.',
        },
        409
      );
    }

    if (
      !Number.isFinite(amountReceived) ||
      Math.abs(
        amountReceived -
          expectedAmount
      ) > 0.001
    ) {
      return json(
        {
          success: false,
          error:
            'Payment amount does not match the admission fee.',
        },
        409
      );
    }

    const paymentIntent =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : null;

    const paidAt =
      new Date();

    const result =
      await prisma.$transaction(
        async (tx) => {
          const currentApplication =
            await tx.admissionApplication.findUnique({
              where: {
                id: application.id,
              },
            });

          if (!currentApplication) {
            throw new Error(
              'Admission application not found.'
            );
          }

          if (
            currentApplication.status ===
            'PAID'
          ) {
            return currentApplication;
          }

          await tx.admissionPayment.update({
            where: {
              applicationId:
                currentApplication.id,
            },

            data: {
              status:
                'PAID',

              gatewayReference:
                session.id,

              checkoutReference:
                session.id,

              transactionId:
                paymentIntent,

              paidAt,
            },
          });

          return tx.admissionApplication.update({
            where: {
              id:
                currentApplication.id,
            },

            data: {
              status:
                'PAID',

              paidAt,
            },
          });
        }
      );

    return json({
      success: true,

      data: {
        applicationId:
          result.id,

        applicationNumber:
          result.applicationNumber,

        amount:
          expectedAmount,

        currency:
          currency,

        paymentStatus:
          'PAID',

        paidAt:
          result.paidAt,
      },
    });
  } catch (error) {
    console.error(
      'Admission Stripe verification error:',
      error
    );

    return json(
      {
        success: false,
        error:
          error?.message ||
          'Unable to verify Stripe payment.',
      },
      500
    );
  }
}
