'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const [form, setForm] = useState({
    titleEn: '',
    bodyEn: '',
    titleAr: '',
    bodyAr: '',
    expiresAt: '',
  });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/announcements', { credentials: 'include' });
      const result = await res.json();
      if (!result.success) {
        setError(result.error || 'Unable to load announcements.');
        return;
      }
      setItems(result.data);
    } catch (err) {
      console.error(err);
      setError('Unable to load announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!form.titleEn.trim() || !form.bodyEn.trim()) {
      setError('Please fill in a title and body.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await res.json();

      if (!result.success) {
        setError(result.error || 'Unable to publish announcement.');
        return;
      }

      setForm({ titleEn: '', bodyEn: '', titleAr: '', bodyAr: '', expiresAt: '' });
      await load();
    } catch (err) {
      console.error(err);
      setError('Unable to publish announcement.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item) => {
    setBusyId(item.id);
    try {
      const res = await fetch(`/api/admin/announcements/${item.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      const result = await res.json();
      if (!result.success) {
        setError(result.error || 'Unable to update announcement.');
        return;
      }
      await load();
    } catch (err) {
      console.error(err);
      setError('Unable to update announcement.');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (item) => {
    const confirmed = window.confirm(
      `Remove "${item.titleEn}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setBusyId(item.id);
    try {
      const res = await fetch(`/api/admin/announcements/${item.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const result = await res.json();
      if (!result.success) {
        setError(result.error || 'Unable to remove announcement.');
        return;
      }
      await load();
    } catch (err) {
      console.error(err);
      setError('Unable to remove announcement.');
    } finally {
      setBusyId(null);
    }
  };

  const isExpired = (item) =>
    item.expiresAt && new Date(item.expiresAt).getTime() < Date.now();

  return (
    <main style={page}>
      <div style={container}>
        <Link href="/admin/homepage" style={backLink}>← Back to Homepage Management</Link>

        <header style={{ marginBottom: 28 }}>
          <span style={eyebrow}>HOMEPAGE CONTENT</span>
          <h1 style={title}>Institution Announcements</h1>
          <p style={subtitle}>
            Published here appear on the public homepage for everyone —
            students, applicants, and visitors. Faculty- and
            department-level notices are managed by Deans and Heads of
            Department from their own dashboards.
          </p>
        </header>

        {error && <div style={errorBox}>{error}</div>}

        <section style={card}>
          <h2 style={cardTitle}>Publish a new announcement</h2>

          <form onSubmit={handleCreate} style={formGrid}>
            <label style={label}>
              Title (English)
              <input
                style={input}
                value={form.titleEn}
                onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                placeholder="e.g. Second Semester registration now open"
              />
            </label>

            <label style={label}>
              Title (Arabic) — optional
              <input
                style={input}
                value={form.titleAr}
                onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                dir="rtl"
              />
            </label>

            <label style={{ ...label, gridColumn: '1 / -1' }}>
              Message (English)
              <textarea
                style={{ ...input, minHeight: 90, resize: 'vertical' }}
                value={form.bodyEn}
                onChange={(e) => setForm({ ...form, bodyEn: e.target.value })}
              />
            </label>

            <label style={{ ...label, gridColumn: '1 / -1' }}>
              Message (Arabic) — optional
              <textarea
                style={{ ...input, minHeight: 90, resize: 'vertical' }}
                value={form.bodyAr}
                onChange={(e) => setForm({ ...form, bodyAr: e.target.value })}
                dir="rtl"
              />
            </label>

            <label style={label}>
              Expires on — optional
              <input
                type="date"
                style={input}
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              />
            </label>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" style={primaryButton} disabled={saving}>
                {saving ? 'Publishing…' : 'Publish Announcement'}
              </button>
            </div>
          </form>
        </section>

        <section style={{ marginTop: 28 }}>
          <h2 style={cardTitle}>Published announcements</h2>

          {loading ? (
            <p style={{ color: 'var(--ink-soft)' }}>Loading…</p>
          ) : items.length === 0 ? (
            <div style={emptyState}>
              No institution-wide announcements yet. Publish one above —
              it will appear on the public homepage immediately.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {items.map((item) => (
                <div key={item.id} style={row}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <strong style={{ color: 'var(--ink)', fontSize: 15 }}>{item.titleEn}</strong>
                      {!item.isActive && <span style={badge('var(--ink-soft)')}>Hidden</span>}
                      {item.isActive && isExpired(item) && <span style={badge('var(--warning)')}>Expired</span>}
                      {item.isActive && !isExpired(item) && <span style={badge('var(--brand-light)')}>Live</span>}
                    </div>
                    <p style={{ color: 'var(--ink-soft)', fontSize: 13.5, margin: '6px 0' }}>{item.bodyEn}</p>
                    <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                      Published {new Date(item.publishedAt).toLocaleDateString()}
                      {item.expiresAt && ` · Expires ${new Date(item.expiresAt).toLocaleDateString()}`}
                      {item.createdBy?.name && ` · By ${item.createdBy.name}`}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => toggleActive(item)}
                      disabled={busyId === item.id}
                      style={secondaryButton}
                    >
                      {item.isActive ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => remove(item)}
                      disabled={busyId === item.id}
                      style={dangerButton}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

const page = { minHeight: '100vh', background: 'var(--paper)', padding: '40px 20px' };
const container = { maxWidth: 860, margin: '0 auto' };
const backLink = { display: 'inline-block', marginBottom: 20, color: 'var(--brand)', fontSize: 13.5, textDecoration: 'none' };
const eyebrow = { fontSize: 11.5, fontWeight: 800, letterSpacing: '0.1em', color: 'var(--gold-dark)' };
const title = { fontFamily: 'var(--font-display)', fontSize: 28, margin: '6px 0 8px', color: 'var(--ink)' };
const subtitle = { color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.6, maxWidth: 620, margin: 0 };
const errorBox = { padding: '12px 16px', borderRadius: 10, background: 'var(--danger-tint)', color: 'var(--danger)', fontSize: 13.5, marginBottom: 20 };
const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 };
const cardTitle = { fontSize: 16, fontWeight: 700, color: 'var(--ink)', margin: '0 0 16px' };
const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 };
const label = { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, fontWeight: 700, color: 'var(--ink-soft)' };
const input = { padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, fontFamily: 'inherit', background: 'var(--paper)', color: 'var(--ink)' };
const primaryButton = { background: 'var(--brand)', color: 'var(--on-accent)', border: 'none', borderRadius: 9, padding: '11px 20px', fontWeight: 700, fontSize: 13.5, cursor: 'pointer' };
const secondaryButton = { background: 'var(--border-soft)', color: 'var(--ink)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' };
const dangerButton = { background: 'var(--danger-tint)', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: 8, padding: '8px 14px', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' };
const emptyState = { padding: '28px 20px', textAlign: 'center', color: 'var(--ink-soft)', fontSize: 13.5, background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 12 };
const row = { display: 'flex', gap: 16, alignItems: 'flex-start', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 };
const badge = (color) => ({
  display: 'inline-flex',
  padding: '2px 9px',
  borderRadius: 999,
  fontSize: 10.5,
  fontWeight: 800,
  color,
  border: `1px solid ${color}`,
});
