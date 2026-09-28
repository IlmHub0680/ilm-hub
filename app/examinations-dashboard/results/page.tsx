'use client';
import { useState } from 'react';
import { useExams } from '../context';

const GRADE_FIELD_LABELS: Record<string, string> = {
    quiz1: 'Quiz 1',
    quiz2: 'Quiz 2',
    assignment: 'Assignment',
    midterm: 'Midterm',
    final: 'Final',
    practical: 'Practical',
};

const STATUS_BADGE: Record<string, string> = {
    PENDING: 'ih-b-neutral',
    SUBMITTED: 'ih-b-info',
    VERIFIED: 'ih-b-success',
    RECONCILED: 'ih-b-success',
};

const fieldStyle = { border: '1px solid var(--border)', borderRadius: 6, padding: '6px 9px', fontSize: 13, background: 'var(--surface)', color: 'var(--ink)' };

export default function ExamResultsPage() {
    const { results, loadingResults, refetchResults, message, setMessage } = useExams();
    const [busyId, setBusyId] = useState<string | null>(null);
    const [drafts, setDrafts] = useState<Record<string, { targetGradeField: string; note: string }>>({});

    const draftFor = (row: any) =>
        drafts[row.examId] || { targetGradeField: row.targetGradeField, note: row.note || '' };

    const setDraft = (examId: string, patch: Partial<{ targetGradeField: string; note: string }>) => {
        setDrafts((prev) => ({ ...prev, [examId]: { ...draftFor({ examId, targetGradeField: prev[examId]?.targetGradeField, note: prev[examId]?.note }), ...prev[examId], ...patch } }));
    };

    const handleAction = async (row: any, status: string) => {
        const draft = draftFor(row);
        setBusyId(row.examId);
        setMessage('');
        try {
            const res = await fetch('/api/examinations/results', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    examId: row.examId,
                    targetGradeField: draft.targetGradeField,
                    status,
                    note: draft.note,
                }),
            });
            const result = await res.json();
            if (res.ok) {
                setMessage(`Exam marked ${status.toLowerCase()}.`);
                refetchResults();
            } else {
                setMessage(result.error || 'Failed to update result verification.');
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
                <div style={{ borderColor: 'var(--success)', color: 'var(--success)', marginBottom: 20, padding: '10px 14px' }}>
                    {message}
                </div>
            )}
            <h3 style={{ margin: '0 0 6px', fontSize: 17 }}>Result Submission &amp; Verification</h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--ink-soft)' }}>
                Reconcile each scheduled exam against the grades the instructor has already entered.
                This does not change any grade — a real discrepancy is corrected only through the
                Academic Records grade-correction process.
            </p>
            {loadingResults && <p>Loading…</p>}
            {!loadingResults && results.length === 0 && <p style={{ color: 'var(--ink-soft)' }}>No exams scheduled yet.</p>}
            {!loadingResults && results.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {results.map((row: any) => {
                        const draft = draftFor(row);
                        const isFullyGraded = row.gradedCount >= row.enrolledCount && row.enrolledCount > 0;
                        const isFinal = row.status === 'VERIFIED' || row.status === 'RECONCILED';

                        return (
                            <div key={row.examId} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                                    <div>
                                        <div style={{ fontWeight: 700 }}>{row.courseTitle}</div>
                                        <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                                            {row.termName} · {row.examType} · {new Date(row.scheduledAt).toLocaleString()}
                                            {row.venue ? ` · ${row.venue}` : ''}
                                        </div>
                                    </div>
                                    <span className={`ih-badge ${STATUS_BADGE[row.status] || 'ih-b-neutral'}`}>
                                        {row.status}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', margin: '12px 0' }}>
                                    <div>
                                        <div style={{ fontSize: 20, fontWeight: 700 }}>{row.enrolledCount}</div>
                                        <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Enrolled students</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 20, fontWeight: 700, color: isFullyGraded ? 'var(--success)' : 'var(--warning, #b45309)' }}>
                                            {row.gradedCount}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                                            Graded in {GRADE_FIELD_LABELS[row.targetGradeField] || row.targetGradeField}
                                        </div>
                                    </div>
                                    {row.verifiedAt && (
                                        <div>
                                            <div style={{ fontSize: 13 }}>{new Date(row.verifiedAt).toLocaleDateString()}</div>
                                            <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Last verified</div>
                                        </div>
                                    )}
                                </div>

                                {!isFinal && (
                                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
                                        <label style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                                            Grade bucket:{' '}
                                            <select
                                                value={draft.targetGradeField}
                                                onChange={(e) => setDraft(row.examId, { targetGradeField: e.target.value })}
                                                style={fieldStyle}
                                            >
                                                {Object.keys(GRADE_FIELD_LABELS).map((f) => (
                                                    <option key={f} value={f}>{GRADE_FIELD_LABELS[f]}</option>
                                                ))}
                                            </select>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Discrepancy note (optional)"
                                            value={draft.note}
                                            onChange={(e) => setDraft(row.examId, { note: e.target.value })}
                                            style={{ ...fieldStyle, flex: '1 1 220px', minWidth: 180 }}
                                        />
                                    </div>
                                )}

                                {isFinal && row.note && (
                                    <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--ink-soft)' }}>Note: {row.note}</p>
                                )}

                                {!isFinal && (
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {row.status === 'PENDING' && (
                                            <button disabled={busyId === row.examId} onClick={() => handleAction(row, 'SUBMITTED')} className="ih-btn ih-btn-secondary">
                                                Mark Results Submitted
                                            </button>
                                        )}
                                        <button disabled={busyId === row.examId} onClick={() => handleAction(row, 'VERIFIED')} className="ih-btn ih-btn-primary">
                                            Verify
                                        </button>
                                        <button disabled={busyId === row.examId} onClick={() => handleAction(row, 'RECONCILED')} className="ih-btn ih-btn-primary">
                                            Mark Reconciled
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
