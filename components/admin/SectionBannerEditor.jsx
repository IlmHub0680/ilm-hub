'use client';

// Shared banner-image editor for a single public section (Model 17) --
// one image, its own independent Save button, applies immediately.
// Used by /admin/bookstore/banner, /admin/media/banner and
// /admin/library-resources/banner so the upload/save logic lives in
// exactly one place instead of being copy-pasted three times.
//
// Mirrors the pattern already built for the Homepage Hero's Brand
// Assets section: upload via the generic /api/admin/uploads/image
// endpoint, then save via a PATCH that updates only this one field --
// nothing else on the page needs to be filled in for this to work.

import { useEffect, useRef, useState } from 'react';

const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 13.5 };

// showText opts a section into editing SectionBanner.titleEn/bodyEn too
// (see the model comment in prisma/schema.prisma) -- off by default so
// bookstore/media/library, which only ever edit the image, are
// unaffected. Only 'homepage-beneficial-knowledge' passes it.
export default function SectionBannerEditor({ section, title, hint, showText = false, textLabel = 'Heading', bodyLabel = 'Body text' }) {
  const [imageUrl, setImageUrl] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [bodyEn, setBodyEn] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/section-banners/${section}`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((result) => {
        if (cancelled || !result?.success) return;
        setImageUrl(result.data.imageUrl || '');
        if (showText) {
          setTitleEn(result.data.titleEn || '');
          setBodyEn(result.data.bodyEn || '');
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [section, showText]);

  async function handleUpload(file) {
    if (!file) return;

    setUploading(true);
    setMessage('');

    try {
      const body = new FormData();
      body.append('file', file);
      body.append('folder', `banner-${section}`);

      const res = await fetch('/api/admin/uploads/image', {
        method: 'POST',
        credentials: 'include',
        body,
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Upload failed.');
      }

      setImageUrl(result.url);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');

    try {
      const payload = { imageUrl };
      if (showText) {
        payload.titleEn = titleEn;
        payload.bodyEn = bodyEn;
      }

      const res = await fetch(`/api/section-banners/${section}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to save banner.');
      }

      setImageUrl(result.data.imageUrl || '');
      if (showText) {
        setTitleEn(result.data.titleEn || '');
        setBodyEn(result.data.bodyEn || '');
      }
      setMessage('Banner saved successfully. The change is already live.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div style={{ padding: 24, color: 'var(--ink-soft)' }}>Loading banner...</div>;
  }

  return (
    <section className="ih-card" style={{ padding: 24, maxWidth: 640 }}>
      <h2 style={{ margin: '0 0 6px', fontSize: 16, color: 'var(--brand)' }}>{title}</h2>
      {hint && (
        <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{hint}</p>
      )}

      <span style={labelStyle}>Banner image</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${title} preview`}
            style={{ width: 200, height: 110, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--border)' }}
          />
        ) : (
          <div
            style={{
              width: 200,
              height: 110,
              borderRadius: 10,
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              handleUpload(file);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            className="ih-btn ih-btn-secondary"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? 'Uploading...' : imageUrl ? 'Replace' : 'Upload'}
          </button>
          {imageUrl && (
            <button type="button" className="ih-btn ih-btn-secondary" onClick={() => setImageUrl('')}>
              Remove
            </button>
          )}
        </div>
      </div>

      {showText && (
        <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <span style={labelStyle}>{textLabel}</span>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="Leave empty to keep the default heading"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '9px 12px',
                fontSize: 13.5,
                background: 'var(--surface)',
                color: 'var(--ink)',
              }}
            />
          </div>
          <div>
            <span style={labelStyle}>{bodyLabel}</span>
            <textarea
              value={bodyEn}
              onChange={(e) => setBodyEn(e.target.value)}
              placeholder="Leave empty to keep the default text"
              rows={4}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '9px 12px',
                fontSize: 13.5,
                fontFamily: 'inherit',
                background: 'var(--surface)',
                color: 'var(--ink)',
                resize: 'vertical',
              }}
            />
          </div>
        </div>
      )}

      {message && (
        <div
          className="ih-card"
          style={{
            marginBottom: 16,
            padding: '10px 14px',
            background: message.includes('successfully') ? 'var(--success-tint)' : 'var(--danger-tint)',
            color: message.includes('successfully') ? 'var(--brand-light)' : 'var(--danger)',
          }}
        >
          {message}
        </div>
      )}

      <button type="button" disabled={saving} onClick={handleSave} className="ih-btn ih-btn-primary" style={{ padding: '11px 26px' }}>
        {saving ? 'Saving...' : 'Save Banner'}
      </button>
    </section>
  );
}
