'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LIBRARY_CATEGORIES } from '@/lib/library';

const initialForm = {
  titleEn: '',
  titleAr: '',
  descriptionEn: '',
  descriptionAr: '',
  category: 'ARTICLES',
  fileUrl: '',
  thumbnailUrl: '',
  author: '',
  isPublished: true,
};

export default function NewLibraryResourcePage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/library-resources/items', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to create Library item.');
      router.push('/admin/library-resources');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Failed to create Library item.');
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: 'var(--sp-6, 32px)', maxWidth: 760 }}>
      <div style={{ marginBottom: 18 }}>
        <Link href="/admin/library-resources" style={{ fontSize: 13, color: 'var(--brand)' }}>
          ← Back to Library
        </Link>
        <h1 style={{ fontSize: 26, fontWeight: 600, margin: '10px 0 2px' }}>Add New Library Item</h1>
        <div style={{ color: 'var(--ink-soft)', fontSize: 13.5 }}>
          Add an article, fatwa, research paper, manuscript or other written resource.
        </div>
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
            <input
              value={form.titleEn}
              onChange={(e) => set('titleEn', e.target.value)}
              required
              placeholder="e.g. Rulings on Fasting While Traveling"
            />
          </div>
          <div className="ih-field">
            <label>Title (Arabic)</label>
            <input
              dir="rtl"
              value={form.titleAr}
              onChange={(e) => set('titleAr', e.target.value)}
              required
              style={{ fontFamily: 'var(--font-arabic-display)' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="ih-field">
            <label>Description (English)</label>
            <textarea
              rows={3}
              value={form.descriptionEn}
              onChange={(e) => set('descriptionEn', e.target.value)}
              required
            />
          </div>
          <div className="ih-field">
            <label>Description (Arabic)</label>
            <textarea
              dir="rtl"
              rows={3}
              value={form.descriptionAr}
              onChange={(e) => set('descriptionAr', e.target.value)}
              required
            />
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
            <input value={form.author} onChange={(e) => set('author', e.target.value)} placeholder="Optional" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="ih-field">
            <label>File URL (document to open/download)</label>
            <input
              value={form.fileUrl}
              onChange={(e) => set('fileUrl', e.target.value)}
              required
              placeholder="https://..."
            />
          </div>
          <div className="ih-field">
            <label>Thumbnail / Cover URL</label>
            <input
              value={form.thumbnailUrl}
              onChange={(e) => set('thumbnailUrl', e.target.value)}
              placeholder="Optional — https://..."
            />
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => set('isPublished', e.target.checked)}
          />
          Publish immediately
        </label>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Link href="/admin/library-resources" className="ih-btn ih-btn-ghost">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="ih-btn ih-btn-primary">
            {saving ? 'Saving…' : 'Create Library Item'}
          </button>
        </div>
      </form>
    </div>
  );
}
