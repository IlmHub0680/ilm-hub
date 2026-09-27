'use client';

import { useEffect, useState } from 'react';

export default function MediaSubscribersPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, awaitingApproval: 0, revenueUSD: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activatingId, setActivatingId] = useState(null);
  const [deactivatingId, setDeactivatingId] = useState(null);

  const load = async () => {
    try {
      const res = await fetch('/api/admin/media/subscribers', { credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load subscribers.');
      setSubscriptions(data.subscriptions);
      setSummary(data.summary);
    } catch (err) {
      setError(err.message || 'Failed to load subscribers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleActivate = async (id) => {
    setActivatingId(id);
    try {
      const res = await fetch(`/api/admin/media/subscribers/${id}/activate`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Unable to activate subscription.');
        return;
      }
      await load();
    } catch (err) {
      alert('Unable to activate subscription.');
    } finally {
      setActivatingId(null);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Cancel this subscription? The subscriber will immediately lose access to subscriber-only media.')) {
      return;
    }
    setDeactivatingId(id);
    try {
      const res = await fetch(`/api/admin/media/subscribers/${id}/deactivate`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Unable to cancel subscription.');
        return;
      }
      await load();
    } catch (err) {
      alert('Unable to cancel subscription.');
    } finally {
      setDeactivatingId(null);
    }
  };

  return (
    <div style={{ padding: 'var(--sp-6, 32px)', maxWidth: 1100 }}>
      <h1 style={{ fontSize: 26, fontWeight: 600, margin: '0 0 2px' }}>Subscribers</h1>
      <div style={{ color: 'var(--ink-soft)', fontSize: 13.5, marginBottom: 22 }}>
        Everyone who has paid for Media access — status, expiry and payment
        reference for each subscription.
      </div>

      <div className="ih-stat-grid" style={{ marginBottom: 24 }}>
        <div className="ih-stat-tile accent">
          <div className="n">{summary.total}</div>
          <div className="l">Total subscriptions</div>
        </div>
        <div className="ih-stat-tile">
          <div className="n">{summary.active}</div>
          <div className="l">Currently active</div>
        </div>
        <div className="ih-stat-tile">
          <div className="n">{summary.awaitingApproval}</div>
          <div className="l">Awaiting approval</div>
        </div>
        <div className="ih-stat-tile">
          <div className="n">${summary.revenueUSD.toFixed(2)}</div>
          <div className="l">Revenue collected</div>
        </div>
      </div>

      {error && (
        <div className="ih-card" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div className="ih-tbl-wrap">
        <table className="ih-tbl">
          <thead>
            <tr>
              <th>Subscriber</th>
              <th>Plan</th>
              <th>Started</th>
              <th>Expires</th>
              <th>Paid</th>
              <th>Payment Ref</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 28, color: 'var(--ink-soft)' }}>
                  Loading subscribers…
                </td>
              </tr>
            )}
            {!loading && subscriptions.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 28, color: 'var(--ink-soft)' }}>
                  No one has subscribed yet.
                </td>
              </tr>
            )}
            {subscriptions.map((s) => (
              <tr key={s.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{s.user.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{s.user.email}</div>
                </td>
                <td>{s.plan.name}</td>
                <td className="mono">{new Date(s.startedAt).toLocaleDateString()}</td>
                <td className="mono">{new Date(s.expiresAt).toLocaleDateString()}</td>
                <td className="mono">{s.paidAmount !== null ? `$${s.paidAmount.toFixed(2)}` : '—'}</td>
                <td style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>{s.paymentRef || '—'}</td>
                <td>
                  <span
                    className={`ih-badge ${
                      s.status === 'ACTIVE'
                        ? 'ih-b-success'
                        : s.awaitingApproval
                        ? 'ih-b-warning'
                        : s.status === 'PENDING'
                        ? 'ih-b-neutral'
                        : s.status === 'EXPIRED'
                        ? 'ih-b-neutral'
                        : 'ih-b-danger'
                    }`}
                  >
                    {s.awaitingApproval ? 'Awaiting Approval' : s.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {s.awaitingApproval && (
                      <button
                        className="ih-btn ih-btn-gold"
                        style={{ fontSize: 12, padding: '6px 14px' }}
                        disabled={activatingId === s.id}
                        onClick={() => handleActivate(s.id)}
                      >
                        {activatingId === s.id ? 'Activating…' : 'Activate'}
                      </button>
                    )}

                    {(s.status === 'ACTIVE' || s.status === 'PENDING') && (
                      <button
                        className="ih-b-danger"
                        style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, border: '1px solid var(--danger)', cursor: 'pointer', background: 'var(--danger-tint)', color: 'var(--danger)', fontWeight: 700 }}
                        disabled={deactivatingId === s.id}
                        onClick={() => handleDeactivate(s.id)}
                      >
                        {deactivatingId === s.id ? 'Cancelling…' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
