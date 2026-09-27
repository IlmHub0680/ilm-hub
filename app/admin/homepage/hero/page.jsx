'use client';

import { useRef, useState, useEffect } from 'react';
import { uploadFileWithProgress } from '@/lib/xhrUpload';

const DEFAULT_FORM = {
  badge: '',
  title: '',
  subtitle: '',
  primaryLabel: '',
  primaryHref: '',
  secondaryLabel: '',
  secondaryHref: '',
  features: ['', '', '', ''],
  badgeAr: '',
  titleAr: '',
  subtitleAr: '',
  primaryLabelAr: '',
  secondaryLabelAr: '',
  featuresAr: ['', '', '', ''],
  logoUrl: '',
  heroImageUrl: '',
  logoSize: 100,
  loginBackgroundUrl: '',
};

const LOGO_SIZE_OPTIONS = [
  { value: 70, label: 'Smaller (70%)' },
  { value: 85, label: 'Small (85%)' },
  { value: 100, label: 'Default (100%)' },
  { value: 115, label: 'Large (115%)' },
  { value: 130, label: 'Larger (130%)' },
  { value: 145, label: 'Extra Large (145%)' },
  { value: 160, label: 'Largest (160%)' },
];

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

const inputStyleAr = {
  ...inputStyle,
  fontFamily: 'var(--font-arabic-display), inherit',
  direction: 'rtl',
  textAlign: 'right',
};

const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 13.5 };

export default function HomepageHeroPage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [savingAssets, setSavingAssets] = useState(false);
  const [assetsMessage, setAssetsMessage] = useState('');
  const [uploading, setUploading] = useState({ logo: false, hero: false, loginBackground: false });
  const [uploadProgress, setUploadProgress] = useState({ logo: 0, hero: 0, loginBackground: 0 });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/homepage/hero', { credentials: 'include' });
      const result = await res.json();

      if (res.ok && result.success) {
        setForm({
          ...DEFAULT_FORM,
          ...result.data,
          features: result.data.features.length > 0 ? result.data.features : ['', '', '', ''],
          featuresAr: result.data.featuresAr?.length > 0 ? result.data.featuresAr : ['', '', '', ''],
        });
      }
      // A 404 (not configured yet) is expected the first time — the
      // form just starts blank and Save will create it.
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function setFeature(index, value) {
    setForm((prev) => {
      const features = [...prev.features];
      features[index] = value;
      return { ...prev, features };
    });
  }

  function addFeature() {
    setForm((prev) => ({ ...prev, features: [...prev.features, ''] }));
  }

  function removeFeature(index) {
    setForm((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  }

  function setFeatureAr(index, value) {
    setForm((prev) => {
      const featuresAr = [...prev.featuresAr];
      featuresAr[index] = value;
      return { ...prev, featuresAr };
    });
  }

  async function handleImageUpload(field, folder, file) {
    if (!file) return;

    const key =
      field === 'logoUrl' ? 'logo' : field === 'loginBackgroundUrl' ? 'loginBackground' : 'hero';
    setUploading((prev) => ({ ...prev, [key]: true }));
    setUploadProgress((prev) => ({ ...prev, [key]: 0 }));
    setMessage('');

    try {
      const body = new FormData();
      body.append('file', file);
      body.append('folder', folder);

      const result = await uploadFileWithProgress(
        '/api/admin/uploads/image',
        body,
        (percent) => setUploadProgress((prev) => ({ ...prev, [key]: percent }))
      );

      if (!result || !result.success) {
        throw new Error((result && result.error) || 'Upload failed.');
      }

      set(field, result.url);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setUploading((prev) => ({ ...prev, [key]: false }));
      setUploadProgress((prev) => ({ ...prev, [key]: 0 }));
    }
  }

  async function handleSaveBrandAssets(e) {
    e.preventDefault();
    setSavingAssets(true);
    setAssetsMessage('');

    try {
      const res = await fetch('/api/admin/homepage/hero', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logoUrl: form.logoUrl,
          heroImageUrl: form.heroImageUrl,
          logoSize: form.logoSize,
          loginBackgroundUrl: form.loginBackgroundUrl,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to save brand assets.');
      }

      setForm((prev) => ({
        ...prev,
        logoUrl: result.data.logoUrl,
        heroImageUrl: result.data.heroImageUrl,
        logoSize: result.data.logoSize || 100,
        loginBackgroundUrl: result.data.loginBackgroundUrl || '',
      }));
      setAssetsMessage('Brand assets saved successfully. The change is already live.');
    } catch (err) {
      setAssetsMessage(err.message);
    } finally {
      setSavingAssets(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/homepage/hero', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to save hero content.');
      }

      setForm({
        ...DEFAULT_FORM,
        ...result.data,
        features: result.data.features.length > 0 ? result.data.features : ['', '', '', ''],
        featuresAr: result.data.featuresAr?.length > 0 ? result.data.featuresAr : ['', '', '', ''],
      });
      setMessage('Hero section updated successfully.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main style={{ padding: 40, color: 'var(--ink)' }}>Loading hero content...</main>;
  }

  return (
    <main style={{ padding: '40px 32px 80px', color: 'var(--ink)', maxWidth: 760 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Hero Section</h1>
        <p style={{ marginTop: 8, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
          The large banner at the top of the public homepage — badge line, headline,
          description, the two call-to-action buttons, and the short feature checklist.
          Arabic text is optional: leave it blank and the homepage's EN/AR toggle falls
          back to the English version.
        </p>
      </div>

      <form onSubmit={handleSaveBrandAssets} style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 20 }}>
        <section className="ih-card" style={{ padding: 24 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 16, color: 'var(--brand)' }}>Brand Assets</h2>
          <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--ink-soft)' }}>
            Saved independently of the Hero Section below — update just the logo or
            banner without needing to fill in or resubmit the headline, description,
            buttons or Arabic translation. The change is live as soon as you save it.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            <ImageUploadField
              label="Site logo"
              hint="Shown in the header and footer in place of the text mark. Square image recommended (PNG, JPEG, WebP or SVG, max 5MB)."
              value={form.logoUrl}
              uploading={uploading.logo}
              progress={uploadProgress.logo}
              onUpload={(file) => handleImageUpload('logoUrl', 'logo', file)}
              onClear={() => set('logoUrl', '')}
              previewStyle={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover' }}
            />

            <ImageUploadField
              label="Hero banner image"
              hint="An optional photo shown alongside the hero text. If left empty, the hero keeps its plain gradient background (PNG, JPEG or WebP, max 5MB)."
              value={form.heroImageUrl}
              uploading={uploading.hero}
              progress={uploadProgress.hero}
              onUpload={(file) => handleImageUpload('heroImageUrl', 'hero', file)}
              onClear={() => set('heroImageUrl', '')}
              previewStyle={{ width: 160, height: 90, borderRadius: 10, objectFit: 'cover' }}
            />

            <ImageUploadField
              label="Login pages banner"
              hint="Shown as a full-page background image behind the Student, Staff and Bookstore/Media/Author login forms. If left empty, every login page keeps its plain brand gradient background (PNG, JPEG or WebP, max 5MB)."
              value={form.loginBackgroundUrl}
              uploading={uploading.loginBackground}
              progress={uploadProgress.loginBackground}
              onUpload={(file) => handleImageUpload('loginBackgroundUrl', 'login-background', file)}
              onClear={() => set('loginBackgroundUrl', '')}
              previewStyle={{ width: 160, height: 90, borderRadius: 10, objectFit: 'cover' }}
            />

            <div>
              <label style={labelStyle}>Logo size</label>
              <p style={{ margin: '0 0 8px', fontSize: 12.5, color: 'var(--ink-soft)' }}>
                How large the logo appears in the header and footer. The footer logo
                stays proportionally smaller than the header's at every size.
              </p>
              <select
                value={form.logoSize}
                onChange={(e) => set('logoSize', Number(e.target.value))}
                style={inputStyle}
              >
                {LOGO_SIZE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {assetsMessage && (
            <div
              className="ih-card"
              style={{
                marginTop: 16,
                padding: '10px 14px',
                background: assetsMessage.includes('successfully') ? 'var(--success-tint)' : 'var(--danger-tint)',
                color: assetsMessage.includes('successfully') ? 'var(--brand-light)' : 'var(--danger)',
              }}
            >
              {assetsMessage}
            </div>
          )}

          <button type="submit" disabled={savingAssets} className="ih-btn ih-btn-primary" style={{ marginTop: 16 }}>
            {savingAssets ? 'Saving...' : 'Save Brand Assets'}
          </button>
        </section>
      </form>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <section className="ih-card" style={{ padding: 24 }}>
          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={labelStyle}>Badge line</span>
            <input value={form.badge} onChange={(e) => set('badge', e.target.value)} style={inputStyle} required />
          </label>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={labelStyle}>Headline</span>
            <input value={form.title} onChange={(e) => set('title', e.target.value)} style={inputStyle} required />
          </label>

          <label style={{ display: 'block' }}>
            <span style={labelStyle}>Description</span>
            <textarea
              value={form.subtitle}
              onChange={(e) => set('subtitle', e.target.value)}
              rows={4}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              required
            />
          </label>
        </section>

        <section className="ih-card" style={{ padding: 24 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 16, color: 'var(--brand)' }}>Arabic Translation (optional)</h2>
          <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--ink-soft)' }}>
            Shown when a visitor switches the homepage to العربية. Leave any field blank to fall back to its English version.
          </p>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={labelStyle}>Badge line (Arabic)</span>
            <input value={form.badgeAr} onChange={(e) => set('badgeAr', e.target.value)} style={inputStyleAr} />
          </label>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={labelStyle}>Headline (Arabic)</span>
            <input value={form.titleAr} onChange={(e) => set('titleAr', e.target.value)} style={inputStyleAr} />
          </label>

          <label style={{ display: 'block' }}>
            <span style={labelStyle}>Description (Arabic)</span>
            <textarea
              value={form.subtitleAr}
              onChange={(e) => set('subtitleAr', e.target.value)}
              rows={4}
              style={{ ...inputStyleAr, resize: 'vertical' }}
            />
          </label>
        </section>

        <section className="ih-card" style={{ padding: 24 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, color: 'var(--brand)' }}>Call-to-Action Buttons</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 16 }}>
            <label>
              <span style={labelStyle}>Primary button label</span>
              <input value={form.primaryLabel} onChange={(e) => set('primaryLabel', e.target.value)} style={inputStyle} required />
            </label>
            <label>
              <span style={labelStyle}>Primary button link</span>
              <input value={form.primaryHref} onChange={(e) => set('primaryHref', e.target.value)} style={inputStyle} required placeholder="/admission" />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 16 }}>
            <label>
              <span style={labelStyle}>Secondary button label</span>
              <input value={form.secondaryLabel} onChange={(e) => set('secondaryLabel', e.target.value)} style={inputStyle} required />
            </label>
            <label>
              <span style={labelStyle}>Secondary button link</span>
              <input value={form.secondaryHref} onChange={(e) => set('secondaryHref', e.target.value)} style={inputStyle} required placeholder="/programs" />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <label>
              <span style={labelStyle}>Primary button label (Arabic)</span>
              <input value={form.primaryLabelAr} onChange={(e) => set('primaryLabelAr', e.target.value)} style={inputStyleAr} />
            </label>
            <label>
              <span style={labelStyle}>Secondary button label (Arabic)</span>
              <input value={form.secondaryLabelAr} onChange={(e) => set('secondaryLabelAr', e.target.value)} style={inputStyleAr} />
            </label>
          </div>
        </section>

        <section className="ih-card" style={{ padding: 24 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 16, color: 'var(--brand)' }}>Feature Checklist</h2>
          <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--ink-soft)' }}>
            Short phrases shown with a checkmark under the buttons (e.g. "Structured curriculum"). The Arabic list is matched to the English list by position.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {form.features.map((feature, i) => (
              <div key={i} style={{ display: 'flex', gap: 8 }}>
                <input
                  value={feature}
                  onChange={(e) => setFeature(i, e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="Structured curriculum"
                />
                <input
                  value={form.featuresAr[i] || ''}
                  onChange={(e) => setFeatureAr(i, e.target.value)}
                  style={{ ...inputStyleAr, flex: 1 }}
                  placeholder="(Arabic, optional)"
                />
                <button
                  type="button"
                  onClick={() => removeFeature(i)}
                  className="ih-btn ih-btn-secondary"
                  style={{ flexShrink: 0 }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button type="button" onClick={addFeature} className="ih-btn ih-btn-secondary" style={{ marginTop: 12 }}>
            + Add Feature
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
          {saving ? 'Saving...' : 'Save Hero Section'}
        </button>
      </form>
    </main>
  );
}

function ImageUploadField({ label, hint, value, uploading, progress, onUpload, onClear, previewStyle }) {
  const inputRef = useRef(null);

  return (
    <div>
      <span style={labelStyle}>{label}</span>
      <p style={{ margin: '0 0 10px', fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{hint}</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {value ? (
          <img src={value} alt={label} style={{ ...previewStyle, border: '1px solid var(--border)' }} />
        ) : (
          <div
            style={{
              ...previewStyle,
              border: '1px dashed var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ink-soft)',
              fontSize: 11,
            }}
          >
            No image
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 130 }}>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              onUpload(file);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            className="ih-btn ih-btn-secondary"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? `Uploading… ${progress || 0}%` : value ? 'Replace' : 'Upload'}
          </button>
          {uploading && (
            <div
              style={{
                width: '100%',
                height: 5,
                borderRadius: 3,
                background: 'var(--border-soft, var(--border))',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progress || 0}%`,
                  height: '100%',
                  background: 'var(--brand-dark)',
                  borderRadius: 3,
                  transition: 'width .15s ease',
                }}
              />
            </div>
          )}
          {value && (
            <button type="button" className="ih-btn ih-btn-secondary" onClick={onClear}>
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
