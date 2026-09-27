export const dynamic = 'force-dynamic';

// The Media SUBSCRIBE SUCCESS page -- lands here after either gateway:
// Paystack's callback_url and Stripe's success_url (see
// app/api/media/subscribe/route.js) both point here with
// ?subscription_id=... ; Stripe additionally appends
// &session_id={CHECKOUT_SESSION_ID}. Mirrors the shape of
// app/checkout/success/page.js (Bookstore's own success page) but for
// a UserMediaSubscription instead of an Order, and flows through to
// the Media-only dashboard (/account/media) per the explicit
// instruction: "the success page appears then bring him to the
// dashboard where he can see his orders."
//
// IMPORTANT: /api/media/subscribe/verify looks a subscription up by
// its paymentRef (called "reference" in that route), not by
// subscriptionId. The Paystack callback_url only carries
// subscription_id, so this page reads the subscription server-side
// first to recover its stored paymentRef, then hands that reference
// to the client verification component to poll with -- same
// reference value already stored server-side, never trusted from
// query params alone.
//
// Per the institute's standing business rule (see
// app/api/media/subscribe/verify/route.js and
// app/api/admin/media/subscribers/[id]/activate/route.js), payment
// confirmation never auto-activates a subscription -- an admin must
// still manually review and release access. This page reflects that
// honestly: "payment confirmed" is a different, and here always
// earlier, state than "access granted."

import Link from 'next/link';
import { redirect } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

import MediaSubscriptionVerification from './MediaSubscriptionVerification';

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

export default async function MediaSubscribeSuccessPage({ searchParams }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/account?next=/media');
  }

  const params = await searchParams;
  const subscriptionId = params?.subscription_id || null;
  const sessionId = params?.session_id || null;

  let subscription = null;

  if (subscriptionId) {
    subscription = await prisma.userMediaSubscription.findFirst({
      where: { id: subscriptionId, userId: user.id },
      include: { plan: true },
    });
  }

  if (!subscription && sessionId) {
    subscription = await prisma.userMediaSubscription.findFirst({
      where: { userId: user.id, paymentRef: sessionId },
      include: { plan: true },
    });
  }

  const status = String(subscription?.status || 'PENDING').toUpperCase();
  const isPaid = subscription?.paidAmount != null;
  const isActive = status === 'ACTIVE';
  const reference = subscription?.paymentRef || null;

  return (
    <main style={page}>
      <div style={card} className="ilmhub-msub-success-card">
        <div style={isPaid ? successIcon : pendingIcon} aria-hidden="true">
          {isPaid ? '✓' : ''}
        </div>

        <div style={eyebrow}>ULUL AZM MEDIA</div>

        <h1 style={title}>
          {isPaid ? 'Payment Received' : 'Payment Processing'}
        </h1>

        <p style={subtitle}>
          {isPaid
            ? 'Your payment has been successfully received and recorded against your subscription.'
            : 'Your payment is being confirmed by the payment provider.'}
        </p>

        {subscription && !isPaid && reference && (
          <MediaSubscriptionVerification reference={reference} />
        )}

        {subscription ? (
          <div style={box}>
            <div style={row}>
              <span style={label}>Plan</span>
              <strong style={value}>{subscription.plan.name}</strong>
            </div>

            <div style={divider} />

            <div style={row}>
              <span style={label}>Amount</span>
              <strong style={amount}>
                ${Number(subscription.plan.priceUSD).toFixed(2)}
              </strong>
            </div>

            <div style={divider} />

            <div style={row}>
              <span style={label}>Duration</span>
              <strong style={value}>{subscription.plan.durationDays} days</strong>
            </div>

            <div style={divider} />

            <div style={row}>
              <span style={label}>Payment Status</span>
              <span style={isPaid ? paidBadge : pendingBadge}>
                {isPaid ? 'PAID' : 'AWAITING CONFIRMATION'}
              </span>
            </div>

            <div style={divider} />

            <div style={row}>
              <span style={label}>Subscription Status</span>
              <strong style={isActive ? approvedValue : pendingValue}>
                {isActive ? 'Active' : 'Awaiting Admin Approval'}
              </strong>
            </div>

            {isActive && subscription.expiresAt && (
              <>
                <div style={divider} />
                <div style={row}>
                  <span style={label}>Renews / Expires</span>
                  <strong style={value}>{formatDate(subscription.expiresAt)}</strong>
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={notice}>
            <div style={noticeIcon}>✓</div>
            <div>
              <strong>Your payment was submitted.</strong>
              <p>We are locating your subscription and confirming the payment.</p>
            </div>
          </div>
        )}

        <div style={importantBox}>
          <div style={importantTitle}>What happens next?</div>

          {isPaid ? (
            <>
              <p>Your payment has been confirmed successfully.</p>
              {!isActive && (
                <p>
                  Your subscription is now awaiting administrative approval.
                  Once approved, subscriber-only Media content will become
                  available from your Media account.
                </p>
              )}
              {isActive && (
                <p>
                  Your subscription is active. Subscriber-only Media content
                  is now available from your Media account.
                </p>
              )}
            </>
          ) : (
            <>
              <p>Please allow a short time for the payment provider to confirm your payment.</p>
              <p>You can safely leave this page. Your subscription will update once payment confirmation is received.</p>
            </>
          )}
        </div>

        <div style={trustLine}>
          <span style={trustDot} />
          Secure payment processing
        </div>

        <div style={actions}>
          <Link href="/account/media" style={primaryButton}>
            Go to My Media Account
          </Link>

          <Link href="/media" style={secondaryButton}>
            Browse Media
          </Link>
        </div>

        <div style={footerText}>
          Ulul Azm Media
          <span> • </span>
          Knowledge is a trust. Character is its companion.
        </div>

        <style>{`
          @keyframes ilmhub-msub-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @media (max-width: 640px) {
            .ilmhub-msub-success-card {
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
  background: 'linear-gradient(135deg, #fdf4f0 0%, #ffffff 48%, #fdf0ec 100%)',
  position: 'relative',
  overflow: 'hidden',
};

const card = {
  width: '100%',
  maxWidth: '680px',
  margin: '0 auto',
  background: '#ffffff',
  border: '1px solid #fde1d3',
  borderRadius: '24px',
  padding: '44px',
  boxShadow: '0 24px 70px rgba(124, 45, 18, 0.12)',
  textAlign: 'center',
  position: 'relative',
  zIndex: 1,
};

const eyebrow = {
  marginBottom: '9px',
  color: '#9a3412',
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
  background: 'linear-gradient(135deg, #9a3412, #ea580c)',
  color: '#ffffff',
  fontSize: '38px',
  fontWeight: '800',
  boxShadow: '0 10px 30px rgba(154, 52, 18, 0.25)',
};

const pendingIcon = {
  width: '78px',
  height: '78px',
  margin: '0 auto 22px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#fff7ed',
  color: '#c2410c',
  fontSize: '0',
  border: '5px solid #fed7aa',
  borderTopColor: '#c2410c',
  animation: 'ilmhub-msub-spin 1s linear infinite',
  boxSizing: 'border-box',
};

const title = {
  margin: '0 0 10px',
  fontSize: '32px',
  lineHeight: 1.2,
  fontWeight: '800',
  color: '#7c2d12',
  letterSpacing: '-0.02em',
};

const subtitle = {
  maxWidth: '500px',
  margin: '0 auto 30px',
  color: '#4b5563',
  lineHeight: 1.7,
  fontSize: '15px',
};

const box = {
  width: '100%',
  border: '1px solid #fde1d3',
  borderRadius: '16px',
  padding: '0 20px',
  marginBottom: '24px',
  background: '#fffaf7',
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
  background: '#fde1d3',
};

const label = {
  color: '#6b7280',
  fontSize: '12px',
  fontWeight: '600',
  whiteSpace: 'nowrap',
};

const value = {
  color: '#7c2d12',
  fontSize: '15px',
  fontWeight: '700',
  textAlign: 'right',
  marginLeft: 'auto',
  overflowWrap: 'anywhere',
};

const amount = {
  color: '#9a3412',
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
  background: '#ffedd5',
  color: '#9a3412',
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
  background: '#ffedd5',
  color: '#9a3412',
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
  background: '#fff7ed',
  border: '1px solid #fed7aa',
  borderRadius: '14px',
  marginBottom: '24px',
  color: '#7c2d12',
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
  background: '#ffedd5',
  color: '#9a3412',
  fontWeight: '800',
};

const importantBox = {
  padding: '20px',
  background: 'linear-gradient(135deg, #fff7ed, #fdf0ec)',
  border: '1px solid #fed7aa',
  borderRadius: '14px',
  marginBottom: '28px',
  color: '#9a3412',
  lineHeight: 1.7,
  textAlign: 'left',
};

const importantTitle = {
  marginBottom: '8px',
  color: '#9a3412',
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
  background: '#ea580c',
  boxShadow: '0 0 0 4px rgba(234, 88, 12, 0.10)',
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
  background: 'linear-gradient(135deg, #9a3412, #c2410c)',
  color: '#ffffff',
  textDecoration: 'none',
  fontWeight: '700',
  boxShadow: '0 6px 18px rgba(154, 52, 18, 0.2)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
};

const secondaryButton = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '48px',
  padding: '12px 22px',
  borderRadius: '10px',
  background: '#ffffff',
  color: '#9a3412',
  textDecoration: 'none',
  fontWeight: '700',
  border: '1px solid #fdba8c',
  transition: 'background 0.2s ease, transform 0.2s ease',
};

const footerText = {
  marginTop: '26px',
  paddingTop: '18px',
  borderTop: '1px solid #fde1d3',
  color: '#6b7280',
  fontSize: '11px',
  lineHeight: 1.6,
  textAlign: 'center',
};
