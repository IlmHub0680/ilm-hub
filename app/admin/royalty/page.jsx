'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const DEFAULT_SETTINGS = {
  defaultRatePct: 70,
  isActive: true,
  effectiveDate: '',
  description: '',
};

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

const STATUS_TONE = {
  PENDING: { background: 'var(--warning-tint)', color: 'var(--warning)' },
  APPROVED: { background: 'var(--brand-tint)', color: 'var(--brand)' },
  PAID: { background: 'var(--success-tint)', color: 'var(--success)' },
  REJECTED: { background: 'var(--danger-tint)', color: 'var(--danger)' },
};

function StatusBadge({ status }) {
  return (
    <span
      style={{
        padding: '4px 11px',
        borderRadius: 999,
        fontSize: 11.5,
        fontWeight: 800,
        whiteSpace: 'nowrap',
        ...(STATUS_TONE[status] || STATUS_TONE.PENDING),
      }}
    >
      {status}
    </span>
  );
}

export default function AdminRoyaltyPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [authors, setAuthors] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [overrideDrafts, setOverrideDrafts] = useState({});
  const [payoutAmountDrafts, setPayoutAmountDrafts] = useState({});
  const [payoutMethodDrafts, setPayoutMethodDrafts] = useState({});
  const [busyAuthorId, setBusyAuthorId] = useState('');
  const [busyPayoutId, setBusyPayoutId] = useState('');
  const [referenceDrafts, setReferenceDrafts] = useState({});

  async function loadAll() {
    setLoading(true);
    setError('');

    try {
      const [settingsRes, authorsRes, payoutsRes] = await Promise.all([
        fetch('/api/admin/royalty/settings'),
        fetch('/api/admin/royalty/authors'),
        fetch('/api/admin/royalty/payouts'),
      ]);

      const [settingsResult, authorsResult, payoutsResult] = await Promise.all([
        settingsRes.json(),
        authorsRes.json(),
        payoutsRes.json(),
      ]);

      if (!settingsRes.ok || !settingsResult.success) {
        throw new Error(settingsResult.error || 'Failed to load royalty settings.');
      }
      if (!authorsRes.ok || !authorsResult.success) {
        throw new Error(authorsResult.error || 'Failed to load authors.');
      }
      if (!payoutsRes.ok || !payoutsResult.success) {
        throw new Error(payoutsResult.error || 'Failed to load payouts.');
      }

      setSettings(settingsResult.data);
      setAuthors(authorsResult.data);
      setPayouts(payoutsResult.data);

      const drafts = {};
      authorsResult.data.forEach((a) => {
        drafts[a.id] = a.overrideRatePct != null ? String(a.overrideRatePct) : '';
      });
      setOverrideDrafts(drafts);
    } catch (err) {
      setError(err.message || 'Failed to load royalty data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleSaveSettings(event) {
    event.preventDefault();
    setSavingSettings(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/admin/royalty/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to save royalty settings.');
      }

      setSettings(result.data);
      setMessage('Institution-wide royalty settings saved.');
    } catch (err) {
      setError(err.message || 'Failed to save royalty settings.');
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleSaveOverride(authorId) {
    setBusyAuthorId(authorId);
    setError('');

    try {
      const raw = overrideDrafts[authorId];
      const response = await fetch(`/api/admin/royalty/authors/${authorId}/override`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ratePct: raw === '' ? null : Number(raw) }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to update this author's rate.");
      }

      await loadAll();
      setMessage('Author royalty rate updated.');
    } catch (err) {
      setError(err.message || "Failed to update this author's rate.");
    } finally {
      setBusyAuthorId('');
    }
  }

  async function handleCreatePayout(authorId) {
    setBusyAuthorId(authorId);
    setError('');
    setMessage('');

    try {
      const amountRaw = payoutAmountDrafts[authorId];
      const response = await fetch('/api/admin/royalty/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId,
          amountUSD: amountRaw ? Number(amountRaw) : undefined,
          method: payoutMethodDrafts[authorId] || '',
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to queue this payout.');
      }

      setPayoutAmountDrafts((prev) => ({ ...prev, [authorId]: '' }));
      await loadAll();
      setMessage(`Payout of ${money(result.data.amountUSD)} queued for review.`);
    } catch (err) {
      setError(err.message || 'Failed to queue this payout.');
    } finally {
      setBusyAuthorId('');
    }
  }

  async function handlePayoutAction(payoutId, action) {
    setBusyPayoutId(payoutId);
    setError('');
    setMessage('');

    try {
      const body = { action };
      if (action === 'mark-paid') {
        body.reference = referenceDrafts[payoutId] || '';
      }

      const response = await fetch(`/api/admin/royalty/payouts/${payoutId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update this payout.');
      }

      await loadAll();
      setMessage('Payout updated.');
    } catch (err) {
      setError(err.message || 'Failed to update this payout.');
    } finally {
      setBusyPayoutId('');
    }
  }

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 12px',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '14px',
    color: 'var(--ink)',
    backgroundColor: 'var(--surface)',
  };

  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 700, fontSize: 13.5 };

  const sectionStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: 28,
    marginBottom: 24,
    boxShadow: '0 4px 18px rgba(27,36,31,.08)',
  };

  const buttonStyle = (variant = 'primary') => ({
    padding: '9px 16px',
    borderRadius: 8,
    border: variant === 'primary' ? 'none' : '1px solid var(--border)',
    background: variant === 'primary' ? 'var(--brand)' : 'var(--surface)',
    color: variant === 'primary' ? 'var(--on-accent)' : 'var(--ink)',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  });

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--paper)', padding: 40, color: 'var(--ink)' }}>
        Loading royalty & payout data...
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--paper)', padding: '40px 24px 80px', color: 'var(--ink)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Link href="/admin" style={{ display: 'inline-block', marginBottom: 18, color: 'var(--brand)', fontWeight: 600, fontSize: 13.5, textDecoration: 'none' }}>
          ← Back to Admin
        </Link>

        <div style={{ marginBottom: 30 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            Administration
          </div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: 'var(--ink)' }}>Author Royalty &amp; Payouts</h1>
          <p style={{ marginTop: 10, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
            Configure the institution-wide royalty rate, set per-author overrides, and review,
            approve and pay out each author's real earnings from the Bookstore.
          </p>
        </div>

        {message && (
          <div style={{ marginBottom: 18, padding: '12px 16px', borderRadius: 10, background: 'var(--success-tint)', color: 'var(--success)', fontSize: 13.5, fontWeight: 600 }}>
            {message}
          </div>
        )}
        {error && (
          <div style={{ marginBottom: 18, padding: '12px 16px', borderRadius: 10, background: 'var(--danger-tint)', color: 'var(--danger)', fontSize: 13.5, fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSaveSettings}>
          <section style={sectionStyle}>
            <h2 style={{ margin: '0 0 8px', fontSize: 20, color: 'var(--brand)' }}>Institution-wide Default Rate</h2>
            <p style={{ margin: '0 0 22px', color: 'var(--ink-soft)', fontSize: 14 }}>
              Applies to every author sale unless a specific book or author has its own rate configured below.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
              <label>
                <span style={labelStyle}>Default Royalty Rate (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  required
                  value={settings.defaultRatePct}
                  onChange={(e) => setSettings((p) => ({ ...p, defaultRatePct: e.target.value }))}
                  style={inputStyle}
                />
              </label>

              <label>
                <span style={labelStyle}>Effective Date</span>
                <input
                  type="date"
                  value={settings.effectiveDate}
                  onChange={(e) => setSettings((p) => ({ ...p, effectiveDate: e.target.value }))}
                  style={inputStyle}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 26 }}>
                <input
                  type="checkbox"
                  checked={!!settings.isActive}
                  onChange={(e) => setSettings((p) => ({ ...p, isActive: e.target.checked }))}
                />
                <span style={{ fontWeight: 700, fontSize: 13.5 }}>Active</span>
              </label>
            </div>

            <label style={{ display: 'block', marginTop: 20 }}>
              <span style={labelStyle}>Notes (optional, internal)</span>
              <textarea
                rows={2}
                value={settings.description}
                onChange={(e) => setSettings((p) => ({ ...p, description: e.target.value }))}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </label>

            <div style={{ marginTop: 20 }}>
              <button type="submit" disabled={savingSettings} style={buttonStyle('primary')}>
                {savingSettings ? 'Saving…' : 'Save Default Rate'}
              </button>
            </div>
          </section>
        </form>

        <section style={sectionStyle}>
          <h2 style={{ margin: '0 0 8px', fontSize: 20, color: 'var(--brand)' }}>Authors &amp; Balances</h2>
          <p style={{ margin: '0 0 20px', color: 'var(--ink-soft)', fontSize: 14 }}>
            Real, live figures computed from actual book sales — never estimated. Set a
            standing rate override for a specific author, or queue a payout of their
            available balance.
          </p>

          {authors.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-soft)', fontSize: 13.5 }}>
              No approved authors yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {authors.map((author) => (
                <div
                  key={author.id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '16px 18px',
                    background: 'var(--paper)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                    <div>
                      <strong style={{ fontSize: 15 }}>{author.name}</strong>
                      <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>
                        {author.email} · {author.bookCount} book{author.bookCount === 1 ? '' : 's'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 12.5 }}>
                      <div>
                        <div style={{ color: 'var(--ink-soft)' }}>Available</div>
                        <strong style={{ color: 'var(--success)' }}>{money(author.availableBalanceUSD)}</strong>
                      </div>
                      <div>
                        <div style={{ color: 'var(--ink-soft)' }}>Queued</div>
                        <strong>{money(author.queuedInPayoutUSD)}</strong>
                      </div>
                      <div>
                        <div style={{ color: 'var(--ink-soft)' }}>Paid to date</div>
                        <strong>{money(author.totalPaidOutUSD)}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    <label>
                      <span style={{ ...labelStyle, fontSize: 12 }}>Rate override (%) — blank uses default</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder={`${settings.defaultRatePct}`}
                          value={overrideDrafts[author.id] ?? ''}
                          onChange={(e) =>
                            setOverrideDrafts((p) => ({ ...p, [author.id]: e.target.value }))
                          }
                          style={{ ...inputStyle, padding: '8px 10px' }}
                        />
                        <button
                          type="button"
                          disabled={busyAuthorId === author.id}
                          onClick={() => handleSaveOverride(author.id)}
                          style={buttonStyle('secondary')}
                        >
                          Save
                        </button>
                      </div>
                    </label>

                    <label>
                      <span style={{ ...labelStyle, fontSize: 12 }}>Payout amount — blank pays full available balance</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder={money(author.availableBalanceUSD)}
                          value={payoutAmountDrafts[author.id] ?? ''}
                          onChange={(e) =>
                            setPayoutAmountDrafts((p) => ({ ...p, [author.id]: e.target.value }))
                          }
                          style={{ ...inputStyle, padding: '8px 10px' }}
                        />
                        <input
                          type="text"
                          placeholder="Method (e.g. Mobile Money)"
                          value={payoutMethodDrafts[author.id] ?? ''}
                          onChange={(e) =>
                            setPayoutMethodDrafts((p) => ({ ...p, [author.id]: e.target.value }))
                          }
                          style={{ ...inputStyle, padding: '8px 10px' }}
                        />
                        <button
                          type="button"
                          disabled={busyAuthorId === author.id || author.availableBalanceUSD <= 0}
                          onClick={() => handleCreatePayout(author.id)}
                          style={buttonStyle('primary')}
                        >
                          Queue Payout
                        </button>
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={sectionStyle}>
          <h2 style={{ margin: '0 0 8px', fontSize: 20, color: 'var(--brand)' }}>Payout History</h2>
          <p style={{ margin: '0 0 20px', color: 'var(--ink-soft)', fontSize: 14 }}>
            Every payout ever queued, approved, paid or rejected — the institution's full
            author-payment record.
          </p>

          {payouts.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-soft)', fontSize: 13.5 }}>
              No payouts have been recorded yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '8px 10px' }}>Author</th>
                    <th style={{ padding: '8px 10px' }}>Amount</th>
                    <th style={{ padding: '8px 10px' }}>Method</th>
                    <th style={{ padding: '8px 10px' }}>Reference</th>
                    <th style={{ padding: '8px 10px' }}>Status</th>
                    <th style={{ padding: '8px 10px' }}>Requested</th>
                    <th style={{ padding: '8px 10px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px' }}>
                        <div style={{ fontWeight: 700 }}>{p.authorName}</div>
                        <div style={{ color: 'var(--ink-soft)', fontSize: 11.5 }}>{p.authorEmail}</div>
                      </td>
                      <td style={{ padding: '10px', fontWeight: 700 }}>{money(p.amountUSD)}</td>
                      <td style={{ padding: '10px' }}>{p.method || '—'}</td>
                      <td style={{ padding: '10px' }}>
                        {p.status === 'PENDING' || p.status === 'APPROVED' ? (
                          <input
                            type="text"
                            placeholder="Enter reference to mark paid"
                            value={referenceDrafts[p.id] ?? ''}
                            onChange={(e) => setReferenceDrafts((prev) => ({ ...prev, [p.id]: e.target.value }))}
                            style={{ ...inputStyle, padding: '6px 8px', fontSize: 12, minWidth: 160 }}
                          />
                        ) : (
                          p.reference || '—'
                        )}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <StatusBadge status={p.status} />
                      </td>
                      <td style={{ padding: '10px', color: 'var(--ink-soft)' }}>
                        {new Date(p.requestedAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {p.status === 'PENDING' && (
                            <button
                              type="button"
                              disabled={busyPayoutId === p.id}
                              onClick={() => handlePayoutAction(p.id, 'approve')}
                              style={buttonStyle('secondary')}
                            >
                              Approve
                            </button>
                          )}
                          {(p.status === 'PENDING' || p.status === 'APPROVED') && (
                            <>
                              <button
                                type="button"
                                disabled={busyPayoutId === p.id}
                                onClick={() => handlePayoutAction(p.id, 'mark-paid')}
                                style={buttonStyle('primary')}
                              >
                                Mark Paid
                              </button>
                              <button
                                type="button"
                                disabled={busyPayoutId === p.id}
                                onClick={() => handlePayoutAction(p.id, 'reject')}
                                style={buttonStyle('secondary')}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
