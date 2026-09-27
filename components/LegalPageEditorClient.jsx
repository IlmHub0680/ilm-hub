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

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px 14px',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '15px',
    color: 'var(--ink)',
    backgroundColor: 'var(--surface)',
  };

  if (loading) {
    return (
      <main style={{ padding: 40, color: 'var(--ink)' }}>Loading…</main>
    );
  }

  return (
    <main style={{ padding: '40px 32px 80px', color: 'var(--ink)', maxWidth: 900 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
        Legal & Info Pages
      </div>
      <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800 }}>{heading}</h1>
      {hint && <p style={{ margin: '0 0 26px', color: 'var(--ink-soft)', lineHeight: 1.6 }}>{hint}</p>}

      <form onSubmit={handleSave}>
        <label style={{ display: 'block', marginBottom: 18 }}>
          <span style={{ display: 'block', marginBottom: 6, fontWeight: 700 }}>Page Title</span>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
          />
        </label>

        <label style={{ display: 'block', marginBottom: 20 }}>
          <span style={{ display: 'block', marginBottom: 6, fontWeight: 700 }}>Page Content</span>
          <RichTextEditor value={bodyHtml} onChange={setBodyHtml} minHeight={320} />
        </label>

        {message && (
          <div
            style={{
              marginBottom: 18,
              padding: '12px 16px',
              borderRadius: 8,
              background: message === 'Saved successfully.' ? 'var(--success-tint)' : 'var(--danger-tint)',
              color: message === 'Saved successfully.' ? 'var(--brand-light)' : 'var(--danger)',
              border: `1px solid ${message === 'Saved successfully.' ? 'var(--success)' : 'var(--danger)'}`,
              fontWeight: 600,
            }}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          style={{
            border: 'none',
            borderRadius: 9,
            background: saving ? 'var(--ink-soft)' : 'var(--brand)',
            color: 'var(--on-accent)',
            padding: '13px 24px',
            fontSize: 15,
            fontWeight: 800,
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving…' : 'Save Page'}
        </button>
      </form>
    </main>
  );
}
