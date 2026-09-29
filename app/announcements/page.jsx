'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { SearchIcon } from '@/components/Icons';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function matches(query, ...fields) {
  if (!query) return true;
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return fields.some((field) => (field || '').toLowerCase().includes(needle));
}

// The full "View All" destination for the homepage's Announcements
// card -- every current institution-wide notice, three per row like
// the Events & News page, each one addressable by #announcement-<id>
// so the homepage card can link straight to a specific notice. Same
// fetch, same public endpoint (/api/announcements) the homepage card
// itself uses.
export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;

    fetch('/api/announcements')
      .then((res) => res.json())
      .then((result) => {
        if (cancelled) return;
        if (result?.success) {
          setAnnouncements(result.data || []);
        } else {
          setError('Unable to load announcements right now -- please try again shortly.');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Unable to load announcements right now -- please try again shortly.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () => announcements.filter((item) => matches(query, item.titleEn, item.bodyEn)),
    [announcements, query]
  );

  const nothingPublishedAtAll = !loading && !error && announcements.length === 0;
  const searchHasNoResults =
    !loading && !error && !nothingPublishedAtAll && query.trim() !== '' && filtered.length === 0;

  return (
    <>
      <SiteHeader />
      <main style={page}>
        <section style={hero}>
          <div style={heroInner}>
            <div style={backLinkWrap}>
              <Link href="/" style={backLink}>
                &larr; Back to homepage
              </Link>
            </div>

            <div style={eyebrow}>Ulul Azm</div>
            <h1 style={heroTitle}>Announcements</h1>
            <p style={heroSub}>
              Notices from the Institute -- admissions updates, academic notices, and other
              institution-wide announcements, in one place.
            </p>

            <div style={heroControls}>
              <div style={searchWrap}>
                <SearchIcon size={15} style={searchIconStyle} />
                <label htmlFor="announcements-search" style={srOnlyLabel}>
                  Search announcements
                </label>
                <input
                  id="announcements-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search announcements…"
                  style={searchInput}
                />
              </div>
            </div>
          </div>
        </section>

        <section style={container}>
          {loading && <div style={emptyState}>Loading announcements&hellip;</div>}
          {error && <div style={{ ...emptyState, color: 'var(--danger)' }}>{error}</div>}

          {nothingPublishedAtAll && (
            <div style={emptyState}>No announcements are published right now -- please check back soon.</div>
          )}

          {searchHasNoResults && (
            <div style={emptyState}>
              No announcements match &ldquo;{query.trim()}&rdquo;. Try a different search.
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div style={grid}>
              {filtered.map((item) => (
                <article key={item.id} id={`announcement-${item.id}`} style={card}>
                  <div style={cardEyebrow}>{formatDate(item.publishedAt)}</div>
                  <h2 style={cardTitle}>{item.titleEn}</h2>
                  <p style={cardDesc}>{item.bodyEn}</p>
                </article>
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
  padding: '28px 24px 40px',
  color: 'var(--on-accent)',
};

const heroInner = { maxWidth: 780, margin: '0 auto', textAlign: 'center' };

const backLinkWrap = {
  textAlign: 'left',
  marginBottom: 22,
};

const backLink = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  color: 'var(--on-accent)',
  opacity: 0.85,
  fontWeight: 700,
  fontSize: 13.5,
  textDecoration: 'none',
};

const eyebrow = {
  fontSize: 12.5,
  letterSpacing: 2,
  textTransform: 'uppercase',
  color: 'var(--gold)',
  fontWeight: 700,
  marginBottom: 10,
};

const heroTitle = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(26px, 3.4vw, 40px)',
  lineHeight: 1.15,
  margin: '0 0 14px',
  color: 'var(--on-accent)',
  textWrap: 'balance',
};

const heroSub = {
  fontSize: 15.5,
  lineHeight: 1.6,
  color: 'var(--on-accent)',
  opacity: 0.92,
  margin: '0 auto',
  maxWidth: 620,
};

const heroControls = {
  marginTop: 28,
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 14,
};

const searchWrap = {
  position: 'relative',
  flex: '1 1 320px',
  maxWidth: 420,
};

const searchIconStyle = {
  position: 'absolute',
  left: 16,
  top: '50%',
  transform: 'translateY(-50%)',
  opacity: 0.75,
  pointerEvents: 'none',
};

const srOnlyLabel = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
};

const searchInput = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 16px 12px 42px',
  borderRadius: 999,
  border: '1px solid rgba(255,255,255,.35)',
  background: 'rgba(255,255,255,.12)',
  color: 'var(--on-accent)',
  fontSize: 14.5,
  outline: 'none',
};

const container = { maxWidth: 1180, margin: '32px auto 0', padding: '0 24px 60px' };

const emptyState = { color: 'var(--ink-soft)', padding: '40px 0', textAlign: 'center' };

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: 22,
};

const card = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  padding: 22,
  borderTop: '4px solid var(--gold)',
  boxShadow: '0 1px 3px rgba(0,0,0,.06)',
  scrollMarginTop: 120,
};

const cardEyebrow = {
  fontSize: 11.5,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: 0.4,
  color: 'var(--gold-dark)',
};

const cardTitle = {
  fontFamily: 'var(--font-display)',
  fontSize: 18.5,
  fontWeight: 600,
  color: 'var(--ink)',
  lineHeight: 1.3,
  margin: 0,
};

const cardDesc = {
  fontSize: 13.5,
  lineHeight: 1.55,
  color: 'var(--ink-soft)',
  margin: 0,
  display: '-webkit-box',
  WebkitLineClamp: 5,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

