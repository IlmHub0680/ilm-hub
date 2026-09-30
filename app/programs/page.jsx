'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

const LEVEL_LABELS = {
  FOUNDATION: 'Foundation',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  CERTIFICATE: 'Certificate',
  DIPLOMA: 'Diploma',
  UNDERGRADUATE: "Bachelor's",
  POSTGRADUATE: 'Postgraduate',
  MASTERS: "Master's",
  DOCTORATE: 'Doctorate',
  SHORT_COURSE: 'Short Course',
};

function AcademicProgrammesPageInner() {
  const searchParams = useSearchParams();
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // A Set, not a single string -- the homepage's Foundation Programme
  // card links here with ?level=FOUNDATION,INTERMEDIATE,ADVANCED (its
  // three real pathway tiers together), while every other card and
  // the level dropdown below pass just one. Empty set = no level
  // filter applied (every level shown).
  const [levelFilters, setLevelFilters] = useState(new Set());
  const [facultyFilter, setFacultyFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [shareStatus, setShareStatus] = useState('idle');

  useEffect(() => {
    fetch('/api/academic/programs?type=programs')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProgrammes(data.data);
        } else {
          setError('Unable to load academic programmes right now.');
        }
      })
      .catch(() => setError('Unable to load academic programmes right now.'))
      .finally(() => setLoading(false));
  }, []);

  // Pre-applies the level filter(s) from the URL a card on the
  // homepage (or any other link) sends visitors here with -- e.g.
  // /programs?level=DIPLOMA or /programs?level=FOUNDATION,INTERMEDIATE,ADVANCED.
  // Only recognized ProgramLevel values are kept, so a stray or typo'd
  // query param is simply ignored rather than silently showing zero
  // results.
  useEffect(() => {
    const raw = searchParams.get('level');
    if (!raw) return;
    const requested = raw.split(',').map((v) => v.trim().toUpperCase()).filter(Boolean);
    const valid = requested.filter((lvl) => LEVEL_LABELS[lvl]);
    if (valid.length > 0) setLevelFilters(new Set(valid));
  }, [searchParams]);

  const faculties = useMemo(() => {
    const set = new Set(programmes.map((p) => p.faculty).filter(Boolean));
    return Array.from(set).sort();
  }, [programmes]);

  const levels = useMemo(() => {
    const set = new Set(programmes.map((p) => p.level));
    return Array.from(set);
  }, [programmes]);

  const visible = programmes.filter((p) => {
    if (levelFilters.size > 0 && !levelFilters.has(p.level)) return false;
    if (facultyFilter !== 'ALL' && p.faculty !== facultyFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const haystack = `${p.name} ${p.code} ${p.department || ''} ${p.faculty || ''}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  function removeLevelFilter(level) {
    setLevelFilters((prev) => {
      const next = new Set(prev);
      next.delete(level);
      return next;
    });
  }

  async function handleShare() {
    const shareData = {
      title: 'Academic Programmes | Ulul Azm Institute',
      text: 'Explore academic programmes at Ulul Azm Institute.',
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        /* the visitor closed the share sheet without picking anything --
           not an error worth surfacing */
      }
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard && shareData.url) {
      try {
        await navigator.clipboard.writeText(shareData.url);
        setShareStatus('copied');
        setTimeout(() => setShareStatus('idle'), 2500);
      } catch (err) {
        setShareStatus('unavailable');
        setTimeout(() => setShareStatus('idle'), 2500);
      }
    } else {
      setShareStatus('unavailable');
      setTimeout(() => setShareStatus('idle'), 2500);
    }
  }

  const hasActiveFilters = levelFilters.size > 0 || facultyFilter !== 'ALL';

  return (
    <>
      <SiteHeader />
      <main style={page}>
      <div style={topBar}>
        <nav aria-label="Breadcrumb" style={breadcrumb}>
          <Link href="/" style={breadcrumbLink}>Home</Link>
          <span style={breadcrumbSep}>›</span>
          <span style={breadcrumbCurrent}>Academic Programmes</span>
        </nav>

        <div style={{ position: 'relative' }}>
          <button type="button" onClick={handleShare} style={shareButton}>
            🔗 Share Page
          </button>
          {shareStatus === 'copied' && <span style={shareStatusText}>Link copied!</span>}
          {shareStatus === 'unavailable' && <span style={shareStatusText}>Couldn&apos;t copy the link.</span>}
        </div>
      </div>

      <section style={hero}>
        <div style={heroInner}>
          <div style={eyebrow}>Ulul Azm</div>
          <h1 style={heroTitle}>Academic Programmes</h1>
          <p style={heroSub}>
            Explore every active programme offered across our faculties and
            departments — certificate, diploma, undergraduate and postgraduate
            pathways alike.
          </p>
        </div>
      </section>

      <section style={toolbar}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search programmes, codes, departments…"
          style={searchInputStyle}
          aria-label="Search academic programmes"
        />

        <div style={filterRow}>
          <select
            value={levelFilters.size === 1 ? Array.from(levelFilters)[0] : 'ALL'}
            onChange={(e) => setLevelFilters(e.target.value === 'ALL' ? new Set() : new Set([e.target.value]))}
            style={selectStyle}
          >
            <option value="ALL">All Levels</option>
            {levels.map((lvl) => (
              <option key={lvl} value={lvl}>{LEVEL_LABELS[lvl] || lvl}</option>
            ))}
          </select>

          {faculties.length > 0 && (
            <select value={facultyFilter} onChange={(e) => setFacultyFilter(e.target.value)} style={selectStyle}>
              <option value="ALL">All Faculties</option>
              {faculties.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          )}
        </div>

        {hasActiveFilters && (
          <div style={appliedFiltersRow}>
            <span style={appliedFiltersLabel}>Applied Filters:</span>
            {Array.from(levelFilters).map((lvl) => (
              <button key={lvl} type="button" onClick={() => removeLevelFilter(lvl)} style={filterChip}>
                {LEVEL_LABELS[lvl] || lvl} <span aria-hidden="true">×</span>
              </button>
            ))}
            {facultyFilter !== 'ALL' && (
              <button type="button" onClick={() => setFacultyFilter('ALL')} style={filterChip}>
                {facultyFilter} <span aria-hidden="true">×</span>
              </button>
            )}
          </div>
        )}
      </section>

      <section style={grid}>
        {loading && <div style={emptyState}>Loading programmes…</div>}

        {error && <div style={{ ...emptyState, color: 'var(--danger)' }}>{error}</div>}

        {!loading && !error && visible.length === 0 && (
          <div style={emptyState}>
            {programmes.length === 0
              ? 'No academic programmes are published yet — please check back soon.'
              : 'No programmes match your search.'}
          </div>
        )}

        {visible.map((p) => (
          <Link key={p.id} href={`/programs/${p.id}`} style={card}>
            <div style={cardLevel}>{LEVEL_LABELS[p.level] || p.level}</div>
            <div style={cardTitle}>{p.name}</div>
            {(p.faculty || p.department) && (
              <div style={cardMeta}>
                {p.faculty}{p.faculty && p.department ? ' · ' : ''}{p.department}
              </div>
            )}
            {p.description && <p style={cardDesc}>{p.description}</p>}
            <div style={cardFooter}>
              <span>{p.duration}</span>
              <span style={cardCta}>View Programme →</span>
            </div>
          </Link>
        ))}
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

export default function AcademicProgrammesPage() {
  return (
    <Suspense fallback={null}>
      <AcademicProgrammesPageInner />
    </Suspense>
  );
}

const page = { minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--font-body)' };

const topBar = {
  maxWidth: 1180,
  margin: '0 auto',
  padding: '16px 24px 0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 10,
};

const breadcrumb = { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 };
const breadcrumbLink = { color: 'var(--brand)', textDecoration: 'none', fontWeight: 700 };
const breadcrumbSep = { color: 'var(--ink-soft)' };
const breadcrumbCurrent = { color: 'var(--ink-soft)' };

const shareButton = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 16px',
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--ink)',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
};

const shareStatusText = {
  position: 'absolute',
  top: '100%',
  right: 0,
  marginTop: 4,
  fontSize: 12,
  color: 'var(--brand)',
  whiteSpace: 'nowrap',
};

const appliedFiltersRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap',
};

const appliedFiltersLabel = { fontSize: 12.5, fontWeight: 700, color: 'var(--ink-soft)' };

const filterChip = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '5px 10px',
  borderRadius: 999,
  border: '1px solid var(--brand-tint, var(--border))',
  background: 'var(--brand-tint)',
  color: 'var(--brand)',
  fontSize: 12.5,
  fontWeight: 700,
  cursor: 'pointer',
};

const hero = {
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

const toolbar = {
  maxWidth: 1180,
  margin: '28px auto 0',
  padding: '0 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

const searchInputStyle = {
  width: '100%',
  maxWidth: 560,
  padding: '13px 20px',
  borderRadius: 999,
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--ink)',
  fontSize: 14.5,
  fontFamily: 'var(--font-body)',
  boxSizing: 'border-box',
};

const filterRow = { display: 'flex', gap: 10, flexWrap: 'wrap' };

const selectStyle = {
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--ink)',
  fontSize: 13.5,
};

const grid = {
  maxWidth: 1180,
  margin: '24px auto 0',
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

const cardLevel = {
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
