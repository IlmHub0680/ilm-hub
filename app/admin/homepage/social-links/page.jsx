'use client';

import { useEffect, useState } from 'react';

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 14,
  color: 'var(--ink)',
  backgroundColor: 'var(--surface)',
};

function emptyLink() {
  return { name: '', icon: '', url: '', isActive: true };
}

export default function SocialLinksPage() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/homepage/social-links', { credentials: 'include' });
      const result = await res.json();

      if (res.ok && result.success) {
        setLinks(result.data.length > 0 ? result.data : [emptyLink()]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function updateLink(index, field, value) {
    setLinks((prev) => prev.map((link, i) => (i === index ? { ...link, [field]: value } : link)));
  }

  function moveLink(index, direction) {
    setLinks((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function addLink() {
    setLinks((prev) => [...prev, emptyLink()]);
  }

  function removeLink(index) {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/homepage/social-links', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to save social links.');
      }

      setLinks(result.data.length > 0 ? result.data : [emptyLink()]);
      setMessage('Social links updated successfully.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main style={{ padding: 40, color: 'var(--ink)' }}>Loading social links...</main>;
  }

  return (
    <main style={{ padding: '40px 32px 80px', color: 'var(--ink)', maxWidth: 760 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Social Links</h1>
        <p style={{ marginTop: 8, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
          The "Follow Us" buttons in the homepage footer. The icon is a single
          character or symbol (e.g. "f", "▶", "𝕏", "✈") — not an uploaded image.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {links.map((link, i) => (
          <div key={i} className="ih-card" style={{ padding: 18, display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <label style={{ width: 160 }}>
              <span style={{ display: 'block', marginBottom: 6, fontSize: 12.5, fontWeight: 700 }}>Platform name</span>
              <input value={link.name} onChange={(e) => updateLink(i, 'name', e.target.value)} style={inputStyle} placeholder="Facebook" required />
            </label>

            <label style={{ width: 90 }}>
              <span style={{ display: 'block', marginBottom: 6, fontSize: 12.5, fontWeight: 700 }}>Icon</span>
              <input value={link.icon} onChange={(e) => updateLink(i, 'icon', e.target.value)} style={inputStyle} placeholder="f" required />
            </label>

            <label style={{ flex: 1, minWidth: 200 }}>
              <span style={{ display: 'block', marginBottom: 6, fontSize: 12.5, fontWeight: 700 }}>URL</span>
              <input value={link.url} onChange={(e) => updateLink(i, 'url', e.target.value)} style={inputStyle} placeholder="https://www.facebook.com/yourpage" required />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <input type="checkbox" checked={link.isActive !== false} onChange={(e) => updateLink(i, 'isActive', e.target.checked)} />
              Visible
            </label>

            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" onClick={() => moveLink(i, -1)} disabled={i === 0} className="ih-btn ih-btn-secondary" title="Move up">↑</button>
              <button type="button" onClick={() => moveLink(i, 1)} disabled={i === links.length - 1} className="ih-btn ih-btn-secondary" title="Move down">↓</button>
              <button type="button" onClick={() => removeLink(i)} className="ih-btn ih-btn-danger">Remove</button>
            </div>
          </div>
        ))}

        <button type="button" onClick={addLink} className="ih-btn ih-btn-secondary" style={{ alignSelf: 'flex-start' }}>
          + Add Social Link
        </button>

        {message && (
          <div
            className="ih-card"
            style={{
              padding: '12px 14px',
              background: message.includes('successfully') ? 'var(--success-tint)' : 'var(--danger-tint)',
              color: message.includes('successfully') ? 'var(--brand-light)' : 'var(--danger)',
            }}
          >
            {message}
          </div>
        )}

        <button type="submit" disabled={saving} className="ih-btn ih-btn-primary" style={{ alignSelf: 'flex-start', padding: '13px 28px' }}>
          {saving ? 'Saving...' : 'Save Social Links'}
        </button>
      </form>
    </main>
  );
}
