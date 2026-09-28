'use client';

import Link from 'next/link';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

// This page used to show a fake "Active Affiliate Tracking
// Dashboard" -- a hardcoded click counter, partner links that all
// pointed to "#" (nowhere), and a button whose only effect was an
// alert() claiming "Affiliate tracking recorded." None of it was
// backed by a real program, a real partner, or a real tracking
// system. Replaced with an honest holding page until a real
// affiliate program exists to describe here.
export default function AffiliatesPage() {
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
            <div style={{ fontSize: 34, marginBottom: 14 }} aria-hidden="true">🤝</div>

            <h1 style={{ margin: '0 0 12px', fontSize: 28, fontWeight: 800, color: 'var(--ink)' }}>
              Affiliate Program
            </h1>

            <p style={{ color: 'var(--ink-soft)', lineHeight: 1.7, fontSize: 15.5, marginBottom: 28 }}>
              We don't have a formal affiliate or partner program open yet. If you'd like to collaborate
              with Ulul Azm Institute or discuss a partnership, we'd love to hear from you.
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
