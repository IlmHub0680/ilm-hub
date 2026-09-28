'use client';

import { useEffect, useState } from 'react';

const DEFAULT_FORM = {
  isEnabled: true,
  welcomeMessageEn: '',
  welcomeMessageAr: '',
  supportedLanguages: ['en', 'ar'],
};

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

export default function AssistantSettingsPage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/assistant-settings', { credentials: 'include' });
      const result = await res.json();

      if (res.ok && result.success) {
        setForm(result.data);
      }
      // A 404 (not configured yet) is expected the first time — the
      // form just starts with the built-in defaults and Save will
      // create the row.
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleLanguage(lang) {
    setForm((prev) => {
      const has = prev.supportedLanguages.includes(lang);
      const supportedLanguages = has
        ? prev.supportedLanguages.filter((l) => l !== lang)
        : [...prev.supportedLanguages, lang];
      return { ...prev, supportedLanguages };
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/assistant-settings', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to save assistant settings.');
      }

      setForm(result.data);
      setMessage('Assistant settings updated successfully.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main style={{ padding: 40, color: 'var(--ink)' }}>Loading assistant settings...</main>;
  }

  return (
    <main style={{ padding: '40px 32px 80px', color: 'var(--ink)', maxWidth: 720 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Assistant Settings</h1>
        <p style={{ marginTop: 8, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
          The AI Assistant widget appears on every page of the site. This page
          controls whether it's shown at all, its opening greeting in each
          supported language, and which languages it offers. The identity
          cards (Student / Employee / Visitor), quick options, and knowledge
          base are maintained in code, alongside the routes and permissions
          they link to, so an admin change here can never point the
          assistant at a page that doesn't exist or grant access it
          shouldn't have.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <section className="ih-card" style={{ padding: 24 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.isEnabled}
              onChange={(e) => set('isEnabled', e.target.checked)}
              style={{ width: 18, height: 18 }}
            />
            <span style={{ fontWeight: 700, fontSize: 14.5 }}>Assistant is available on the site</span>
          </label>
          <p style={{ margin: '8px 0 0 28px', fontSize: 13, color: 'var(--ink-soft)' }}>
            Turning this off hides the assistant launcher everywhere and
            declines any direct request to it, without removing anyone's
            other access to the site.
          </p>
        </section>

        <section className="ih-card" style={{ padding: 24 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 16, color: 'var(--brand)' }}>Supported Languages</h2>
          <p style={{ margin: '0 0 14px', fontSize: 13.5, color: 'var(--ink-soft)' }}>
            English and Arabic are the two languages the assistant's
            interface is actually translated into.
          </p>
          <div style={{ display: 'flex', gap: 18 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.supportedLanguages.includes('en')}
                onChange={() => toggleLanguage('en')}
              />
              English
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.supportedLanguages.includes('ar')}
                onChange={() => toggleLanguage('ar')}
              />
              العربية (Arabic)
            </label>
          </div>
        </section>

        <section className="ih-card" style={{ padding: 24 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, color: 'var(--brand)' }}>Opening Greeting</h2>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={labelStyle}>English</span>
            <textarea
              value={form.welcomeMessageEn}
              onChange={(e) => set('welcomeMessageEn', e.target.value)}
              rows={3}
              maxLength={500}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              placeholder="Assalamu alaikum! I'm the Ulul Azm assistant. How may I help you today?"
            />
          </label>

          <label style={{ display: 'block' }}>
            <span style={labelStyle}>Arabic</span>
            <textarea
              value={form.welcomeMessageAr}
              onChange={(e) => set('welcomeMessageAr', e.target.value)}
              rows={3}
              maxLength={500}
              dir="rtl"
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-arabic)' }}
              placeholder="السلام عليكم! أنا مساعد أولو العزم. كيف يمكنني مساعدتك اليوم؟"
            />
          </label>

          <p style={{ margin: '10px 0 0', fontSize: 12.5, color: 'var(--ink-soft)' }}>
            Leave either field blank to use the assistant's built-in default
            greeting for that language.
          </p>
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
          {saving ? 'Saving...' : 'Save Assistant Settings'}
        </button>
      </form>
    </main>
  );
}
