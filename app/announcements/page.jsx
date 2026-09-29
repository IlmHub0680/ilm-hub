'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// The full "View All" destination for the homepage's Announcements
// card -- every current institution-wide notice, newest first, each
// one addressable by #announcement-<id> so the homepage can link
// straight to a specific notice. Same fetch, same public endpoint
// (/api/announcements) the homepage card itself uses.
export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <>
      <SiteHeader />
      <main style={page}>
        <section style={hero}>
          <div style={heroInner}>
            <div style={eyebrow}>Ulul Azm</div>
            <h1 style={heroTitle}>Announcements</h1>
            <p style={heroSub}>
              Notices from the Institute -- admissions updates, academic notices, and
              other institution-wide announcements, in one place.
            </p>
          </div>
        </section>

        <section style={container}>
          {loading && <div style={emptyState}>Loading announcements&hellip;</div>}
          {error && <div style={{ ...emptyState, color: 'var(--danger)' }}>{error}</div>}

          {!loading && !error && announcements.length === 0 && (
            <div style={emptyState}>No announcements are published right now -- please check back soon.</div>
          )}

          {!loading && !error && announcements.length > 0 && (
            <div style={list}>
              {announcements.map((item) => (
                <article
                  key={item.id}
                  id={`announcement-${item.id}`}
                  style={card}
                >
                  <div style={cardDate}>{formatDate(item.publishedAt)}</div>
                  <h2 style={cardTitle}>{item.titleEn}</h2>
                  <p style={cardBody}>{item.bodyEn}</p>
                </article>
              ))}
            </div>
          )}

          <div style={backLinkWrap}>
            <Link href="/" style={backLink}>
              &larr; Back to homepage
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

const page = { minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--font-body)' };

const hero = {
  background: 'linear-gradient(135deg, var(--brand-dark), var(--brand))',
  padding: '64px 24px 40px',
  color: 'var(--on-accent)',
};

const heroInner = { maxWidth: 780, margin: '0 auto', textAlign: 'center' };

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

const container = { maxWidth: 860, margin: '32px auto 0', padding: '0 24px 60px' };

const emptyState = { color: 'var(--ink-soft)', padding: '40px 0', textAlign: 'center' };

const list = {
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
};

const card = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  padding: '24px 26px',
  borderTop: '4px solid var(--gold)',
  boxShadow: '0 1px 3px rgba(0,0,0,.06)',
  scrollMarginTop: 120,
};

const cardDate = {
  color: 'var(--gold-dark)',
  fontWeight: 800,
  fontSize: 11.5,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: 10,
};

const cardTitle = {
  fontFamily: 'var(--font-display)',
  color: 'var(--brand)',
  fontSize: 20,
  margin: '0 0 10px',
};

const cardBody = {
  color: 'var(--ink-soft)',
  lineHeight: 1.7,
  fontSize: 14.5,
  margin: 0,
};

const backLinkWrap = {
  marginTop: 40,
  textAlign: 'center',
};

const backLink = {
  color: 'var(--brand)',
  fontWeight: 700,
  fontSize: 14,
  textDecoration: 'none',
};
