'use client';

import Link from 'next/link';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

// This page used to show a fake "Sell Your Books Portal" -- a form
// collecting a book title, author, price, and the submitter's
// contact email or phone, whose "Publish Listing" button only set a
// local success flag. Nothing was ever saved, sent, or reviewed, and
// the contact info entered was silently discarded, while the person
// was told "Your book has been submitted for review and will appear
// in the bookstore catalogue shortly." Replaced with an honest
// holding page until a real book-selling submission flow exists.
export default function SellBooksPage() {
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
            <div style={{ fontSize: 34, marginBottom: 14 }} aria-hidden="true">📚</div>

            <h1 style={{ margin: '0 0 12px', fontSize: 28, fontWeight: 800, color: 'var(--ink)' }}>
              Sell Your Books
            </h1>

            <p style={{ color: 'var(--ink-soft)', lineHeight: 1.7, fontSize: 15.5, marginBottom: 28 }}>
              We don't have a book-selling submission portal open yet. If you'd like to offer academic
              or Islamic texts for the bookstore catalogue, please reach out to the institute directly
              and we'll be happy to discuss it.
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
