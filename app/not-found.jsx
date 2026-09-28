import Link from 'next/link';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

// Previously missing entirely -- an unmatched route (or a call to
// Next's notFound(), e.g. app/bookstore/[id]/page.jsx for a missing
// book) fell through to Next.js's bare default 404: no header, no
// footer, no brand styling, nothing matching the rest of the site.
export default function NotFound() {
  return (
    <>
      <SiteHeader />

      <div style={{ minHeight: '55vh', backgroundColor: 'var(--paper)', padding: '60px 20px 90px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 72,
              fontWeight: 800,
              color: 'var(--gold)',
              lineHeight: 1,
              marginBottom: 8,
            }}
          >
            404
          </div>

          <h1 style={{ margin: '0 0 12px', fontSize: 26, fontWeight: 800, color: 'var(--ink)' }}>
            Page Not Found
          </h1>

          <p style={{ color: 'var(--ink-soft)', lineHeight: 1.7, fontSize: 15.5, marginBottom: 30 }}>
            The page you're looking for doesn't exist or may have moved.
          </p>

          <Link
            href="/"
            style={{
              display: 'inline-block',
              background: 'var(--brand)',
              color: 'var(--on-accent)',
              padding: '13px 28px',
              borderRadius: 9,
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: 15,
            }}
          >
            Return to Homepage →
          </Link>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
