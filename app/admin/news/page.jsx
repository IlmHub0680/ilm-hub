'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import RichTextEditor from '@/components/RichTextEditor';

const CATEGORIES = [
  { value: 'GENERAL', label: 'General' },
  { value: 'ANNOUNCEMENT', label: 'Announcement' },
  { value: 'ACADEMIC', label: 'Academic' },
  { value: 'ADMISSIONS', label: 'Admissions' },
  { value: 'COMMUNITY', label: 'Community' },
  { value: 'ACHIEVEMENT', label: 'Achievement' },
];

const EMPTY_FORM = {
  titleEn: '', titleAr: '', bodyEnHtml: '', bodyArHtml: '',
  featuredImageUrl: '', category: 'GENERAL', isPublished: false,
};

const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '10px 12px',
  border: '1px solid var(--border)', borderRadius: 8, fontSize: 14,
  color: 'var(--ink)', backgroundColor: 'var(--surface)',
};

const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 13 };

export default function AdminNewsPage() {
  const [articles, setArticles] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setArticles(null);
    setError('');
    try {
      const res = await fetch('/api/admin/news', { credentials: 'include' });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to load articles.');
      setArticles(result.data);
    } catch (err) {
      setError(err.message);
      setArticles([]);
    }
  }

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(article) {
    setEditingId(article.id);
    setForm({
      titleEn: article.titleEn, titleAr: article.titleAr, bodyEnHtml: article.bodyEnHtml,
      bodyArHtml: article.bodyArHtml, featuredImageUrl: article.featuredImageUrl,
      category: article.category, isPublished: article.isPublished,
    });
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'news');
      const res = await fetch('/api/admin/uploads/image', { method: 'POST', credentials: 'include', body: formData });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Upload failed.');
      set('featuredImageUrl', result.url);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.titleEn.trim() || !form.bodyEnHtml.trim()) {
      setMessage('Please fill in a title and article content.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const url = editingId ? `/api/admin/news/${editingId}` : '/api/admin/news';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method, credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to save.');
      setMessage(editingId ? 'Article updated.' : 'Article created.');
      cancelEdit();
      load();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(article) {
    setBusyId(article.id);
    try {
      const res = await fetch(`/api/admin/news/${article.id}`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !article.isPublished }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to update.');
      setArticles((prev) => prev.map((a) => (a.id === article.id ? result.data : a)));
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main style={{ padding: '40px 32px 80px', color: 'var(--ink)', maxWidth: 880 }}>
      <Link href="/admin" style={{ display: 'inline-block', marginBottom: 16, color: 'var(--brand)', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>← Back to Admin Overview</Link>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>News</h1>
        <p style={{ marginTop: 8, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
          Write and manage news articles shown publicly at /news. Only
          articles marked Published are visible to the public.
        </p>
      </div>

      {message && <div className="ih-card" style={{ padding: '12px 16px', marginBottom: 16 }}>{message}</div>}

      <form onSubmit={submit} className="ih-card" style={{ padding: 22, marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{editingId ? 'Edit Article' : 'New Article'}</h2>

        <div>
          <label style={labelStyle}>Title (English) *</label>
          <input value={form.titleEn} onChange={(e) => set('titleEn', e.target.value)} style={inputStyle} required />
        </div>
        <div>
          <label style={labelStyle}>Title (Arabic)</label>
          <input value={form.titleAr} onChange={(e) => set('titleAr', e.target.value)} style={{ ...inputStyle, direction: 'rtl', textAlign: 'right' }} />
        </div>

        <div>
          <label style={labelStyle}>Category</label>
          <select value={form.category} onChange={(e) => set('category', e.target.value)} style={inputStyle}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Featured Image</label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {form.featuredImageUrl && (
              <div style={{ width: 80, height: 54, borderRadius: 8, backgroundImage: `url(${form.featuredImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid var(--border)' }} />
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
            {uploading && <span style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>Uploading…</span>}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Article Content (English) *</label>
          <RichTextEditor value={form.bodyEnHtml} onChange={(html) => set('bodyEnHtml', html)} minHeight={240} />
        </div>
        <div>
          <label style={labelStyle}>Article Content (Arabic)</label>
          <RichTextEditor value={form.bodyArHtml} onChange={(html) => set('bodyArHtml', html)} minHeight={200} />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}>
          <input type="checkbox" checked={form.isPublished} onChange={(e) => set('isPublished', e.target.checked)} />
          Published (visible on the public site)
        </label>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" disabled={saving} style={primaryButtonStyle}>
            {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Article'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} style={secondaryButtonStyle}>Cancel</button>
          )}
        </div>
      </form>

      {articles === null && <div style={{ color: 'var(--ink-soft)' }}>Loading…</div>}
      {articles && articles.length === 0 && (
        <div className="ih-card" style={{ padding: 24, color: 'var(--ink-soft)' }}>No articles yet.</div>
      )}

      {articles && articles.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {articles.map((article) => (
            <div key={article.id} className="ih-card" style={{ padding: 18, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700 }}>{article.titleEn}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: article.isPublished ? 'var(--brand-tint)' : 'var(--border)', color: article.isPublished ? 'var(--brand)' : 'var(--ink-soft)' }}>
                    {article.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>
                  {CATEGORIES.find((c) => c.value === article.category)?.label || article.category}
                  {article.publishedAt ? ` · ${new Date(article.publishedAt).toLocaleDateString()}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button type="button" onClick={() => startEdit(article)} style={secondaryButtonStyle}>Edit</button>
                <button
                  type="button"
                  disabled={busyId === article.id}
                  onClick={() => togglePublish(article)}
                  style={article.isPublished ? secondaryButtonStyle : primaryButtonStyle}
                >
                  {article.isPublished ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

const primaryButtonStyle = {
  padding: '10px 18px', borderRadius: 8, border: 'none',
  background: 'var(--brand)', color: 'var(--on-accent)',
  fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
};

const secondaryButtonStyle = {
  padding: '10px 18px', borderRadius: 8, border: '1px solid var(--border)',
  background: 'var(--surface)', color: 'var(--ink)',
  fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
};
