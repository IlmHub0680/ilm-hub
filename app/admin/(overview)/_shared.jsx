// Shared style tokens and constants for the admin dashboard's three
// section pages (overview / duties / delegated). Not a route — Next.js
// only treats files named page/layout/route as routes, so this can sit
// alongside them as a plain module.

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
   categories (bigger padding/icon/border than an ordinary module card).
   Level 2 reuses the existing sectionCard/cardIcon/cardTitle/cardDesc
   tokens above for the per-module grids inside each category page. */

export const primaryCardGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '22px',
};

export const primaryCard = {
  display: 'block',
  textDecoration: 'none',
  color: 'inherit',
  position: 'relative',
  padding: 'var(--sp-6)',
  border: '1.5px solid var(--border)',
};

export const primaryCardIcon = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '56px',
  height: '56px',
  borderRadius: '14px',
  background: 'var(--brand-tint)',
  color: 'var(--brand-dark)',
  fontSize: '26px',
  marginBottom: '16px',
};

export const primaryCardTitle = {
  color: 'var(--ink)',
  fontFamily: 'var(--font-display)',
  fontSize: '19px',
  margin: '0 0 10px',
};

export const primaryCardDesc = {
  color: 'var(--ink-soft)',
  fontSize: '13.5px',
  lineHeight: 1.6,
  margin: 0,
};

export const primaryCardArrow = {
  position: 'absolute',
  top: 'var(--sp-6)',
  right: 'var(--sp-6)',
  color: 'var(--gold-dark)',
  fontSize: '18px',
  fontWeight: 700,
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
