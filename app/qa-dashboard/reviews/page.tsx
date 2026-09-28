'use client';
import { useState } from 'react';
import { useQA } from '../context';

const STATUS_BADGE: Record<string, string> = {
    SCHEDULED: 'ih-b-info',
    IN_PROGRESS: 'ih-b-warning',
    COMPLETED: 'ih-b-success',
};

const OUTCOME_BADGE: Record<string, string> = {
    COMPLIANT: 'ih-b-success',
    MINOR_NON_COMPLIANCE: 'ih-b-warning',
    MAJOR_NON_COMPLIANCE: 'ih-b-danger',
};

const IMPROVEMENT_BADGE: Record<string, string> = {
    NOT_REQUIRED: 'ih-b-neutral',
    PENDING: 'ih-b-warning',
    IN_PROGRESS: 'ih-b-warning',
    COMPLETED: 'ih-b-success',
};

const fieldStyle = { border: '1px solid var(--border)', borderRadius: 6, padding: '9px 11px', fontSize: 13.5, background: 'var(--surface)', color: 'var(--ink)' };

export default function ReviewsPage() {
    const { reviews, loadingReviews, reviewsError, refetchReviews, refetchOverview } = useQA();
    const [message, setMessage] = useState('');
    const [completingId, setCompletingId] = useState<string | null>(null);
    const [completeDraft, setCompleteDraft] = useState<{ findings: string; outcome: string; recommendation: string; evidenceUrls: string; actionOwner: string }>({
        findings: '', outcome: 'COMPLIANT', recommendation: '', evidenceUrls: '', actionOwner: '',
    });
    const [busyId, setBusyId] = useState<string | null>(null);
    const [progressDraftId, setProgressDraftId] = useState<string | null>(null);
    const [progressDraft, setProgressDraft] = useState<{ improvementStatus: string; evidenceUrls: string; actionOwner: string }>({ improvementStatus: 'IN_PROGRESS', evidenceUrls: '', actionOwner: '' });

    const handleStart = async (id: string) => {
        setBusyId(id);
        setMessage('');
        try {
            const res = await fetch(`/api/qa/reviews/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'start' }),
            });
            const result = await res.json();
            if (res.ok) {
                refetchReviews();
            } else {
                setMessage(result.error || 'Failed to start review.');
            }
        } catch {
            setMessage('An error occurred.');
        } finally {
            setBusyId(null);
        }
    };

    const openComplete = (id: string) => {
        setCompletingId(id);
        setCompleteDraft({ findings: '', outcome: 'COMPLIANT', recommendation: '', evidenceUrls: '', actionOwner: '' });
    };

    const handleComplete = async (id: string) => {
        setBusyId(id);
        setMessage('');
        try {
            const res = await fetch(`/api/qa/reviews/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'complete',
                    findings: completeDraft.findings,
                    outcome: completeDraft.outcome,
                    recommendation: completeDraft.recommendation,
                    evidenceUrls: completeDraft.evidenceUrls.split(',').map((u) => u.trim()).filter(Boolean),
                    actionOwner: completeDraft.actionOwner,
                }),
            });
            const result = await res.json();
            if (res.ok) {
                setMessage('Review completed.');
                setCompletingId(null);
                refetchReviews();
                refetchOverview();
            } else {
                setMessage(result.error || 'Failed to complete review.');
            }
        } catch {
            setMessage('An error occurred.');
        } finally {
            setBusyId(null);
        }
    };

    const handleUpdateProgress = async (id: string) => {
        setBusyId(id);
        setMessage('');
        try {
            const res = await fetch(`/api/qa/reviews/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update_progress',
                    improvementStatus: progressDraft.improvementStatus,
                    evidenceUrls: progressDraft.evidenceUrls.split(',').map((u) => u.trim()).filter(Boolean),
                    actionOwner: progressDraft.actionOwner,
                }),
            });
            const result = await res.json();
            if (res.ok) {
                setMessage('Improvement plan updated.');
                setProgressDraftId(null);
                refetchReviews();
            } else {
                setMessage(result.error || 'Failed to update.');
            }
        } catch {
            setMessage('An error occurred.');
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="ih-card">
            {message && (
                <div style={{ background: 'var(--success-tint)', color: 'var(--success)', padding: '10px 14px', marginBottom: 20, borderRadius: 8 }}>
                    {message}
                </div>
            )}
            <h3 style={{ margin: '0 0 16px', fontSize: 17 }}>Reviews</h3>

            {loadingReviews && <p>Loading reviews…</p>}
            {reviewsError && <p style={{ color: 'var(--danger)' }}>{reviewsError}</p>}
            {!loadingReviews && !reviewsError && reviews.length === 0 && (
                <p style={{ color: 'var(--ink-soft)' }}>No reviews scheduled yet.</p>
            )}

            {!loadingReviews && reviews.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {reviews.map((r: any) => (
                        <div key={r.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>
                                        {r.reviewType} — {r.subjectName}
                                    </div>
                                    <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                                        {r.subjectType.charAt(0) + r.subjectType.slice(1).toLowerCase()} · reviewer {r.reviewedByName} · scheduled{' '}
                                        {new Date(r.createdAt).toLocaleDateString()}
                                        {r.followUpDate ? ` · follow-up ${new Date(r.followUpDate).toLocaleDateString()}` : ''}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    <span className={`ih-badge ${STATUS_BADGE[r.status] || 'ih-b-neutral'}`}>
                                        {r.status.replace(/_/g, ' ')}
                                    </span>
                                    {r.outcome && (
                                        <span className={`ih-badge ${OUTCOME_BADGE[r.outcome] || 'ih-b-neutral'}`}>
                                            {r.outcome.replace(/_/g, ' ')}
                                        </span>
                                    )}
                                    {r.status === 'COMPLETED' && r.improvementStatus !== 'NOT_REQUIRED' && (
                                        <span className={`ih-badge ${IMPROVEMENT_BADGE[r.improvementStatus] || 'ih-b-neutral'}`}>
                                            Plan: {r.improvementStatus.replace(/_/g, ' ')}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <p style={{ margin: '10px 0' }}>{r.findings}</p>

                            {r.recommendation && (
                                <p style={{ margin: '0 0 10px', fontSize: 13, background: 'var(--brand-tint)', borderRadius: 6, padding: 8 }}>
                                    <strong>Recommendation:</strong> {r.recommendation}
                                </p>
                            )}

                            {r.status === 'COMPLETED' && r.improvementStatus !== 'NOT_REQUIRED' && (
                                <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--ink-soft)' }}>
                                    <strong>Action owner:</strong> {r.actionOwner || 'Not yet assigned'}
                                    {r.followUpDate && <> · <strong>Follow-up by:</strong> {new Date(r.followUpDate).toLocaleDateString()}</>}
                                </p>
                            )}

                            {r.evidenceUrls && r.evidenceUrls.length > 0 && (
                                <div style={{ margin: '0 0 10px', fontSize: 12.5 }}>
                                    <strong>Evidence:</strong>{' '}
                                    {r.evidenceUrls.map((u: string, i: number) => (
                                        <a key={u} href={u} target="_blank" rel="noreferrer" style={{ marginRight: 8 }}>[{i + 1}]</a>
                                    ))}
                                </div>
                            )}

                            {r.status === 'COMPLETED' && r.improvementStatus !== 'NOT_REQUIRED' && progressDraftId !== r.id && (
                                <button
                                    disabled={busyId === r.id}
                                    onClick={() => {
                                        setProgressDraftId(r.id);
                                        setProgressDraft({ improvementStatus: r.improvementStatus === 'PENDING' ? 'IN_PROGRESS' : r.improvementStatus, evidenceUrls: '', actionOwner: r.actionOwner || '' });
                                    }}
                                    className="ih-btn ih-btn-secondary"
                                    style={{ marginBottom: 8 }}
                                >
                                    Update Improvement Plan
                                </button>
                            )}

                            {progressDraftId === r.id && (
                                <div style={{ marginBottom: 10, borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <select
                                        value={progressDraft.improvementStatus}
                                        onChange={(e) => setProgressDraft({ ...progressDraft, improvementStatus: e.target.value })}
                                        style={fieldStyle}
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="IN_PROGRESS">In progress</option>
                                        <option value="COMPLETED">Completed</option>
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Action owner (person or unit responsible)"
                                        value={progressDraft.actionOwner}
                                        onChange={(e) => setProgressDraft({ ...progressDraft, actionOwner: e.target.value })}
                                        style={fieldStyle}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Add evidence URL(s), comma-separated"
                                        value={progressDraft.evidenceUrls}
                                        onChange={(e) => setProgressDraft({ ...progressDraft, evidenceUrls: e.target.value })}
                                        style={fieldStyle}
                                    />
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button disabled={busyId === r.id} onClick={() => handleUpdateProgress(r.id)} className="ih-btn ih-btn-primary">Save</button>
                                        <button onClick={() => setProgressDraftId(null)} className="ih-btn ih-btn-ghost">Cancel</button>
                                    </div>
                                </div>
                            )}

                            {r.status !== 'COMPLETED' && completingId !== r.id && (
                                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                    {r.status === 'SCHEDULED' && (
                                        <button disabled={busyId === r.id} onClick={() => handleStart(r.id)} className="ih-btn ih-btn-secondary">
                                            Start Review
                                        </button>
                                    )}
                                    <button disabled={busyId === r.id} onClick={() => openComplete(r.id)} className="ih-btn ih-btn-primary">
                                        Complete Review
                                    </button>
                                </div>
                            )}

                            {completingId === r.id && (
                                <div style={{ marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <textarea
                                        placeholder="Findings"
                                        value={completeDraft.findings}
                                        onChange={(e) => setCompleteDraft({ ...completeDraft, findings: e.target.value })}
                                        style={{ ...fieldStyle, minHeight: 60 }}
                                    />
                                    <select
                                        value={completeDraft.outcome}
                                        onChange={(e) => setCompleteDraft({ ...completeDraft, outcome: e.target.value })}
                                        style={fieldStyle}
                                    >
                                        <option value="COMPLIANT">Compliant</option>
                                        <option value="MINOR_NON_COMPLIANCE">Minor non-compliance</option>
                                        <option value="MAJOR_NON_COMPLIANCE">Major non-compliance</option>
                                    </select>
                                    <textarea
                                        placeholder="Recommendation (optional)"
                                        value={completeDraft.recommendation}
                                        onChange={(e) => setCompleteDraft({ ...completeDraft, recommendation: e.target.value })}
                                        style={{ ...fieldStyle, minHeight: 50 }}
                                    />
                                    {completeDraft.recommendation.trim() && (
                                        <input
                                            type="text"
                                            placeholder="Action owner (person or unit responsible for this recommendation)"
                                            value={completeDraft.actionOwner}
                                            onChange={(e) => setCompleteDraft({ ...completeDraft, actionOwner: e.target.value })}
                                            style={fieldStyle}
                                        />
                                    )}
                                    <input
                                        type="text"
                                        placeholder="Evidence URL(s), comma-separated (optional)"
                                        value={completeDraft.evidenceUrls}
                                        onChange={(e) => setCompleteDraft({ ...completeDraft, evidenceUrls: e.target.value })}
                                        style={fieldStyle}
                                    />
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button disabled={busyId === r.id} onClick={() => handleComplete(r.id)} className="ih-btn ih-btn-primary">
                                            Submit
                                        </button>
                                        <button onClick={() => setCompletingId(null)} className="ih-btn ih-btn-ghost">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
