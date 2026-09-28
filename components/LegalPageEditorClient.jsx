'use client';

import { useEffect, useState } from 'react';
import RichTextEditor from '@/components/RichTextEditor';

export default function LegalPageEditorClient({ slug, heading, hint }) {
  const [title, setTitle] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/admin/legal-pages/${slug}`);
        const result = await res.json();

        if (!res.ok) throw new Error(result.error || 'Failed to load page.');

        if (!cancelled) {
          setTitle(result.data.title);
          setBodyHtml(result.data.bodyHtml);
        }
      } catch (err) {
        if (!cancelled) setMessage(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch(`/api/admin/legal-pages/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, bodyHtml }),
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Failed to save page.');

      setMessage('Saved successfully.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main style={{ padding: 40, color: 'var(--ink)' }}>Loading…</main>
    );
  }

  const isSuccess = message === 'Saved successfully.';

  return (
    <main style={{ padding: '40px 32px 80px', color: 'var(--ink)', maxWidth: 900 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
        Legal & Info Pages
      </div>
      <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800 }}>{heading}</h1>
      {hint && <p style={{ margin: '0 0 26px', color: 'var(--ink-soft)', lineHeight: 1.6 }}>{hint}</p>}

      <div className="ih-card">
        <form onSubmit={handleSave}>
          <div className="ih-field" style={{ marginBottom: 18 }}>
            <label>Page Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="ih-field" style={{ marginBottom: 20 }}>
            <label>Page Content</label>
            <RichTextEditor value={bodyHtml} onChange={setBodyHtml} minHeight={320} />
          </div>

          {message && (
            <div style={{ marginBottom: 18 }}>
              <span className={`ih-badge ${isSuccess ? 'ih-b-success' : 'ih-b-danger'}`}>
                {message}
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="ih-btn ih-btn-primary"
          >
            {saving ? 'Saving…' : 'Save Page'}
          </button>
        </form>
      </div>
    </main>
  );
}
