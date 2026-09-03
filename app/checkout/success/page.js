import Link from 'next/link';
import { redirect } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

import PaystackVerification from './PaystackVerification';

export const dynamic = 'force-dynamic';

function formatAmount(total, currency) {
  const amount = Number(total);

  if (!Number.isFinite(amount)) {
    return '0.00';
  }

  const code = String(currency || 'USD').toUpperCase();

  const symbol =
    code === 'GHS'
      ? 'GH₵'
      : '$';

  return `${symbol}${amount.toFixed(2)}`;
}

function formatOrderStatus(status) {
  return String(status || 'ORDER_PLACED')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

export default async function CheckoutSuccessPage({
  searchParams,
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/account?next=/checkout');
  }

  const params = await searchParams;

  const orderId =
    params?.order_id || null;

  const sessionId =
    params?.session_id || null;

  let order = null;

  if (orderId) {
    order =
      await prisma.order.findFirst({
        where: {
          id: orderId,
          userId: user.id,
        },

        include: {
          payments: true,
        },
      });
  }

  if (!order && sessionId) {
    order =
      await prisma.order.findFirst({
        where: {
          userId: user.id,
          paymentRef: sessionId,
        },

        include: {
          payments: true,
        },
      });
  }

  const paymentStatus =
    String(
      order?.paymentStatus ||
        'PENDING'
    ).toUpperCase();

  const orderStatus =
    String(
      order?.status ||
        'ORDER_PLACED'
    ).toUpperCase();

  const paymentMethod =
    String(
      order?.paymentMethod ||
        ''
    ).toUpperCase();

  const isPaid =
    paymentStatus === 'PAID';

  const isApproved =
    [
      'APPROVED',
      'ACTIVATED',
      'COMPLETED',
    ].includes(orderStatus);

  const isPaystack =
    paymentMethod ===
      'MTN_MOBILE_MONEY' ||
    paymentMethod ===
      'TELECEL_CASH' ||
    paymentMethod ===
      'AIRTEL_TIGO_MONEY';

  return (
    <main style={page}>
      <div
        style={card}
        className="ilmhub-success-card"
      >

        <div
          style={
            isPaid
              ? successIcon
              : pendingIcon
          }
          aria-hidden="true"
        >
          {isPaid ? '✓' : ''}
        </div>

        <div style={eyebrow}>
          ILM-HUB BOOKSTORE
        </div>

        <h1 style={title}>
          {isPaid
            ? 'Payment Received'
            : 'Payment Processing'}
        </h1>

        <p style={subtitle}>
          {isPaid
            ? 'Your payment has been successfully received and your order has been recorded.'
            : 'Your payment is being confirmed by the payment provider.'}
        </p>

        {order &&
          isPaystack &&
          !isPaid && (
            <PaystackVerification
              orderId={order.id}
            />
          )}

        {order ? (
          <div style={orderBox}>

            <div style={row}>
              <span style={label}>
                Order Number
              </span>

              <strong style={value}>
                {order.orderNumber}
              </strong>
            </div>

            <div style={divider} />

            <div style={row}>
              <span style={label}>
                Amount
              </span>

              <strong style={amount}>
                {formatAmount(
                  isPaid
                    ? order.paidAmount
                    : order.currencyCode === 'GHS'
                      ? Number(order.totalUSD) *
                        Number(order.exchangeRate)
                      : order.totalUSD,
                  order.currencyCode
                )}
              </strong>
            </div>

            <div style={divider} />

            <div style={row}>
              <span style={label}>
                Currency
              </span>

              <strong style={value}>
                {String(
                  order.currencyCode
                ).toUpperCase()}
              </strong>
            </div>

            <div style={divider} />

            <div style={row}>
              <span style={label}>
                Payment Status
              </span>

              <span
                style={
                  isPaid
                    ? paidBadge
                    : pendingBadge
                }
              >
                {isPaid
                  ? 'PAID'
                  : paymentStatus}
              </span>
            </div>

            <div style={divider} />

            <div style={row}>
              <span style={label}>
                Order Status
              </span>

              <strong
                style={
                  isApproved
                    ? approvedValue
                    : pendingValue
                }
              >
                {formatOrderStatus(
                  orderStatus
                )}
              </strong>
            </div>

          </div>
        ) : (
          <div style={notice}>
            <div style={noticeIcon}>
              ✓
            </div>

            <div>
              <strong>
                Your payment was submitted.
              </strong>

              <p>
                We are locating your order
                and confirming the payment.
              </p>
            </div>
          </div>
        )}

        <div style={importantBox}>
          <div style={importantTitle}>
            What happens next?
          </div>

          {isPaid ? (
            <>
              <p>
                Your payment has been
                confirmed successfully.
              </p>

              {!isApproved && (
                <p>
                  Your order is now awaiting
                  administrative approval.
                  Once approved, your purchased
                  books will become available
                  in your dashboard.
                </p>
              )}

              {isApproved && (
                <p>
                  Your order has been approved.
                  Your purchased books should
                  now be available from your
                  dashboard.
                </p>
              )}
            </>
          ) : (
            <>
              <p>
                Please allow a short time for
                the payment provider to confirm
                your payment.
              </p>

              <p>
                You can safely leave this page.
                Your order will update once
                payment confirmation is received.
              </p>
            </>
          )}
        </div>

        <div style={trustLine}>
          <span style={trustDot} />
          Secure order processing
        </div>

        <div style={actions}>
          <Link
            href="/dashboard"
            style={primaryButton}
          >
            Go to My Dashboard
          </Link>

          <Link
            href="/bookstore"
            style={secondaryButton}
          >
            Continue Shopping
          </Link>
        </div>

        <div style={footerText}>
          Ilm-Hub Institute
          <span> • </span>
          Knowledge is a trust. Character is its companion.
        </div>

        <style>{`
          @keyframes ilmhub-spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 640px) {
            .ilmhub-success-card {
              padding: 30px 20px !important;
              border-radius: 20px !important;
            }
          }
        `}</style>

      </div>
    </main>
  );
}

const page = {
  minHeight: '100vh',
  minHeight: '100dvh',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  padding: '40px 20px',

  background:
    'linear-gradient(135deg, #f0fdf4 0%, #ffffff 48%, #ecfdf5 100%)',

  position: 'relative',
  overflow: 'hidden',
};

const card = {
  width: '100%',
  maxWidth: '680px',

  margin: '0 auto',

  background: '#ffffff',

  border: '1px solid #d1fae5',
  borderRadius: '24px',

  padding: '44px',

  boxShadow:
    '0 24px 70px rgba(6, 78, 59, 0.12)',

  textAlign: 'center',

  position: 'relative',
  zIndex: 1,
};

const eyebrow = {
  marginBottom: '9px',

  color: '#166534',

  fontSize: '11px',
  fontWeight: '800',

  letterSpacing: '0.18em',

  textTransform: 'uppercase',
};

const successIcon = {
  width: '78px',
  height: '78px',

  margin: '0 auto 22px',

  borderRadius: '50%',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  background:
    'linear-gradient(135deg, #166534, #16a34a)',

  color: '#ffffff',

  fontSize: '38px',
  fontWeight: '800',

  boxShadow:
    '0 10px 30px rgba(22, 101, 52, 0.25)',
};

const pendingIcon = {
  width: '78px',
  height: '78px',

  margin: '0 auto 22px',

  borderRadius: '50%',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  background: '#ecfdf5',

  color: '#15803d',

  fontSize: '0',

  border: '5px solid #bbf7d0',

  borderTopColor: '#15803d',

  animation:
    'ilmhub-spin 1s linear infinite',

  boxSizing: 'border-box',
};

const title = {
  margin: '0 0 10px',

  fontSize: '32px',
  lineHeight: 1.2,
  fontWeight: '800',

  color: '#14532d',

  letterSpacing: '-0.02em',
};

const subtitle = {
  maxWidth: '500px',

  margin: '0 auto 30px',

  color: '#4b5563',

  lineHeight: 1.7,

  fontSize: '15px',
};

const orderBox = {
  width: '100%',

  border: '1px solid #d1fae5',
  borderRadius: '16px',

  padding: '0 20px',

  marginBottom: '24px',

  background: '#fafffc',

  textAlign: 'left',

  boxSizing: 'border-box',
};

const row = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  gap: '30px',

  padding: '16px 0',

  fontSize: '14px',
};

const divider = {
  height: '1px',

  background: '#dcfce7',
};

const label = {
  color: '#6b7280',

  fontSize: '12px',
  fontWeight: '600',

  whiteSpace: 'nowrap',
};

const value = {
  color: '#14532d',

  fontSize: '15px',
  fontWeight: '700',

  textAlign: 'right',

  marginLeft: 'auto',

  overflowWrap: 'anywhere',
};

const amount = {
  color: '#166534',

  fontSize: '21px',
  fontWeight: '800',

  textAlign: 'right',

  marginLeft: 'auto',
};

const paidBadge = {
  display: 'inline-flex',
  alignItems: 'center',

  padding: '5px 10px',

  borderRadius: '999px',

  background: '#dcfce7',
  color: '#166534',

  fontSize: '12px',
  fontWeight: '800',

  letterSpacing: '0.04em',

  marginLeft: 'auto',
};

const approvedValue = {
  display: 'inline-flex',
  alignItems: 'center',

  padding: '5px 10px',

  borderRadius: '999px',

  background: '#dcfce7',
  color: '#166534',

  fontSize: '12px',
  fontWeight: '800',

  marginLeft: 'auto',
};

const pendingBadge = {
  display: 'inline-flex',
  alignItems: 'center',

  padding: '5px 10px',

  borderRadius: '999px',

  background: '#fef3c7',
  color: '#92400e',

  fontSize: '12px',
  fontWeight: '800',

  marginLeft: 'auto',
};

const pendingValue = {
  color: '#92400e',

  fontSize: '13px',
  fontWeight: '800',

  textAlign: 'right',

  marginLeft: 'auto',
};

const notice = {
  padding: '20px',

  background: '#f0fdf4',

  border: '1px solid #bbf7d0',

  borderRadius: '14px',

  marginBottom: '24px',

  color: '#365314',

  textAlign: 'left',

  lineHeight: 1.6,
};

const noticeIcon = {
  width: '32px',
  height: '32px',

  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',

  marginRight: '12px',

  borderRadius: '50%',

  background: '#dcfce7',
  color: '#166534',

  fontWeight: '800',
};

const importantBox = {
  padding: '20px',

  background:
    'linear-gradient(135deg, #f0fdf4, #ecfdf5)',

  border: '1px solid #bbf7d0',

  borderRadius: '14px',

  marginBottom: '28px',

  color: '#166534',

  lineHeight: 1.7,

  textAlign: 'left',
};

const importantTitle = {
  marginBottom: '8px',

  color: '#166534',

  fontSize: '15px',
  fontWeight: '800',
};

const trustLine = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  gap: '8px',

  marginBottom: '19px',

  color: '#6b7280',

  fontSize: '12px',
};

const trustDot = {
  width: '7px',
  height: '7px',

  borderRadius: '50%',

  background: '#16a34a',

  boxShadow:
    '0 0 0 4px rgba(22, 163, 74, 0.10)',
};

const actions = {
  display: 'flex',

  justifyContent: 'center',

  flexWrap: 'wrap',

  gap: '12px',
};

const primaryButton = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',

  minHeight: '48px',

  padding: '12px 22px',

  borderRadius: '10px',

  background:
    'linear-gradient(135deg, #166534, #15803d)',

  color: '#ffffff',

  textDecoration: 'none',

  fontWeight: '700',

  boxShadow:
    '0 6px 18px rgba(22, 101, 52, 0.2)',

  transition:
    'transform 0.2s ease, box-shadow 0.2s ease',
};

const secondaryButton = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',

  minHeight: '48px',

  padding: '12px 22px',

  borderRadius: '10px',

  background: '#ffffff',

  color: '#166534',

  textDecoration: 'none',

  fontWeight: '700',

  border: '1px solid #86efac',

  transition:
    'background 0.2s ease, transform 0.2s ease',
};

const footerText = {
  marginTop: '26px',

  paddingTop: '18px',

  borderTop:
    '1px solid #dcfce7',

  color: '#6b7280',

  fontSize: '11px',

  lineHeight: 1.6,

  textAlign: 'center',
};
