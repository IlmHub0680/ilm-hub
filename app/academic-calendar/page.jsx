'use client';

import Link from 'next/link';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import AcademicCalendarView from '@/components/AcademicCalendarView';

export default function PublicAcademicCalendarPage() {
  return (
    <>
      <SiteHeader />
      <main style={page}>
        <section style={hero}>
          <div style={heroInner}>
            <div style={eyebrow}>Ulul Azm</div>
            <h1 style={heroTitle}>Academic Calendar</h1>
            <p style={heroSub}>
              The Academy's official, currently-published academic calendar —
              the same calendar every student, instructor and department
              reads from, with both Gregorian and Hijri dates.
            </p>
          </div>
        </section>

        <div style={container}>
          <AcademicCalendarView />

          <section style={ctaSection}>
            <h2 style={ctaTitle}>Have a question about a specific date?</h2>
            <p style={ctaSub}>
              For registration deadlines and programme-specific scheduling,
              see the relevant programme page or contact the Registrar.
            </p>
            <Link href="/programs" style={ctaButton}>Browse Programmes →</Link>
          </section>
        </div>
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

const container = { maxWidth: 900, margin: '32px auto 0', padding: '0 24px 60px', display: 'flex', flexDirection: 'column', gap: 28 };

const ctaSection = {
  background: 'var(--brand-tint)',
  borderRadius: 14,
  padding: '32px 24px',
  textAlign: 'center',
};

const ctaTitle = { fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ink)', margin: '0 0 8px' };
const ctaSub = { color: 'var(--ink-soft)', fontSize: 13.5, maxWidth: 480, margin: '0 auto 18px' };

const ctaButton = {
  display: 'inline-block',
  padding: '12px 24px',
  borderRadius: 9,
  background: 'var(--gold)',
  color: 'var(--on-accent)',
  fontWeight: 700,
  fontSize: 14,
  textDecoration: 'none',
};
