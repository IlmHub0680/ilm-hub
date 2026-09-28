'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

const LEVEL_LABELS = {
  CERTIFICATE: 'Certificate',
  DIPLOMA: 'Diploma',
  UNDERGRADUATE: "Bachelor's",
  POSTGRADUATE: 'Postgraduate',
  MASTERS: "Master's",
  DOCTORATE: 'Doctorate',
  SHORT_COURSE: 'Short Course',
  FOUNDATION: 'Foundation',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

export default function DepartmentDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/academic/departments/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) throw new Error(data.error || 'Department not found.');
        setDepartment(data.data);
      })
      .catch((err) => setError(err.message || 'Department not found.'))
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

  if (error || !department) {
    return (
      <>
        <SiteHeader />
        <main style={page}>
          <div style={{ maxWidth: 640, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
            <p style={{ color: 'var(--danger)', marginBottom: 16 }}>{error || 'Department not found.'}</p>
            <Link href="/departments" style={{ color: 'var(--brand)' }}>← Back to Academic Departments</Link>
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
          <Link href="/departments" style={backLink}>← Back to Academic Departments</Link>

          <div style={headerCard}>
            {department.faculty && <div style={eyebrowBadge}>{department.faculty.name}</div>}
            <h1 style={title}>{department.name}</h1>
            {department.nameAr && <div style={titleAr} dir="rtl">{department.nameAr}</div>}

            <div style={metaRow}>
              {department.code && <MetaChip label="Code" value={department.code} />}
              {department.head && <MetaChip label="Department Head" value={department.headTitle ? `${department.headTitle} ${department.head}` : department.head} />}
              <MetaChip label="Programmes" value={String(department.programs.length)} />
            </div>
          </div>

          {department.description && (
            <section style={sectionBlock}>
              <h2 style={sectionTitle}>Overview</h2>
              <p style={bodyText}>{department.description}</p>
            </section>
          )}

          <section style={sectionBlock}>
            <h2 style={sectionTitle}>Programmes Offered</h2>
            {department.programs.length === 0 ? (
              <p style={mutedText}>This department does not have an active, approved programme published yet.</p>
            ) : (
              <div style={programGrid}>
                {department.programs.map((p) => (
                  <Link key={p.id} href={`/programs/${p.id}`} style={programCard}>
                    <div style={programLevel}>{LEVEL_LABELS[p.level] || p.level}</div>
                    <div style={programTitle}>{p.name}</div>
                    <div style={programMeta}>{p.code} · {p.duration}</div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section style={ctaSection}>
            <h2 style={ctaTitle}>Interested in studying here?</h2>
            <p style={ctaSub}>
              Explore this department's programmes above, or start your
              application directly.
            </p>
            <Link href="/admission" style={ctaButton}>Start Your Application →</Link>
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
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  padding: 28,
  marginBottom: 24,
};

const eyebrowBadge = {
  display: 'inline-block',
  fontSize: 11.5,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: 0.4,
  color: 'var(--gold-dark)',
  marginBottom: 8,
};

const title = { fontFamily: 'var(--font-display)', fontSize: 28, margin: '0 0 4px', color: 'var(--ink)' };
const titleAr = { fontFamily: 'var(--font-arabic-display)', fontSize: 20, color: 'var(--ink-soft)', marginBottom: 16 };

const metaRow = { display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 10 };
const metaChip = {};
const metaChipLabel = { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--ink-soft)', marginBottom: 2 };
const metaChipValue = { fontSize: 14, fontWeight: 600, color: 'var(--ink)' };

const sectionBlock = { marginBottom: 28 };
const sectionTitle = { fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--ink)', margin: '0 0 12px' };
const bodyText = { fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink)', marginBottom: 8 };
const mutedText = { fontSize: 13.5, color: 'var(--ink-soft)' };

const programGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 };
const programCard = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  textDecoration: 'none',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: '14px 16px',
};
const programLevel = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--gold-dark)' };
const programTitle = { fontSize: 14.5, fontWeight: 700, color: 'var(--ink)' };
const programMeta = { fontSize: 12.5, color: 'var(--ink-soft)' };

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
