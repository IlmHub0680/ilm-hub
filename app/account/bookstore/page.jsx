export const dynamic = 'force-dynamic';

// The BOOKSTORE-ONLY account dashboard -- purchased books, download
// access, and order history. Split out from the old combined
// /account/dashboard (which mixed bookstore books/orders together with
// Media subscriptions on one page) so a bookstore customer sees only
// their own bookstore account, never Media data that isn't theirs to
// see here -- see app/account/media/page.jsx for the Media-only
// counterpart, and app/account/dashboard/page.jsx (now a thin router)
// for how a visitor lands on the right one of the two.
//
// Reachable by any logged-in User with book purchases -- not the
// student academic portal (see lib/permissions.ts's
// getAccountDestination()).

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import BookDownloadButton from '@/components/BookDownloadButton';

export default async function BookstoreDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/account?next=/account/bookstore');
  }

  // Model 31 §11 bug fix: this page used to render for ANY signed-in
  // session -- a brand-new AUTHOR account (no purchases yet) could
  // browse straight here and see an (empty but real) "My Bookstore
  // Account" page that was never theirs to have. An AUTHOR-role
  // account has its own real destination (getAccountDestination() in
  // lib/permissions.ts) and belongs there instead, never in the
  // ordinary-customer account area.
  if (user.role === 'AUTHOR') {
    redirect('/author-portal/admission');
  }

  const [orders, access] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            book: true,
          },
        },
      },
    }),
    // Every purchased book's entitlement record — including deactivated
    // ones, so a customer can see their access was turned off rather than
    // the book just silently vanishing from their library.
    prisma.bookAccess.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        book: {
          include: {
            author: { select: { name: true } },
            category: { select: { nameEn: true } },
          },
        },
      },
    }),
  ]);

  const activeAccess = access.filter((item) => !item.revokedAt);

  return (
    <main style={page}>
      <div style={container}>
        <header style={header}>
          <div>
            <Link href="/bookstore" style={back}>
              ← Back to Bookstore
            </Link>

            <h1 style={heading}>My Bookstore Account</h1>

            <p style={muted}>
              Welcome back, <strong>{user.name}</strong>
            </p>

            <p style={email}>{user.email}</p>
          </div>

          <div style={actions}>
            <Link href="/bookstore" style={shopButton}>
              Browse Books
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
            <strong style={number}>{activeAccess.length}</strong>
            <span>My Books</span>
          </div>

          <div style={statCard}>
            <strong style={number}>{orders.length}</strong>
            <span>Orders</span>
          </div>
        </section>

        <section style={section}>
          <h2 style={sectionTitle}>My Books</h2>
          <p style={muted}>
            Your purchased digital books, and their current download access.
          </p>

          {access.length === 0 ? (
            <div style={empty}>
              <h3>No approved books yet</h3>
              <p>
                Books will appear here after payment and administrator
                approval.
              </p>
              <Link href="/bookstore" style={button}>
                Browse Bookstore
              </Link>
            </div>
          ) : (
            <div style={grid}>
              {access.map((item) => {
                const active = !item.revokedAt;

                return (
                  <div key={item.id} style={bookCard}>
                    <img
                      src={item.book.coverImageUrl}
                      alt={item.book.titleEn}
                      style={cover}
                    />

                    <div style={bookBody}>
                      <h3 style={bookTitleStyle}>{item.book.titleEn}</h3>

                      {item.book.author?.name && (
                        <p style={bookAuthorStyle}>by {item.book.author.name}</p>
                      )}

                      {item.book.category?.nameEn && (
                        <span style={categoryBadge}>{item.book.category.nameEn}</span>
                      )}

                      <span style={active ? approved : deactivated}>
                        {active ? '✓ Download Access Active' : '⊘ Access Deactivated'}
                      </span>

                      {active ? (
                        <BookDownloadButton
                          orderId={item.orderId}
                          bookId={item.bookId}
                          style={download}
                        />
                      ) : (
                        <p style={small}>
                          Contact the Bookstore if you believe this is a mistake.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section style={section}>
          <h2 style={sectionTitle}>My Orders</h2>

          {orders.length === 0 ? (
            <div style={empty}>
              <h3>No orders yet</h3>
              <p>Your purchases will appear here.</p>
            </div>
          ) : (
            <div style={ordersBox}>
              {orders.map((order) => (
                <div key={order.id} style={orderRow}>
                  <div>
                    <strong>#{order.orderNumber}</strong>
                    <p style={small}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <strong>${Number(order.totalUSD).toFixed(2)}</strong>
                  </div>

                  <span style={status}>
                    {order.paymentStatus}
                  </span>

                  <span style={status}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
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

const bookCard = {
  border: '1px solid var(--border)',
  borderRadius: '12px',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

const cover = {
  width: '100%',
  height: '260px',
  objectFit: 'cover',
};

const bookBody = {
  padding: '18px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const bookTitleStyle = {
  color: 'var(--ink)',
  fontSize: '16px',
  margin: 0,
};

const bookAuthorStyle = {
  color: 'var(--ink-soft)',
  fontSize: '13px',
  margin: '2px 0 6px',
};

const categoryBadge = {
  alignSelf: 'flex-start',
  background: 'var(--gold-tint)',
  color: 'var(--gold-dark)',
  fontSize: '11px',
  fontWeight: '700',
  padding: '3px 9px',
  borderRadius: '999px',
  marginBottom: '8px',
};

const approved = {
  display: 'block',
  color: 'var(--brand-light)',
  background: 'var(--success-tint)',
  padding: '6px 10px',
  borderRadius: '6px',
  margin: '4px 0 10px',
  fontSize: '13px',
  fontWeight: '700',
};

const deactivated = {
  display: 'block',
  color: 'var(--danger)',
  background: 'var(--danger-tint)',
  padding: '6px 10px',
  borderRadius: '6px',
  margin: '4px 0 10px',
  fontSize: '13px',
  fontWeight: '700',
};

const download = {
  display: 'block',
  width: '100%',
  background: 'var(--brand)',
  color: 'var(--on-accent)',
  border: 'none',
  borderRadius: '8px',
  padding: '10px 14px',
  fontWeight: '700',
  fontSize: '13.5px',
  cursor: 'pointer',
  textAlign: 'center',
};

const ordersBox = {
  display: 'flex',
  flexDirection: 'column',
};

const orderRow = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr 1fr',
  gap: '20px',
  alignItems: 'center',
  padding: '18px 0',
  borderBottom: '1px solid var(--border)',
};

const small = {
  color: 'var(--ink-soft)',
  fontSize: '13px',
};

const status = {
  display: 'inline-block',
  background: 'var(--brand-tint)',
  color: 'var(--brand-light)',
  padding: '6px 10px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: '700',
};
