'use client';

import Link from 'next/link';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { useEffect, useState } from 'react';

const DEFAULT_HERO = {
  badge: 'Ulul Azm',
  title: 'The Academy',
  subtitle:
    "Everything that defines how Ulul Azm Academy teaches, assesses and progresses its students — from the programmes you can enrol in today to the institutional documents that govern them.",
};

const DEFAULT_CARDS = [
  {
    icon: '🕌',
    title: 'Academy Foundation',
    description:
      "The Academy's institutional identity, educational philosophy, the learners it serves, and the principles that govern every curriculum, program and course decision.",
    href: '/academy-foundation',
  },
  {
    icon: '🎓',
    title: 'Academy Pathways',
    description:
      'The academic pathways and qualification framework — Foundation, Intermediate, Advanced, Diploma and Specialized Certificates.',
    href: '/academy-pathways',
  },
];

// The Academy's other governance/curriculum/assessment/etc. planning
// documents are real, internal content -- still fully viewable and
// editable at /admin/academy-* -- but are no longer shown as public
// pages here; they were never meant to stand as a second public
// sitemap of raw institutional planning documents.

export default function AcademyHubPage() {
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [cards, setCards] = useState(DEFAULT_CARDS);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/academy-hub')
      .then((res) => (res.ok ? res.json() : null))
      .then((result) => {
        if (cancelled || !result?.success) return;
        if (result.data.hero) setHero(result.data.hero);
        if (result.data.cards?.length > 0) setCards(result.data.cards);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <SiteHeader />
      <main style={page}>
      <section style={hero_}>
        <div style={heroInner}>
          <div style={eyebrow}>{hero.badge}</div>
          <h1 style={heroTitle}>{hero.title}</h1>
          <p style={heroSub}>{hero.subtitle}</p>
        </div>
      </section>

      <section style={programmesSection}>
        <Link href="/programs" style={programmesCard}>
          <div style={programmesCardText}>
            <div style={programmesEyebrow}>Start Here</div>
            <div style={programmesTitle}>Browse Academic Programmes</div>
            <p style={programmesDesc}>
              Explore every active programme offered across the Academy's
              departments — certificate, diploma and advanced pathways alike.
            </p>
          </div>
          <span style={programmesCta}>View Programmes →</span>
        </Link>

        <div style={quickLinkRow}>
          <Link href="/departments" style={quickLinkCard}>
            <span style={quickLinkIcon}>🏢</span>
            <span style={quickLinkTitle}>Departments</span>
            <span style={quickLinkDesc}>The Academy's real academic departments.</span>
          </Link>
          <Link href="/faculty" style={quickLinkCard}>
            <span style={quickLinkIcon}>👥</span>
            <span style={quickLinkTitle}>Faculty</span>
            <span style={quickLinkDesc}>Meet the teaching staff, by department.</span>
          </Link>
          <Link href="/academic-calendar" style={quickLinkCard}>
            <span style={quickLinkIcon}>📅</span>
            <span style={quickLinkTitle}>Academic Calendar</span>
            <span style={quickLinkDesc}>The official Gregorian &amp; Hijri calendar.</span>
          </Link>
        </div>
      </section>

      <section style={docsSection}>
        <h2 style={docsSectionTitle}>Institutional &amp; Academic Documents</h2>
        <p style={docsSectionSub}>
          The Academy's governing documents, in order — from institutional
          identity through to how learners are assessed and graduate.
        </p>

        <div style={grid}>
          {cards.map((doc) => (
            <Link key={doc.href} href={doc.href} style={card}>
              <div style={cardIcon}>{doc.icon}</div>
              <div style={cardTitle}>{doc.title}</div>
              <p style={cardDesc}>{doc.description}</p>
              <div style={cardFooter}>
                <span style={cardCta}>Read Document →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section style={ctaSection}>
        <h2 style={ctaTitle}>Ready to apply?</h2>
        <p style={ctaSub}>Admission requirements are reviewed as part of your application — start the process below.</p>
        <Link href="/admission" style={ctaButton}>Start Your Application →</Link>
      </section>
    </main>
      <SiteFooter />
    </>
  );
}

const page = { minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--font-body)' };

const hero_ = {
  background: 'linear-gradient(135deg, var(--brand-dark), var(--brand))',
  padding: '64px 24px 56px',
  color: 'var(--on-accent)',
};

const heroInner = { maxWidth: 980, margin: '0 auto', textAlign: 'center' };

const backToHomeLink = {
  display: 'block',
  textAlign: 'left',
  marginBottom: 20,
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

const heroSub = { fontSize: 15.5, lineHeight: 1.6, color: 'var(--on-accent)', opacity: 0.92, margin: '0 auto', maxWidth: 640 };

const programmesSection = {
  maxWidth: 1180,
  margin: '28px auto 0',
  padding: '0 24px',
};

const programmesCard = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 20,
  flexWrap: 'wrap',
  textDecoration: 'none',
  color: 'inherit',
  background: 'var(--brand-tint)',
  border: '1px solid var(--border)',
  borderRadius: 16,
  padding: '26px 28px',
};

const programmesCardText = { maxWidth: 640 };

const quickLinkRow = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: 14,
  marginTop: 16,
};

const quickLinkCard = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  textDecoration: 'none',
  color: 'inherit',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: '16px 18px',
};

const quickLinkIcon = { fontSize: 20 };
const quickLinkTitle = { fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ink)' };
const quickLinkDesc = { fontSize: 12.5, color: 'var(--ink-soft)' };

const programmesEyebrow = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  color: 'var(--gold-dark)',
  marginBottom: 6,
};

const programmesTitle = {
  fontFamily: 'var(--font-display)',
  fontSize: 21,
  fontWeight: 700,
  color: 'var(--ink)',
  marginBottom: 6,
};

const programmesDesc = { fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-soft)', margin: 0 };

const programmesCta = {
  flexShrink: 0,
  color: 'var(--brand)',
  fontWeight: 700,
  fontSize: 14.5,
};

const docsSection = {
  maxWidth: 1180,
  margin: '48px auto 0',
  padding: '0 24px',
};

const docsSectionTitle = {
  fontFamily: 'var(--font-display)',
  fontSize: 22,
  color: 'var(--ink)',
  margin: '0 0 6px',
};

const docsSectionSub = { fontSize: 13.5, color: 'var(--ink-soft)', margin: '0 0 24px', maxWidth: 640 };

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: 20,
  paddingBottom: 60,
};

const card = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  textDecoration: 'none',
  color: 'inherit',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  padding: 22,
  boxShadow: '0 1px 3px rgba(0,0,0,.06)',
};

const cardIcon = { fontSize: 22 };

const cardTitle = {
  fontFamily: 'var(--font-display)',
  fontSize: 17,
  fontWeight: 600,
  color: 'var(--ink)',
  lineHeight: 1.3,
};

const cardDesc = {
  fontSize: 13,
  lineHeight: 1.55,
  color: 'var(--ink-soft)',
  margin: 0,
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

const cardFooter = {
  marginTop: 'auto',
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  fontSize: 12.5,
  paddingTop: 8,
  borderTop: '1px solid var(--border)',
};

const cardCta = { color: 'var(--brand)', fontWeight: 700 };

const ctaSection = {
  background: 'var(--brand-tint)',
  padding: '48px 24px 56px',
  borderTop: '1px solid var(--border)',
  textAlign: 'center',
};

const ctaTitle = { fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--ink)', margin: '0 0 8px' };
const ctaSub = { color: 'var(--ink-soft)', fontSize: 14, maxWidth: 520, margin: '0 auto 22px' };

const ctaButton = {
  display: 'inline-block',
  padding: '13px 28px',
  borderRadius: 9,
  background: 'var(--gold)',
  color: 'var(--on-accent)',
  fontWeight: 700,
  fontSize: 14.5,
  textDecoration: 'none',
};
