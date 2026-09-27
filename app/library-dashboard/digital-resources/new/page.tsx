'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { INSTITUTE_LIBRARY_VISIBILITY_TIERS } from '@/lib/institute-library-visibility';

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

const initialForm = {
  titleEn: '',
  titleAr: '',
  descriptionEn: '',
  descriptionAr: '',
  category: 'ARTICLES',
  status: 'DRAFT',
  fileUrl: '',
  externalUrl: '',
  thumbnailUrl: '',
  author: '',
  subject: '',
  topic: '',
  isPublished: false,
  // Safe non-public default -- a resource only becomes Public via an
  // explicit choice here, matching the schema column's own default.
  visibility: 'INSTITUTE_ONLY',
};

export default function NewInstituteLibraryResourcePage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
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
      const res = await fetch('/api/library/institute-resources', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to create Digital Library resource.');
      router.push('/library-dashboard/digital-resources');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to create Digital Library resource.');
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ marginBottom: 18 }}>
        <Link href="/library-dashboard/digital-resources" style={{ fontSize: 13, color: 'var(--brand)' }}>
          ← Back to Digital Library
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: '10px 0 2px' }}>Add New Digital Library Resource</h1>
        <div style={{ color: 'var(--ink-soft)', fontSize: 13.5 }}>
          Add an institute e-book, article, fatwa, research paper, manuscript or other digital scholarly resource.
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
            <input value={form.author} onChange={(e) => set('author', e.target.value)} placeholder="Optional" />
          </div>
          <div className="ih-field">
            <label>Subject (optional)</label>
            <input value={form.subject} onChange={(e) => set('subject', e.target.value)} placeholder="Optional" />
          </div>
        </div>

        <div className="ih-field">
          <label>Topic (optional)</label>
          <input value={form.topic} onChange={(e) => set('topic', e.target.value)} placeholder="Optional" />
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
            Who may see this resource once published. Defaults to Institute
            Only -- choose Public deliberately to make it visible to anyone.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="ih-field">
            <label>File URL (app-hosted document)</label>
            <input
              value={form.fileUrl}
              onChange={(e) => set('fileUrl', e.target.value)}
              placeholder="https://... (optional if an external link is given)"
            />
          </div>
          <div className="ih-field">
            <label>External Resource Link</label>
            <input
              value={form.externalUrl}
              onChange={(e) => set('externalUrl', e.target.value)}
              placeholder="https://... (optional if a file URL is given)"
            />
          </div>
        </div>

        <div className="ih-field">
          <label>Thumbnail / Cover URL</label>
          <input
            value={form.thumbnailUrl}
            onChange={(e) => set('thumbnailUrl', e.target.value)}
            placeholder="Optional — https://..."
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

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Link href="/library-dashboard/digital-resources" className="ih-btn ih-btn-ghost">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="ih-btn ih-btn-primary">
            {saving ? 'Saving…' : 'Create Resource'}
          </button>
        </div>
      </form>
    </div>
  );
}
