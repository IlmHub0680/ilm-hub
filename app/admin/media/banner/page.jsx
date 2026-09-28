'use client';

import SectionBannerEditor from '@/components/admin/SectionBannerEditor';

export default function MediaBannerPage() {
  return (
    <main style={{ padding: '40px 32px 80px', color: 'var(--ink)' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Media Banner</h1>
        <p style={{ marginTop: 8, color: 'var(--ink-soft)', lineHeight: 1.6, maxWidth: 640 }}>
          The background image behind the Media page's hero banner. Leave empty and it keeps
          its plain green gradient background.
        </p>
      </div>

      <SectionBannerEditor
        section="media"
        title="Media Banner"
        hint="Shown behind the hero heading on the public Media page (PNG, JPEG, WebP or SVG, max 5MB)."
      />
    </main>
  );
}
