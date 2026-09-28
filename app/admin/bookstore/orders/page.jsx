'use client';
import BackToAdmin from '../BackToAdmin';

import { useEffect, useState } from 'react';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

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

  async function deleteOrder(order) {
    const confirmed = window.confirm(
      `Permanently delete order ${order.orderNumber}? This removes its ` +
        `payment records and book access grants too. This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');

      const response = await fetch(
        `/api/admin/orders/${encodeURIComponent(order.id)}`,
        { method: 'DELETE' }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result?.error || 'Unable to delete this order.'
        );
      }

      setOrders((previous) =>
        previous.filter((o) => o.id !== order.id)
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to delete this order.'
      );
    }
  }

  async function toggleBookAccess(access, nextActive) {
    const confirmMessage = nextActive
      ? 'Reactivate download access for this book?'
      : 'Deactivate download access for this book? The customer will no longer be able to download it.';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setError('');

      const response = await fetch(
        `/api/admin/book-access/${encodeURIComponent(access.id)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ active: nextActive }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result?.error || 'Unable to update download access.'
        );
      }

      await loadOrders();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update download access.'
      );
    }
  }

  const matchesSearch = (order) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    const haystack = [
      order.orderNumber,
      order.user?.name,
      order.user?.email,
      order.paymentRef,
      ...(order.items || []).map((item) => item.book?.titleEn),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  };

  const matchesStatusFilter = (order) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PAID') return order.paymentStatus === 'PAID' && !isActivated(order);
    if (statusFilter === 'ACTIVATED') return isActivated(order);
    if (statusFilter === 'AWAITING_PAYMENT') return order.paymentStatus !== 'PAID' && !isActivated(order);
    return true;
  };

  const filteredOrders = orders.filter(
    (order) => matchesSearch(order) && matchesStatusFilter(order)
  );

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
            color="var(--brand-light)"
          />

          <SummaryCard
            label="Activated"
            value={activatedCount}
            color="var(--brand-dark)"
          />

          <SummaryCard
            label="Awaiting Payment"
            value={pendingCount}
            color="var(--warning)"
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

          <div style={styles.filterRow}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order #, customer, email, book title..."
              style={styles.searchInput}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="ALL">All Orders</option>
              <option value="PAID">Paid — Awaiting Activation</option>
              <option value="ACTIVATED">Activated</option>
              <option value="AWAITING_PAYMENT">Awaiting Payment</option>
            </select>
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
          ) : filteredOrders.length === 0 ? (
            <div style={styles.empty}>
              <h3>No orders match your search or filter.</h3>

              <p>Try a different search term or filter option.</p>
            </div>
          ) : (
            <div style={styles.orders}>
              {filteredOrders.map((order) => {
                const activated = isActivated(order);
                const canApprove = canActivate(order);

                // The book price/order total is always stored in USD
                // (Book.priceUSD / Order.totalUSD) regardless of which
                // currency the customer actually pays in. `currency` here
                // is the CHARGE currency (what the payment gateway
                // actually processed) — never format totalUSD with it.
                const currency =
                  order.currencyCode || 'USD';

                const chargePayment =
                  order.payments?.[0] || null;

                const chargeAmount =
                  chargePayment?.amount != null
                    ? Number(chargePayment.amount)
                    : Number(order.totalUSD || 0) *
                      Number(order.exchangeRate || 1);

                const chargeCurrency =
                  chargePayment?.currencyCode || currency;

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

                      <div style={{ textAlign: 'right' }}>
                        <div style={styles.amount}>
                          {formatMoney(
                            chargeAmount,
                            chargeCurrency
                          )}
                        </div>
                        {chargeCurrency !== 'USD' && (
                          <div
                            style={{
                              fontSize: '12px',
                              color: 'var(--ink-soft)',
                              marginTop: '2px',
                            }}
                          >
                            Book price:{' '}
                            {formatMoney(
                              order.totalUSD,
                              'USD'
                            )}
                          </div>
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
                            ? 'var(--brand-light)'
                            : 'var(--warning)'
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
                            ? 'var(--brand-light)'
                            : 'var(--warning)'
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

                              {item.access ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleBookAccess(
                                      item.access,
                                      !item.access.active
                                    )
                                  }
                                  style={
                                    item.access.active
                                      ? styles.deactivateAccessButton
                                      : styles.activateAccessButton
                                  }
                                >
                                  {item.access.active
                                    ? '⊘ Deactivate Download'
                                    : '✓ Activate Download'}
                                </button>
                              ) : (
                                <span style={styles.accessPendingNote}>
                                  Not yet activated
                                </span>
                              )}
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

                      <button
                        type="button"
                        onClick={() => deleteOrder(order)}
                        style={styles.deleteOrderButton}
                      >
                        🗑 Delete Order
                      </button>

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
          color: color || 'var(--brand)',
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
          color: color || 'var(--brand-dark)',
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
    background: 'var(--paper)',
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
    color: 'var(--brand-light)',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.12em',
    marginBottom: '8px',
  },

  title: {
    margin: 0,
    color: 'var(--brand-dark)',
    fontSize: '34px',
    fontWeight: 800,
  },

  subtitle: {
    marginTop: '8px',
    color: 'var(--ink-soft)',
    fontSize: '15px',
  },

  error: {
    marginBottom: '20px',
    padding: '14px 16px',
    borderRadius: '10px',
    background: 'var(--danger-tint)',
    color: 'var(--danger)',
    border: '1px solid var(--danger-tint)',
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
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
     boxShadow: '0 4px 18px rgba(27,36,31,.08)',
  },

  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '24px',
     boxShadow: '0 4px 18px rgba(27,36,31,.08)',
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
    color: 'var(--brand-dark)',
  },

  muted: {
    color: 'var(--ink-soft)',
    marginTop: '6px',
    lineHeight: 1.5,
  },

  filterRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '20px',
  },

  searchInput: {
    flex: '1 1 280px',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    fontSize: '13.5px',
    fontFamily: 'inherit',
    background: 'var(--paper)',
    color: 'var(--ink)',
  },

  filterSelect: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    fontSize: '13.5px',
    fontFamily: 'inherit',
    background: 'var(--paper)',
    color: 'var(--ink)',
  },

  refreshButton: {
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    borderRadius: '9px',
    padding: '9px 14px',
    cursor: 'pointer',
    fontWeight: 700,
  },

  empty: {
    textAlign: 'center',
    padding: '50px 20px',
    color: 'var(--ink-soft)',
  },

  orders: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },

  order: {
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '22px',
    background: 'var(--surface)',
     boxShadow: '0 4px 18px rgba(27,36,31,.08)',
  },

  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    alignItems: 'flex-start',
  },

  orderNumber: {
    color: 'var(--brand-light)',
    fontSize: '13px',
    fontWeight: 800,
    letterSpacing: '0.04em',
  },

  customer: {
    margin: '7px 0 3px',
    color: 'var(--brand-dark)',
    fontSize: '19px',
  },

  email: {
    color: 'var(--ink-soft)',
    fontSize: '14px',
  },

  amount: {
    color: 'var(--brand-dark)',
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
    background: 'var(--paper)',
    borderRadius: '10px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },

  reference: {
    marginTop: '14px',
    padding: '12px 14px',
    background: 'var(--paper)',
    borderRadius: '9px',
    color: 'var(--brand-deepest)',
    fontSize: '14px',
    wordBreak: 'break-word',
  },

  link: {
    color: 'var(--brand-light)',
    fontWeight: 700,
  },

  booksSection: {
    marginTop: '20px',
    borderTop: '1px solid var(--border)',
    paddingTop: '18px',
  },

  booksTitle: {
    margin: '0 0 10px',
    color: 'var(--brand-deepest)',
    fontSize: '15px',
  },

  bookRow: {
    display: 'grid',
    gridTemplateColumns:
      'minmax(0, 1fr) 70px 110px 170px',
    gap: '12px',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid var(--border-soft)',
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
    background: 'var(--border)',
    flexShrink: 0,
  },

  arabic: {
    marginTop: '3px',
    color: 'var(--ink-soft)',
    direction: 'rtl',
  },

  quantity: {
    textAlign: 'center',
    color: 'var(--ink-soft)',
  },

  itemPrice: {
    textAlign: 'right',
    fontWeight: 700,
  },

  activateAccessButton: {
    background: 'var(--brand-tint)',
    color: 'var(--brand-dark)',
    border: '1px solid var(--brand-light)',
    borderRadius: '7px',
    padding: '7px 10px',
    fontSize: '11.5px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },

  deactivateAccessButton: {
    background: 'var(--danger-tint)',
    color: 'var(--danger)',
    border: '1px solid var(--danger)',
    borderRadius: '7px',
    padding: '7px 10px',
    fontSize: '11.5px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },

  accessPendingNote: {
    color: 'var(--ink-soft)',
    fontSize: '11px',
    textAlign: 'right',
  },

  actionRow: {
    marginTop: '20px',
  },

  activateButton: {
    width: '100%',
    border: 'none',
    borderRadius: '10px',
    padding: '15px 20px',
    background: 'var(--brand-light)',
    color: 'var(--on-accent)',
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
    background: 'var(--brand-tint)',
    color: 'var(--brand-light)',
    border: '1px solid var(--success-tint)',
  },

  waitingBox: {
    padding: '14px 16px',
    borderRadius: '10px',
    background: 'var(--warning-tint)',
    color: 'var(--warning)',
    border: '1px solid var(--warning-tint)',
    fontWeight: 600,
  },

  deleteOrderButton: {
    width: '100%',
    marginTop: '10px',
    border: '1px solid var(--danger)',
    borderRadius: '10px',
    padding: '10px 20px',
    background: 'var(--danger-tint)',
    color: 'var(--danger)',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
  },
};
