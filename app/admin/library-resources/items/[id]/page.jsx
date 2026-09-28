'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LIBRARY_CATEGORIES } from '@/lib/library';

export default function EditLibraryResourcePage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params?.id;

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/library-resources/items', { credentials: 'include' });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to load Library item.');
        const found = data.items.find((i) => i.id === itemId);
        if (!found) throw new Error('Library item not found.');
        setForm(found);
      } catch (err) {
        setError(err.message || 'Failed to load Library item.');
      } finally {
        setLoading(false);
      }
    }
    if (itemId) load();
  }, [itemId]);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/library-resources/items/${itemId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titleEn: form.titleEn,
          titleAr: form.titleAr,
          descriptionEn: form.descriptionEn,
          descriptionAr: form.descriptionAr,
          category: form.category,
          fileUrl: form.fileUrl,
          thumbnailUrl: form.thumbnailUrl,
          author: form.author,
          isPublished: form.isPublished,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to update Library item.');
      router.push('/admin/library-resources');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Failed to update Library item.');
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${form.titleEn}"? This cannot be undone.`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/library-resources/items/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to delete Library item.');
      router.push('/admin/library-resources');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Failed to delete Library item.');
      setSaving(false);
    }
  }

  if (loading) {
    return <div style={{ padding: 32, color: 'var(--ink-soft)' }}>Loading…</div>;
  }

  if (error && !form) {
    return (
      <div style={{ padding: 32 }}>
        <div className="ih-card" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--sp-6, 32px)', maxWidth: 760 }}>
      <div style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Link href="/admin/library-resources" style={{ fontSize: 13, color: 'var(--brand)' }}>
            ← Back to Library
          </Link>
          <h1 style={{ fontSize: 26, fontWeight: 600, margin: '10px 0 2px' }}>Edit Library Item</h1>
          <div style={{ color: 'var(--ink-soft)', fontSize: 13.5 }}>{form.titleEn}</div>
        </div>
        <button onClick={handleDelete} disabled={saving} className="ih-btn ih-btn-danger">
          Delete
        </button>
      </div>

      {error && (
        <div className="ih-card" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', marginBottom: 18 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="ih-card" style={{ display: 'grid', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="ih-field">
            <label>Title (English)</label>
            <input value={form.titleEn} onChange={(e) => set('titleEn', e.target.value)} required />
          </div>
          <div className="ih-field">
            <label>Title (Arabic)</label>
            <input dir="rtl" value={form.titleAr} onChange={(e) => set('titleAr', e.target.value)} required />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="ih-field">
            <label>Description (English)</label>
            <textarea rows={3} value={form.descriptionEn} onChange={(e) => set('descriptionEn', e.target.value)} required />
          </div>
          <div className="ih-field">
            <label>Description (Arabic)</label>
            <textarea dir="rtl" rows={3} value={form.descriptionAr} onChange={(e) => set('descriptionAr', e.target.value)} required />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="ih-field">
            <label>Category</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)}>
              {LIBRARY_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="ih-field">
            <label>Author (optional)</label>
            <input value={form.author || ''} onChange={(e) => set('author', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="ih-field">
            <label>File URL</label>
            <input value={form.fileUrl} onChange={(e) => set('fileUrl', e.target.value)} required />
          </div>
          <div className="ih-field">
            <label>Thumbnail / Cover URL</label>
            <input value={form.thumbnailUrl || ''} onChange={(e) => set('thumbnailUrl', e.target.value)} />
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
          <input type="checkbox" checked={form.isPublished} onChange={(e) => set('isPublished', e.target.checked)} />
          Published
        </label>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Link href="/admin/library-resources" className="ih-btn ih-btn-ghost">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="ih-btn ih-btn-primary">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
