'use client';

import { useEffect, useState } from 'react';
import { getGraduationStatusMeta, getClearanceStatusMeta } from '@/lib/graduation';

const STATUS_BADGE = {
  NOT_STARTED: 'ih-b-neutral',
  ELIGIBLE: 'ih-b-info',
  APPLIED: 'ih-b-info',
  CLEARANCE_IN_PROGRESS: 'ih-b-warning',
  CLEARED: 'ih-b-warning',
  APPROVED: 'ih-b-success',
  REJECTED: 'ih-b-danger',
  COMPLETED: 'ih-b-neutral',
};

export default function AdminGraduationPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  function loadApplications() {
    setLoading(true);
    fetch('/api/admin/graduation', { credentials: 'include', cache: 'no-store' })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to load graduation applications.');
        setApplications(result.data || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadApplications();
  }, []);

  return (
    <main style={page}>
      <div style={container}>
        <a href="/admin" style={backLink}>
          ← Back to Admin Overview
        </a>

        <h1 style={heading}>Graduation Clearance</h1>
        <p style={muted}>
          Every student's graduation application, its per-office clearance checklist, and the
          final approval decision — all in one place.
        </p>
        <p style={muted}>
          Read-only. Library, Finance, Academic Administration, and Student Affairs each clear
          their own checklist item at their own dashboard, and the Registrar approves, rejects,
          or completes an application at the Academic Records dashboard.
        </p>

        {loading && <div className="ih-card">Loading graduation applications…</div>}

        {error && (
          <div
            className="ih-card"
            style={{
              background: 'var(--danger-tint)',
              color: 'var(--danger)',
              border: '1px solid var(--danger)',
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && applications.length === 0 && (
          <div className="ih-card" style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>
            No graduation applications have been submitted yet.
          </div>
        )}

        {!loading && applications.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {applications.map((app) => {
              const expanded = expandedId === app.id;
              const statusMeta = getGraduationStatusMeta(app.status);

              return (
                <div key={app.id} className="ih-card">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: 8,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>
                        {app.student.user.name}{' '}
                        <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}>
                          ({app.student.studentNo})
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                        {app.program?.nameEn || 'No programme on file'}
                        {app.appliedAt ? ` · applied ${new Date(app.appliedAt).toLocaleDateString()}` : ''}
                      </div>
                    </div>

                    <span className={`ih-badge ${STATUS_BADGE[app.status] || 'ih-b-neutral'}`}>
                      {statusMeta.label}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : app.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--brand)',
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: '8px 0 0',
                    }}
                  >
                    {expanded ? 'Hide details ▲' : 'View clearance checklist ▼'}
                  </button>

                  {expanded && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                        {app.clearances.map((clearance) => {
                          const cMeta = getClearanceStatusMeta(clearance.status);

                          return (
                            <div
                              key={clearance.id}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: 10,
                                flexWrap: 'wrap',
                                padding: '10px 12px',
                                borderRadius: 8,
                                border: '1px solid var(--border)',
                              }}
                            >
                              <div>
                                <strong style={{ fontSize: 13.5 }}>{clearance.unit.nameEn}</strong>
                                {clearance.clearedByStaff && (
                                  <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>
                                    by {clearance.clearedByStaff.user.name}
                                  </div>
                                )}
                                {clearance.note && (
                                  <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>
                                    {clearance.note}
                                  </div>
                                )}
                              </div>

                              <span className={`ih-badge ${cMeta.tone === 'good' ? 'ih-b-success' : cMeta.tone === 'danger' ? 'ih-b-danger' : 'ih-b-neutral'}`}>
                                {cMeta.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {app.decisionNote && (app.status === 'APPROVED' || app.status === 'REJECTED') && (
                        <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                          <strong>Decision note:</strong> {app.decisionNote}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

const page = {
  minHeight: '100vh',
  background: 'var(--paper)',
  padding: '40px 20px',
  fontFamily: 'var(--font-body)',
  color: 'var(--ink)',
};

const container = {
  maxWidth: '1100px',
  margin: '0 auto',
};

const backLink = {
  color: 'var(--brand)',
  textDecoration: 'none',
  fontWeight: 700,
  fontSize: '14px',
};

const heading = {
  color: 'var(--ink)',
  fontFamily: 'var(--font-display)',
  fontSize: '28px',
  margin: '20px 0 6px',
};

const muted = {
  color: 'var(--ink-soft)',
  fontSize: '14px',
  marginBottom: '10px',
};
