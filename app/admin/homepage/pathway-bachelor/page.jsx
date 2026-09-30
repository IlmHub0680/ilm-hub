'use client';

import SectionBannerEditor from '@/components/admin/SectionBannerEditor';

export default function PathwayBachelorCardPage() {
  return (
    <main style={{ padding: '40px 32px 80px', color: 'var(--ink)' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Bachelor&rsquo;s Degree Card</h1>
        <p style={{ marginTop: 8, color: 'var(--ink-soft)', lineHeight: 1.6, maxWidth: 640 }}>
          The picture and caption for the &ldquo;Bachelor&rsquo;s Degree&rdquo; card in the
          homepage&rsquo;s Academic Programs section. The card shows &ldquo;Coming Soon&rdquo;
          automatically until a real Bachelor&rsquo;s (Undergraduate-level) programme is added
          and activated from a Head of Department&rsquo;s dashboard &mdash; this page only
          controls the picture and caption, not that availability. Leave any field empty to
          keep the site&rsquo;s default icon and wording. Each save takes effect immediately.
        </p>
      </div>

      <SectionBannerEditor
        section="homepage-pathway-bachelor"
        title="Bachelor's Degree Card"
        hint="Shown as the Bachelor's Degree card in the homepage's Academic Programs section. Leave the heading or text empty to keep the site's default wording (PNG, JPEG, WebP or SVG, max 5MB for the image)."
        showText
        textLabel="Heading"
        bodyLabel="Description"
      />
    </main>
  );
}
