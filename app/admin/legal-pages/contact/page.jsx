'use client';

import { useEffect, useState } from 'react';

const FIELDS = [
  { key: 'address', label: 'Institute Address', placeholder: 'Ulul Azm Institute, Street, City, Country' },
  { key: 'poBox', label: 'P.O. Box', placeholder: 'P.O. Box 170' },
  { key: 'phone', label: 'Telephone', placeholder: '+233 1234568' },
  { key: 'whatsapp', label: 'WhatsApp', placeholder: '+000 000 000 0000' },
  { key: 'email', label: 'General Email', placeholder: 'info@ululazm.org' },
  { key: 'admissionsEmail', label: 'Admissions Email', placeholder: 'admissions@ululazm.org' },
  { key: 'bookstoreEmail', label: 'Bookstore Email', placeholder: 'bookstore@ululazm.org' },
  { key: 'officeHours', label: 'Office Hours', placeholder: 'Monday – Friday: 8:00 AM – 5:00 PM' },
];

const EMPTY = Object.fromEntries(FIELDS.map((f) => [f.key, '']));

export default function ContactAdminPage() {
  const [values, setValues] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/legal-pages/contact');
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to load contact info.');
        setValues({ ...EMPTY, ...result.data });
      } catch (err) {
        setMessage(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/legal-pages/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save contact info.');
      setValues({ ...EMPTY, ...result.data });
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
    borderRadius: 8,
    fontSize: 15,
    color: 'var(--ink)',
    backgroundColor: 'var(--surface)',
  };

  if (loading) return <main style={{ padding: 40, color: 'var(--ink)' }}>Loading…</main>;

  return (
    <main style={{ padding: '40px 32px 80px', color: 'var(--ink)', maxWidth: 900 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
        Legal & Info Pages
      </div>
      <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800 }}>Contact Information</h1>
      <p style={{ margin: '0 0 26px', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
        Shown publicly at /contact and linked from the homepage footer.
      </p>

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18, marginBottom: 24 }}>
          {FIELDS.map((field) => (
            <label key={field.key}>
              <span style={{ display: 'block', marginBottom: 6, fontWeight: 700 }}>{field.label}</span>
              <input
                type="text"
                value={values[field.key] || ''}
                onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                style={inputStyle}
              />
            </label>
          ))}
        </div>

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
          {saving ? 'Saving…' : 'Save Contact Information'}
        </button>
      </form>
    </main>
  );
}
