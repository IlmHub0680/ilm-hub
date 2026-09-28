'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/academic/departments')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDepartments(data.data);
        } else {
          setError('Unable to load academic departments right now.');
        }
      })
      .catch(() => setError('Unable to load academic departments right now.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SiteHeader />
      <main style={page}>
        <section style={hero}>
          <div style={heroInner}>
            <div style={eyebrow}>Ulul Azm</div>
            <h1 style={heroTitle}>Academic Departments</h1>
            <p style={heroSub}>
              The Academy's real academic departments — each one owning a
              slice of the curriculum and offering the programmes that draw
              on it.
            </p>
          </div>
        </section>

        <section style={grid}>
          {loading && <div style={emptyState}>Loading departments…</div>}

          {error && <div style={{ ...emptyState, color: 'var(--danger)' }}>{error}</div>}

          {!loading && !error && departments.length === 0 && (
            <div style={emptyState}>No academic departments are published yet — please check back soon.</div>
          )}

          {departments.map((d) => (
            <Link key={d.id} href={`/departments/${d.id}`} style={card}>
              {d.faculty && <div style={cardEyebrow}>{d.faculty}</div>}
              <div style={cardTitle}>{d.name}</div>
              {d.code && <div style={cardMeta}>{d.code}</div>}
              {d.description && <p style={cardDesc}>{d.description}</p>}
              <div style={cardFooter}>
                <span>
                  {d.programCount} programme{d.programCount === 1 ? '' : 's'}
                </span>
                <span style={cardCta}>View Department →</span>
              </div>
            </Link>
          ))}
        </section>

        <section style={ctaSection}>
          <h2 style={ctaTitle}>Not sure which department fits you?</h2>
          <p style={ctaSub}>
            Browse every active programme across all departments, or meet the
            faculty who teach them.
          </p>
          <div style={ctaButtonRow}>
            <Link href="/programs" style={ctaButton}>Browse Programmes →</Link>
            <Link href="/faculty" style={ctaButtonSecondary}>Meet the Faculty →</Link>
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
  padding: '64px 24px 56px',
  color: 'var(--on-accent)',
};

const heroInner = { maxWidth: 980, margin: '0 auto', textAlign: 'center' };

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

const grid = {
  maxWidth: 1180,
  margin: '32px auto 0',
  padding: '0 24px 60px',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: 22,
};

const emptyState = { color: 'var(--ink-soft)', padding: '40px 0', gridColumn: '1 / -1' };

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

const cardEyebrow = {
  fontSize: 11,
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
};

const cardMeta = { fontSize: 12.5, color: 'var(--ink-soft)' };

const cardDesc = {
  fontSize: 13.5,
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
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: 12.5,
  color: 'var(--ink-soft)',
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

const ctaButtonRow = { display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' };

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

const ctaButtonSecondary = {
  display: 'inline-block',
  padding: '13px 28px',
  borderRadius: 9,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  color: 'var(--ink)',
  fontWeight: 700,
  fontSize: 14.5,
  textDecoration: 'none',
};
