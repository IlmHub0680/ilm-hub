'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const SEVERITY_STYLE = {
  high: { background: 'var(--danger-tint, #fbe9e7)', color: 'var(--danger, #c0392b)', label: 'High', icon: '⛔' },
  medium: { background: 'var(--gold-tint, #fbf3df)', color: 'var(--gold-dark, #a3792f)', label: 'Medium', icon: '⚠️' },
  low: { background: 'var(--border)', color: 'var(--ink)', label: 'Low', icon: 'ℹ️' },
};

const SEVERITY_ORDER = ['high', 'medium', 'low'];

const TYPE_LABELS = {
  FINANCE_ISOLATION_VIOLATION: 'Finance Isolation Violation',
  ACADEMIC_UNRELATED_PERMISSION: 'Academic Position — Unrelated Permission',
  EXCESSIVE_PERMISSIONS: 'Excessive Permissions',
  UNUSED_ROLE: 'Unused Role',
  DUPLICATE_ROLE: 'Duplicate Roles',
  ORPHANED_USER: 'Orphaned User',
};

const statCardStyle = {
  padding: '18px 20px',
  borderRadius: 14,
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  boxShadow: '0 1px 3px rgba(0,0,0,.04)',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  minWidth: 140,
};

export default function AdminPermissionReviewPage() {
  const [findings, setFindings] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await fetch('/api/admin/permission-review', { credentials: 'include' });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to load permission review.');
      setFindings(result.data);
    } catch (err) {
      setError(err.message);
      setFindings([]);
    }
  }

  const counts = useMemo(() => {
    const base = { high: 0, medium: 0, low: 0 };
    (findings || []).forEach((f) => {
      base[f.severity] = (base[f.severity] || 0) + 1;
    });
    return base;
  }, [findings]);

  const grouped = useMemo(() => {
    const groups = { high: [], medium: [], low: [] };
    (findings || []).forEach((f) => {
      (groups[f.severity] || groups.low).push(f);
    });
    return groups;
  }, [findings]);

  return (
    <main style={{ padding: '40px 32px 80px', color: 'var(--ink)', maxWidth: 1040 }}>
      <Link href="/admin" style={{ display: 'inline-block', marginBottom: 16, color: 'var(--brand)', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>← Back to Admin Overview</Link>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Permission Review</h1>
        <p style={{ marginTop: 8, color: 'var(--ink-soft)', lineHeight: 1.6, maxWidth: 760 }}>
          A read-only scan of the real Position / Permission / Staff data for
          issues worth a human look — finance-isolation violations, unrelated
          permissions on academic positions, unused or duplicate roles, and
          accounts with a role but no functional access. Nothing here is
          changed or deleted automatically; every flag is for you to review
          and act on directly in Staff Management.
        </p>
      </div>

      {error && (
        <div className="ih-card" style={{ padding: '12px 16px', marginBottom: 16, color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      {findings === null && <div style={{ color: 'var(--ink-soft)' }}>Scanning…</div>}

      {findings && findings.length === 0 && (
        <div className="ih-card" style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>✅</div>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>No issues found</div>
          <div style={{ color: 'var(--ink-soft)', fontSize: 13.5 }}>
            Every position and permission looks consistent with the institution's least-privilege rules.
          </div>
        </div>
      )}

      {findings && findings.length > 0 && (
        <>
          <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
            {SEVERITY_ORDER.map((sev) => {
              const style = SEVERITY_STYLE[sev];
              return (
                <div key={sev} style={statCardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{style.icon}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                      {style.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 30, fontWeight: 800, color: style.color, lineHeight: 1 }}>
                    {counts[sev] || 0}
                  </div>
                </div>
              );
            })}
            <div style={{ ...statCardStyle, background: 'var(--brand-tint, #eef3fb)', borderColor: 'transparent' }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                Total Flags
              </div>
              <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--brand)', lineHeight: 1 }}>
                {findings.length}
              </div>
            </div>
          </div>

          {SEVERITY_ORDER.filter((sev) => grouped[sev].length > 0).map((sev) => {
            const style = SEVERITY_STYLE[sev];
            return (
              <section key={sev} style={{ marginBottom: 28 }}>
                <h2 style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.4,
                  color: style.color, margin: '0 0 14px',
                }}>
                  <span>{style.icon}</span>
                  {style.label} Priority
                  <span style={{ fontWeight: 500, color: 'var(--ink-soft)', textTransform: 'none', letterSpacing: 0 }}>
                    ({grouped[sev].length})
                  </span>
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
                  {grouped[sev].map((f, i) => (
                    <div
                      key={i}
                      className="ih-card"
                      style={{
                        padding: '18px 20px',
                        borderLeft: `4px solid ${style.color}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 800 }}>
                        {TYPE_LABELS[f.type] || f.type}
                      </div>
                      {f.positionName && (
                        <div style={{
                          display: 'inline-flex', alignSelf: 'flex-start',
                          fontSize: 11.5, fontWeight: 700, padding: '3px 10px',
                          borderRadius: 999, background: style.background, color: style.color,
                        }}>
                          {f.positionName}
                        </div>
                      )}
                      <div style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--ink-soft)' }}>
                        {f.detail}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </>
      )}
    </main>
  );
}
