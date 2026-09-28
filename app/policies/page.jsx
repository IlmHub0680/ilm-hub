'use client';

import Link from 'next/link';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

// This page used to be a public "Institute Policies & Transparency"
// hub making specific factual claims -- that Ulul Azm runs affiliate
// links and earns commissions, and that it manages advertising slots
// (Homepage Banners, Sidebar, In-Content ads) with a "Sponsored" badge
// system. Neither an affiliate system nor an ad-slot system exists
// anywhere in this app (confirmed by searching the whole codebase),
// so those claims were false. Replaced with an honest holding page
// until there are real policies here to describe. The one system this
// page referenced that DOES exist -- sponsor management -- is
// covered by the real /sponsored page instead, so it doesn't need to
// be re-described here.
export default function PoliciesPage() {
  return (
    <>
      <SiteHeader />

      <div style={{ minHeight: '60vh', backgroundColor: 'var(--paper)', padding: '48px 20px 80px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: '40px 34px',
              boxShadow: '0 4px 20px rgba(27,36,31,.06)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 34, marginBottom: 14 }} aria-hidden="true">📄</div>

            <h1 style={{ margin: '0 0 12px', fontSize: 28, fontWeight: 800, color: 'var(--ink)' }}>
              Institute Policies
            </h1>

            <p style={{ color: 'var(--ink-soft)', lineHeight: 1.7, fontSize: 15.5, marginBottom: 28 }}>
              This page isn't ready yet. For our terms, privacy, and other published policies, see the
              links in the site footer, or get in touch with the institute directly.
            </p>

            <Link
              href="/contact"
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
              Contact the Institute →
            </Link>
          </div>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
