'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const CATEGORY_TABS = [
  { value: 'ALL', label: 'All' },
  { value: 'ADMISSION_DECISION', label: 'Admissions' },
  { value: 'GRADE_CORRECTION', label: 'Grade Corrections' },
  { value: 'ACADEMIC_RECORD_ADJUSTMENT', label: 'Academic Records' },
  { value: 'DOCUMENT_FINALIZATION', label: 'Document Finalizations' },
  { value: 'COMMUNITY_MODERATION', label: 'Community Moderation' },
];

const SOURCE_COLORS = {
  AuditLog: 'var(--brand)',
  AdmissionAuditLog: 'var(--info, #2f6fb0)',
  GradeCorrection: 'var(--gold-dark, #a3792f)',
};

export default function AdminAuditLogPage() {
  const [category, setCategory] = useState('ALL');
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    load(category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  async function load(forCategory) {
    setEntries(null);
    setError('');
    try {
      const res = await fetch(`/api/admin/audit-log?category=${forCategory}`, { credentials: 'include' });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to load audit log.');
      setEntries(result.data);
    } catch (err) {
      setError(err.message);
      setEntries([]);
    }
  }

  return (
    <main style={{ padding: '40px 32px 80px', color: 'var(--ink)', maxWidth: 960 }}>
      <Link href="/admin" style={{ display: 'inline-block', marginBottom: 16, color: 'var(--brand)', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>← Back to Admin Overview</Link>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Audit Log</h1>
        <p style={{ marginTop: 8, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
          Who did what, when, and to which record — across admission decisions,
          grade corrections, graduation clearance and document finalization, and
          Community moderation. Read-only: no action anywhere in the system can
          alter or erase an entry here.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setCategory(tab.value)}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: category === tab.value ? 'var(--brand)' : 'var(--surface)',
              color: category === tab.value ? 'var(--on-accent)' : 'var(--ink)',
              fontWeight: 700,
              fontSize: 12.5,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="ih-card" style={{ padding: '12px 16px', marginBottom: 16, color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      {entries === null && <div style={{ color: 'var(--ink-soft)' }}>Loading…</div>}
      {entries && entries.length === 0 && (
        <div className="ih-card" style={{ padding: 24, color: 'var(--ink-soft)' }}>
          No entries yet for this filter.
        </div>
      )}

      {entries && entries.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {entries.map((e) => (
            <div key={e.id} className="ih-card" style={{ padding: '14px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 999,
                      background: SOURCE_COLORS[e.source] || 'var(--border)',
                      color: 'var(--on-accent, #fff)',
                      letterSpacing: 0.3,
                    }}
                  >
                    {e.action}
                  </span>
                  <span style={{ fontSize: 12.5, fontWeight: 700 }}>{e.actorName}</span>
                  {e.department && <span style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>· {e.department}</span>}
                  {e.module && <span style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>· {e.module}</span>}
                </div>
                <span style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>
                  {new Date(e.createdAt).toLocaleString()}
                </span>
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.5 }}>{e.summary}</div>
              {e.targetType && (
                <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 4 }}>
                  {e.targetType}: {e.targetId}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
