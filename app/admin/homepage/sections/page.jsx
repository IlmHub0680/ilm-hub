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

const DEFAULT_SECTIONS_TEXT = {
  welcomeBadge: '',
  welcomeTitle: '',
  welcomeSubtitle: '',
  academyBadge: '',
  academyTitle: '',
  academySubtitle: '',
  approachBadge: '',
  approachTitle: '',
  approachSubtitle: '',
  ctaArabicLine: '',
  ctaTitle: '',
  ctaDescription: '',
};

function emptyFeatureCard() {
  return { icon: '📚', title: '', text: '', isActive: true };
}

function emptyAcademyItem() {
  return { icon: '📖', text: '', isActive: true };
}

function emptyApproachStep() {
  return { number: '01', title: '', text: '', isActive: true };
}

// Generic reorderable list editor shared by the three card/item/step
// lists below -- same up/down/remove/add pattern as the Academy Hub's
// card editor, just parameterized over which text fields each list's
// items have.
function ListEditor({ title, hint, items, setItems, fields, makeEmpty, addLabel }) {
  function update(index, field, value) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  }

  function move(index, direction) {
    setItems((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function add() {
    setItems((prev) => [...prev, makeEmpty()]);
  }

  function remove(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <section className="ih-card" style={{ padding: 20 }}>
      <h2 style={{ margin: '0 0 6px', fontSize: 16, color: 'var(--brand)' }}>{title}</h2>
      {hint && <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--ink-soft)' }}>{hint}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {items.map((item, index) => (
          <div
            key={index}
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
              {fields.map((field) =>
                field.type === 'textarea' ? null : (
                  <input
                    key={field.key}
                    value={item[field.key] || ''}
                    onChange={(e) => update(index, field.key, e.target.value)}
                    style={{
                      ...inputStyle,
                      ...(field.narrow ? { width: 64, flex: '0 0 64px', textAlign: 'center', fontSize: 18 } : { flex: 1, minWidth: 180 }),
                      ...(field.bold ? { fontWeight: 700 } : {}),
                    }}
                    placeholder={field.placeholder}
                    aria-label={field.label}
                  />
                )
              )}
            </div>

            {fields
              .filter((field) => field.type === 'textarea')
              .map((field) => (
                <textarea
                  key={field.key}
                  value={item[field.key] || ''}
                  onChange={(e) => update(index, field.key, e.target.value)}
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                  placeholder={field.placeholder}
                  aria-label={field.label}
                />
              ))}

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5 }}>
                <input
                  type="checkbox"
                  checked={item.isActive !== false}
                  onChange={(e) => update(index, 'isActive', e.target.checked)}
                />
                Visible
              </label>
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="ih-btn ih-btn-secondary" title="Move up">↑</button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1} className="ih-btn ih-btn-secondary" title="Move down">↓</button>
              <button type="button" onClick={() => remove(index)} className="ih-btn ih-btn-danger">Remove</button>
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={add} className="ih-btn ih-btn-secondary" style={{ marginTop: 14 }}>
        {addLabel}
      </button>
    </section>
  );
}

export default function HomepageSectionsAdminPage() {
  const [sectionsText, setSectionsText] = useState(DEFAULT_SECTIONS_TEXT);
  const [featureCards, setFeatureCards] = useState([]);
  const [academyItems, setAcademyItems] = useState([]);
  const [approachSteps, setApproachSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/homepage/sections', { credentials: 'include' });
      const result = await res.json();

      if (res.ok && result.success) {
        if (result.data.sectionsText) setSectionsText(result.data.sectionsText);
        setFeatureCards(result.data.featureCards.length > 0 ? result.data.featureCards : [emptyFeatureCard()]);
        setAcademyItems(result.data.academyItems.length > 0 ? result.data.academyItems : [emptyAcademyItem()]);
        setApproachSteps(result.data.approachSteps.length > 0 ? result.data.approachSteps : [emptyApproachStep()]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function setTextField(field, value) {
    setSectionsText((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/homepage/sections', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionsText, featureCards, academyItems, approachSteps }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to save the homepage sections.');
      }

      setSectionsText(result.data.sectionsText);
      setFeatureCards(result.data.featureCards.length > 0 ? result.data.featureCards : [emptyFeatureCard()]);
      setAcademyItems(result.data.academyItems.length > 0 ? result.data.academyItems : [emptyAcademyItem()]);
      setApproachSteps(result.data.approachSteps.length > 0 ? result.data.approachSteps : [emptyApproachStep()]);
      setMessage('Homepage sections updated successfully.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main style={{ padding: 40, color: 'var(--ink)' }}>Loading the homepage sections...</main>;
  }

  return (
    <main style={{ padding: '40px 32px 80px', color: 'var(--ink)', maxWidth: 860 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Homepage Sections</h1>
        <p style={{ marginTop: 8, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
          The public homepage's Welcome text and its four feature cards, the Academy section's
          heading and eight subject icons, the Our Approach section and its three steps, and the
          closing Bismillah banner. The Hero banner at the very top of the page (headline, CTAs,
          logo and banner image) is managed separately under Hero Section.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <section className="ih-card" style={{ padding: 24 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, color: 'var(--brand)' }}>Welcome Section</h2>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={labelStyle}>Eyebrow</span>
            <input value={sectionsText.welcomeBadge} onChange={(e) => setTextField('welcomeBadge', e.target.value)} style={inputStyle} required placeholder="WELCOME TO ULUL AZM" />
          </label>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={labelStyle}>Headline</span>
            <input value={sectionsText.welcomeTitle} onChange={(e) => setTextField('welcomeTitle', e.target.value)} style={inputStyle} required placeholder="A place to seek knowledge with sincerity" />
          </label>

          <label style={{ display: 'block' }}>
            <span style={labelStyle}>Description</span>
            <textarea
              value={sectionsText.welcomeSubtitle}
              onChange={(e) => setTextField('welcomeSubtitle', e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              required
            />
          </label>
        </section>

        <ListEditor
          title="Feature Cards"
          hint="The four cards under the Welcome section."
          items={featureCards}
          setItems={setFeatureCards}
          makeEmpty={emptyFeatureCard}
          addLabel="+ Add Feature Card"
          fields={[
            { key: 'icon', label: 'Icon', placeholder: '📚', narrow: true },
            { key: 'title', label: 'Title', placeholder: 'Structured Learning', bold: true },
            { key: 'text', label: 'Text', placeholder: 'Short description...', type: 'textarea' },
          ]}
        />

        <section className="ih-card" style={{ padding: 24 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, color: 'var(--brand)' }}>Academy Section</h2>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={labelStyle}>Eyebrow</span>
            <input value={sectionsText.academyBadge} onChange={(e) => setTextField('academyBadge', e.target.value)} style={inputStyle} required placeholder="ACADEMY" />
          </label>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={labelStyle}>Headline</span>
            <input value={sectionsText.academyTitle} onChange={(e) => setTextField('academyTitle', e.target.value)} style={inputStyle} required placeholder="Explore Our Academic Programmes" />
          </label>

          <label style={{ display: 'block' }}>
            <span style={labelStyle}>Description</span>
            <textarea
              value={sectionsText.academySubtitle}
              onChange={(e) => setTextField('academySubtitle', e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              required
            />
          </label>
        </section>

        <ListEditor
          title="Academy Subject Icons"
          hint="The grid of subject icons in the green Academy section."
          items={academyItems}
          setItems={setAcademyItems}
          makeEmpty={emptyAcademyItem}
          addLabel="+ Add Subject Icon"
          fields={[
            { key: 'icon', label: 'Icon', placeholder: '📖', narrow: true },
            { key: 'text', label: 'Label', placeholder: "Qur'anic Sciences", bold: true },
          ]}
        />

        <section className="ih-card" style={{ padding: 24 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, color: 'var(--brand)' }}>Our Approach Section</h2>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={labelStyle}>Eyebrow</span>
            <input value={sectionsText.approachBadge} onChange={(e) => setTextField('approachBadge', e.target.value)} style={inputStyle} required placeholder="OUR APPROACH" />
          </label>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={labelStyle}>Headline</span>
            <input value={sectionsText.approachTitle} onChange={(e) => setTextField('approachTitle', e.target.value)} style={inputStyle} required placeholder="More than a website — a learning environment" />
          </label>

          <label style={{ display: 'block' }}>
            <span style={labelStyle}>Description</span>
            <textarea
              value={sectionsText.approachSubtitle}
              onChange={(e) => setTextField('approachSubtitle', e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              required
            />
          </label>
        </section>

        <ListEditor
          title="Approach Steps"
          hint="The three numbered steps in the Our Approach section."
          items={approachSteps}
          setItems={setApproachSteps}
          makeEmpty={emptyApproachStep}
          addLabel="+ Add Step"
          fields={[
            { key: 'number', label: 'Number', placeholder: '01', narrow: true },
            { key: 'title', label: 'Title', placeholder: 'Authentic Foundations', bold: true },
            { key: 'text', label: 'Text', placeholder: 'Short description...', type: 'textarea' },
          ]}
        />

        <section className="ih-card" style={{ padding: 24 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, color: 'var(--brand)' }}>Bismillah Banner</h2>
          <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--ink-soft)' }}>
            The closing band just above the footer.
          </p>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={labelStyle}>Arabic / eyebrow line</span>
            <input value={sectionsText.ctaArabicLine} onChange={(e) => setTextField('ctaArabicLine', e.target.value)} style={inputStyle} required placeholder="BISMILLAH • SEEK KNOWLEDGE • SERVE WITH EXCELLENCE" />
          </label>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={labelStyle}>Headline</span>
            <input value={sectionsText.ctaTitle} onChange={(e) => setTextField('ctaTitle', e.target.value)} style={inputStyle} required placeholder="Begin Your Journey of Knowledge" />
          </label>

          <label style={{ display: 'block' }}>
            <span style={labelStyle}>Description</span>
            <textarea
              value={sectionsText.ctaDescription}
              onChange={(e) => setTextField('ctaDescription', e.target.value)}
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
          {saving ? 'Saving...' : 'Save Homepage Sections'}
        </button>
      </form>
    </main>
  );
}
