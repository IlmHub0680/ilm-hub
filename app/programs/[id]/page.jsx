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

// Real, already-published institutional policy, transcribed from Academy
// Pathways §2 and §7 (not invented per-programme copy) — one entry per
// pathway tier, including CERTIFICATE (Academy Pathways §7, approved
// 2026-09 as Specialized Certificate Programs' real initial course list).
const PATHWAY_INFO = {
  FOUNDATION: {
    purpose: "Establishes the basic Islamic knowledge, Qur'an reading ability, and study habits every later pathway assumes.",
    learnerProfile: 'Learners with little or no prior structured Islamic education, at any age from young learner to adult — the entry point for someone starting from zero.',
    entryRequirements: 'None beyond basic literacy and willingness to be placed by assessment — deliberately the pathway with no prerequisite.',
    placement: 'A short readiness assessment confirms Foundation is the right starting point rather than Intermediate.',
    assessment: 'Competence-based, not exam-heavy — demonstrated recitation ability, basic knowledge checks, and character/adab observed by instructors over the term.',
    progression: 'Completing Foundation is the normal route into Intermediate Islamic Studies.',
    award: 'A Certificate of Foundation Studies issued by the Academy — not a diploma-level credential.',
  },
  INTERMEDIATE: {
    purpose: 'Moves a learner from basic knowledge to systematic, connected understanding across the core disciplines.',
    learnerProfile: 'Learners who have completed Foundation Studies, or who test in with equivalent prior learning.',
    entryRequirements: 'Completed Foundation Studies, or a placement assessment demonstrating equivalent competence.',
    placement: 'Foundation completion is the default route in; direct entry by assessment is possible but controlled.',
    assessment: 'A mix of knowledge assessment and applied communication tasks.',
    progression: 'Completing Intermediate is the normal route into Advanced Islamic Studies.',
    award: 'A Certificate of Intermediate Islamic Studies issued by the Academy.',
  },
  ADVANCED: {
    purpose: 'Independent engagement with primary texts and a first taste of specialization, preparing a learner for the Diploma.',
    learnerProfile: 'Learners who have completed Intermediate Islamic Studies and are ready to work with less guidance.',
    entryRequirements: 'Completed Intermediate Islamic Studies, or a placement assessment demonstrating equivalent competence.',
    placement: 'Intermediate completion is the default route in; direct entry by assessment is possible but controlled.',
    assessment: 'Source-engagement and analytical tasks, not just recall.',
    progression: 'Completing Advanced is the normal route into the Diploma in Islamic Studies, or directly into a Specialized Certificate.',
    award: 'A Certificate of Advanced Islamic Studies issued by the Academy.',
  },
  DIPLOMA: {
    purpose: "The Academy's flagship structured qualification, integrating every contributing department's coursework into one credential.",
    learnerProfile: 'Learners who have completed Advanced Islamic Studies and are pursuing the Academy’s most complete credential.',
    entryRequirements: 'Completed Advanced Islamic Studies, or a placement assessment demonstrating equivalent competence across all prior tiers.',
    placement: 'Advanced completion is the default route in; direct entry by comprehensive assessment is possible but tightly controlled, given the weight of the credential.',
    assessment: 'Comprehensive, integrative assessment across all contributing departments, not department-by-department in isolation.',
    progression: 'Completing the Diploma is the normal route into a Specialized Certificate for a learner pursuing a teaching or research track.',
    award: "The Diploma in Islamic Studies, the Academy's principal credential — an Academy-issued credential, not an externally accredited one (see Recognition & Accreditation Readiness).",
  },
  CERTIFICATE: {
    purpose: 'Focused, single-area competence beyond the general pathway, for a learner who wants depth in one discipline rather than the full multi-year progression.',
    learnerProfile: 'Learners who have completed Advanced Islamic Studies or the Diploma in Islamic Studies and want to go deep in one specific area.',
    entryRequirements: 'Completed Advanced Islamic Studies or the Diploma in Islamic Studies, or a placement assessment demonstrating equivalent competence in the chosen area.',
    placement: 'Advanced or Diploma completion is the default route in; direct entry by assessment is possible but controlled.',
    assessment: 'Competence-based assessment specific to the chosen area (for example supervised recitation for Tajweed/Hifz, written and applied assessment for Fiqh/Hadith/Tafsir).',
    progression: 'A terminal award within its area — a learner may go on to hold more than one Specialized Certificate over time.',
    award: 'A named Specialized Certificate issued by the Academy, naming the specific competency completed rather than a general credential.',
  },
};

const APPROVAL_LABELS = {
  DRAFT: 'Not yet running',
  UNDER_REVIEW: 'Pending scholarly review',
  APPROVED: null, // the normal case — no badge needed
  RETURNED_FOR_REVISION: 'Under revision',
};

export default function ProgrammeDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [programme, setProgramme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/academic/programs/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) throw new Error(data.error || 'Programme not found.');
        setProgramme(data.data);
      })
      .catch((err) => setError(err.message || 'Programme not found.'))
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

  if (error || !programme) {
    return (
      <>
        <SiteHeader />
        <main style={page}>
          <div style={{ maxWidth: 640, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
            <p style={{ color: 'var(--danger)', marginBottom: 16 }}>{error || 'Programme not found.'}</p>
            <Link href="/programs" style={{ color: 'var(--brand)' }}>← Back to Academic Programmes</Link>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const info = PATHWAY_INFO[programme.level] || null;

  return (
    <>
      <SiteHeader />
      <main style={page}>
      <div style={container}>
        <Link href="/programs" style={backLink}>← Back to Academic Programmes</Link>

        <div style={headerCard}>
          <div style={levelBadge}>{LEVEL_LABELS[programme.level] || programme.level}</div>
          <h1 style={title}>{programme.name}</h1>
          <div style={titleAr} dir="rtl">{programme.nameAr}</div>

          <div style={metaRow}>
            {programme.faculty && <MetaChip label="Faculty" value={programme.faculty.name} />}
            {programme.department && <MetaChip label="Department" value={programme.department.name} />}
            <MetaChip label="Duration" value={programme.duration} />
            <MetaChip label="Total Credit Hours" value={String(programme.totalCreditHours || '—')} />
            {programme.coordinator && <MetaChip label="Coordinator" value={programme.coordinator} />}
          </div>
        </div>

        {programme.description && (
          <section style={sectionBlock}>
            <h2 style={sectionTitle}>Overview</h2>
            <p style={bodyText}>{programme.description}</p>
            {programme.descriptionAr && <p style={bodyTextAr} dir="rtl">{programme.descriptionAr}</p>}
          </section>
        )}

        {info && (
          <section style={sectionBlock}>
            <h2 style={sectionTitle}>Is This Programme Right For You?</h2>
            <div style={infoGrid}>
              <InfoBlock label="Purpose" text={info.purpose} />
              <InfoBlock label="Who It's For" text={info.learnerProfile} />
              <InfoBlock label="Entry Requirements" text={info.entryRequirements} />
              <InfoBlock label="Placement" text={info.placement} />
              <InfoBlock label="Delivery" text="Online, through the Academy's own instructor-led live classes and course portal. Whether any in-person component is ever required is a standing open decision (Academic Governance) — check with Admissions for the current arrangement." />
              <InfoBlock label="Assessment" text={info.assessment} />
              <InfoBlock label="Progression" text={info.progression} />
              <InfoBlock label="Award on Completion" text={info.award} />
            </div>
            <p style={{ ...mutedText, marginTop: 14 }}>
              Full policy detail: <Link href="/academy-pathways" style={inlineLink}>Academy Pathways &amp; Qualification Framework →</Link>
            </p>
          </section>
        )}

        <section style={sectionBlock}>
          <h2 style={sectionTitle}>Study Plan / Curriculum</h2>
          {programme.courses.length === 0 ? (
            <p style={mutedText}>Curriculum for this programme has not been published yet.</p>
          ) : (
            <div style={tableWrap}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Code</th>
                    <th style={th}>Course</th>
                    <th style={th}>Credit Hours</th>
                    <th style={th}>Prerequisites</th>
                    <th style={th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {programme.courses.map((c) => {
                    const badge = APPROVAL_LABELS[c.approvalStatus];
                    return (
                      <tr key={c.id}>
                        <td style={td}>{c.code}</td>
                        <td style={td}>{c.title}</td>
                        <td style={td}>{c.creditHours}</td>
                        <td style={td}>
                          {c.prerequisites.length === 0 ? '—' : c.prerequisites.map((p) => p.code).join(', ')}
                        </td>
                        <td style={td}>{badge ? <span style={statusBadge}>{badge}</span> : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <p style={{ ...mutedText, marginTop: 10 }}>
            "Pending scholarly review" and "Not yet running" reflect this programme's real approval status, not a display error — some courses in the Academy's catalogue are still awaiting Scholarly Review Committee sign-off before they can be taught.
          </p>
        </section>

        <section style={sectionBlock}>
          <h2 style={sectionTitle}>Faculty</h2>
          {programme.instructors.length === 0 ? (
            <p style={mutedText}>No instructor has been assigned to this programme's courses yet.</p>
          ) : (
            <div style={facultyGrid}>
              {programme.instructors.map((inst) => (
                <div key={inst.id} style={facultyCard}>
                  <div style={facultyName}>{inst.title ? `${inst.title} ` : ''}{inst.name}</div>
                  {inst.position && <div style={facultyMeta}>{inst.position}</div>}
                  {inst.specialization && <div style={facultyMeta}>{inst.specialization}</div>}
                  {inst.yearsExperience != null && (
                    <div style={facultyMeta}>{inst.yearsExperience} year{inst.yearsExperience === 1 ? '' : 's'} of experience</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={sectionBlock}>
          <h2 style={sectionTitle}>Support</h2>
          <p style={bodyText}>
            Every enrolled student is assigned an Academic Advisor for guidance through registration, course
            selection and progression, and can reach Student Affairs for non-academic support. Both are part of
            the Academy's standard student experience, not specific to this programme.
          </p>
        </section>

        <section style={sectionBlock}>
          <h2 style={sectionTitle}>Frequently Asked Questions</h2>
          <div style={faqList}>
            <FaqItem q="Is this programme accredited?" a="Not necessarily by an external body — see the Academy's Recognition & Accreditation Readiness framework. This is an Academy-issued credential unless and until an external accreditation strategy is resolved and stated otherwise." />
            <FaqItem q="Can I study online?" a="Yes — the Academy delivers this programme through its own instructor-led live classes and course portal." />
            <FaqItem q="What happens if I don't meet the entry requirements yet?" a="A placement assessment can demonstrate equivalent competence in place of the normal prerequisite — see Placement above." />
          </div>
        </section>

        <section style={ctaSection}>
          <h2 style={ctaTitle}>Interested in this programme?</h2>
          <p style={ctaSub}>
            Admission requirements are reviewed as part of your application to this
            programme — begin the process below.
          </p>
          <Link href={`/admission?program=${programme.id}`} style={ctaButton}>Start Your Application →</Link>
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

function InfoBlock({ label, text }) {
  return (
    <div style={infoBlock}>
      <div style={infoBlockLabel}>{label}</div>
      <p style={infoBlockText}>{text}</p>
    </div>
  );
}

function FaqItem({ q, a }) {
  return (
    <div style={faqItem}>
      <div style={faqQ}>{q}</div>
      <p style={faqA}>{a}</p>
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

const levelBadge = {
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
const bodyTextAr = { fontSize: 14.5, lineHeight: 1.9, color: 'var(--ink-soft)' };
const mutedText = { fontSize: 13.5, color: 'var(--ink-soft)' };
const inlineLink = { color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' };

const infoGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: 16,
};

const infoBlock = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' };
const infoBlockLabel = { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--gold-dark)', fontWeight: 700, marginBottom: 6 };
const infoBlockText = { fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink)', margin: 0 };

const tableWrap = { overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 10 };
const table = { width: '100%', borderCollapse: 'collapse', fontSize: 13.5 };
const th = { textAlign: 'left', padding: '10px 14px', background: 'var(--brand-tint)', color: 'var(--ink)', fontWeight: 700, borderBottom: '1px solid var(--border)' };
const td = { padding: '10px 14px', borderBottom: '1px solid var(--border)', color: 'var(--ink)' };

const statusBadge = {
  display: 'inline-block',
  fontSize: 11.5,
  fontWeight: 700,
  padding: '3px 8px',
  borderRadius: 999,
  background: 'var(--brand-tint)',
  color: 'var(--gold-dark)',
};

const facultyGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 };
const facultyCard = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' };
const facultyName = { fontSize: 14.5, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 };
const facultyMeta = { fontSize: 12.5, color: 'var(--ink-soft)' };

const faqList = { display: 'grid', gap: 14 };
const faqItem = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' };
const faqQ = { fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 };
const faqA = { fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink-soft)', margin: 0 };

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
