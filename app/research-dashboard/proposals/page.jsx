'use client';
import { useState, useEffect } from 'react';
import { useResearch } from '../context';

const STATUS_BADGE = {
    SUBMITTED: 'ih-b-info',
    UNDER_REVIEW: 'ih-b-warning',
    REVISION_REQUESTED: 'ih-b-warning',
    APPROVED: 'ih-b-success',
    REJECTED: 'ih-b-danger',
    WITHDRAWN: 'ih-b-neutral',
};

const fieldStyle = { border: '1px solid var(--border)', borderRadius: 6, padding: '9px 11px', fontSize: 13.5, background: 'var(--surface)', color: 'var(--ink)', width: '100%' };

export default function ResearchProposalsPage() {
    const { proposals, loadingProposals, proposalsError, refetchProposals, refetchOverview, refetchProjects, staffOptions, data } = useResearch();
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [draft, setDraft] = useState({ title: '', summary: '', areaId: '' });
    const [expandedId, setExpandedId] = useState(null);
    const [detail, setDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [reviewerId, setReviewerId] = useState('');
    const [decisionNote, setDecisionNote] = useState('');
    const [busy, setBusy] = useState(false);

    const loadDetail = async (id) => {
        setLoadingDetail(true);
        try {
            const res = await fetch(`/api/research/proposals/${id}`, { credentials: 'include' });
            const result = await res.json();
            if (res.ok && result.success) setDetail(result.data);
        } finally {
            setLoadingDetail(false);
        }
    };

    useEffect(() => {
        if (expandedId) loadDetail(expandedId);
        else setDetail(null);
    }, [expandedId]);

    const handleSubmit = async () => {
        if (!draft.title.trim() || !draft.summary.trim()) {
            setMessage('A title and summary are required.');
            return;
        }
        setSubmitting(true);
        setMessage('');
        try {
            const res = await fetch('/api/research/proposals', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: draft.title, summary: draft.summary, areaId: draft.areaId || undefined }),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                setMessage('Proposal submitted.');
                setDraft({ title: '', summary: '', areaId: '' });
                refetchProposals();
                refetchOverview();
            } else {
                setMessage(result.error || 'Failed to submit proposal.');
            }
        } catch {
            setMessage('An error occurred.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAssignReviewer = async (id) => {
        if (!reviewerId) {
            setMessage('Select a reviewer.');
            return;
        }
        setBusy(true);
        try {
            const res = await fetch(`/api/research/proposals/${id}/reviews`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewerId }),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                setReviewerId('');
                loadDetail(id);
                refetchProposals();
            } else {
                setMessage(result.error || 'Failed to assign reviewer.');
            }
        } finally {
            setBusy(false);
        }
    };

    const handleDecision = async (id, action) => {
        if (action === 'REQUEST_REVISION' && !decisionNote.trim()) {
            setMessage('A revision note is required.');
            return;
        }
        setBusy(true);
        try {
            const res = await fetch(`/api/research/proposals/${id}/decision`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, note: decisionNote || undefined }),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                setMessage(`Proposal ${action.toLowerCase().replace(/_/g, ' ')}.`);
                setDecisionNote('');
                loadDetail(id);
                refetchProposals();
                refetchOverview();
                refetchProjects();
            } else {
                setMessage(result.error || 'Failed to record decision.');
            }
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            {message && (
                <div className="ih-card" style={{ background: 'var(--success-tint)', color: 'var(--success)', padding: '10px 14px', marginBottom: 20 }}>
                    {message}
                </div>
            )}

            <div className="ih-card" style={{ maxWidth: 480, marginBottom: 20 }}>
                <h3 style={{ margin: '0 0 4px', fontSize: 17 }}>Submit a Proposal</h3>
                <p style={{ color: 'var(--ink-soft)', marginTop: 0, marginBottom: 16, fontSize: 13 }}>
                    Submission starts the proposal workflow: reviewer assignment, review, revision requests, and a final decision.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input style={fieldStyle} type="text" placeholder="Proposal title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                    <textarea style={{ ...fieldStyle, minHeight: 80 }} placeholder="Summary" value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} />
                    <select style={fieldStyle} value={draft.areaId} onChange={(e) => setDraft({ ...draft, areaId: e.target.value })}>
                        <option value="">No research area</option>
                        {(data?.areas || []).map((a) => <option key={a.id} value={a.id}>{a.nameEn}</option>)}
                    </select>
                    <button onClick={handleSubmit} disabled={submitting} className="ih-btn ih-btn-primary">
                        {submitting ? 'Submitting...' : 'Submit Proposal'}
                    </button>
                </div>
            </div>

            <div className="ih-card">
                <h3 style={{ margin: '0 0 16px', fontSize: 17 }}>Proposals</h3>
                {loadingProposals && <p>Loading...</p>}
                {proposalsError && <p style={{ color: 'var(--danger)' }}>{proposalsError}</p>}
                {!loadingProposals && proposals.length === 0 && <p style={{ color: 'var(--ink-soft)' }}>No proposals submitted yet.</p>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {proposals.map((p) => (
                        <div key={p.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>{p.title}</div>
                                    <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                                        Submitted by {p.submittedByName}{p.areaName ? ` · ${p.areaName}` : ''} · {new Date(p.submittedAt).toLocaleDateString()}
                                        {p.projectId ? ' · became a project' : ''}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <span className={`ih-badge ${STATUS_BADGE[p.status] || 'ih-b-neutral'}`}>{p.status.replace(/_/g, ' ')}</span>
                                    <button className="ih-btn ih-btn-secondary" style={{ fontSize: 12.5, padding: '5px 10px' }} onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>
                                        {expandedId === p.id ? 'Hide' : 'Review'}
                                    </button>
                                </div>
                            </div>

                            {expandedId === p.id && (
                                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                                    {loadingDetail && <p>Loading detail...</p>}
                                    {!loadingDetail && detail && (
                                        <>
                                            <p style={{ fontSize: 13.5 }}>{detail.summary}</p>

                                            <h4 style={{ margin: '12px 0 6px', fontSize: 14 }}>Reviewers</h4>
                                            {detail.reviews.length === 0 && <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No reviewer assigned yet.</p>}
                                            {detail.reviews.map((r) => (
                                                <div key={r.id} style={{ fontSize: 13, marginBottom: 6 }}>
                                                    <strong>{r.reviewerName}</strong> -- {r.decision.replace(/_/g, ' ')}
                                                    {r.comments ? `: ${r.comments}` : ''}
                                                </div>
                                            ))}
                                            {['SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUESTED'].includes(p.status) && (
                                                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                                                    <select style={{ ...fieldStyle, fontSize: 12.5 }} value={reviewerId} onChange={(e) => setReviewerId(e.target.value)}>
                                                        <option value="">Assign reviewer...</option>
                                                        {staffOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                    </select>
                                                    <button className="ih-btn ih-btn-secondary" style={{ fontSize: 12.5 }} disabled={busy} onClick={() => handleAssignReviewer(p.id)}>Assign</button>
                                                </div>
                                            )}

                                            <h4 style={{ margin: '16px 0 6px', fontSize: 14 }}>Decision History</h4>
                                            {detail.decisions.map((d) => (
                                                <div key={d.id} style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginBottom: 4 }}>
                                                    {new Date(d.createdAt).toLocaleString()} -- {d.type.replace(/_/g, ' ')} ({d.actorName}){d.note ? `: ${d.note}` : ''}
                                                </div>
                                            ))}

                                            {['SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUESTED'].includes(p.status) && (
                                                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                                                    <textarea style={{ ...fieldStyle, minHeight: 50, fontSize: 12.5 }} placeholder="Decision note (required for revision requests)" value={decisionNote} onChange={(e) => setDecisionNote(e.target.value)} />
                                                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                                                        <button className="ih-btn ih-btn-primary" style={{ fontSize: 12.5 }} disabled={busy} onClick={() => handleDecision(p.id, 'APPROVE')}>Approve</button>
                                                        <button className="ih-btn ih-btn-secondary" style={{ fontSize: 12.5 }} disabled={busy} onClick={() => handleDecision(p.id, 'REQUEST_REVISION')}>Request Revision</button>
                                                        <button className="ih-btn ih-btn-secondary" style={{ fontSize: 12.5, color: 'var(--danger)' }} disabled={busy} onClick={() => handleDecision(p.id, 'REJECT')}>Reject</button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
