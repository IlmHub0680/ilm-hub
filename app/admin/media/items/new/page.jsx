'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MEDIA_CATEGORIES } from '@/lib/media';

const initialForm = {
  titleEn: '',
  titleAr: '',
  descriptionEn: '',
  descriptionAr: '',
  category: 'LECTURES',
  mediaType: 'VIDEO',
  mediaUrl: '',
  thumbnailUrl: '',
  speaker: '',
  durationSec: '',
  isPublished: true,
  isFreePreview: false,
  requiresSubscription: true,
  priceUSD: '',
};

export default function NewMediaItemPage() {
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
      const res = await fetch('/api/admin/media/items', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          durationSec: form.durationSec === '' ? 0 : Number(form.durationSec),
          priceUSD: form.priceUSD === '' ? null : Number(form.priceUSD),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to create media item.');
      router.push('/admin/media');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Failed to create media item.');
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: 'var(--sp-6, 32px)', maxWidth: 760 }}>
      <div style={{ marginBottom: 18 }}>
        <Link href="/admin/media" style={{ fontSize: 13, color: 'var(--brand)' }}>
          ← Back to Media
        </Link>
        <h1 style={{ fontSize: 26, fontWeight: 600, margin: '10px 0 2px' }}>Upload New Media</h1>
        <div style={{ color: 'var(--ink-soft)', fontSize: 13.5 }}>
          Add a sermon, text, poem, lecture or programme to the library.
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
              placeholder="e.g. Friday Khutbah: Patience in Adversity"
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div className="ih-field">
            <label>Category</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)}>
              {MEDIA_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="ih-field">
            <label>Media Type</label>
            <select value={form.mediaType} onChange={(e) => set('mediaType', e.target.value)}>
              <option value="VIDEO">Video</option>
              <option value="AUDIO">Audio</option>
            </select>
          </div>
          <div className="ih-field">
            <label>Duration (seconds)</label>
            <input
              type="number"
              min="0"
              value={form.durationSec}
              onChange={(e) => set('durationSec', e.target.value)}
              placeholder="e.g. 1800"
            />
          </div>
        </div>

        <div className="ih-field">
          <label>Speaker / Presenter</label>
          <input value={form.speaker} onChange={(e) => set('speaker', e.target.value)} placeholder="Optional" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="ih-field">
            <label>Media URL (video/audio file)</label>
            <input
              value={form.mediaUrl}
              onChange={(e) => set('mediaUrl', e.target.value)}
              required
              placeholder="https://..."
            />
          </div>
          <div className="ih-field">
            <label>Thumbnail URL</label>
            <input
              value={form.thumbnailUrl}
              onChange={(e) => set('thumbnailUrl', e.target.value)}
              placeholder="Optional — https://..."
            />
          </div>
        </div>

        <div
          className="ih-card"
          style={{ background: 'var(--paper)', display: 'grid', gap: 12, boxShadow: 'none' }}
        >
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase' }}>
            Access & Pricing
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
            <input
              type="checkbox"
              checked={form.requiresSubscription}
              onChange={(e) => set('requiresSubscription', e.target.checked)}
            />
            Requires an active subscription to view
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
            <input
              type="checkbox"
              checked={form.isFreePreview}
              onChange={(e) => set('isFreePreview', e.target.checked)}
            />
            Mark as free preview (visible to everyone regardless of subscription)
          </label>

          <div className="ih-field" style={{ maxWidth: 220 }}>
            <label>Individual price (USD, optional)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.priceUSD}
              onChange={(e) => set('priceUSD', e.target.value)}
              placeholder="Leave blank if subscription-only"
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => set('isPublished', e.target.checked)}
            />
            Publish immediately
          </label>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Link href="/admin/media" className="ih-btn ih-btn-ghost">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="ih-btn ih-btn-primary">
            {saving ? 'Saving…' : 'Create Media Item'}
          </button>
        </div>
      </form>
    </div>
  );
}
