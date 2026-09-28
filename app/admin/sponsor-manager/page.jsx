'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const emptyForm = {
  name: '',
  description: '',
  logoUrl: '',
  websiteUrl: '',
  amountUSD: '',
  startDate: '',
  endDate: '',
  isPublic: true,
};

export default function SponsorManagerDashboard() {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/sponsors', { credentials: 'include' });
      const result = await res.json();
      if (!result.success) {
        setError(result.error || 'Unable to load sponsors.');
        return;
      }
      setSponsors(result.sponsors);
    } catch (err) {
      console.error(err);
      setError('Unable to load sponsors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (sponsor) => {
    setEditingId(sponsor.id);
    setForm({
      name: sponsor.name || '',
      description: sponsor.description || '',
      logoUrl: sponsor.logoUrl || '',
      websiteUrl: sponsor.websiteUrl || '',
      amountUSD: sponsor.amountUSD === null || sponsor.amountUSD === undefined ? '' : String(sponsor.amountUSD),
      startDate: sponsor.startDate ? sponsor.startDate.slice(0, 10) : '',
      endDate: sponsor.endDate ? sponsor.endDate.slice(0, 10) : '',
      isPublic: sponsor.isPublic,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError('Please enter a sponsor name.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const url = editingId ? `/api/admin/sponsors/${editingId}` : '/api/admin/sponsors';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await res.json();

      if (!result.success) {
        setError(result.error || 'Unable to save sponsor.');
        return;
      }

      resetForm();
      await load();
    } catch (err) {
      console.error(err);
      setError('Unable to save sponsor.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (sponsor) => {
    setBusyId(sponsor.id);
    try {
      const res = await fetch(`/api/admin/sponsors/${sponsor.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: sponsor.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }),
      });
      const result = await res.json();
      if (!result.success) {
        setError(result.error || 'Unable to update sponsor.');
        return;
      }
      await load();
    } catch (err) {
      console.error(err);
      setError('Unable to update sponsor.');
    } finally {
      setBusyId(null);
    }
  };

  const togglePublic = async (sponsor) => {
    setBusyId(sponsor.id);
    try {
      const res = await fetch(`/api/admin/sponsors/${sponsor.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !sponsor.isPublic }),
      });
      const result = await res.json();
      if (!result.success) {
        setError(result.error || 'Unable to update sponsor.');
        return;
      }
      await load();
    } catch (err) {
      console.error(err);
      setError('Unable to update sponsor.');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (sponsor) => {
    const confirmed = window.confirm(`Remove sponsor "${sponsor.name}"? This cannot be undone.`);
    if (!confirmed) return;

    setBusyId(sponsor.id);
    try {
      const res = await fetch(`/api/admin/sponsors/${sponsor.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const result = await res.json();
      if (!result.success) {
        setError(result.error || 'Unable to remove sponsor.');
        return;
      }
      if (editingId === sponsor.id) resetForm();
      await load();
    } catch (err) {
      console.error(err);
      setError('Unable to remove sponsor.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--paper)', padding: '40px 20px', fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <Link href="/admin" style={{ color: 'var(--brand)', fontWeight: '600', textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>
          ← Back to Admin
        </Link>

        <div style={{ marginBottom: '28px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--gold-dark)' }}>
            INSTITUTION OVERSIGHT
          </span>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 'bold', color: 'var(--ink)', margin: '6px 0 8px' }}>Sponsor Manager</h1>
          <p style={{ color: 'var(--ink-soft)', maxWidth: 640, lineHeight: 1.6 }}>
            Manage institution sponsors and partners. Sponsors marked Active and Public appear
            on the public <Link href="/sponsored" style={{ color: 'var(--brand)', fontWeight: 700 }}>Sponsored</Link> page.
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--danger-tint)', color: 'var(--danger)', fontSize: 13.5, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <section className="ih-card" style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 16px' }}>
            {editingId ? 'Edit sponsor' : 'Add a new sponsor'}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="ih-field">
              <label>Sponsor name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Al-Noor Foundation"
              />
            </div>

            <div className="ih-field">
              <label>Website URL — optional</label>
              <input
                value={form.websiteUrl}
                onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="ih-field">
              <label>Logo URL — optional</label>
              <input
                value={form.logoUrl}
                onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="ih-field">
              <label>Sponsorship amount (USD) — optional</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amountUSD}
                onChange={(e) => setForm({ ...form, amountUSD: e.target.value })}
              />
            </div>

            <div className="ih-field">
              <label>Start date — optional</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>

            <div className="ih-field">
              <label>End date — optional</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>

            <div className="ih-field" style={{ gridColumn: '1 / -1' }}>
              <label>Description — optional</label>
              <textarea
                style={{ minHeight: 80, resize: 'vertical' }}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 700, color: 'var(--ink-soft)' }}>
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
              />
              Show on the public Sponsored page (when Active)
            </label>

            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <button type="submit" disabled={saving} className="ih-btn ih-btn-primary">
                {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Sponsor'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="ih-btn ih-btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="ih-card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 16px' }}>Sponsors</h2>

          {loading ? (
            <p style={{ color: 'var(--ink-soft)' }}>Loading…</p>
          ) : sponsors.length === 0 ? (
            <div style={{ padding: '28px 20px', textAlign: 'center', color: 'var(--ink-soft)', fontSize: 13.5, background: 'var(--paper)', border: '1px dashed var(--border)', borderRadius: 12 }}>
              No sponsors yet. Add one above.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {sponsors.map((sponsor) => (
                <div key={sponsor.id} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, flexWrap: 'wrap' }}>
                  {sponsor.logoUrl && (
                    <img src={sponsor.logoUrl} alt="" style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)' }} />
                  )}

                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <strong style={{ color: 'var(--ink)', fontSize: 15 }}>{sponsor.name}</strong>
                      <span className={`ih-badge ${sponsor.status === 'ACTIVE' ? 'ih-b-success' : 'ih-b-danger'}`}>
                        {sponsor.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </span>
                      <span className={`ih-badge ${sponsor.isPublic ? 'ih-b-warning' : 'ih-b-neutral'}`}>
                        {sponsor.isPublic ? 'Public' : 'Hidden'}
                      </span>
                    </div>

                    {sponsor.description && (
                      <p style={{ color: 'var(--ink-soft)', fontSize: 13.5, margin: '6px 0' }}>{sponsor.description}</p>
                    )}

                    <div style={{ fontSize: 12, color: 'var(--ink-soft)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {sponsor.websiteUrl && (
                        <a href={sponsor.websiteUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--brand)' }}>
                          {sponsor.websiteUrl}
                        </a>
                      )}
                      {sponsor.amountUSD !== null && <span className="mono">${Number(sponsor.amountUSD).toFixed(2)}</span>}
                      {(sponsor.startDate || sponsor.endDate) && (
                        <span className="mono">
                          {sponsor.startDate ? new Date(sponsor.startDate).toLocaleDateString() : '—'}
                          {' – '}
                          {sponsor.endDate ? new Date(sponsor.endDate).toLocaleDateString() : '—'}
                        </span>
                      )}
                      {sponsor.createdBy?.name && <span>Added by {sponsor.createdBy.name}</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                    <button onClick={() => startEdit(sponsor)} className="ih-btn ih-btn-secondary">
                      Edit
                    </button>
                    <button onClick={() => toggleStatus(sponsor)} disabled={busyId === sponsor.id} className="ih-btn ih-btn-secondary">
                      {sponsor.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => togglePublic(sponsor)} disabled={busyId === sponsor.id} className="ih-btn ih-btn-secondary">
                      {sponsor.isPublic ? 'Hide' : 'Publish'}
                    </button>
                    <button onClick={() => remove(sponsor)} disabled={busyId === sponsor.id} className="ih-btn ih-btn-danger">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
