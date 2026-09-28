# -*- coding: utf-8 -*-
import io

def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d" % (label, c)
    return content.replace(old, new)

path = "app/page.jsx"
with io.open(path, "r", encoding="utf-8") as f:
    c = f.read()

# ---------------------------------------------------------------------
# 1. Insert the <AcademicProgramsSection /> render right after the
#    existing generic "ACADEMICS" (subject-area teaser) section, before
#    BOOKSTORE. Model 12 brief section 2 -- presents the Academy's five
#    real pathway tiers (Foundation/Intermediate/Advanced/Diploma/
#    Specialized Certificate) without overwhelming the homepage with
#    the full 42-course catalogue.
# ---------------------------------------------------------------------
c = r1(
    c,
    """      </section>

      {/* =====================================================
          BOOKSTORE
      ===================================================== */}""",
    """      </section>

      {/* =====================================================
          ACADEMIC PROGRAMS
          (Model 12 -- the Academy's five real pathway tiers; full
          detail lives on /academy-pathways and each programme's own
          page, not here)
      ===================================================== */}

      <AcademicProgramsSection />

      {/* =====================================================
          BOOKSTORE
      ===================================================== */}""",
    "insert AcademicProgramsSection render after ACADEMICS section",
)

# ---------------------------------------------------------------------
# 2. Component + data, inserted right after AnnouncementsStrip's
#    closing brace (same nested-component pattern already used in this
#    file for AnnouncementsStrip/FeatureCard/MiniFeature/etc).
# ---------------------------------------------------------------------
COMPONENT = '''
// Model 12 -- the Academy's five real pathway tiers (Academic Pathways
// & Qualification Framework, already approved). Content below is
// transcribed from that document's section 2 (and section 1 for the
// Specialized Certificate tier), not invented here. Foundation,
// Intermediate, Advanced and Diploma are real Program records
// (resolved to their live id via the same public programmes endpoint
// /programs uses); Specialized Certificate Programs is a real,
// approved *framework* but has no defined certificate yet -- so its
// card says so plainly and carries no "Apply" action, rather than
// linking to an application for something that does not exist.
const PATHWAY_TIERS = [
  {
    level: 'FOUNDATION',
    badge: 'Tier 1',
    name: 'Foundation Studies',
    purpose:
      "Establishes the basic Islamic knowledge, Qur'an reading ability, and study habits every later pathway assumes.",
    who: 'Learners with little or no prior structured Islamic education, at any age from young learner to adult.',
    studyAreas: [
      'Aqeedah & Fiqh essentials',
      "Qur'an reading & Tajweed foundations",
      'Arabic foundations',
      'Islamic character & adab',
      'Basic study skills',
    ],
    duration: "The Academy's shortest pathway -- a small number of academic terms.",
    delivery: "Online, through instructor-led live classes and the Academy's own course portal.",
    progression: 'The normal route into Intermediate Islamic Studies.',
    admission: 'No prior study required -- placement by a short readiness assessment.',
    hasProgram: true,
    canApply: true,
    note: null,
  },
  {
    level: 'INTERMEDIATE',
    badge: 'Tier 2',
    name: 'Intermediate Islamic Studies',
    purpose:
      'Moves a learner from basic knowledge to systematic, connected understanding across the core disciplines.',
    who: 'Learners who have completed Foundation Studies, or who test in with equivalent prior learning.',
    studyAreas: [
      'Systematic Aqeedah & Fiqh',
      'Seerah',
      "Applied Tajweed & Qur'an comprehension",
      'Arabic grammar',
      'Islamic history & civilization',
      'Communication & leadership',
    ],
    duration: 'Longer than Foundation, shorter than Advanced -- a multi-term sequence.',
    delivery: "Online, through instructor-led live classes and the Academy's own course portal.",
    progression: 'The normal route into Advanced Islamic Studies.',
    admission: 'Completed Foundation Studies, or a placement assessment demonstrating equivalent competence.',
    hasProgram: true,
    canApply: true,
    note: null,
  },
  {
    level: 'ADVANCED',
    badge: 'Tier 3',
    name: 'Advanced Islamic Studies',
    purpose:
      'Independent engagement with primary texts and a first taste of specialization, preparing a learner for the Diploma.',
    who: 'Learners who have completed Intermediate Islamic Studies and are ready to work with less guidance.',
    studyAreas: [
      'Independent Aqeedah reasoning',
      'Usul al-Fiqh & Hadith Sciences',
      'Tajweed mastery & introductory Tafsir',
      'Source-level Arabic',
      'Islamic thought & research preparation',
      'One specialization elective',
    ],
    duration: 'Comparable to or slightly longer than Intermediate.',
    delivery: "Online, through instructor-led live classes and the Academy's own course portal.",
    progression: 'The normal route into the Diploma -- or directly into a Specialized Certificate.',
    admission: 'Completed Intermediate Islamic Studies, or a placement assessment demonstrating equivalent competence.',
    hasProgram: true,
    canApply: true,
    note: null,
  },
  {
    level: 'DIPLOMA',
    badge: 'Tier 4',
    name: 'Diploma in Islamic Studies',
    purpose:
      "The Academy's flagship structured qualification, integrating all six departments into one assessed credential.",
    who: 'Learners who have completed Advanced Islamic Studies and are pursuing the Academy\\'s most complete credential.',
    studyAreas: [
      'Islamic Studies',
      "Qur'anic Studies",
      'Arabic Language',
      'Islamic Education & Tarbiyah',
      'Islamic Civilization & Society',
      'Research & Learning Skills',
    ],
    duration: "The Academy's longest structured pathway.",
    delivery: "Online, through instructor-led live classes and the Academy's own course portal.",
    progression: 'The normal route into a Specialized Certificate for a teaching or research track.',
    admission: 'Completed Advanced Islamic Studies, or a comprehensive placement assessment.',
    hasProgram: true,
    canApply: true,
    note: 'An Academy-issued credential -- not an externally accredited one.',
  },
  {
    level: 'SPECIALIZED',
    badge: 'Tier 5',
    name: 'Specialized Certificate Programs',
    purpose:
      'Focused, single-area competence beyond the general pathway, for a learner who wants depth in one discipline.',
    who: 'Learners who have completed Advanced Islamic Studies or the Diploma and want to go deep in one area.',
    studyAreas: ['One focused competency area, defined per certificate at approval'],
    duration: 'Shorter and more focused than the Diploma -- varies by certificate.',
    delivery: "Online, through instructor-led live classes and the Academy's own course portal.",
    progression: 'A terminal award within its area -- a learner may hold more than one certificate over time.',
    admission: "Completed Advanced or the Diploma, plus that certificate's own prerequisite, set when the certificate is approved.",
    hasProgram: false,
    canApply: false,
    note: 'A framework, not yet an open programme -- no Specialized Certificate has been approved with a defined course list yet.',
  },
];

function AcademicProgramsSection() {
  const [programIds, setProgramIds] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/academic/programs?type=programs')
      .then((res) => res.json())
      .then((result) => {
        if (cancelled) return;
        if (result && result.success && Array.isArray(result.data)) {
          const map = {};
          for (const p of result.data) {
            if (p.level) map[p.level] = p.id;
          }
          setProgramIds(map);
        }
      })
      .catch(() => {
        /* silently ignore -- cards fall back to the programmes list link */
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section style={sectionStyle}>
      <div style={headingContainer}>
        <span style={goldLabel}>ACADEMIC PROGRAMS</span>

        <h2 style={{ ...sectionTitle, whiteSpace: 'normal' }}>
          Five Pathways, One Progression
        </h2>

        <p style={sectionDescription}>
          Every learner enters at the pathway that matches their starting
          point and progresses in sequence -- from Foundation Studies
          through to the Diploma in Islamic Studies, with a Specialized
          Certificate reachable after Advanced or the Diploma. This is an
          overview of each tier; the full framework and course-by-course
          detail live on their own pages.
        </p>
      </div>

      <div style={pathwayGrid}>
        {PATHWAY_TIERS.map((tier) => (
          <PathwayCard key={tier.level} tier={tier} programId={programIds[tier.level]} loaded={loaded} />
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '34px' }}>
        <Link href="/academy-pathways" style={outlineButton}>
          Read the Full Academic Pathways Framework →
        </Link>
      </div>
    </section>
  );
}

function PathwayCard({ tier, programId, loaded }) {
  const detailsHref = tier.hasProgram
    ? loaded && programId
      ? `/programs/${programId}`
      : '/programs'
    : '/academy-pathways';

  return (
    <div style={pathwayCard}>
      <div style={pathwayCardHeader}>
        <span style={pathwayTierBadge}>{tier.badge}</span>
        <h3 style={pathwayCardTitle}>{tier.name}</h3>
      </div>

      <p style={pathwayPurpose}>{tier.purpose}</p>

      <dl style={pathwayMetaList}>
        <div style={pathwayMetaRow}>
          <dt style={pathwayMetaLabel}>Who it&apos;s for</dt>
          <dd style={pathwayMetaValue}>{tier.who}</dd>
        </div>
        <div style={pathwayMetaRow}>
          <dt style={pathwayMetaLabel}>Study areas</dt>
          <dd style={pathwayMetaValue}>{tier.studyAreas.join(' · ')}</dd>
        </div>
        <div style={pathwayMetaRow}>
          <dt style={pathwayMetaLabel}>Duration</dt>
          <dd style={pathwayMetaValue}>{tier.duration}</dd>
        </div>
        <div style={pathwayMetaRow}>
          <dt style={pathwayMetaLabel}>Delivery</dt>
          <dd style={pathwayMetaValue}>{tier.delivery}</dd>
        </div>
        <div style={pathwayMetaRow}>
          <dt style={pathwayMetaLabel}>Progression</dt>
          <dd style={pathwayMetaValue}>{tier.progression}</dd>
        </div>
        <div style={pathwayMetaRow}>
          <dt style={pathwayMetaLabel}>Admission</dt>
          <dd style={pathwayMetaValue}>{tier.admission}</dd>
        </div>
      </dl>

      {tier.note && <p style={pathwayNote}>{tier.note}</p>}

      <div style={pathwayCardFooter}>
        <Link href={detailsHref} style={pathwayLinkPrimary}>
          {tier.hasProgram ? 'Programme Details' : 'Learn About This Pathway'} →
        </Link>

        {tier.canApply && (
          <Link href="/admission" style={pathwayLinkSecondary}>
            Apply
          </Link>
        )}
      </div>
    </div>
  );
}
'''

c = r1(
    c,
    """function FeatureCard({ icon, title, text }) {""",
    COMPONENT.strip("\n") + "\n\nfunction FeatureCard({ icon, title, text }) {",
    "insert AcademicProgramsSection + PathwayCard + PATHWAY_TIERS before FeatureCard",
)

# ---------------------------------------------------------------------
# 3. Style constants, inserted after the existing outlineButton style
#    (keeps the new pathway-card styles grouped near the other
#    button/card styles already in this file).
# ---------------------------------------------------------------------
STYLES = '''
const pathwayGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
  gap: '20px',
  marginTop: '10px',
};

const pathwayCard = {
  display: 'flex',
  flexDirection: 'column',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '15px',
  padding: '26px',
  boxShadow: '0 10px 30px rgba(15,23,42,.05)',
  textAlign: 'left',
};

const pathwayCardHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '10px',
};

const pathwayTierBadge = {
  display: 'inline-block',
  padding: '4px 10px',
  borderRadius: '999px',
  background: 'var(--gold)',
  color: 'var(--brand-deepest)',
  fontWeight: '900',
  fontSize: '11px',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

const pathwayCardTitle = {
  fontFamily: 'var(--font-display)',
  color: 'var(--brand)',
  fontSize: '18px',
  margin: 0,
};

const pathwayPurpose = {
  color: 'var(--ink-soft)',
  lineHeight: 1.6,
  fontSize: '13.5px',
  margin: '0 0 16px',
};

const pathwayMetaList = {
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const pathwayMetaRow = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
};

const pathwayMetaLabel = {
  margin: 0,
  color: 'var(--gold-dark)',
  fontWeight: '800',
  fontSize: '10.5px',
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
};

const pathwayMetaValue = {
  margin: 0,
  color: 'var(--ink)',
  fontSize: '13px',
  lineHeight: 1.55,
};

const pathwayNote = {
  margin: '14px 0 0',
  padding: '10px 12px',
  borderRadius: '8px',
  background: 'var(--surface-2, rgba(15,23,42,.04))',
  color: 'var(--ink-soft)',
  fontSize: '12px',
  lineHeight: 1.5,
};

const pathwayCardFooter = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  marginTop: '18px',
  paddingTop: '16px',
  borderTop: '1px solid var(--border)',
};

const pathwayLinkPrimary = {
  color: 'var(--brand)',
  textDecoration: 'none',
  fontWeight: '800',
  fontSize: '13.5px',
};

const pathwayLinkSecondary = {
  display: 'inline-block',
  padding: '6px 14px',
  borderRadius: '7px',
  background: 'var(--brand)',
  color: 'var(--on-accent)',
  textDecoration: 'none',
  fontWeight: '800',
  fontSize: '13px',
};
'''

c = r1(
    c,
    """const outlineButton = {
  display: 'inline-block',
  padding: '12px 22px',
  background: 'var(--surface)',
  color: 'var(--brand)',
  textDecoration: 'none',
  border: '1px solid var(--brand)',
  borderRadius: '8px',
  fontWeight: '800',
};""",
    """const outlineButton = {
  display: 'inline-block',
  padding: '12px 22px',
  background: 'var(--surface)',
  color: 'var(--brand)',
  textDecoration: 'none',
  border: '1px solid var(--brand)',
  borderRadius: '8px',
  fontWeight: '800',
};
""" + STYLES.strip("\n"),
    "insert pathway card style constants after outlineButton",
)

with io.open(path, "w", encoding="utf-8") as f:
    f.write(c)
print("app/page.jsx: AcademicProgramsSection inserted (component + data + styles).")
