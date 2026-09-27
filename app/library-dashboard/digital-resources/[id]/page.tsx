'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { INSTITUTE_LIBRARY_VISIBILITY_TIERS } from '@/lib/institute-library-visibility.constants';

const CATEGORY_OPTIONS = [
  { value: 'DIGITAL_BOOKS', label: 'Digital Books' },
  { value: 'EBOOKS', label: 'E-Books' },
  { value: 'ARTICLES', label: 'Articles' },
  { value: 'FATWAS', label: 'Fatwas' },
  { value: 'RESEARCH_PAPERS', label: 'Research Papers' },
  { value: 'MANUSCRIPTS', label: 'Manuscripts' },
  { value: 'MUTOON_TEXTS', label: 'Mutoon / Texts' },
  { value: 'ACADEMIC_RESOURCES', label: 'Academic Resources' },
  { value: 'ISLAMIC_SCHOLARLY_RESOURCES', label: 'Islamic Scholarly Resources' },
  { value: 'COURSE_RESOURCES', label: 'Course Resources' },
];

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export default function EditInstituteLibraryResourcePage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params?.id as string;

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/library/institute-resources', { credentials: 'include' });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to load Digital Library resource.');
        const found = data.items.find((i: any) => i.id === itemId);
        if (!found) throw new Error('Digital Library resource not found.');
        setForm({ ...found, fileUrl: found.fileUrl || '', externalUrl: found.externalUrl || '' });
      } catch (err: any) {
        setError(err.message || 'Failed to load Digital Library resource.');
      } finally {
        setLoading(false);
      }
    }
    if (itemId) load();
  }, [itemId]);

  function set(field: string, value: any) {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.fileUrl.trim() && !form.externalUrl.trim()) {
      setError('Either a file URL or an external resource link is required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/library/institute-resources/${itemId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titleEn: form.titleEn,
          titleAr: form.titleAr,
          descriptionEn: form.descriptionEn,
          descriptionAr: form.descriptionAr,
          category: form.category,
          status: form.status,
          fileUrl: form.fileUrl,
          externalUrl: form.externalUrl,
          thumbnailUrl: form.thumbnailUrl,
          author: form.author,
          subject: form.subject,
          topic: form.topic,
          isPublished: form.isPublished,
          visibility: form.visibility,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to update Digital Library resource.');
      router.push('/library-dashboard/digital-resources');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update Digital Library resource.');
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${form.titleEn}"? This cannot be undone.`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/library/institute-resources/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to delete Digital Library resource.');
      router.push('/library-dashboard/digital-resources');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to delete Digital Library resource.');
      setSaving(false);
    }
  }

  if (loading) {
    return <div style={{ color: 'var(--ink-soft)' }}>Loading…</div>;
  }

  if (error && !form) {
    return (
      <div className="ih-card" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>{error}</div>
    );
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Link href="/library-dashboard/digital-resources" style={{ fontSize: 13, color: 'var(--brand)' }}>
            ← Back to Digital Library
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: '10px 0 2px' }}>Edit Digital Library Resource</h1>
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
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="ih-field">
            <label>Resource Status</label>
            <select value={form.status} onChange={(e) => set('status', e.target.value)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="ih-field">
            <label>Author (optional)</label>
            <input value={form.author || ''} onChange={(e) => set('author', e.target.value)} />
          </div>
          <div className="ih-field">
            <label>Subject (optional)</label>
            <input value={form.subject || ''} onChange={(e) => set('subject', e.target.value)} />
          </div>
        </div>

        <div className="ih-field">
          <label>Topic (optional)</label>
          <input value={form.topic || ''} onChange={(e) => set('topic', e.target.value)} />
        </div>

        <div className="ih-field">
          <label>Visibility</label>
          <select value={form.visibility} onChange={(e) => set('visibility', e.target.value)}>
            {INSTITUTE_LIBRARY_VISIBILITY_TIERS.map((t: any) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>
            Who may see this resource once published. Re-tiering to Public is
            logged in the Audit Log.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="ih-field">
            <label>File URL (app-hosted document)</label>
            <input value={form.fileUrl} onChange={(e) => set('fileUrl', e.target.value)} />
          </div>
          <div className="ih-field">
            <label>External Resource Link</label>
            <input value={form.externalUrl} onChange={(e) => set('externalUrl', e.target.value)} />
          </div>
        </div>

        <div className="ih-field">
          <label>Thumbnail / Cover URL</label>
          <input value={form.thumbnailUrl || ''} onChange={(e) => set('thumbnailUrl', e.target.value)} />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
          <input type="checkbox" checked={form.isPublished} onChange={(e) => set('isPublished', e.target.checked)} />
          Published
        </label>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Link href="/library-dashboard/digital-resources" className="ih-btn ih-btn-ghost">
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
