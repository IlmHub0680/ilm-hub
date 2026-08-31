import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAYSTACK_CURRENCY = 'GHS';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is missing.');
  }

  return new Stripe(key);
}

function getPaystackSecret() {
  const key = process.env.PAYSTACK_SECRET_KEY;

  if (!key) {
    throw new Error('PAYSTACK_SECRET_KEY is missing.');
  }

  return key;
}

function getPaystackExchangeRate() {
  const rate = Number(process.env.PAYSTACK_USD_GHS_RATE);

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error(
      'PAYSTACK_USD_GHS_RATE is missing or invalid.'
    );
  }

  return rate;
}

async function getAuthenticatedUser() {
  return getCurrentUser();
}

function generateOrderNumber() {
  return `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}

function generatePaymentReference() {
  return `PAY-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 10)
    .toUpperCase()}`;
}

function normalizePaymentMethod(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

  if (
    [
      'stripe',
      'visa',
      'mastercard',
      'master_card',
      'card',
      'credit_card',
      'debit_card',
    ].includes(normalized)
  ) {
    return 'stripe';
  }

  if (
    [
      'paystack',
      'momo',
      'mobile_money',
      'mobilemoney',
      'mtn',
      'mtn_momo',
      'mtn_mobile_money',
      'telecel',
      'telecel_cash',
      'telecel_money',
      'vodafone_cash',
      'airtel',
      'airteltigo',
      'airtel_tigo',
      'airtel_tigo_money',
      'airtelmoney',
    ].includes(normalized)
  ) {
    return 'paystack';
  }

  return null;
}

function toDecimal(value) {
  return Number(value.toFixed(2));
}


export async function GET() {
  try {
    return Response.json({
      success: true,
      paymentMethods: {
        stripe: {
          currency: 'USD',
        },
        paystack: {
          currency: PAYSTACK_CURRENCY,
          usdToGhsRate: getPaystackExchangeRate(),
        },
      },
    });
  } catch (error) {
    console.error('CHECKOUT CONFIG ERROR:', error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to load checkout configuration.',
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  let createdOrderId = null;

  try {
    const user =
  await getAuthenticatedUser();


    if (!user) {
      return Response.json(
        {
          success: false,
          error: 'Authentication required.',
        },
        { status: 401 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (!dbUser) {
      return Response.json(
        {
          success: false,
          error: 'User account was not found.',
        },
        { status: 404 }
      );
    }

    const body = await request.json();

    const items = Array.isArray(body?.items)
      ? body.items
      : [];

    const paymentMethod = normalizePaymentMethod(
      body?.paymentMethod
    );

    if (!paymentMethod) {
      return Response.json(
        {
          success: false,
          error: 'Unsupported payment method.',
        },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return Response.json(
        {
          success: false,
          error: 'Your cart is empty.',
        },
        { status: 400 }
      );
    }

    const normalizedItems = items
      .map((item) => ({
        id: String(item?.id || '').trim(),
        quantity: Math.max(
          1,
          Math.floor(Number(item?.quantity) || 1)
        ),
      }))
      .filter((item) => item.id);

    if (normalizedItems.length === 0) {
      return Response.json(
        {
          success: false,
          error: 'No valid books were provided.',
        },
        { status: 400 }
      );
    }

    const bookIds = [
      ...new Set(
        normalizedItems.map((item) => item.id)
      ),
    ];

    const books = await prisma.book.findMany({
      where: {
        id: {
          in: bookIds,
        },
      },
      select: {
        id: true,
        titleEn: true,
        titleAr: true,
        descriptionEn: true,
        descriptionAr: true,
        priceUSD: true,
        coverImageUrl: true,
      },
    });

    const bookMap = new Map(
      books.map((book) => [
        String(book.id),
        book,
      ])
    );

    const missingIds = bookIds.filter(
      (id) => !bookMap.has(id)
    );

    if (missingIds.length > 0) {
      return Response.json(
        {
          success: false,
          error:
            'One or more books could not be found.',
          missingBookIds: missingIds,
        },
        { status: 404 }
      );
    }

    let totalUSD = 0;

    const orderItems = normalizedItems.map((item) => {
      const book = bookMap.get(item.id);

      const price = Number(book.priceUSD);

      if (!Number.isFinite(price) || price < 0) {
        throw new Error(
          `Invalid price for book "${book.titleEn}".`
        );
      }

      totalUSD += price * item.quantity;

      return {
        bookId: book.id,
        priceUSD: toDecimal(price),
        quantity: item.quantity,
      };
    });

    totalUSD = toDecimal(totalUSD);

    if (totalUSD <= 0) {
      return Response.json(
        {
          success: false,
          error: 'Invalid order total.',
        },
        { status: 400 }
      );
    }

    let paymentCurrency = 'USD';
    let paymentAmount = totalUSD;
    let exchangeRate = 1;
    let gateway = 'STRIPE';
    let method = 'VISA';

    if (paymentMethod === 'paystack') {
      exchangeRate = getPaystackExchangeRate();

      paymentCurrency = PAYSTACK_CURRENCY;

      paymentAmount = toDecimal(
        totalUSD * exchangeRate
      );

      gateway = 'PAYSTACK';
      method = 'MTN_MOBILE_MONEY';
    }

    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        userId: dbUser.id,
        orderNumber,

        totalUSD: totalUSD,
        paidAmount: 0,
        currencyCode: paymentCurrency,
        exchangeRate,

        status: 'ORDER_PLACED',
        paymentMethod: method,
        paymentGateway: gateway,
        paymentStatus: 'PENDING',

        items: {
          create: orderItems.map((item) => ({
            bookId: item.bookId,
            priceUSD: item.priceUSD,
            quantity: item.quantity,
          })),
        },

        payments: {
          create: {
            gateway,
            method,
            status: 'PENDING',
            amount: paymentAmount,
            currencyCode: paymentCurrency,
            exchangeRate,
          },
        },
      },

      include: {
        payments: true,
        items: true,
      },
    });

    createdOrderId = order.id;

    const payment = order.payments[0];

    if (!payment) {
      throw new Error(
        'Unable to create payment record.'
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL;

    if (!appUrl) {
      throw new Error(
        'NEXT_PUBLIC_APP_URL is missing.'
      );
    }

    /*
     * ========================================================
     * PAYSTACK
     * ========================================================
     */

    if (paymentMethod === 'paystack') {
      const reference =
        generatePaymentReference();

      await prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          gatewayReference: reference,
          checkoutReference: reference,
        },
      });

      const response = await fetch(
        'https://api.paystack.co/transaction/initialize',
        {
          method: 'POST',
          headers: {
            Authorization:
              `Bearer ${getPaystackSecret()}`,
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            email: user.email,

            amount: Math.round(
              paymentAmount * 100
            ),

            currency:
              paymentCurrency,

            reference,

            callback_url:
              `${appUrl}/checkout/success?order_id=${encodeURIComponent(
                order.id
              )}`,

            metadata: {
              orderId: order.id,
              orderNumber,
              userId: dbUser.id,
              paymentId: payment.id,
              paymentMethod: 'paystack',
              originalUSD: totalUSD,
              exchangeRate,
            },
          }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data?.status ||
        !data?.data
      ) {
        console.error(
          'PAYSTACK INITIALIZATION FAILED:',
          data
        );

        await prisma.payment.update({
          where: {
            id: payment.id,
          },
          data: {
            status: 'FAILED',
          },
        });

        await prisma.order.update({
          where: {
            id: order.id,
          },
          data: {
            paymentStatus: 'FAILED',
            status: 'REJECTED',
          },
        });

        return Response.json(
          {
            success: false,
            error:
              data?.message ||
              'Unable to initialize Paystack payment.',
          },
          { status: 400 }
        );
      }

      const paystackReference =
        String(
          data.data.reference || reference
        ).trim();

      const authorizationUrl =
        data.data.authorization_url;

      if (!paystackReference) {
        throw new Error(
          'Paystack did not return a transaction reference.'
        );
      }

      await prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          gatewayReference:
            paystackReference,
          checkoutReference:
            paystackReference,
          authorizationUrl,
        },
      });

      await prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          paymentRef:
            paystackReference,
        },
      });

      return Response.json({
        success: true,
        provider: 'paystack',
        paymentMethod: 'paystack',

        orderId: order.id,
        orderNumber,

        paymentId: payment.id,

        reference:
          paystackReference,

        authorizationUrl,

        accessCode:
          data.data.access_code,

        url:
          authorizationUrl,

        currency:
          paymentCurrency,

        amount:
          paymentAmount,
      });
    }

    /*
     * ========================================================
     * STRIPE
     * ========================================================
     */

    if (paymentMethod === 'stripe') {
      const stripe = getStripe();

      const stripeLineItems =
        orderItems.map((item) => {
          const book =
            bookMap.get(item.bookId);

          return {
            quantity:
              item.quantity,

            price_data: {
              currency: 'usd',

              unit_amount:
                Math.round(
                  item.priceUSD * 100
                ),

              product_data: {
                name:
                  book.titleEn,

                description:
                  book.descriptionEn ||
                  book.titleAr ||
                  undefined,

                images:
                  book.coverImageUrl
                    ? [
                        book.coverImageUrl,
                      ]
                    : undefined,
              },
            },
          };
        });

      const session =
        await stripe.checkout.sessions.create({
          mode: 'payment',

          customer_email:
            user.email,

          line_items:
            stripeLineItems,

          success_url:
            `${appUrl}/checkout/success?order_id=${encodeURIComponent(
              order.id
            )}&session_id={CHECKOUT_SESSION_ID}`,

          cancel_url:
            `${appUrl}/checkout`,

          metadata: {
            orderId: order.id,
            orderNumber,
            userId: dbUser.id,
            paymentId: payment.id,
            paymentMethod: 'stripe',
          },
        });

      if (!session.id) {
        throw new Error(
          'Stripe did not return a session ID.'
        );
      }

      await prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          gatewayReference:
            session.id,

          checkoutReference:
            session.id,

          authorizationUrl:
            session.url,
        },
      });

      await prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          paymentRef:
            session.id,
        },
      });

      return Response.json({
        success: true,
        provider: 'stripe',
        paymentMethod: 'stripe',

        orderId: order.id,
        orderNumber,

        paymentId: payment.id,

        sessionId:
          session.id,

        url:
          session.url,

        currency:
          'USD',

        amount:
          totalUSD,
      });
    }

    throw new Error(
      'Unsupported payment method.'
    );
  } catch (error) {
    console.error(
      'CHECKOUT ERROR:',
      error
    );

    if (createdOrderId) {
      try {
        await prisma.order.update({
          where: {
            id: createdOrderId,
          },
          data: {
            paymentStatus: 'FAILED',
            status: 'REJECTED',
          },
        });
      } catch (cleanupError) {
        console.error(
          'CHECKOUT CLEANUP ERROR:',
          cleanupError
        );
      }
    }

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to start checkout.',
      },
      { status: 500 }
    );
  }
}
