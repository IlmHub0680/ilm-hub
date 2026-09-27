'use client';

import { useEffect, useState } from 'react';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function PublicLegalPageClient({ slug, fallbackTitle }) {
  const [page, setPage] = useState({ title: fallbackTitle, bodyHtml: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/legal-content')
      .then((res) => res.json())
      .then((result) => {
        if (cancelled) return;
        const data = result?.data?.pages?.[slug];
        if (data) setPage(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <>
      <SiteHeader />
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--paper)', padding: '48px 20px 80px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '36px 34px',
            boxShadow: '0 4px 20px rgba(27,36,31,.06)',
          }}
        >
          <h1 style={{ margin: '0 0 22px', fontSize: 30, fontWeight: 800, color: 'var(--ink)' }}>
            {page.title}
          </h1>

          {loading ? (
            <p style={{ color: 'var(--ink-soft)' }}>Loading…</p>
          ) : (
            <div
              className="legal-page-body"
              style={{ color: 'var(--ink)', lineHeight: 1.75, fontSize: 15.5 }}
              dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
            />
          )}
        </div>
      </div>

      <style jsx global>{`
        .legal-page-body h2 {
          font-size: 1.35em;
          font-weight: 800;
          margin: 1em 0 0.4em;
          color: var(--brand);
        }
        .legal-page-body h3 {
          font-size: 1.15em;
          font-weight: 700;
          margin: 0.9em 0 0.35em;
        }
        .legal-page-body p {
          margin: 0 0 0.9em;
        }
        .legal-page-body ul,
        .legal-page-body ol {
          margin: 0 0 0.9em;
          padding-left: 1.4em;
        }
        .legal-page-body li {
          margin-bottom: 0.4em;
        }
        .legal-page-body blockquote {
          margin: 1em 0;
          padding: 0.85em 1.1em;
          border-left: 3px solid var(--gold, #a3792f);
          background: var(--brand-tint, #eaf1ec);
          border-radius: 0 8px 8px 0;
          font-size: 0.96em;
          color: var(--ink);
        }
        .legal-page-body blockquote p:last-child {
          margin-bottom: 0;
        }
        .legal-page-body .table-wrap {
          overflow-x: auto;
          margin: 1em 0;
        }
        .legal-page-body table {
          border-collapse: collapse;
          width: 100%;
          min-width: 560px;
          font-size: 0.92em;
        }
        .legal-page-body th,
        .legal-page-body td {
          border: 1px solid var(--border);
          padding: 8px 12px;
          text-align: left;
          vertical-align: top;
        }
        .legal-page-body th {
          background: var(--brand-tint, #eaf1ec);
          color: var(--brand);
          font-weight: 700;
        }
        .legal-page-body code {
          background: var(--brand-tint, #eaf1ec);
          border-radius: 4px;
          padding: 0.1em 0.35em;
          font-size: 0.92em;
        }
      `}</style>
      </div>
      <SiteFooter />
    </>
  );
}
