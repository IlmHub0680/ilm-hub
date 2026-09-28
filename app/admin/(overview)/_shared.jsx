// Shared style tokens and constants for the admin dashboard's three
// section pages (overview / duties / delegated). Not a route — Next.js
// only treats files named page/layout/route as routes, so this can sit
// alongside them as a plain module.

import Link from 'next/link';

// Admin-overview welcome banner tokens -- copied from the student
// portal's welcome banner (app/login/page.jsx, `styles.welcomeBanner`
// and friends) so the admin overview page matches that established
// pattern. Scoped to this page (not DashboardShell) since the banner
// is page content, not shell chrome -- see the earlier top-profile
// additions to DashboardShell for the shell-level pattern instead.
export const bannerWrap = {
  marginBottom: '24px',
};

export const welcomeBanner = {
  position: 'relative',
  borderRadius: '16px',
  padding: '20px 26px',
  background: 'var(--gold-tint)',
  border: '1px solid color-mix(in srgb, var(--gold) 28%, transparent)',
  overflow: 'hidden',
};

// Matches the student portal banner's photo treatment exactly
// (app/login/page.jsx, styles.welcomeBanner's dashboardBannerUrl
// branch): the institute's own hero image (useSiteBranding()'s
// heroImageUrl) faded in from the right behind a warm gold/cream
// gradient on the left, where the text sits, instead of the flat
// solid gold-tint background alone. Callers spread this onto
// welcomeBanner *when heroImageUrl is set*; falls back to the plain
// gold-tint base (welcomeBanner alone) when there's no hero image
// configured yet, same as the student portal.
export function welcomeBannerPhotoStyle(heroImageUrl) {
  if (!heroImageUrl) return {};
  return {
    backgroundImage: `linear-gradient(90deg, var(--gold-tint) 0%, var(--gold-tint) 32%, rgba(246,239,225,.55) 55%, rgba(246,239,225,0) 78%), url(${heroImageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center right',
  };
}

export const welcomeBannerAccentLine = {
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  width: '4px',
  background: 'linear-gradient(180deg, var(--gold), var(--gold-dark))',
};

export const bannerTitle = {
  margin: 0,
  color: 'var(--brand-dark)',
  fontSize: '28px',
  fontWeight: 900,
};

export const bannerDescription = {
  margin: '7px 0 0',
  color: 'var(--ink-soft)',
  fontSize: '15px',
  maxWidth: '520px',
};

export const bannerPillRow = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
  marginTop: '16px',
};

export const bannerPill = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 14px',
  borderRadius: '999px',
  background: 'var(--surface)',
  color: 'var(--brand-dark)',
  fontSize: '12.5px',
  fontWeight: 700,
  whiteSpace: 'nowrap',
};

export const QUICK_LINK_TITLES = [
  'Homepage Management',
  'Bookstore',
  'Media',
  'My Library',
  'Staff Management',
  'Student Complaints & Enquiries',
];

export const sectionTitle = {
  color: 'var(--ink)',
  fontFamily: 'var(--font-display)',
  fontSize: '20px',
  margin: '0 0 4px',
};

export const cardGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
  gap: '16px',
};

export const sectionCard = {
  display: 'block',
  textDecoration: 'none',
  color: 'inherit',
};

export const cardIcon = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '36px',
  height: '36px',
  borderRadius: '9px',
  background: 'var(--brand-tint)',
  color: 'var(--brand-dark)',
  fontSize: '17px',
  marginBottom: '10px',
};

export const delegatedCard = {
  ...sectionCard,
  display: 'block',
  borderTop: '3px solid var(--gold)',
  position: 'relative',
};

export const cardIconGold = {
  ...cardIcon,
  background: 'var(--gold-tint)',
  color: 'var(--gold-dark)',
};

export const ownerTag = {
  display: 'inline-block',
  marginLeft: '10px',
  padding: '3px 9px',
  borderRadius: '999px',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  color: 'var(--ink-soft)',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '.01em',
  verticalAlign: 'middle',
};

export const cardTitle = { color: 'var(--ink)', fontFamily: 'var(--font-display)', fontSize: '16px', margin: '0 0 6px' };
export const cardDesc = { color: 'var(--ink-soft)', fontSize: '13px', margin: 0 };

export const inlineLink = {
  display: 'inline-block',
  marginTop: '10px',
  color: 'var(--brand)',
  fontWeight: 700,
  fontSize: '13px',
  textDecoration: 'none',
};

export const pendingNote = {
  marginTop: '10px',
  color: 'var(--warning)',
  fontSize: '12px',
  fontStyle: 'italic',
};

/* ---- Institute Management: Level 1 (category) vs Level 2 (module) cards ----
   Level 1 cards are primary navigation into one of the four institute
   categories. Previously these just reused .ih-card at oversized
   padding -- plain white, no different from an ordinary module card,
   which read as generic rather than a deliberate landing page. Now
   they pair a per-card accent (top border + gradient icon badge, the
   same idea as the existing .ih-stat-tile.accent top-border and the
   .ih-shell-brand-badge gradient badge in globals.css) with a subtle
   top-down tint that fades into the ordinary card surface, tighter
   proportions (smaller icon/padding/grid gap than before), and a
   clamped description so a long blurb can't inflate the card's height.
   Level 2 reuses the existing sectionCard/cardIcon/cardTitle/cardDesc
   tokens above for the per-module grids inside each category page. */

export const primaryCardGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
  gap: '18px',
};

const PRIMARY_CARD_ACCENTS = {
  brand: {
    tint: 'var(--brand-tint)',
    border: 'var(--brand)',
    iconBg: 'linear-gradient(135deg, var(--brand), var(--brand-light))',
    iconColor: 'var(--gold-tint)',
  },
  gold: {
    tint: 'var(--gold-tint)',
    border: 'var(--gold-dark)',
    iconBg: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
    iconColor: '#fff',
  },
};

function primaryCardAccent(accent) {
  return PRIMARY_CARD_ACCENTS[accent] || PRIMARY_CARD_ACCENTS.brand;
}

// `accent` is 'brand' | 'gold' -- the four Institute Management
// categories alternate between them so the grid has visual rhythm
// instead of four identical tiles, while staying inside the app's two
// approved accent colors (see the palette comment at the top of
// globals.css) rather than introducing new ones.
export function primaryCardStyle(accent) {
  const a = primaryCardAccent(accent);
  return {
    display: 'block',
    textDecoration: 'none',
    color: 'inherit',
    position: 'relative',
    overflow: 'hidden',
    padding: '22px 20px 20px',
    border: '1px solid var(--border)',
    borderTop: `3px solid ${a.border}`,
    background: `linear-gradient(180deg, ${a.tint} 0%, var(--surface) 42%)`,
  };
}

export function primaryCardIconStyle(accent) {
  const a = primaryCardAccent(accent);
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: a.iconBg,
    color: a.iconColor,
    fontSize: '20px',
    marginBottom: '14px',
    boxShadow: '0 3px 8px rgba(27,36,31,.18)',
  };
}

export const primaryCardTitle = {
  color: 'var(--ink)',
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: '16.5px',
  margin: '0 0 6px',
  paddingRight: '30px',
};

export const primaryCardDesc = {
  color: 'var(--ink-soft)',
  fontSize: '13px',
  lineHeight: 1.55,
  margin: 0,
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

export const primaryCardArrow = {
  position: 'absolute',
  top: '18px',
  right: '18px',
  width: '26px',
  height: '26px',
  borderRadius: '50%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  color: 'var(--gold-dark)',
  fontSize: '13px',
  fontWeight: 700,
  boxShadow: '0 2px 6px rgba(27,36,31,.10)',
};

// Elegant stat-tile treatment for the admin overview page specifically
// -- scoped here (new exports, own class names below) rather than
// touching the shared global .ih-stat-grid/.ih-stat-tile in
// globals.css, since those are reused verbatim across 20+ other
// dashboards (academic-records, dean, hod, qa, finance, ...) that
// were never asked to change. Same two approved accent colors
// (brand/gold) as primaryCardStyle above, alternated per tile so the
// row has rhythm instead of four identical plain-white boxes.
export const overviewStatGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '16px',
};

export function overviewStatTileStyle(accent) {
  const a = primaryCardAccent(accent);
  return {
    position: 'relative',
    overflow: 'hidden',
    padding: '18px 20px',
    borderRadius: '14px',
    border: '1px solid var(--border)',
    borderTop: `3px solid ${a.border}`,
    background: `linear-gradient(160deg, ${a.tint} 0%, var(--surface) 55%)`,
    boxShadow: 'var(--shadow-raised)',
    transition: 'box-shadow .15s ease, transform .15s ease',
  };
}

export const overviewStatValue = {
  fontFamily: 'var(--font-display)',
  fontSize: '30px',
  fontWeight: 700,
  color: 'var(--ink)',
  fontVariantNumeric: 'tabular-nums',
  lineHeight: 1.1,
};

export const overviewStatLabel = {
  marginTop: '4px',
  fontSize: '12.5px',
  fontWeight: 600,
  color: 'var(--ink-soft)',
};

export const backLink = {
  display: 'inline-block',
  marginBottom: '18px',
  color: 'var(--brand)',
  fontWeight: 600,
  fontSize: '13.5px',
  textDecoration: 'none',
};

export const oversightBadge = {
  display: 'inline-block',
  padding: '2px 9px',
  borderRadius: '999px',
  background: 'var(--border-soft)',
  color: 'var(--ink-soft)',
  fontSize: '10.5px',
  fontWeight: 700,
  letterSpacing: '.04em',
  textTransform: 'uppercase',
  marginLeft: '8px',
  verticalAlign: 'middle',
};

// Detects an oversight/read-only module from the existing section data
// itself (never a hand-maintained list) so it stays correct as that
// data changes: title containing "(Oversight)" or description starting
// with "Read-only".
export function isOversightSection(s) {
  return (
    (s.title && s.title.includes('(Oversight)')) ||
    (s.description && s.description.startsWith('Read-only'))
  );
}

/* ---- Cross-page admin search --------------------------------------
   The search box lives once in the shared shell chrome (DashboardShell,
   wired through AdminShell's AdminDataContext -- see searchQuery
   there) and is visible on all four sidebar pages: Overview, Personal
   Management, Institute Management, Delegated Operations. Previously
   only the Overview page used searchQuery, to filter its own
   Quick Links grid -- typing anything while on Personal/Institute/
   Delegated did nothing, since those pages never read searchQuery at
   all. buildSearchIndex + AdminSearchResults give every one of the
   four pages the same behavior: when there's a query, show one
   unified result list drawn from EVERY section across all three
   scopes (Personal, Institute's four sub-groups, and Delegated),
   not just the current page's own items -- so search works the same
   regardless of which tab you're on. This was reachable without a
   disproportionate rewrite because layout.jsx already computes all
   six section arrays and already threads them into AdminDataContext
   for the existing pages to consume; this just combines them. */

export function buildSearchIndex({
  personalManagementSections = [],
  instituteFrameworkSections = [],
  institutePublicWebsiteSections = [],
  instituteAdministrationSections = [],
  instituteConfigSections = [],
  delegatedDuties = [],
}) {
  // delegatedDuties has its own shape (owner/note, no `description`) --
  // reshape it to the common {href, icon, title, description} shape so
  // it can be searched and rendered alongside the rest.
  const delegatedAsSections = delegatedDuties.map((d) => ({
    href: d.href,
    icon: d.icon,
    title: d.title,
    description: `Owned by ${d.owner}.${d.note ? ` ${d.note}` : ''}`,
  }));

  return [
    ...personalManagementSections,
    ...instituteFrameworkSections,
    ...institutePublicWebsiteSections,
    ...instituteAdministrationSections,
    ...instituteConfigSections,
    ...delegatedAsSections,
  ];
}

// Some hrefs are deliberately shared between an Institute Configuration
// oversight entry and its matching Delegated Operations entry (e.g.
// '/admin/admissions' appears as both "Admissions (Oversight)" and
// "Admissions Processing") -- so results are keyed by href+title, not
// href alone.
export function AdminSearchResults({ query, index }) {
  const trimmedQuery = (query || '').trim().toLowerCase();
  const results = index.filter(
    (s) =>
      s.title.toLowerCase().includes(trimmedQuery) ||
      (s.description && s.description.toLowerCase().includes(trimmedQuery))
  );

  return (
    <section>
      <h2 style={sectionTitle}>Search Results</h2>
      <p className="sub" style={{ marginBottom: 16 }}>
        {results.length} section{results.length === 1 ? '' : 's'} matching
        &quot;{(query || '').trim()}&quot; across Overview, Personal
        Management, Institute Management and Delegated Operations.
      </p>
      <div style={cardGrid}>
        {results.map((s) => (
          <Link key={`${s.href}|${s.title}`} href={s.href} className="ih-card" style={sectionCard}>
            <span style={cardIcon} aria-hidden="true">{s.icon}</span>
            <h3 style={cardTitle}>{s.title}</h3>
            <p style={cardDesc}>{s.description}</p>
          </Link>
        ))}
        {results.length === 0 && <p className="sub">No sections match your search.</p>}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------
// Delegated Operations "oversight" pages (Research, QA, Faculties,
// Departments, Admissions, Academic Records, Examinations, Fees,
// Student Affairs, Advising, Library, ICT). These used to live
// outside this route group entirely, each rendering its own bare
// <main>/<div>/back-link scaffold with no sidebar, search, or shell
// of any kind -- now that they're real children of this layout
// (moved under app/admin/(overview)/<name>/page.jsx, same URLs as
// before), that scaffold is redundant and actively wrong: the shell
// already supplies padding, max-width and navigation, and its own
// back-link duplicated the sidebar's "Delegated Operations" /
// "Institute Management" entry one click away. These tokens replace
// each page's old local `page`/`container`/`backLink`/`heading`/
// `muted`/`sectionHeading` consts with one shared, elegant treatment
// consistent with the rest of the admin shell.
export const oversightHeader = {
  marginBottom: '22px',
};

export const oversightHeading = {
  margin: 0,
  color: 'var(--ink)',
  fontFamily: 'var(--font-display)',
  fontSize: '24px',
  fontWeight: 800,
};

export const oversightSubtitle = {
  margin: '6px 0 0',
  color: 'var(--ink-soft)',
  fontSize: '13.5px',
  maxWidth: '640px',
  lineHeight: 1.55,
};

// A small "read-only" pill next to the heading -- every one of these
// pages is oversight-only by design (the real write path lives at
// that role's own dashboard), so this makes that status visible at a
// glance instead of only readable in the subtitle paragraph text.
// (Named distinctly from the smaller `oversightBadge` above, which is
// the inline "(Oversight)" pill used on Institute Management card
// titles -- different size/purpose, so it keeps its existing name and
// existing call sites rather than being touched by this addition.)
export const oversightPageBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  padding: '4px 11px',
  borderRadius: '999px',
  background: 'var(--gold-tint)',
  border: '1px solid color-mix(in srgb, var(--gold) 32%, transparent)',
  color: 'var(--brand-dark)',
  fontSize: '11.5px',
  fontWeight: 700,
  letterSpacing: '.02em',
  textTransform: 'uppercase',
  marginTop: '10px',
};

// No top border here on purpose -- it's used directly under the page
// heading/badge for single-table pages and would read as a stray
// line right under the intro; multi-table pages (Research) add their
// own spacing between sections via marginBottom on each table card
// instead.
export const oversightSectionHeading = {
  fontSize: '15.5px',
  fontWeight: 700,
  color: 'var(--brand-dark)',
  margin: '0 0 12px',
};

// .ih-tbl-wrap (app/globals.css) already supplies the elevated-surface
// treatment (border/radius/background/shadow) and, importantly,
// overflow:auto so a wide table can scroll horizontally on narrow
// screens instead of breaking the page layout -- this only adds a
// touch of breathing room around the table, and deliberately does
// NOT redeclare overflow (an inline overflow:hidden here would
// silently break that horizontal scroll).
export const oversightTableCard = {
  padding: '2px',
};
