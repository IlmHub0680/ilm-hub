'use client';

import { useEffect, useState } from 'react';

const DEFAULT_CONTENT = {
  heroEyebrow: '',
  heroTitle: '',
  heroSubtitle: '',
  heroTrust: ['', '', ''],
  categoryLabel: '',
  categoryHeading: '',
  featuredLabel: '',
  featuredHeading: '',
  featuredSubtitle: '',
  collectionLabel: '',
  collectionHeading: '',
  publisherLabel: '',
  publisherHeading: '',
  publisherText: '',
  footerAboutText: '',
};

function emptyValueCard() {
  return { icon: '', title: '', text: '', isActive: true };
}

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '11px 13px',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 14.5,
  color: 'var(--ink)',
  backgroundColor: 'var(--surface)',
};

const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 13.5 };

export default function BookstorePageContentAdmin() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [valueCards, setValueCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/bookstore/page-content', { credentials: 'include' });
      const result = await res.json();

      if (res.ok && result.success) {
        setContent({
          ...DEFAULT_CONTENT,
          ...result.data.content,
          heroTrust: result.data.content.heroTrust.length > 0 ? result.data.content.heroTrust : ['', '', ''],
        });
        setValueCards(result.data.valueCards.length > 0 ? result.data.valueCards : [emptyValueCard()]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function set(field, value) {
    setContent((prev) => ({ ...prev, [field]: value }));
  }

  function setTrust(index, value) {
    setContent((prev) => {
      const heroTrust = [...prev.heroTrust];
      heroTrust[index] = value;
      return { ...prev, heroTrust };
    });
  }

  function addTrust() {
    setContent((prev) => ({ ...prev, heroTrust: [...prev.heroTrust, ''] }));
  }

  function removeTrust(index) {
    setContent((prev) => ({ ...prev, heroTrust: prev.heroTrust.filter((_, i) => i !== index) }));
  }

  function updateCard(index, field, value) {
    setValueCards((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  }

  function moveCard(index, direction) {
    setValueCards((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function addCard() {
    setValueCards((prev) => [...prev, emptyValueCard()]);
  }

  function removeCard(index) {
    setValueCards((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/bookstore/page-content', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, valueCards }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to save.');
      }

      setContent({
        ...DEFAULT_CONTENT,
        ...result.data.content,
        heroTrust: result.data.content.heroTrust.length > 0 ? result.data.content.heroTrust : ['', '', ''],
      });
      setValueCards(result.data.valueCards.length > 0 ? result.data.valueCards : [emptyValueCard()]);
      setMessage('Bookstore page content updated successfully.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main style={{ padding: 40, color: 'var(--ink)' }}>Loading bookstore page content...</main>;
  }

  return (
    <main style={{ padding: '40px 32px 80px', color: 'var(--ink)', maxWidth: 780 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Bookstore Page Content</h1>
        <p style={{ marginTop: 8, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
          The public /bookstore page's own copy -- hero, section headings, the "why shop with us" cards, the
          publisher call-to-action and the footer's About blurb. Books, categories, orders and submissions are
          managed on their own pages in this menu and are not affected here.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <section className="ih-card" style={{ padding: 24 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, color: 'var(--brand)' }}>Hero</h2>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={labelStyle}>Eyebrow</span>
            <input value={content.heroEyebrow} onChange={(e) => set('heroEyebrow', e.target.value)} style={inputStyle} required />
          </label>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={labelStyle}>Headline</span>
            <input value={content.heroTitle} onChange={(e) => set('heroTitle', e.target.value)} style={inputStyle} required />
          </label>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={labelStyle}>Description</span>
            <textarea
              value={content.heroSubtitle}
              onChange={(e) => set('heroSubtitle', e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              required
            />
          </label>

          <span style={labelStyle}>Trust checklist</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {content.heroTrust.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8 }}>
                <input
                  value={item}
                  onChange={(e) => setTrust(i, e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="Curated Islamic literature"
                />
                <button type="button" onClick={() => removeTrust(i)} className="ih-btn ih-btn-secondary">Remove</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addTrust} className="ih-btn ih-btn-secondary" style={{ marginTop: 10 }}>
            + Add Checklist Item
          </button>
        </section>

        <section className="ih-card" style={{ padding: 24 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, color: 'var(--brand)' }}>Section Headings</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 16 }}>
            <label>
              <span style={labelStyle}>"Browse by discipline" label</span>
              <input value={content.categoryLabel} onChange={(e) => set('categoryLabel', e.target.value)} style={inputStyle} required />
            </label>
            <label>
              <span style={labelStyle}>"Browse by discipline" heading</span>
              <input value={content.categoryHeading} onChange={(e) => set('categoryHeading', e.target.value)} style={inputStyle} required />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 16 }}>
            <label>
              <span style={labelStyle}>"Featured Books" label</span>
              <input value={content.featuredLabel} onChange={(e) => set('featuredLabel', e.target.value)} style={inputStyle} required />
            </label>
            <label>
              <span style={labelStyle}>"Featured Books" heading</span>
              <input value={content.featuredHeading} onChange={(e) => set('featuredHeading', e.target.value)} style={inputStyle} required />
            </label>
          </div>
          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={labelStyle}>"Featured Books" description</span>
            <input value={content.featuredSubtitle} onChange={(e) => set('featuredSubtitle', e.target.value)} style={inputStyle} required />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <label>
              <span style={labelStyle}>"Islamic Books" collection label</span>
              <input value={content.collectionLabel} onChange={(e) => set('collectionLabel', e.target.value)} style={inputStyle} required />
            </label>
            <label>
              <span style={labelStyle}>"Islamic Books" collection heading</span>
              <input value={content.collectionHeading} onChange={(e) => set('collectionHeading', e.target.value)} style={inputStyle} required />
            </label>
          </div>
        </section>

        <section className="ih-card" style={{ padding: 24 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 16, color: 'var(--brand)' }}>"Why Shop With Us" Cards</h2>
          <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--ink-soft)' }}>
            The 4-card strip below the featured books ("Curated Collection", "Secure Checkout", ...).
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {valueCards.map((card, i) => (
              <div key={card.id || i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <input
                  value={card.icon}
                  onChange={(e) => updateCard(i, 'icon', e.target.value)}
                  style={{ ...inputStyle, width: 60, flex: '0 0 60px' }}
                  placeholder="📚"
                />
                <input
                  value={card.title}
                  onChange={(e) => updateCard(i, 'title', e.target.value)}
                  style={{ ...inputStyle, flex: '1 1 160px' }}
                  placeholder="Curated Collection"
                />
                <input
                  value={card.text}
                  onChange={(e) => updateCard(i, 'text', e.target.value)}
                  style={{ ...inputStyle, flex: '2 1 220px' }}
                  placeholder="Selected literature for meaningful Islamic study."
                />
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button type="button" onClick={() => moveCard(i, -1)} disabled={i === 0} className="ih-btn ih-btn-secondary" title="Move up">↑</button>
                  <button type="button" onClick={() => moveCard(i, 1)} disabled={i === valueCards.length - 1} className="ih-btn ih-btn-secondary" title="Move down">↓</button>
                  <button type="button" onClick={() => removeCard(i)} className="ih-btn ih-btn-danger">Remove</button>
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={addCard} className="ih-btn ih-btn-secondary" style={{ marginTop: 12 }}>
            + Add Card
          </button>
        </section>

        <section className="ih-card" style={{ padding: 24 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, color: 'var(--brand)' }}>Publisher Call-to-Action</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 16 }}>
            <label>
              <span style={labelStyle}>Label</span>
              <input value={content.publisherLabel} onChange={(e) => set('publisherLabel', e.target.value)} style={inputStyle} required />
            </label>
            <label>
              <span style={labelStyle}>Heading</span>
              <input value={content.publisherHeading} onChange={(e) => set('publisherHeading', e.target.value)} style={inputStyle} required />
            </label>
          </div>
          <label style={{ display: 'block' }}>
            <span style={labelStyle}>Description</span>
            <textarea
              value={content.publisherText}
              onChange={(e) => set('publisherText', e.target.value)}
              rows={2}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              required
            />
          </label>
        </section>

        <section className="ih-card" style={{ padding: 24 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, color: 'var(--brand)' }}>Footer About Text</h2>
          <label style={{ display: 'block' }}>
            <textarea
              value={content.footerAboutText}
              onChange={(e) => set('footerAboutText', e.target.value)}
              rows={2}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              required
            />
          </label>
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
          {saving ? 'Saving...' : 'Save Bookstore Page Content'}
        </button>
      </form>
    </main>
  );
}
