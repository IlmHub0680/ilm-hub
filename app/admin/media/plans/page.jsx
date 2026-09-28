'use client';

import { useEffect, useState } from 'react';

const emptyForm = { name: '', descriptionEn: '', priceUSD: '', durationDays: '30' };

export default function MediaSubscriptionPlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/media/plans', { credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load plans.');
      setPlans(data.plans);
    } catch (err) {
      setError(err.message || 'Failed to load plans.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/media/plans', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          priceUSD: Number(form.priceUSD),
          durationDays: Number(form.durationDays),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to create plan.');
      setPlans((prev) => [...prev, data.plan].sort((a, b) => a.priceUSD - b.priceUSD));
      setForm(emptyForm);
    } catch (err) {
      setError(err.message || 'Failed to create plan.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(plan) {
    setBusyId(plan.id);
    try {
      const res = await fetch(`/api/admin/media/plans/${plan.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !plan.isActive }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to update plan.');
      setPlans((prev) => prev.map((p) => (p.id === plan.id ? data.plan : p)));
    } catch (err) {
      alert(err.message || 'Failed to update plan.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div style={{ padding: 'var(--sp-6, 32px)', maxWidth: 900 }}>
      <h1 style={{ fontSize: 26, fontWeight: 600, margin: '0 0 2px' }}>Subscription Plans</h1>
      <div style={{ color: 'var(--ink-soft)', fontSize: 13.5, marginBottom: 22 }}>
        Set the price and duration of Media subscriptions. Subscribers get access to
        every item marked "requires subscription".
      </div>

      {error && (
        <div className="ih-card" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', marginBottom: 18 }}>
          {error}
        </div>
      )}

      <div className="ih-tbl-wrap" style={{ marginBottom: 24 }}>
        <table className="ih-tbl">
          <thead>
            <tr>
              <th>Plan</th>
              <th>Description</th>
              <th>Price</th>
              <th>Duration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 28, color: 'var(--ink-soft)' }}>
                  Loading plans…
                </td>
              </tr>
            )}
            {!loading && plans.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 28, color: 'var(--ink-soft)' }}>
                  No subscription plans yet. Create one below.
                </td>
              </tr>
            )}
            {plans.map((plan) => (
              <tr key={plan.id}>
                <td style={{ fontWeight: 600 }}>{plan.name}</td>
                <td>{plan.descriptionEn || '—'}</td>
                <td className="mono">${plan.priceUSD.toFixed(2)}</td>
                <td>{plan.durationDays} days</td>
                <td>
                  <button
                    onClick={() => toggleActive(plan)}
                    disabled={busyId === plan.id}
                    className={`ih-badge ${plan.isActive ? 'ih-b-success' : 'ih-b-neutral'}`}
                    style={{ border: 'none', cursor: 'pointer' }}
                  >
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleCreate} className="ih-card" style={{ display: 'grid', gap: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Add a new plan</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="ih-field">
            <label>Plan name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              placeholder="e.g. Monthly Access"
            />
          </div>
          <div className="ih-field">
            <label>Description (optional)</label>
            <input
              value={form.descriptionEn}
              onChange={(e) => setForm((f) => ({ ...f, descriptionEn: e.target.value }))}
              placeholder="e.g. Full access to the Media"
            />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="ih-field">
            <label>Price (USD)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.priceUSD}
              onChange={(e) => setForm((f) => ({ ...f, priceUSD: e.target.value }))}
              required
            />
          </div>
          <div className="ih-field">
            <label>Duration (days)</label>
            <input
              type="number"
              min="1"
              value={form.durationDays}
              onChange={(e) => setForm((f) => ({ ...f, durationDays: e.target.value }))}
              required
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" disabled={saving} className="ih-btn ih-btn-primary">
            {saving ? 'Saving…' : 'Create Plan'}
          </button>
        </div>
      </form>
    </div>
  );
}
