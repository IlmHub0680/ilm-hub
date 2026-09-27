'use client';

import SectionBannerEditor from '@/components/admin/SectionBannerEditor';

export default function LibraryCardBannerPage() {
  return (
    <main style={{ padding: '40px 32px 80px', color: 'var(--ink)' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Library Card</h1>
        <p style={{ marginTop: 8, color: 'var(--ink-soft)', lineHeight: 1.6, maxWidth: 640 }}>
          The picture, heading, and description for the "Library" card in the homepage's
          MEDIA &amp; LIBRARY section. Leave any field empty to keep the site's default
          📖 icon and wording. Each save takes effect immediately.
        </p>
      </div>

      <SectionBannerEditor
        section="homepage-library-card"
        title="Library Card"
        hint="Shown as the Library card in the homepage's MEDIA & LIBRARY section. Leave the heading or text empty to keep the site's default wording (PNG, JPEG, WebP or SVG, max 5MB for the image)."
        showText
        textLabel="Heading"
        bodyLabel="Description"
      />
    </main>
  );
}
