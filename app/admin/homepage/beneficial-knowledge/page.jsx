'use client';

import SectionBannerEditor from '@/components/admin/SectionBannerEditor';

export default function BeneficialKnowledgeBannerPage() {
  return (
    <main style={{ padding: '40px 32px 80px', color: 'var(--ink)' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Beneficial Knowledge</h1>
        <p style={{ marginTop: 8, color: 'var(--ink-soft)', lineHeight: 1.6, maxWidth: 640 }}>
          The heading, message, and background image for the \u201cBeneficial Knowledge\u201d box
          in the homepage's Bookstore section. A dark overlay is applied automatically to the
          image so the heading and text stay readable over any photo. Leave any field empty to
          keep the site's default wording or plain green gradient background. You can change
          these again at any time -- each save takes effect immediately.
        </p>
      </div>

      <SectionBannerEditor
        section="homepage-beneficial-knowledge"
        title="Beneficial Knowledge"
        hint="Shown in the homepage's Bookstore section. Leave the heading or text empty to keep the site's default wording (PNG, JPEG, WebP or SVG, max 5MB for the image)."
        showText
        textLabel="Heading"
        bodyLabel="Message"
      />
    </main>
  );
}
