'use client';
import BackToAdmin from '../BackToAdmin';

import { useEffect, useState } from 'react';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadOrders() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        '/api/admin/orders',
        { cache: 'no-store' }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || 'Unable to load bookstore orders.'
        );
      }

      setOrders(result.orders || result.data || []);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load bookstore orders.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  function formatDate(value) {
    if (!value) return '—';

    try {
      return new Date(value).toLocaleString();
    } catch {
      return '—';
    }
  }

  function formatMoney(value, currency = 'USD') {
    const amount = Number(value || 0);

    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
      }).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(2)}`;
    }
  }

  function isActivated(order) {
    return (
      order.status === 'ACTIVATED' ||
      order.status === 'COMPLETED'
    );
  }

  function canActivate(order) {
    return (
      order.paymentStatus === 'PAID' &&
      !isActivated(order) &&
      !['REJECTED'].includes(order.status)
    );
  }

  async function activateOrder(order) {
    const confirmed = window.confirm(
      `Approve payment and activate book access for order ${order.orderNumber}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');

      const response = await fetch(
        `/api/orders/${encodeURIComponent(order.id)}/approve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      /*
       * The existing approval endpoint redirects after
       * successful activation. A redirect response is still
       * considered successful here.
       */
      if (!response.ok) {
        let result = {};

        try {
          result = await response.json();
        } catch {
          // Response may be a redirect/html response.
        }

        throw new Error(
          result?.error ||
            'Unable to activate this order.'
        );
      }

      await loadOrders();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to activate this order.'
      );
    }
  }

  const paidCount = orders.filter(
    (order) => order.paymentStatus === 'PAID'
  ).length;

  const activatedCount = orders.filter(
    (order) => isActivated(order)
  ).length;

  const pendingCount = orders.filter(
    (order) =>
      order.paymentStatus !== 'PAID' &&
      !isActivated(order)
  ).length;

  return (
    <main style={styles.page}>
      <div style={{ marginBottom: 20 }}>
        <BackToAdmin />
      </div>
      <div style={styles.container}>

        <header style={styles.header}>
          <div>
            <div style={styles.eyebrow}>
              BOOKSTORE MANAGEMENT
            </div>

            <h1 style={styles.title}>
              Bookstore Orders
            </h1>

            <p style={styles.subtitle}>
              Monitor customer purchases, payment status,
              approval and digital book access.
            </p>
          </div>

        </header>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <section style={styles.summary}>
          <SummaryCard
            label="Total Orders"
            value={orders.length}
          />

          <SummaryCard
            label="Paid"
            value={paidCount}
            color="#166534"
          />

          <SummaryCard
            label="Activated"
            value={activatedCount}
            color="#1d4ed8"
          />

          <SummaryCard
            label="Awaiting Payment"
            value={pendingCount}
            color="#92400e"
          />
        </section>

        <section style={styles.card}>
          <div style={styles.cardTitleRow}>
            <div>
              <h2 style={styles.sectionTitle}>
                Customer Book Purchases
              </h2>

              <p style={styles.muted}>
                Approving a paid order grants BookAccess
                and enables the customer's digital download.
              </p>
            </div>

            <button
              type="button"
              onClick={loadOrders}
              disabled={loading}
              style={styles.refreshButton}
            >
              {loading ? 'Loading...' : '↻ Refresh'}
            </button>
          </div>

          {loading ? (
            <div style={styles.empty}>
              Loading bookstore orders...
            </div>
          ) : orders.length === 0 ? (
            <div style={styles.empty}>
              <h3>No bookstore orders found.</h3>

              <p>
                Customer book purchases will appear here
                when orders are created.
              </p>
            </div>
          ) : (
            <div style={styles.orders}>
              {orders.map((order) => {
                const activated = isActivated(order);
                const canApprove = canActivate(order);

                const currency =
                  order.currencyCode || 'USD';

                return (
                  <article
                    key={order.id}
                    style={styles.order}
                  >

                    <div style={styles.orderHeader}>
                      <div>
                        <div style={styles.orderNumber}>
                          {order.orderNumber || order.id}
                        </div>

                        <h3 style={styles.customer}>
                          {order.user?.name ||
                            'Customer'}
                        </h3>

                        <div style={styles.email}>
                          {order.user?.email ||
                            'No email available'}
                        </div>
                      </div>

                      <div style={styles.amount}>
                        {formatMoney(
                          order.totalUSD,
                          currency
                        )}
                      </div>
                    </div>

                    <div style={styles.infoGrid}>

                      <Info
                        label="Payment"
                        value={
                          order.paymentStatus ||
                          'UNKNOWN'
                        }
                        color={
                          order.paymentStatus === 'PAID'
                            ? '#166534'
                            : '#92400e'
                        }
                      />

                      <Info
                        label="Order Status"
                        value={
                          order.status ||
                          'UNKNOWN'
                        }
                        color={
                          activated
                            ? '#166534'
                            : '#92400e'
                        }
                      />

                      <Info
                        label="Payment Method"
                        value={
                          order.paymentMethod ||
                          '—'
                        }
                      />

                      <Info
                        label="Currency"
                        value={currency}
                      />

                      <Info
                        label="Created"
                        value={formatDate(
                          order.createdAt
                        )}
                      />

                      <Info
                        label="Paid Amount"
                        value={formatMoney(
                          order.paidAmount,
                          currency
                        )}
                      />

                    </div>

                    {order.paymentRef && (
                      <div style={styles.reference}>
                        <strong>
                          Payment Reference:
                        </strong>{' '}
                        {order.paymentRef}
                      </div>
                    )}

                    {order.paymentProofUrl && (
                      <div style={styles.reference}>
                        <strong>
                          Payment Proof:
                        </strong>{' '}

                        <a
                          href={order.paymentProofUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.link}
                        >
                          View payment proof
                        </a>
                      </div>
                    )}

                    <div style={styles.booksSection}>
                      <h4 style={styles.booksTitle}>
                        Books Purchased
                      </h4>

                      {order.items?.length ? (
                        <div>
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              style={styles.bookRow}
                            >
                              <div style={styles.bookInfo}>
                                {item.book
                                  ?.coverImageUrl && (
                                  <img
                                    src={
                                      item.book
                                        .coverImageUrl
                                    }
                                    alt=""
                                    style={
                                      styles.cover
                                    }
                                  />
                                )}

                                <div>
                                  <strong>
                                    {item.book
                                      ?.titleEn ||
                                      'Book'}
                                  </strong>

                                  {item.book
                                    ?.titleAr && (
                                    <div
                                      style={
                                        styles.arabic
                                      }
                                    >
                                      {
                                        item.book
                                          .titleAr
                                      }
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div style={styles.quantity}>
                                ×{' '}
                                {item.quantity || 1}
                              </div>

                              <div style={styles.itemPrice}>
                                {formatMoney(
                                  Number(
                                    item.priceUSD || 0
                                  ) *
                                    Number(
                                      item.quantity || 1
                                    ),
                                  'USD'
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={styles.muted}>
                          No books recorded.
                        </p>
                      )}
                    </div>

                    <div style={styles.actionRow}>

                      {activated ? (
                        <div
                          style={
                            styles.activatedBox
                          }
                        >
                          <strong>
                            ✓ BOOK ACCESS ACTIVATED
                          </strong>

                          <span>
                            Customer can download
                            purchased digital books.
                          </span>
                        </div>
                      ) : canApprove ? (
                        <button
                          type="button"
                          onClick={() =>
                            activateOrder(order)
                          }
                          style={
                            styles.activateButton
                          }
                        >
                          ✓ Approve Payment & Activate
                          Order
                        </button>
                      ) : (
                        <div
                          style={
                            styles.waitingBox
                          }
                        >
                          {order.paymentStatus ===
                          'PAID'
                            ? 'Payment confirmed — order awaiting activation.'
                            : 'Waiting for payment confirmation.'}
                        </div>
                      )}

                    </div>

                  </article>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  color,
}) {
  return (
    <div style={styles.summaryCard}>
      <strong
        style={{
          color: color || '#14532d',
        }}
      >
        {value}
      </strong>

      <span>{label}</span>
    </div>
  );
}

function Info({
  label,
  value,
  color,
}) {
  return (
    <div style={styles.info}>
      <span>{label}</span>

      <strong
        style={{
          color: color || '#111827',
        }}
      >
        {value}
      </strong>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
    padding: '40px 20px',
    fontFamily: 'Inter, Arial, sans-serif',
  },

  container: {
    maxWidth: '1400px',
    margin: '0 auto',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '20px',
    marginBottom: '28px',
  },

  eyebrow: {
    color: '#166534',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.12em',
    marginBottom: '8px',
  },

  title: {
    margin: 0,
    color: '#111827',
    fontSize: '34px',
    fontWeight: 800,
  },

  subtitle: {
    marginTop: '8px',
    color: '#6b7280',
    fontSize: '15px',
  },

  error: {
    marginBottom: '20px',
    padding: '14px 16px',
    borderRadius: '10px',
    background: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    fontWeight: 600,
  },

  summary: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '14px',
    marginBottom: '24px',
  },

  summaryCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },

  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    padding: '24px',
  },

  cardTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },

  sectionTitle: {
    margin: 0,
    fontSize: '22px',
    color: '#111827',
  },

  muted: {
    color: '#6b7280',
    marginTop: '6px',
    lineHeight: 1.5,
  },

  refreshButton: {
    border: '1px solid #d1d5db',
    background: '#fff',
    borderRadius: '9px',
    padding: '9px 14px',
    cursor: 'pointer',
    fontWeight: 700,
  },

  empty: {
    textAlign: 'center',
    padding: '50px 20px',
    color: '#6b7280',
  },

  orders: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },

  order: {
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    padding: '22px',
    background: '#fff',
  },

  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    alignItems: 'flex-start',
  },

  orderNumber: {
    color: '#166534',
    fontSize: '13px',
    fontWeight: 800,
    letterSpacing: '0.04em',
  },

  customer: {
    margin: '7px 0 3px',
    color: '#111827',
    fontSize: '19px',
  },

  email: {
    color: '#6b7280',
    fontSize: '14px',
  },

  amount: {
    color: '#111827',
    fontSize: '22px',
    fontWeight: 800,
  },

  infoGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(170px, 1fr))',
    gap: '12px',
    marginTop: '20px',
  },

  info: {
    background: '#f8fafc',
    borderRadius: '10px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },

  reference: {
    marginTop: '14px',
    padding: '12px 14px',
    background: '#f9fafb',
    borderRadius: '9px',
    color: '#374151',
    fontSize: '14px',
    wordBreak: 'break-word',
  },

  link: {
    color: '#166534',
    fontWeight: 700,
  },

  booksSection: {
    marginTop: '20px',
    borderTop: '1px solid #e5e7eb',
    paddingTop: '18px',
  },

  booksTitle: {
    margin: '0 0 10px',
    color: '#374151',
    fontSize: '15px',
  },

  bookRow: {
    display: 'grid',
    gridTemplateColumns:
      'minmax(0, 1fr) 70px 110px',
    gap: '12px',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6',
  },

  bookInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: 0,
  },

  cover: {
    width: '44px',
    height: '58px',
    objectFit: 'cover',
    borderRadius: '5px',
    background: '#e5e7eb',
    flexShrink: 0,
  },

  arabic: {
    marginTop: '3px',
    color: '#6b7280',
    direction: 'rtl',
  },

  quantity: {
    textAlign: 'center',
    color: '#6b7280',
  },

  itemPrice: {
    textAlign: 'right',
    fontWeight: 700,
  },

  actionRow: {
    marginTop: '20px',
  },

  activateButton: {
    width: '100%',
    border: 'none',
    borderRadius: '10px',
    padding: '15px 20px',
    background: '#166534',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 800,
    cursor: 'pointer',
  },

  activatedBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '14px 16px',
    borderRadius: '10px',
    background: '#ecfdf5',
    color: '#166534',
    border: '1px solid #bbf7d0',
  },

  waitingBox: {
    padding: '14px 16px',
    borderRadius: '10px',
    background: '#fffbeb',
    color: '#92400e',
    border: '1px solid #fde68a',
    fontWeight: 600,
  },
};
