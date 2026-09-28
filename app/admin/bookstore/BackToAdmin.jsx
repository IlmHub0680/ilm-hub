'use client';

export default function BackToAdmin() {
  return (
    <a
      href="/admin/bookstore"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 16px",
        borderRadius: "10px",
        border: "1px solid var(--border)",
        background: 'var(--surface)',
        color: "var(--brand-deepest)",
        textDecoration: "none",
        fontSize: "14px",
        fontWeight: 700,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      ← Back to Bookstore Overview
    </a>
  );
}
