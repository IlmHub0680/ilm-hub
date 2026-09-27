'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

const CATEGORY_LABELS = {
  ANNOUNCEMENT: 'Announcement',
  ACADEMIC: 'Academic',
  ADMISSIONS: 'Admissions',
  COMMUNITY: 'Community',
  ACHIEVEMENT: 'Achievement',
  GENERAL: 'General',
};

export default function NewsArticlePage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/news')
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setError('Unable to load this article right now.');
          return;
        }
        const found = data.data.find((a) => a.id === id);
        if (!found) {
          setError('This article is not available.');
          return;
        }
        setArticle(found);
      })
      .catch(() => setError('Unable to load this article right now.'));
  }, [id]);

  return (
    <>
      <SiteHeader />
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--paper)', padding: '48px 20px 80px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <Link href="/news" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginBottom: 20 }}>
            ← Back to News
          </Link>

          {!article && !error && <div style={{ color: 'var(--ink-soft)' }}>Loading…</div>}
          {error && <div style={{ color: 'var(--danger)' }}>{error}</div>}

          {article && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '36px 34px', boxShadow: '0 4px 20px rgba(27,36,31,.06)' }}>
              {article.featuredImageUrl && (
                <div style={{ width: '100%', height: 260, borderRadius: 12, backgroundImage: `url(${article.featuredImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: 22 }} />
              )}
              <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--gold-dark)', marginBottom: 8 }}>
                {CATEGORY_LABELS[article.category] || article.category}
                {article.publishedAt ? ` · ${new Date(article.publishedAt).toLocaleDateString()}` : ''}
              </div>
              <h1 style={{ margin: '0 0 22px', fontSize: 28, fontWeight: 800, color: 'var(--ink)' }}>{article.titleEn}</h1>
              <div
                className="legal-page-body"
                style={{ color: 'var(--ink)', lineHeight: 1.75, fontSize: 15.5 }}
                dangerouslySetInnerHTML={{ __html: article.bodyEnHtml }}
              />
            </div>
          )}
        </div>

        {/* Same rich-text rendering rules as PublicLegalPageClient's
            .legal-page-body -- duplicated here (rather than imported)
            because that block is defined as styled-jsx scoped to that
            component and never reaches a page that doesn't mount it. */}
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
