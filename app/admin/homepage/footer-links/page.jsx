'use client';

import { useEffect, useState } from 'react';

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '9px 11px',
  border: '1px solid var(--border)',
  borderRadius: 7,
  fontSize: 13.5,
  color: 'var(--ink)',
  backgroundColor: 'var(--surface)',
};

function emptyLink() {
  return { label: '', href: '', isActive: true };
}

function emptyGroup() {
  return { title: '', isActive: true, links: [emptyLink()] };
}

export default function FooterLinksPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/homepage/footer-links', { credentials: 'include' });
      const result = await res.json();

      if (res.ok && result.success) {
        setGroups(result.data.length > 0 ? result.data : [emptyGroup()]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function updateGroup(gi, field, value) {
    setGroups((prev) => prev.map((g, i) => (i === gi ? { ...g, [field]: value } : g)));
  }

  function moveGroup(gi, direction) {
    setGroups((prev) => {
      const next = [...prev];
      const target = gi + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[gi], next[target]] = [next[target], next[gi]];
      return next;
    });
  }

  function addGroup() {
    setGroups((prev) => [...prev, emptyGroup()]);
  }

  function removeGroup(gi) {
    setGroups((prev) => prev.filter((_, i) => i !== gi));
  }

  function updateLink(gi, li, field, value) {
    setGroups((prev) =>
      prev.map((g, i) =>
        i === gi
          ? { ...g, links: g.links.map((l, j) => (j === li ? { ...l, [field]: value } : l)) }
          : g
      )
    );
  }

  function moveLink(gi, li, direction) {
    setGroups((prev) =>
      prev.map((g, i) => {
        if (i !== gi) return g;
        const links = [...g.links];
        const target = li + direction;
        if (target < 0 || target >= links.length) return g;
        [links[li], links[target]] = [links[target], links[li]];
        return { ...g, links };
      })
    );
  }

  function addLink(gi) {
    setGroups((prev) => prev.map((g, i) => (i === gi ? { ...g, links: [...g.links, emptyLink()] } : g)));
  }

  function removeLink(gi, li) {
    setGroups((prev) =>
      prev.map((g, i) => (i === gi ? { ...g, links: g.links.filter((_, j) => j !== li) } : g))
    );
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/homepage/footer-links', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groups }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to save footer links.');
      }

      setGroups(result.data.length > 0 ? result.data : [emptyGroup()]);
      setMessage('Footer links updated successfully.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main style={{ padding: 40, color: 'var(--ink)' }}>Loading footer links...</main>;
  }

  return (
    <main style={{ padding: '40px 32px 80px', color: 'var(--ink)', maxWidth: 820 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Footer Links</h1>
        <p style={{ marginTop: 8, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
          Navigation link columns shown in the homepage footer (e.g. "Academy").
          Each group has a title and an ordered list of label + link pairs. This is
          separate from the footer's About / Contact / Privacy / Terms / FAQ
          panels, which are managed in code.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {groups.map((group, gi) => (
          <section key={gi} className="ih-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
              <input
                value={group.title}
                onChange={(e) => updateGroup(gi, 'title', e.target.value)}
                style={{ ...inputStyle, flex: 1, minWidth: 180, fontWeight: 700, fontSize: 15 }}
                placeholder="Column title (e.g. Academics)"
                required
              />

              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={group.isActive !== false}
                  onChange={(e) => updateGroup(gi, 'isActive', e.target.checked)}
                />
                Visible
              </label>

              <button type="button" onClick={() => moveGroup(gi, -1)} disabled={gi === 0} className="ih-btn ih-btn-secondary" title="Move up">↑</button>
              <button type="button" onClick={() => moveGroup(gi, 1)} disabled={gi === groups.length - 1} className="ih-btn ih-btn-secondary" title="Move down">↓</button>
              <button type="button" onClick={() => removeGroup(gi)} className="ih-btn ih-btn-danger">Remove Column</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 12, borderLeft: '2px solid var(--border)' }}>
              {group.links.map((link, li) => (
                <div key={li} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    value={link.label}
                    onChange={(e) => updateLink(gi, li, 'label', e.target.value)}
                    style={{ ...inputStyle, flex: 1, minWidth: 160 }}
                    placeholder="Link label"
                    required
                  />
                  <input
                    value={link.href}
                    onChange={(e) => updateLink(gi, li, 'href', e.target.value)}
                    style={{ ...inputStyle, flex: 1, minWidth: 160 }}
                    placeholder="/path or https://…"
                    required
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5 }}>
                    <input
                      type="checkbox"
                      checked={link.isActive !== false}
                      onChange={(e) => updateLink(gi, li, 'isActive', e.target.checked)}
                    />
                    Visible
                  </label>
                  <button type="button" onClick={() => moveLink(gi, li, -1)} disabled={li === 0} className="ih-btn ih-btn-secondary" title="Move up">↑</button>
                  <button type="button" onClick={() => moveLink(gi, li, 1)} disabled={li === group.links.length - 1} className="ih-btn ih-btn-secondary" title="Move down">↓</button>
                  <button type="button" onClick={() => removeLink(gi, li)} className="ih-btn ih-btn-danger">Remove</button>
                </div>
              ))}

              <button type="button" onClick={() => addLink(gi)} className="ih-btn ih-btn-secondary" style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                + Add Link
              </button>
            </div>
          </section>
        ))}

        <button type="button" onClick={addGroup} className="ih-btn ih-btn-secondary" style={{ alignSelf: 'flex-start' }}>
          + Add Footer Column
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
          {saving ? 'Saving...' : 'Save Footer Links'}
        </button>
      </form>
    </main>
  );
}
