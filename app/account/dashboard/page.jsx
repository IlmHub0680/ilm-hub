export const dynamic = 'force-dynamic';

// /account/dashboard is now a thin ROUTER, not a page of its own --
// Bookstore and Media used to share this one combined dashboard (My
// Books + My Orders + My Media Subscriptions all on one page), which is
// exactly the "bookstore and media share the same account" complaint
// this split fixes. The real dashboards now live at:
//   - /account/bookstore  (My Books, My Orders)
//   - /account/media      (My Media Subscriptions)
// This route only decides which of those two a given signed-in user
// should land on, for every existing bookmark/link that still points
// here (see next.config.js's /dashboard -> /account/dashboard redirect,
// SiteHeader.jsx, lib/permissions.ts's getAccountDestination(), etc.):
//   - Has bookstore activity (an order or book access) but no Media
//     subscription -> straight to /account/bookstore.
//   - Has a Media subscription but no bookstore activity -> straight to
//     /account/media.
//   - Has both -> a short chooser (never silently guesses which one the
//     visitor actually wants).
//   - Has neither yet -> the same chooser, so a brand-new account isn't
//     dropped onto one section's dashboard as if that's the only one
//     that exists.

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function AccountDashboardRouter() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/account?next=/account/dashboard');
  }

  // Model 31 §11 bug fix: an AUTHOR-role account has its own real
  // destination (getAccountDestination() in lib/permissions.ts) and
  // never belongs in the ordinary-customer Bookstore/Media chooser --
  // redirect here too, since this router is a second, independent
  // entry point into the same account area (bookmarks, old links) and
  // not everything reaches it via getAccountDestination() first.
  if (user.role === 'AUTHOR') {
    redirect('/author-portal/admission');
  }

  const [orderCount, bookAccessCount, subscriptionCount] = await Promise.all([
    prisma.order.count({ where: { userId: user.id } }),
    prisma.bookAccess.count({ where: { userId: user.id } }),
    prisma.userMediaSubscription.count({ where: { userId: user.id } }),
  ]);

  const hasBookstore = orderCount > 0 || bookAccessCount > 0;
  const hasMedia = subscriptionCount > 0;

  if (hasBookstore && !hasMedia) {
    redirect('/account/bookstore');
  }

  if (hasMedia && !hasBookstore) {
    redirect('/account/media');
  }

  // Both, or neither -- show the chooser rather than guess.
  return (
    <main style={page}>
      <div style={container}>
        <h1 style={heading}>My Account</h1>

        <p style={muted}>
          Welcome back, <strong>{user.name}</strong> — {user.email}
        </p>

        <p style={intro}>
          Bookstore and Media are two separate, dedicated accounts.
          {hasBookstore && hasMedia
            ? ' Choose which one you\'d like to open:'
            : ' Choose one to get started:'}
        </p>

        <div style={choiceGrid}>
          <Link href="/account/bookstore" style={choiceCard}>
            <div style={choiceIcon}>📚</div>
            <h2 style={choiceTitle}>Bookstore Account</h2>
            <p style={choiceText}>
              {hasBookstore
                ? 'Your purchased books, download access, and order history.'
                : 'No purchases yet — visit the Bookstore to get started.'}
            </p>
            <span style={choiceLink}>Open Bookstore Account →</span>
          </Link>

          <Link href="/account/media" style={choiceCard}>
            <div style={choiceIcon}>🎙️</div>
            <h2 style={choiceTitle}>Media Account</h2>
            <p style={choiceText}>
              {hasMedia
                ? 'Your Media subscription status and payment history.'
                : 'No subscription yet — visit Media to see subscription plans.'}
            </p>
            <span style={choiceLink}>Open Media Account →</span>
          </Link>
        </div>

        <form action="/api/auth/logout" method="post" style={{ marginTop: '30px' }}>
          <button type="submit" style={logout}>
            Sign Out
          </button>
        </form>
      </div>
    </main>
  );
}

const page = {
  minHeight: '100vh',
  background: 'var(--paper)',
  padding: '40px 20px',
  fontFamily: 'var(--font-body)',
};

const container = {
  maxWidth: '760px',
  margin: '0 auto',
};

const heading = {
  color: 'var(--brand)',
  fontFamily: 'var(--font-display)',
  fontSize: '34px',
  margin: '0 0 8px',
};

const muted = {
  color: 'var(--ink-soft)',
  margin: '0 0 4px',
};

const intro = {
  color: 'var(--ink-soft)',
  margin: '18px 0 28px',
  lineHeight: 1.6,
};

const choiceGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
  gap: '20px',
};

const choiceCard = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '4px',
  padding: '28px',
  borderRadius: '16px',
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  textDecoration: 'none',
  boxShadow: '0 4px 20px rgba(0,0,0,.05)',
};

const choiceIcon = {
  fontSize: '30px',
  marginBottom: '6px',
};

const choiceTitle = {
  color: 'var(--brand)',
  fontSize: '19px',
  fontWeight: '800',
  margin: '0 0 6px',
};

const choiceText = {
  color: 'var(--ink-soft)',
  lineHeight: 1.6,
  margin: '0 0 16px',
  fontSize: '14px',
};

const choiceLink = {
  color: 'var(--gold-dark)',
  fontWeight: '800',
  fontSize: '14px',
  marginTop: 'auto',
};

const logout = {
  background: 'var(--danger-tint)',
  color: 'var(--danger)',
  border: 'none',
  padding: '12px 18px',
  borderRadius: '8px',
  fontWeight: '700',
  cursor: 'pointer',
};
