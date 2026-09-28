'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

const DEFAULT_CONTENT = {
  heroEyebrow: 'OUR ALUMNI',
  heroTitle: 'Carrying the light of knowledge forward.',
  heroSubtitle:
    'Ulul Azm graduates go on to teach, lead, and serve their communities. This page celebrates their journey beyond these halls.',
  statsHeading: 'Our Graduates, By the Numbers',
  spotlightLabel: 'ALUMNI SPOTLIGHT',
  spotlightHeading: 'Where They Are Now',
  spotlightSubtitle: 'A few of the graduates who continue the mission of beneficial knowledge in their own way.',
  ctaHeading: 'Are you a Ulul Azm graduate?',
  ctaText: 'We would love to hear about your journey since graduation and stay connected with you.',
};

export default function AlumniPage() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [stats, setStats] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/alumni/content')
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setContent({ ...DEFAULT_CONTENT, ...result.data.content });
          setStats(result.data.stats || []);
          setProfiles(result.data.profiles || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoaded(true));
  }, []);

  return (
    <>
      <SiteHeader />
      <main style={page}>
        <section style={hero}>
          <div style={heroInner}>
            <div style={eyebrow}>{content.heroEyebrow}</div>
            <h1 style={heroTitle}>{content.heroTitle}</h1>
            <p style={heroSub}>{content.heroSubtitle}</p>
          </div>
        </section>

        <div style={container}>
          {stats.length > 0 && (
            <section>
              <h2 style={sectionHeading}>{content.statsHeading}</h2>
              <div style={statsGrid}>
                {stats.map((stat, i) => (
                  <div key={i} style={statCard}>
                    <div style={statValue}>{stat.value}</div>
                    <div style={statLabel}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <div style={{ ...eyebrow, color: 'var(--brand)', textAlign: 'center' }}>{content.spotlightLabel}</div>
            <h2 style={sectionHeading}>{content.spotlightHeading}</h2>
            <p style={sectionSub}>{content.spotlightSubtitle}</p>

            {profiles.length > 0 ? (
              <div style={profileGrid}>
                {profiles.map((profile) => (
                  <div key={profile.id} style={profileCard}>
                    {profile.photoUrl ? (
                      <img src={profile.photoUrl} alt={profile.name} style={profilePhoto} />
                    ) : (
                      <div style={profilePhotoFallback}>{profile.name.charAt(0)}</div>
                    )}
                    <div style={profileName}>{profile.name}</div>
                    <div style={profileMeta}>
                      {[profile.program, profile.graduationYear].filter(Boolean).join(' · ')}
                    </div>
                    {profile.currentRole && <div style={profileRole}>{profile.currentRole}</div>}
                    {profile.quote && <p style={profileQuote}>&ldquo;{profile.quote}&rdquo;</p>}
                  </div>
                ))}
              </div>
            ) : (
              loaded && (
                <div style={emptyState}>
                  Alumni stories are being gathered — check back soon, or reach out below if you&apos;re a
                  graduate who&apos;d like to be featured.
                </div>
              )
            )}
          </section>

          <section style={ctaSection}>
            <h2 style={ctaTitle}>{content.ctaHeading}</h2>
            <p style={ctaSub}>{content.ctaText}</p>
            <Link href="/contact" style={ctaButton}>Get in Touch →</Link>
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

const container = { maxWidth: 1040, margin: '0 auto', padding: '48px 24px 60px', display: 'flex', flexDirection: 'column', gap: 48 };

const sectionHeading = { fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--ink)', margin: '0 0 10px', textAlign: 'center' };
const sectionSub = { color: 'var(--ink-soft)', fontSize: 14.5, maxWidth: 560, margin: '0 auto 28px', textAlign: 'center' };

const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 18 };

const statCard = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: '24px 16px',
  textAlign: 'center',
};

const statValue = { fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: 'var(--brand)' };
const statLabel = { fontSize: 13, color: 'var(--ink-soft)', marginTop: 6 };

const profileGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 22 };

const profileCard = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  padding: 22,
  textAlign: 'center',
};

const profilePhoto = { width: 76, height: 76, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px' };

const profilePhotoFallback = {
  width: 76,
  height: 76,
  borderRadius: '50%',
  background: 'var(--brand-tint)',
  color: 'var(--brand)',
  fontSize: 26,
  fontWeight: 800,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 12px',
};

const profileName = { fontWeight: 800, fontSize: 15.5, color: 'var(--ink)' };
const profileMeta = { fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4 };
const profileRole = { fontSize: 13, color: 'var(--brand)', marginTop: 6, fontWeight: 600 };
const profileQuote = { fontSize: 13, color: 'var(--ink-soft)', fontStyle: 'italic', marginTop: 10, lineHeight: 1.5 };

const emptyState = {
  background: 'var(--brand-tint)',
  borderRadius: 12,
  padding: '28px 24px',
  textAlign: 'center',
  color: 'var(--ink-soft)',
  fontSize: 14,
  maxWidth: 560,
  margin: '0 auto',
};

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
