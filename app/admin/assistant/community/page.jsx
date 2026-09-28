'use client';

import { useEffect, useState } from 'react';

const STATUS_TABS = [
  { value: 'OPEN', label: 'Open' },
  { value: 'REVIEWED', label: 'Reviewed' },
  { value: 'DISMISSED', label: 'Dismissed' },
];

const REASON_LABELS = {
  SPAM: 'Spam',
  HARASSMENT: 'Harassment',
  INAPPROPRIATE_CONTENT: 'Inappropriate content',
  MISINFORMATION: 'Misinformation',
  OTHER: 'Other',
};

export default function AdminCommunityReportsPage() {
  const [status, setStatus] = useState('OPEN');
  const [reports, setReports] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    load(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function load(forStatus) {
    setReports(null);
    setError('');
    try {
      const res = await fetch(`/api/admin/community/reports?status=${forStatus}`, { credentials: 'include' });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to load reports.');
      setReports(result.data);
    } catch (err) {
      setError(err.message);
      setReports([]);
    }
  }

  async function resolve(id, resolveStatus, hideContent) {
    setActionId(id);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/community/reports/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: resolveStatus, hideContent }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to update report.');
      setReports((prev) => (prev || []).filter((r) => r.id !== id));
      setMessage(
        resolveStatus === 'DISMISSED'
          ? 'Report dismissed.'
          : hideContent
            ? 'Report marked reviewed and content hidden.'
            : 'Report marked reviewed.'
      );
    } catch (err) {
      setMessage(err.message);
    } finally {
      setActionId(null);
    }
  }

  return (
    <main style={{ padding: '40px 32px 80px', color: 'var(--ink)', maxWidth: 880 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Community Moderation</h1>
        <p style={{ marginTop: 8, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
          Reports submitted by Community members on a post or comment land here.
          Resolving a report as Reviewed can optionally hide the reported content
          in the same step — the same Hidden state moderators already toggle
          directly from the Community feed. Dismissing a report leaves the
          content untouched.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatus(tab.value)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: status === tab.value ? 'var(--brand)' : 'var(--surface)',
              color: status === tab.value ? 'var(--on-accent)' : 'var(--ink)',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
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
      {message && (
        <div className="ih-card" style={{ padding: '12px 16px', marginBottom: 16 }}>
          {message}
        </div>
      )}

      {reports === null && <div style={{ color: 'var(--ink-soft)' }}>Loading…</div>}
      {reports && reports.length === 0 && (
        <div className="ih-card" style={{ padding: 24, color: 'var(--ink-soft)' }}>
          No {status.toLowerCase()} reports.
        </div>
      )}

      {reports && reports.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {reports.map((r) => {
            const content = r.post || r.comment;
            const contentType = r.post ? 'Post' : 'Comment';
            return (
              <div key={r.id} className="ih-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: 13.5 }}>{contentType} reported</span>
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        padding: '3px 9px',
                        borderRadius: 999,
                        background: 'var(--danger-tint, #fbe9e7)',
                        color: 'var(--danger, #c0392b)',
                      }}
                    >
                      {REASON_LABELS[r.reason] || r.reason}
                    </span>
                    {content?.isHidden && (
                      <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: 'var(--border)', color: 'var(--ink)' }}>
                        Already Hidden
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                    {new Date(r.createdAt).toLocaleString()}
                  </span>
                </div>

                <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginBottom: 8 }}>
                  Reported by {r.reporterName}
                  {r.details ? ` — "${r.details}"` : ''}
                </div>

                {content ? (
                  <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
                    {r.post?.title && (
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{r.post.title}</div>
                    )}
                    <div style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{content.body}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 6 }}>— {content.authorName}</div>
                  </div>
                ) : (
                  <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', fontStyle: 'italic', marginBottom: 12 }}>
                    The reported content has since been deleted.
                  </div>
                )}

                {r.status === 'OPEN' && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      disabled={actionId === r.id}
                      onClick={() => resolve(r.id, 'REVIEWED', false)}
                      style={actionButtonStyle('var(--surface)', 'var(--ink)')}
                    >
                      Mark Reviewed
                    </button>
                    {content && !content.isHidden && (
                      <button
                        type="button"
                        disabled={actionId === r.id}
                        onClick={() => resolve(r.id, 'REVIEWED', true)}
                        style={actionButtonStyle('var(--danger, #c0392b)', 'var(--on-accent)')}
                      >
                        Hide Content &amp; Mark Reviewed
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={actionId === r.id}
                      onClick={() => resolve(r.id, 'DISMISSED', false)}
                      style={actionButtonStyle('var(--surface)', 'var(--ink-soft)')}
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {r.status !== 'OPEN' && (
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                    {r.status === 'DISMISSED' ? 'Dismissed' : 'Reviewed'}
                    {r.reviewedByName ? ` by ${r.reviewedByName}` : ''}
                    {r.reviewedAt ? ` on ${new Date(r.reviewedAt).toLocaleDateString()}` : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

function actionButtonStyle(bg, color) {
  return {
    padding: '9px 16px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: bg,
    color,
    fontSize: 12.5,
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };
}
