'use client';

import { useEffect, useRef, useState } from 'react';
import { uploadFileWithProgress } from '@/lib/xhrUpload';

const MAX_BANNERS = 5;

const captionInputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '8px 10px',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 13,
  color: 'var(--ink)',
  backgroundColor: 'var(--surface)',
};

function emptyBanner() {
  return { imageUrl: '', captionEn: '', captionAr: '', accentColor: '', isActive: true };
}

export default function HeroBannerSliderPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/homepage/hero-banners', { credentials: 'include' });
      const result = await res.json();

      if (res.ok && result.success) {
        setBanners(result.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function updateBanner(index, field, value) {
    setBanners((prev) => prev.map((b, i) => (i === index ? { ...b, [field]: value } : b)));
  }

  function moveBanner(index, direction) {
    setBanners((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function addBanner() {
    if (banners.length >= MAX_BANNERS) return;
    setBanners((prev) => [...prev, emptyBanner()]);
  }

  function removeBanner(index) {
    setBanners((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleImageUpload(index, file) {
    if (!file) return;

    setUploadingIndex(index);
    setUploadProgress(0);
    setMessage('');

    try {
      const body = new FormData();
      body.append('file', file);
      body.append('folder', 'hero-banners');

      const result = await uploadFileWithProgress(
        '/api/admin/uploads/image',
        body,
        (percent) => setUploadProgress(percent)
      );

      if (!result || !result.success) {
        throw new Error((result && result.error) || 'Upload failed.');
      }

      updateBanner(index, 'imageUrl', result.url);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setUploadingIndex(null);
      setUploadProgress(0);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/homepage/hero-banners', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banners }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to save hero banners.');
      }

      setBanners(result.data);
      setMessage('Hero banner slider updated successfully.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main style={{ padding: 40, color: 'var(--ink)' }}>Loading hero banners...</main>;
  }

  return (
    <main style={{ padding: '40px 32px 80px', color: 'var(--ink)', maxWidth: 780 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Hero Banner Slider</h1>
        <p style={{ marginTop: 8, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
          Upload up to {MAX_BANNERS} images to rotate through the homepage hero banner,
          5 seconds each, in the order below (use ↑ / ↓ to reorder). This is
          independent of the single banner image on the Hero Section page —
          when at least one image here is enabled, the slider is shown on the
          homepage instead; when none are enabled, the homepage falls back to
          the Hero Section's single image exactly as before. Give each banner
          a short caption (English, and Arabic if you have it) — it types out
          in the homepage headline as that banner is shown, describing the
          picture on screen. Leave a caption blank to fall back to the Hero
          Section's own title instead. Pick an accent color to tint the
          hero background and the image's frame while that banner is
          showing -- Reset returns it to the site's default green.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {banners.length === 0 && (
          <div className="ih-card" style={{ padding: 18, color: 'var(--ink-soft)', fontSize: 13.5 }}>
            No banner images yet. Add one below to get started.
          </div>
        )}

        {banners.map((banner, i) => (
          <div
            key={banner.id || i}
            className="ih-card"
            style={{ padding: 18, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}
          >
            <div>
              {banner.imageUrl ? (
                <img
                  src={banner.imageUrl}
                  alt={`Banner ${i + 1}`}
                  style={{ width: 160, height: 90, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--border)' }}
                />
              ) : (
                <div
                  style={{
                    width: 160,
                    height: 90,
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
            </div>

            <BannerUploadButton
              uploading={uploadingIndex === i}
              progress={uploadingIndex === i ? uploadProgress : 0}
              hasImage={Boolean(banner.imageUrl)}
              onUpload={(file) => handleImageUpload(i, file)}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: '1 1 260px', minWidth: 220 }}>
              <input
                type="text"
                value={banner.captionEn || ''}
                onChange={(e) => updateBanner(i, 'captionEn', e.target.value)}
                placeholder="Caption (English) — describes this banner image"
                style={captionInputStyle}
              />
              <input
                type="text"
                dir="rtl"
                value={banner.captionAr || ''}
                onChange={(e) => updateBanner(i, 'captionAr', e.target.value)}
                placeholder="التسمية التوضيحية (عربي) — اختياري"
                style={{ ...captionInputStyle, fontFamily: 'var(--font-arabic)' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
              <input
                type="color"
                value={banner.accentColor || '#0f4d2c'}
                onChange={(e) => updateBanner(i, 'accentColor', e.target.value)}
                title="Accent color -- the hero background/frame tints toward this while this banner is showing"
                style={{ width: 44, height: 30, padding: 0, border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', background: 'none' }}
              />
              <button
                type="button"
                onClick={() => updateBanner(i, 'accentColor', '')}
                style={{ border: 'none', background: 'none', color: 'var(--ink-soft)', fontSize: 11, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
              >
                Reset
              </button>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={banner.isActive !== false}
                onChange={(e) => updateBanner(i, 'isActive', e.target.checked)}
              />
              Enabled
            </label>

            <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
              <button type="button" onClick={() => moveBanner(i, -1)} disabled={i === 0} className="ih-btn ih-btn-secondary" title="Move up">↑</button>
              <button type="button" onClick={() => moveBanner(i, 1)} disabled={i === banners.length - 1} className="ih-btn ih-btn-secondary" title="Move down">↓</button>
              <button type="button" onClick={() => removeBanner(i)} className="ih-btn ih-btn-danger">Remove</button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addBanner}
          disabled={banners.length >= MAX_BANNERS}
          className="ih-btn ih-btn-secondary"
          style={{ alignSelf: 'flex-start' }}
        >
          {banners.length >= MAX_BANNERS ? `Maximum of ${MAX_BANNERS} reached` : '+ Add Banner Image'}
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
          {saving ? 'Saving...' : 'Save Hero Banner Slider'}
        </button>
      </form>
    </main>
  );
}

function BannerUploadButton({ uploading, progress, hasImage, onUpload }) {
  const inputRef = useRef(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 120 }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          onUpload(file);
          e.target.value = '';
        }}
      />
      <button type="button" className="ih-btn ih-btn-secondary" disabled={uploading} onClick={() => inputRef.current?.click()}>
        {uploading ? `Uploading… ${progress}%` : hasImage ? 'Replace' : 'Upload'}
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
              width: `${progress}%`,
              height: '100%',
              background: 'var(--brand-dark)',
              borderRadius: 3,
              transition: 'width .15s ease',
            }}
          />
        </div>
      )}
    </div>
  );
}
