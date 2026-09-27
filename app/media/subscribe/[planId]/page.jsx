export const dynamic = 'force-dynamic';

// The Media SUBSCRIBE REVIEW page -- price, terms/refund-policy
// acknowledgment, and a choice of payment method, before the visitor
// is sent to the gateway. Previously, clicking "Subscribe" on /media
// went straight to Paystack with no review step at all and no way to
// acknowledge the Terms of Use / Refund Policy first; this page (and
// its client half, SubscribeForm.jsx) is that missing review step,
// matching how Bookstore checkout already works (see
// app/checkout/page.jsx).
//
// Reached from /media's plan cards (see app/media/page.jsx's
// goToSubscribe()). A signed-out visitor is sent to sign in first,
// with ?next pointing back here so they land on the right plan
// afterward -- same pattern as app/account/bookstore and
// app/account/media.

import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import SiteHeader from '@/components/SiteHeader';
import SubscribeForm from './SubscribeForm';

export default async function MediaSubscribePage({ params }) {
  const { planId } = await params;

  const user = await getCurrentUser();

  if (!user) {
    redirect(`/account?next=${encodeURIComponent(`/media/subscribe/${planId}`)}`);
  }

  const plan = await prisma.mediaSubscriptionPlan.findUnique({
    where: { id: planId },
  });

  if (!plan || !plan.isActive) {
    notFound();
  }

  // If this account already has any subscription record (pending,
  // active, whatever), send them to their Media dashboard instead of
  // letting them start a second one -- same "Already Subscribed" guard
  // /media's plan card already shows.
  const existingSubscription = await prisma.userMediaSubscription.findFirst({
    where: { userId: user.id },
    orderBy: { startedAt: 'desc' },
  });

  const priceUSD = Number(plan.priceUSD);

  return (
    <>
      <SiteHeader sectionMode="media" />
      <main style={page}>
        <div style={container}>
          <Link href="/media#plans" style={back}>
            ← Back to Subscription Plans
          </Link>

          <h1 style={heading}>Subscribe to Media</h1>
          <p style={muted}>
            Review your plan, then choose how you'd like to pay.
          </p>

          {existingSubscription ? (
            <div style={noticeBox}>
              <h3 style={noticeTitle}>You already have a subscription on file</h3>
              <p style={noticeText}>
                Check its status, history, or renew it from your Media account.
              </p>
              <Link href="/account/media" style={noticeButton}>
                Go to My Media Account →
              </Link>
            </div>
          ) : (
            <div style={layout}>
              <div style={planSummary}>
                <div style={planSummaryLabel}>Selected Plan</div>
                <div style={planSummaryName}>{plan.name}</div>
                {plan.descriptionEn && (
                  <p style={planSummaryDesc}>{plan.descriptionEn}</p>
                )}
                <div style={planSummaryPrice}>
                  ${priceUSD.toFixed(2)}
                  <span style={planSummaryPeriod}> / {plan.durationDays} days</span>
                </div>
                <ul style={planSummaryList}>
                  <li>Unlocks every subscriber-only item in Media</li>
                  <li>Access begins once an administrator reviews and approves your payment</li>
                  <li>Manage or renew any time from your Media account</li>
                </ul>
              </div>

              <SubscribeForm
                plan={{
                  id: plan.id,
                  name: plan.name,
                  priceUSD,
                  durationDays: plan.durationDays,
                }}
                userEmail={user.email}
              />
            </div>
          )}
        </div>
      </main>
    </>
  );
}

const page = {
  minHeight: '100vh',
  background: 'var(--paper)',
  padding: '40px 20px 80px',
  fontFamily: 'var(--font-body)',
};

const container = {
  maxWidth: '900px',
  margin: '0 auto',
};

const back = {
  color: 'var(--brand)',
  textDecoration: 'none',
  fontWeight: '700',
  fontSize: '13.5px',
};

const heading = {
  color: 'var(--brand)',
  fontFamily: 'var(--font-display)',
  fontSize: '32px',
  margin: '18px 0 6px',
};

const muted = {
  color: 'var(--ink-soft)',
  margin: '0 0 30px',
};

const layout = {
  display: 'grid',
  gridTemplateColumns: 'minmax(260px,1fr) minmax(320px,1.3fr)',
  gap: '24px',
  alignItems: 'start',
};

const planSummary = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  padding: '26px',
  position: 'sticky',
  top: '24px',
};

const planSummaryLabel = {
  color: 'var(--gold-dark)',
  fontWeight: '800',
  fontSize: '12px',
  letterSpacing: '1px',
  textTransform: 'uppercase',
};

const planSummaryName = {
  color: 'var(--brand)',
  fontSize: '22px',
  fontWeight: '800',
  margin: '8px 0 6px',
};

const planSummaryDesc = {
  color: 'var(--ink-soft)',
  fontSize: '14px',
  lineHeight: 1.6,
  margin: '0 0 16px',
};

const planSummaryPrice = {
  color: 'var(--brand)',
  fontSize: '30px',
  fontWeight: '800',
  margin: '0 0 20px',
};

const planSummaryPeriod = {
  color: 'var(--ink-soft)',
  fontSize: '14px',
  fontWeight: '600',
};

const planSummaryList = {
  margin: 0,
  padding: '0 0 0 18px',
  color: 'var(--ink-soft)',
  fontSize: '13.5px',
  lineHeight: 1.8,
};

const noticeBox = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  padding: '32px',
  textAlign: 'center',
};

const noticeTitle = {
  color: 'var(--brand)',
  margin: '0 0 8px',
};

const noticeText = {
  color: 'var(--ink-soft)',
  margin: '0 0 18px',
};

const noticeButton = {
  display: 'inline-block',
  background: 'var(--brand)',
  color: 'var(--on-accent)',
  padding: '12px 20px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: '700',
};
