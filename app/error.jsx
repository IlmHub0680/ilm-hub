'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

// Previously missing entirely -- any unhandled render/runtime error
// in a route segment fell through to Next.js's bare default error
// screen instead of a branded page. This must be a Client Component
// (Next.js requirement for error.jsx) and cannot import server-only
// code, so unlike not-found.jsx it can't do its own data fetching --
// SiteHeader/SiteFooter already resolve what they need client-side.
export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Route error boundary caught:', error);
  }, [error]);

  return (
    <>
      <SiteHeader />

      <div style={{ minHeight: '55vh', backgroundColor: 'var(--paper)', padding: '60px 20px 90px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 14 }} aria-hidden="true">⚠️</div>

          <h1 style={{ margin: '0 0 12px', fontSize: 26, fontWeight: 800, color: 'var(--ink)' }}>
            Something Went Wrong
          </h1>

          <p style={{ color: 'var(--ink-soft)', lineHeight: 1.7, fontSize: 15.5, marginBottom: 30 }}>
            We hit an unexpected error loading this page. You can try again, or head back to the homepage.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                background: 'var(--brand)',
                color: 'var(--on-accent)',
                padding: '13px 28px',
                borderRadius: 9,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                fontSize: 15,
              }}
            >
              Try Again
            </button>

            <Link
              href="/"
              style={{
                display: 'inline-block',
                background: 'var(--surface)',
                color: 'var(--ink)',
                border: '1px solid var(--border)',
                padding: '13px 28px',
                borderRadius: 9,
                fontWeight: 700,
                textDecoration: 'none',
                fontSize: 15,
              }}
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
