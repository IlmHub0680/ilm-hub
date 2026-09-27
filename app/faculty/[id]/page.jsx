'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function FacultyProfilePage() {
  const params = useParams();
  const id = params?.id;

  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/academic/faculty/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) throw new Error(data.error || 'Faculty profile not found.');
        setStaff(data.data);
      })
      .catch((err) => setError(err.message || 'Faculty profile not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <>
        <SiteHeader />
        <main style={page}><div style={{ padding: 60, textAlign: 'center', color: 'var(--ink-soft)' }}>Loading…</div></main>
        <SiteFooter />
      </>
    );
  }

  if (error || !staff) {
    return (
      <>
        <SiteHeader />
        <main style={page}>
          <div style={{ maxWidth: 640, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
            <p style={{ color: 'var(--danger)', marginBottom: 16 }}>{error || 'Faculty profile not found.'}</p>
            <Link href="/faculty" style={{ color: 'var(--brand)' }}>← Back to Faculty</Link>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main style={page}>
        <div style={container}>
          <Link href="/faculty" style={backLink}>← Back to Faculty</Link>

          <div style={headerCard}>
            <div style={avatar}>
              {staff.photoUrl ? (
                <img src={staff.photoUrl} alt={staff.name} style={avatarImg} />
              ) : (
                <span style={avatarInitial}>{(staff.name || '?').trim().charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <h1 style={title}>{staff.name}</h1>
              {staff.title && <div style={subtitle}>{staff.title}</div>}
              <div style={metaRow}>
                {staff.department?.name && <MetaChip label="Department" value={staff.department.name} />}
                {staff.faculty && <MetaChip label="Faculty" value={staff.faculty} />}
                {staff.yearsExperience != null && (
                  <MetaChip label="Experience" value={`${staff.yearsExperience} year${staff.yearsExperience === 1 ? '' : 's'}`} />
                )}
              </div>
            </div>
          </div>

          {staff.bio && (
            <section style={sectionBlock}>
              <h2 style={sectionTitle}>About</h2>
              <p style={bodyText}>{staff.bio}</p>
            </section>
          )}

          {staff.specialization && (
            <section style={sectionBlock}>
              <h2 style={sectionTitle}>Specialization</h2>
              <p style={bodyText}>{staff.specialization}</p>
            </section>
          )}

          {staff.languages?.length > 0 && (
            <section style={sectionBlock}>
              <h2 style={sectionTitle}>Languages</h2>
              <div style={chipRow}>
                {staff.languages.map((lang) => (
                  <span key={lang} style={chip}>{lang}</span>
                ))}
              </div>
            </section>
          )}

          <section style={sectionBlock}>
            <h2 style={sectionTitle}>Courses Taught</h2>
            {staff.coursesTaught.length === 0 ? (
              <p style={mutedText}>Not currently assigned to teach a published course.</p>
            ) : (
              <div style={courseGrid}>
                {staff.coursesTaught.map((c) => (
                  <Link key={c.id} href={c.programId ? `/programs/${c.programId}` : '/programs'} style={courseCard}>
                    <div style={courseCode}>{c.code}</div>
                    <div style={courseTitle}>{c.title}</div>
                    {c.programName && <div style={courseMeta}>{c.programName}</div>}
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section style={ctaSection}>
            <h2 style={ctaTitle}>Want to study with our faculty?</h2>
            <p style={ctaSub}>Browse the Academy's active programmes and start your application.</p>
            <Link href="/programs" style={ctaButton}>Browse Programmes →</Link>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function MetaChip({ label, value }) {
  return (
    <div style={metaChip}>
      <div style={metaChipLabel}>{label}</div>
      <div style={metaChipValue}>{value}</div>
    </div>
  );
}

const page = { minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--font-body)' };
const container = { maxWidth: 860, margin: '0 auto', padding: '32px 24px 60px' };
const backLink = { display: 'inline-block', marginBottom: 20, color: 'var(--brand)', fontSize: 13.5, textDecoration: 'none' };

const headerCard = {
  display: 'flex',
  gap: 22,
  alignItems: 'center',
  flexWrap: 'wrap',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  padding: 28,
  marginBottom: 24,
};

const avatar = {
  width: 84,
  height: 84,
  borderRadius: '50%',
  background: 'var(--brand-tint)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  overflow: 'hidden',
};

const avatarImg = { width: '100%', height: '100%', objectFit: 'cover' };
const avatarInitial = { fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, color: 'var(--brand)' };

const title = { fontFamily: 'var(--font-display)', fontSize: 26, margin: '0 0 4px', color: 'var(--ink)' };
const subtitle = { fontSize: 14.5, color: 'var(--gold-dark)', fontWeight: 600, marginBottom: 12 };

const metaRow = { display: 'flex', flexWrap: 'wrap', gap: 20 };
const metaChip = {};
const metaChipLabel = { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--ink-soft)', marginBottom: 2 };
const metaChipValue = { fontSize: 14, fontWeight: 600, color: 'var(--ink)' };

const sectionBlock = { marginBottom: 28 };
const sectionTitle = { fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--ink)', margin: '0 0 12px' };
const bodyText = { fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink)', marginBottom: 8 };
const mutedText = { fontSize: 13.5, color: 'var(--ink-soft)' };

const chipRow = { display: 'flex', flexWrap: 'wrap', gap: 8 };
const chip = {
  fontSize: 12.5,
  fontWeight: 600,
  padding: '5px 12px',
  borderRadius: 999,
  background: 'var(--brand-tint)',
  color: 'var(--brand-dark)',
};

const courseGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 };
const courseCard = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  textDecoration: 'none',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: '14px 16px',
};
const courseCode = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--gold-dark)' };
const courseTitle = { fontSize: 14.5, fontWeight: 700, color: 'var(--ink)' };
const courseMeta = { fontSize: 12.5, color: 'var(--ink-soft)' };

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
