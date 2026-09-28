// Previously missing entirely across all ~174 routes -- with no
// route-level loading UI anywhere, every navigation risked a blank
// white flash until a page's own component-level "Loading…" state
// (if it even had one) mounted. This root-level file covers every
// route that doesn't define its own more specific loading.jsx,
// giving at least a branded, non-blank transition everywhere. Kept
// intentionally minimal (no header/footer/data) since loading.jsx
// can't know yet which layout segment is loading underneath it.
export default function Loading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--paper)',
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--brand)',
          animation: 'ih-spin .8s linear infinite',
        }}
        role="status"
        aria-label="Loading"
      />

      <style>{`
        @keyframes ih-spin {
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          [role="status"] { animation-duration: 1.6s; }
        }
      `}</style>
    </div>
  );
}
