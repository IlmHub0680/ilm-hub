export const dynamic = 'force-dynamic';

// The MEDIA-ONLY account dashboard -- subscription status and payment
// history. Split out from the old combined /account/dashboard (which
// mixed Media subscriptions together with Bookstore books/orders on one
// page) so a Media subscriber sees only their own Media account, never
// Bookstore data that isn't theirs to see here -- see
// app/account/bookstore/page.jsx for the Bookstore-only counterpart,
// and app/account/dashboard/page.jsx (now a thin router) for how a
// visitor lands on the right one of the two.
//
// Reachable by any logged-in User with a Media subscription (or none
// yet) -- not the student academic portal (see lib/permissions.ts's
// getAccountDestination()).

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const SUBSCRIPTION_STATUS_LABELS = {
  PENDING: 'Pending Approval',
  ACTIVE: 'Active',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
};

const SUBSCRIPTION_STATUS_COLORS = {
  PENDING: 'var(--warning)',
  ACTIVE: 'var(--brand-light)',
  EXPIRED: 'var(--ink-soft)',
  CANCELLED: 'var(--danger)',
};

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return '—';
  }
}

export default async function MediaDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/account?next=/account/media');
  }

  // Model 31 §11 bug fix: this page used to render for ANY signed-in
  // session -- a brand-new AUTHOR account (no subscription) could
  // browse straight here and see an (empty but real) "My Media
  // Account" page that was never theirs to have. An AUTHOR-role
  // account has its own real destination (getAccountDestination() in
  // lib/permissions.ts) and belongs there instead, never in the
  // ordinary-customer account area.
  if (user.role === 'AUTHOR') {
    redirect('/author-portal/admission');
  }

  const subscriptions = await prisma.userMediaSubscription.findMany({
    where: { userId: user.id },
    orderBy: { startedAt: 'desc' },
    include: {
      plan: { select: { name: true, priceUSD: true, durationDays: true } },
    },
  });

  const activeSubscription = subscriptions.find(
    (sub) => sub.status === 'ACTIVE' && sub.expiresAt && new Date(sub.expiresAt) > new Date()
  );

  return (
    <main style={page}>
      <div style={container}>
        <header style={header}>
          <div>
            <Link href="/media" style={back}>
              ← Back to Media
            </Link>

            <h1 style={heading}>My Media Account</h1>

            <p style={muted}>
              Welcome back, <strong>{user.name}</strong>
            </p>

            <p style={email}>{user.email}</p>
          </div>

          <div style={actions}>
            <Link href="/media" style={shopButton}>
              Browse Media
            </Link>

            <form action="/api/auth/logout" method="post">
              <button type="submit" style={logout}>
                Sign Out
              </button>
            </form>
          </div>
        </header>

        <section style={stats}>
          <div style={statCard}>
            <strong style={number}>
              {activeSubscription ? 'Active' : subscriptions.length ? 'Inactive' : '—'}
            </strong>
            <span>Subscription Status</span>
          </div>

          <div style={statCard}>
            <strong style={number}>
              {activeSubscription ? formatDate(activeSubscription.expiresAt) : '—'}
            </strong>
            <span>Renews / Expires</span>
          </div>
        </section>

        <section style={section}>
          <h2 style={sectionTitle}>My Media Subscriptions</h2>
          <p style={muted}>
            Your Media subscription status and history.
          </p>

          {subscriptions.length === 0 ? (
            <div style={empty}>
              <h3>No media subscriptions yet</h3>
              <p>
                Subscribe to unlock khutbahs, recorded lectures, and
                scholarly talks in Media.
              </p>
              <Link href="/media#plans" style={button}>
                See Subscription Plans
              </Link>
            </div>
          ) : (
            <>
              <div style={grid}>
                {subscriptions.map((sub) => (
                  <div key={sub.id} style={subCard}>
                    <div style={subCardHeader}>
                      <strong>{sub.plan?.name || 'Subscription Plan'}</strong>

                      <span
                        style={{
                          ...statusPill,
                          background: 'var(--brand-tint)',
                          color:
                            SUBSCRIPTION_STATUS_COLORS[sub.status] ||
                            'var(--brand-dark)',
                        }}
                      >
                        {SUBSCRIPTION_STATUS_LABELS[sub.status] || sub.status}
                      </span>
                    </div>

                    <div style={subCardBody}>
                      <Info label="Started" value={formatDate(sub.startedAt)} />
                      <Info label="Expires" value={formatDate(sub.expiresAt)} />

                      {sub.paidAmount != null && (
                        <Info
                          label="Paid"
                          value={`$${Number(sub.paidAmount).toFixed(2)}`}
                        />
                      )}

                      {sub.paymentRef && (
                        <Info label="Reference" value={sub.paymentRef} />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {!activeSubscription && (
                <Link href="/media#plans" style={{ ...button, marginTop: '20px' }}>
                  Renew / Subscribe Again
                </Link>
              )}
            </>
          )}
        </section>

      </div>
    </main>
  );
}

function Info({ label, value }) {
  return (
    <div style={infoRow}>
      <span style={infoLabel}>{label}</span>
      <strong style={infoValue}>{value}</strong>
    </div>
  );
}

const page = {
  minHeight: '100vh',
  background: 'var(--paper)',
  padding: '40px 20px',
  fontFamily: 'var(--font-body)',
};

const container = {
  maxWidth: '1200px',
  margin: '0 auto',
};

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '30px',
  marginBottom: '35px',
};

const heading = {
  color: 'var(--brand)',
  fontFamily: 'var(--font-display)',
  fontSize: '38px',
  margin: '15px 0 8px',
};

const back = {
  color: 'var(--brand)',
  textDecoration: 'none',
  fontWeight: '700',
};

const muted = {
  color: 'var(--ink-soft)',
};

const email = {
  color: 'var(--ink-soft)',
};

const actions = {
  display: 'flex',
  gap: '10px',
  alignItems: 'flex-start',
};

const shopButton = {
  background: 'var(--brand)',
  color: 'var(--on-accent)',
  padding: '12px 18px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: '700',
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

const stats = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '20px',
  marginBottom: '40px',
};

const statCard = {
  background: 'var(--surface)',
  padding: '25px',
  borderRadius: '14px',
  boxShadow: '0 4px 20px rgba(0,0,0,.06)',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  color: 'var(--ink-soft)',
};

const number = {
  fontSize: '32px',
  color: 'var(--brand)',
};

const section = {
  background: 'var(--surface)',
  padding: '30px',
  borderRadius: '16px',
  marginBottom: '30px',
  boxShadow: '0 4px 20px rgba(0,0,0,.05)',
};

const sectionTitle = {
  color: 'var(--brand)',
  fontFamily: 'var(--font-display)',
};

const empty = {
  textAlign: 'center',
  padding: '50px 20px',
  color: 'var(--ink-soft)',
};

const button = {
  display: 'inline-block',
  marginTop: '15px',
  background: 'var(--brand)',
  color: 'var(--on-accent)',
  padding: '12px 20px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: '700',
};

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))',
  gap: '20px',
};

const subCard = {
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '18px',
  background: 'var(--paper)',
};

const subCardHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
  color: 'var(--ink)',
};

const subCardBody = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const statusPill = {
  padding: '4px 10px',
  borderRadius: '999px',
  fontSize: '11px',
  fontWeight: '800',
};

const infoRow = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '13px',
};

const infoLabel = {
  color: 'var(--ink-soft)',
};

const infoValue = {
  color: 'var(--ink)',
};

const small = {
  color: 'var(--ink-soft)',
  fontSize: '13px',
};

