// Shared style tokens for the /academics/* student pages. Plain object
// literals (no 'use client' needed) so every page can import the same look.

export const pageHeading = {
  fontFamily: 'var(--font-display)',
  fontSize: 26,
  fontWeight: 700,
  color: 'var(--ink)',
  margin: '0 0 4px',
};

export const pageDescription = {
  color: 'var(--ink-soft)',
  fontSize: 14,
  lineHeight: 1.6,
  margin: '0 0 28px',
  maxWidth: 640,
};

export const card = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  padding: 22,
  marginBottom: 20,
};

export const cardTitle = {
  fontSize: 15.5,
  fontWeight: 700,
  color: 'var(--ink)',
  margin: '0 0 14px',
};

export const statGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: 14,
};

export const statCard = {
  background: 'var(--paper)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: '14px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

export const statLabel = {
  fontSize: 11.5,
  textTransform: 'uppercase',
  letterSpacing: 0.4,
  color: 'var(--ink-soft)',
  fontWeight: 700,
};

export const statValue = {
  fontSize: 18,
  fontWeight: 800,
  color: 'var(--ink)',
};

export const heroRow = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 20,
  alignItems: 'center',
  justifyContent: 'space-between',
  background: 'var(--brand-tint)',
  border: '1px solid var(--success-tint)',
  borderRadius: 14,
  padding: '20px 24px',
  marginBottom: 24,
};

export const heroMetric = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

export const heroLabel = {
  fontSize: 11.5,
  textTransform: 'uppercase',
  letterSpacing: 0.4,
  color: 'var(--ink-soft)',
  fontWeight: 700,
};

export const heroValue = {
  fontSize: 30,
  fontWeight: 800,
  color: 'var(--brand-dark)',
};

export const statusPill = {
  padding: '8px 16px',
  borderRadius: 999,
  background: 'var(--surface)',
  border: '1.5px solid var(--brand-light)',
  color: 'var(--brand-light)',
  fontWeight: 700,
  fontSize: 13,
  whiteSpace: 'nowrap',
};

export const emptyState = {
  textAlign: 'center',
  padding: '48px 20px',
  color: 'var(--ink-soft)',
  fontSize: 14,
};

export const loadingState = {
  padding: '48px 20px',
  color: 'var(--ink-soft)',
  fontSize: 14,
};

export const errorBanner = {
  padding: '14px 16px',
  borderRadius: 10,
  background: 'var(--danger-tint)',
  color: 'var(--danger)',
  fontSize: 13.5,
  marginBottom: 20,
};

export const table = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 13.5,
};

export const th = {
  textAlign: 'left',
  padding: '10px 12px',
  color: 'var(--ink-soft)',
  fontSize: 11.5,
  textTransform: 'uppercase',
  letterSpacing: 0.3,
  borderBottom: `1px solid var(--border)`,
};

export const td = {
  padding: '10px 12px',
  borderBottom: '1px solid var(--border)',
  color: 'var(--ink)',
};

export const badge = (color) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 10px',
  borderRadius: 999,
  fontSize: 11.5,
  fontWeight: 700,
  background: `color-mix(in srgb, ${color} 14%, transparent)`,
  color,
  border: `1px solid ${color}`,
});

// Link-card grid used by the Academic System hub (and other pages that
// need to surface a set of related sections/actions as cards).
export const navCardGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: 14,
};

export const navCard = {
  display: 'block',
  textDecoration: 'none',
  color: 'inherit',
  background: 'var(--paper)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: '16px 18px',
  transition: 'box-shadow .15s ease, transform .15s ease',
};

export const navCardIcon = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 34,
  height: 34,
  borderRadius: 9,
  background: 'var(--brand-tint)',
  color: 'var(--brand-dark)',
  fontSize: 16,
  marginBottom: 10,
};

export const navCardTitle = {
  fontSize: 14.5,
  fontWeight: 700,
  color: 'var(--ink)',
  margin: '0 0 4px',
};

export const navCardDesc = {
  fontSize: 12.5,
  color: 'var(--ink-soft)',
  lineHeight: 1.5,
  margin: 0,
};
