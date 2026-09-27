'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function FacultyDirectoryPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/academic/faculty')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStaff(data.data);
        } else {
          setError('Unable to load the faculty directory right now.');
        }
      })
      .catch(() => setError('Unable to load the faculty directory right now.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SiteHeader />
      <main style={page}>
        <section style={hero}>
          <div style={heroInner}>
            <div style={eyebrow}>Ulul Azm</div>
            <h1 style={heroTitle}>Faculty</h1>
            <p style={heroSub}>
              The real teaching staff of the Academy, by department — each
              profile links to the actual courses they are currently
              assigned to teach.
            </p>
          </div>
        </section>

        <section style={grid}>
          {loading && <div style={emptyState}>Loading faculty…</div>}

          {error && <div style={{ ...emptyState, color: 'var(--danger)' }}>{error}</div>}

          {!loading && !error && staff.length === 0 && (
            <div style={emptyState}>No faculty profiles are published yet — please check back soon.</div>
          )}

          {staff.map((s) => (
            <Link key={s.id} href={`/faculty/${s.id}`} style={card}>
              <div style={avatar}>
                {s.photoUrl ? (
                  <img src={s.photoUrl} alt={s.name} style={avatarImg} />
                ) : (
                  <span style={avatarInitial}>{(s.name || '?').trim().charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div style={cardBody}>
                <div style={cardTitle}>{s.name}</div>
                {s.title && <div style={cardMeta}>{s.title}</div>}
                {(s.department || s.faculty) && (
                  <div style={cardMetaSoft}>{s.department || s.faculty}</div>
                )}
                {s.specialization && <p style={cardDesc}>{s.specialization}</p>}
              </div>
            </Link>
          ))}
        </section>

        <section style={ctaSection}>
          <h2 style={ctaTitle}>Want to learn from them?</h2>
          <p style={ctaSub}>Browse the programmes and courses our faculty teach.</p>
          <Link href="/programs" style={ctaButton}>Browse Programmes →</Link>
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
  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
  gap: 22,
};

const emptyState = { color: 'var(--ink-soft)', padding: '40px 0', gridColumn: '1 / -1' };

const card = {
  display: 'flex',
  gap: 14,
  textDecoration: 'none',
  color: 'inherit',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  padding: 20,
  boxShadow: '0 1px 3px rgba(0,0,0,.06)',
};

const avatar = {
  width: 56,
  height: 56,
  borderRadius: '50%',
  background: 'var(--brand-tint)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  overflow: 'hidden',
};

const avatarImg = { width: '100%', height: '100%', objectFit: 'cover' };
const avatarInitial = { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--brand)' };

const cardBody = { display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 };

const cardTitle = {
  fontFamily: 'var(--font-display)',
  fontSize: 16.5,
  fontWeight: 600,
  color: 'var(--ink)',
  lineHeight: 1.3,
};

const cardMeta = { fontSize: 12.5, color: 'var(--gold-dark)', fontWeight: 600 };
const cardMetaSoft = { fontSize: 12, color: 'var(--ink-soft)' };

const cardDesc = {
  fontSize: 12.5,
  lineHeight: 1.5,
  color: 'var(--ink-soft)',
  margin: '4px 0 0',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

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
