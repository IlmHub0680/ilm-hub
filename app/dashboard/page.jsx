export const dynamic = 'force-dynamic';


import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/account?next=/dashboard');
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
    prisma.bookAccess.findMany({
      where: {
        userId: user.id,
        revokedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        book: true,
      },
    }),
  ]);

  return (
    <main style={page}>
      <div style={container}>
        <header style={header}>
          <div>
            <Link href="/bookstore" style={back}>
              ← Back to Bookstore
            </Link>

            <h1 style={heading}>My Dashboard</h1>

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
            <strong style={number}>{access.length}</strong>
            <span>My Books</span>
          </div>

          <div style={statCard}>
            <strong style={number}>{orders.length}</strong>
            <span>Orders</span>
          </div>

          <div style={statCard}>
            <strong style={number}>{access.length}</strong>
            <span>Approved Books</span>
          </div>
        </section>

        <section style={section}>
          <h2 style={sectionTitle}>My Books</h2>

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
              {access.map((item) => (
                <div key={item.id} style={bookCard}>
                  <img
                    src={item.book.coverImageUrl}
                    alt={item.book.titleEn}
                    style={cover}
                  />

                  <div style={bookBody}>
                    <h3>{item.book.titleEn}</h3>

                    <span style={approved}>✓ Approved</span>

                    <Link
                      href={`/api/books/${item.book.id}/download`}
                      style={download}
                    >
                      Download Book ↓
                    </Link>
                  </div>
                </div>
              ))}
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
  background: '#f8fafc',
  padding: '40px 20px',
  fontFamily: 'Inter, sans-serif',
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
  color: '#14532d',
  fontFamily: 'Georgia, serif',
  fontSize: '38px',
  margin: '15px 0 8px',
};

const back = {
  color: '#14532d',
  textDecoration: 'none',
  fontWeight: '700',
};

const muted = {
  color: '#64748b',
};

const email = {
  color: '#94a3b8',
};

const actions = {
  display: 'flex',
  gap: '10px',
  alignItems: 'flex-start',
};

const shopButton = {
  background: '#14532d',
  color: '#fff',
  padding: '12px 18px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: '700',
};

const logout = {
  background: '#fee2e2',
  color: '#991b1b',
  border: 'none',
  padding: '12px 18px',
  borderRadius: '8px',
  fontWeight: '700',
  cursor: 'pointer',
};

const stats = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '20px',
  marginBottom: '40px',
};

const statCard = {
  background: '#fff',
  padding: '25px',
  borderRadius: '14px',
  boxShadow: '0 4px 20px rgba(0,0,0,.06)',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  color: '#64748b',
};

const number = {
  fontSize: '32px',
  color: '#14532d',
};

const section = {
  background: '#fff',
  padding: '30px',
  borderRadius: '16px',
  marginBottom: '30px',
  boxShadow: '0 4px 20px rgba(0,0,0,.05)',
};

const sectionTitle = {
  color: '#14532d',
  fontFamily: 'Georgia, serif',
};

const empty = {
  textAlign: 'center',
  padding: '50px 20px',
  color: '#64748b',
};

const button = {
  display: 'inline-block',
  marginTop: '15px',
  background: '#14532d',
  color: '#fff',
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
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  overflow: 'hidden',
};

const cover = {
  width: '100%',
  height: '260px',
  objectFit: 'cover',
};

const bookBody = {
  padding: '18px',
};

const approved = {
  display: 'block',
  color: '#166534',
  background: '#dcfce7',
  padding: '6px 10px',
  borderRadius: '6px',
  margin: '10px 0',
  fontSize: '13px',
  fontWeight: '700',
};

const download = {
  display: 'block',
  color: '#14532d',
  fontWeight: '700',
  textDecoration: 'none',
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
  borderBottom: '1px solid #e2e8f0',
};

const small = {
  color: '#94a3b8',
  fontSize: '13px',
};

const status = {
  display: 'inline-block',
  background: '#f0fdf4',
  color: '#166534',
  padding: '6px 10px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: '700',
};
