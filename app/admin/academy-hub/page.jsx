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

const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 13.5 };

const DEFAULT_HERO = { badge: '', title: '', subtitle: '' };

function emptyCard() {
  return { icon: '📄', title: '', description: '', href: '', isActive: true };
}

export default function AcademyHubAdminPage() {
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/academy-hub', { credentials: 'include' });
      const result = await res.json();

      if (res.ok && result.success) {
        if (result.data.hero) setHero(result.data.hero);
        setCards(result.data.cards.length > 0 ? result.data.cards : [emptyCard()]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function setHeroField(field, value) {
    setHero((prev) => ({ ...prev, [field]: value }));
  }

  function updateCard(ci, field, value) {
    setCards((prev) => prev.map((c, i) => (i === ci ? { ...c, [field]: value } : c)));
  }

  function moveCard(ci, direction) {
    setCards((prev) => {
      const next = [...prev];
      const target = ci + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[ci], next[target]] = [next[target], next[ci]];
      return next;
    });
  }

  function addCard() {
    setCards((prev) => [...prev, emptyCard()]);
  }

  function removeCard(ci) {
    setCards((prev) => prev.filter((_, i) => i !== ci));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/academy-hub', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hero, cards }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to save the Academy hub.');
      }

      setHero(result.data.hero);
      setCards(result.data.cards.length > 0 ? result.data.cards : [emptyCard()]);
      setMessage('Academy hub updated successfully.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main style={{ padding: 40, color: 'var(--ink)' }}>Loading the Academy hub...</main>;
  }

  return (
    <main style={{ padding: '40px 32px 80px', color: 'var(--ink)', maxWidth: 860 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Academy Hub</h1>
        <p style={{ marginTop: 8, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
          The public <code>/academy</code> page reached from the homepage's "Academy" nav
          link — its hero copy and the card grid linking to every institutional document.
          The "Browse Academic Programmes" card above the grid always points to
          the live programme directory and is managed in code, not here.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <section className="ih-card" style={{ padding: 24 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, color: 'var(--brand)' }}>Hero</h2>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={labelStyle}>Eyebrow</span>
            <input value={hero.badge} onChange={(e) => setHeroField('badge', e.target.value)} style={inputStyle} required placeholder="Ulul Azm" />
          </label>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={labelStyle}>Headline</span>
            <input value={hero.title} onChange={(e) => setHeroField('title', e.target.value)} style={inputStyle} required placeholder="The Academy" />
          </label>

          <label style={{ display: 'block' }}>
            <span style={labelStyle}>Description</span>
            <textarea
              value={hero.subtitle}
              onChange={(e) => setHeroField('subtitle', e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              required
            />
          </label>
        </section>

        <section className="ih-card" style={{ padding: 20 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 16, color: 'var(--brand)' }}>Document &amp; Programme Cards</h2>
          <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--ink-soft)' }}>
            One card per institutional document. Add a new card here whenever a new
            document is published — no code change needed.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {cards.map((card, ci) => (
              <div
                key={ci}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  padding: 14,
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <input
                    value={card.icon}
                    onChange={(e) => updateCard(ci, 'icon', e.target.value)}
                    style={{ ...inputStyle, width: 64, flex: '0 0 64px', textAlign: 'center', fontSize: 18 }}
                    placeholder="🕌"
                    aria-label="Icon"
                  />
                  <input
                    value={card.title}
                    onChange={(e) => updateCard(ci, 'title', e.target.value)}
                    style={{ ...inputStyle, flex: 1, minWidth: 200, fontWeight: 700 }}
                    placeholder="Document title"
                    required
                  />
                  <input
                    value={card.href}
                    onChange={(e) => updateCard(ci, 'href', e.target.value)}
                    style={{ ...inputStyle, flex: 1, minWidth: 200 }}
                    placeholder="/academy-foundation"
                    required
                  />
                </div>

                <textarea
                  value={card.description}
                  onChange={(e) => updateCard(ci, 'description', e.target.value)}
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                  placeholder="One or two sentences describing this document."
                />

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5 }}>
                    <input
                      type="checkbox"
                      checked={card.isActive !== false}
                      onChange={(e) => updateCard(ci, 'isActive', e.target.checked)}
                    />
                    Visible
                  </label>
                  <button type="button" onClick={() => moveCard(ci, -1)} disabled={ci === 0} className="ih-btn ih-btn-secondary" title="Move up">↑</button>
                  <button type="button" onClick={() => moveCard(ci, 1)} disabled={ci === cards.length - 1} className="ih-btn ih-btn-secondary" title="Move down">↓</button>
                  <button type="button" onClick={() => removeCard(ci)} className="ih-btn ih-btn-danger">Remove Card</button>
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={addCard} className="ih-btn ih-btn-secondary" style={{ marginTop: 14 }}>
            + Add Card
          </button>
        </section>

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
          {saving ? 'Saving...' : 'Save Academy Hub'}
        </button>
      </form>
    </main>
  );
}
