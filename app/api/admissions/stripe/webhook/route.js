import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
    const stripe =
      getStripe();

    const webhookSecret =
      process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error(
        'STRIPE_WEBHOOK_SECRET is missing.'
      );
    }

    const body =
      await request.text();

    const signature =
      request.headers.get(
        'stripe-signature'
      );

    if (!signature) {
      return Response.json(
        {
          success: false,
          error:
            'Missing Stripe signature.',
        },
        { status: 400 }
      );
    }

    let event;

    try {
      event =
        stripe.webhooks.constructEvent(
          body,
          signature,
          webhookSecret
        );
    } catch (error) {
      console.error(
        'Admission Stripe webhook signature verification failed:',
        error
      );

      return Response.json(
        {
          success: false,
          error:
            'Invalid webhook signature.',
        },
        { status: 400 }
      );
    }

    if (
      event.type !==
      'checkout.session.completed'
    ) {
      return Response.json({
        received: true,
        ignored: true,
      });
    }

    const session =
      event.data.object;

    if (
      session.payment_status !==
      'paid'
    ) {
      return Response.json({
        received: true,
        ignored: true,
      });
    }

    const applicationId =
      session.metadata
        ?.admissionApplicationId ||
      session.metadata
        ?.applicationId;

    if (!applicationId) {
      return Response.json(
        {
          success: false,
          error:
            'Admission application ID is missing from Stripe metadata.',
        },
        { status: 400 }
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
      console.error(
        'ADMISSION APPLICATION NOT FOUND:',
        applicationId
      );

      return Response.json(
        {
          success: false,
          error:
            'Admission application not found.',
        },
        { status: 404 }
      );
    }

    if (
      application.status ===
      'PAID'
    ) {
      return Response.json({
        received: true,
        success: true,
        alreadyProcessed: true,
        applicationId:
          application.id,
      });
    }

    const stripeCurrency =
      String(
        session.currency || ''
      ).toUpperCase();

    const expectedCurrency =
      String(
        application.currencyCode || ''
      ).toUpperCase();

    if (
      stripeCurrency !==
      expectedCurrency ||
      stripeCurrency !== 'USD'
    ) {
      console.error(
        'ADMISSION STRIPE CURRENCY MISMATCH:',
        {
          applicationId,
          stripeCurrency,
          expectedCurrency,
        }
      );

      return Response.json(
        {
          success: false,
          error:
            'Payment currency does not match the admission application.',
        },
        { status: 409 }
      );
    }

    const expectedAmount =
      Math.round(
        Number(
          application.admissionFee
        ) * 100
      );

    const receivedAmount =
      Number(
        session.amount_total
      );

    if (
      !Number.isFinite(
        expectedAmount
      ) ||
      expectedAmount <= 0 ||
      !Number.isFinite(
        receivedAmount
      ) ||
      receivedAmount !==
        expectedAmount
    ) {
      console.error(
        'ADMISSION STRIPE AMOUNT MISMATCH:',
        {
          applicationId,
          expectedAmount,
          receivedAmount,
        }
      );

      return Response.json(
        {
          success: false,
          error:
            'Payment amount does not match the admission fee.',
        },
        { status: 409 }
      );
    }

    const paymentIntent =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : null;

    const paidAt =
      new Date();

    await prisma.$transaction(
      async (tx) => {
        const current =
          await tx.admissionApplication.findUnique({
            where: {
              id: application.id,
            },
          });

        if (!current) {
          throw new Error(
            'Admission application not found.'
          );
        }

        if (
          current.status ===
          'PAID'
        ) {
          return;
        }

        await tx.admissionPayment.update({
          where: {
            applicationId:
              current.id,
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

        await tx.admissionApplication.update({
          where: {
            id:
              current.id,
          },

          data: {
            status:
              'PAID',

            paidAt,
          },
        });
      }
    );

    return Response.json({
      received: true,
      success: true,
      applicationId:
        application.id,
      applicationNumber:
        application.applicationNumber,
    });
  } catch (error) {
    console.error(
      'Admission Stripe webhook error:',
      error
    );

    return Response.json(
      {
        success: false,
        error:
          error?.message ||
          'Admission Stripe webhook failed.',
      },
      { status: 500 }
    );
  }
}
