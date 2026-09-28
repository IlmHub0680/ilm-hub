'use client';

import { useEffect, useState } from 'react';
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

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function NewsPage() {
  const [articles, setArticles] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/news')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setArticles(data.data);
        } else {
          setError('Unable to load news right now.');
        }
      })
      .catch(() => setError('Unable to load news right now.'));
  }, []);

  return (
    <>
      <SiteHeader />
      <main style={page}>
        <section style={hero}>
          <div style={heroInner}>
            <div style={eyebrow}>Ulul Azm</div>
            <h1 style={heroTitle}>News</h1>
            <p style={heroSub}>Updates, announcements, and stories from across the Institute.</p>
          </div>
        </section>

        <section style={container}>
          {articles === null && !error && <div style={emptyState}>Loading news…</div>}
          {error && <div style={{ ...emptyState, color: 'var(--danger)' }}>{error}</div>}

          {articles && articles.length === 0 && (
            <div style={emptyState}>No news articles are published yet — please check back soon.</div>
          )}

          {articles && articles.length > 0 && (
            <div style={grid}>
              {articles.map((article) => (
                <Link key={article.id} href={`/news/${article.id}`} style={card}>
                  {article.featuredImageUrl && (
                    <div style={{ ...cardImage, backgroundImage: `url(${article.featuredImageUrl})` }} />
                  )}
                  <div style={cardEyebrow}>
                    {CATEGORY_LABELS[article.category] || article.category}
                    {article.publishedAt ? ` · ${new Date(article.publishedAt).toLocaleDateString()}` : ''}
                  </div>
                  <div style={cardTitle}>{article.titleEn}</div>
                  <p style={cardDesc}>{stripHtml(article.bodyEnHtml)}</p>
                  <span style={cardCta}>Read More →</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

const page = { minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--font-body)' };

const hero = {
  background: 'linear-gradient(135deg, var(--brand-dark), var(--brand))',
  padding: '64px 24px 56px',
  color: 'var(--on-accent)',
};

const heroInner = { maxWidth: 980, margin: '0 auto', textAlign: 'center' };

const eyebrow = {
  fontSize: 12.5, letterSpacing: 2, textTransform: 'uppercase',
  color: 'var(--gold)', fontWeight: 700, marginBottom: 10,
};

const heroTitle = {
  fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3.4vw, 40px)',
  lineHeight: 1.15, margin: '0 0 14px', color: 'var(--on-accent)', textWrap: 'balance',
};

const heroSub = { fontSize: 15.5, lineHeight: 1.6, color: 'var(--on-accent)', opacity: 0.92, margin: '0 auto', maxWidth: 640 };

const container = { maxWidth: 1180, margin: '32px auto 0', padding: '0 24px 60px' };

const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 22 };

const emptyState = { color: 'var(--ink-soft)', padding: '40px 0' };

const card = {
  display: 'flex', flexDirection: 'column', gap: 8, textDecoration: 'none', color: 'inherit',
  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
  padding: 22, boxShadow: '0 1px 3px rgba(0,0,0,.06)',
};

const cardImage = { height: 150, borderRadius: 10, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: 4 };

const cardEyebrow = { fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--gold-dark)' };

const cardTitle = { fontFamily: 'var(--font-display)', fontSize: 18.5, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 };

const cardDesc = {
  fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-soft)', margin: 0,
  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
};

const cardCta = { marginTop: 'auto', paddingTop: 8, color: 'var(--brand)', fontWeight: 700, fontSize: 13 };
