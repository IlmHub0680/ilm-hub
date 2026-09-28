'use client';
import { useEffect, useState } from 'react';

const fieldStyle = { border: '1px solid var(--border)', borderRadius: 6, padding: '9px 11px', fontSize: 13.5, background: 'var(--surface)', color: 'var(--ink)', width: '100%' };

const APPROVAL_BADGE: Record<string, string> = {
    DRAFT: 'ih-b-neutral',
    UNDER_REVIEW: 'ih-b-warning',
    APPROVED: 'ih-b-success',
    RETURNED_FOR_REVISION: 'ih-b-danger',
};

const SEVERITY_BADGE: Record<string, string> = {
    MINOR: 'ih-b-warning',
    MAJOR: 'ih-b-danger',
};

const STATUS_BADGE: Record<string, string> = {
    REPORTED: 'ih-b-warning',
    UNDER_REVIEW: 'ih-b-warning',
    RESOLVED: 'ih-b-success',
    DISMISSED: 'ih-b-neutral',
};

export default function HODApprovalsPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [courseMessage, setCourseMessage] = useState('');
    const [returnDraftId, setReturnDraftId] = useState<string | null>(null);
    const [returnNote, setReturnNote] = useState('');
    const [busyId, setBusyId] = useState<string | null>(null);

    const [cases, setCases] = useState<any[]>([]);
    const [loadingCases, setLoadingCases] = useState(true);
    const [caseMessage, setCaseMessage] = useState('');
    const [resolveDraftId, setResolveDraftId] = useState<string | null>(null);
    const [resolveDraft, setResolveDraft] = useState({ sanction: '', standingActionTaken: false });

    function loadCourses() {
        setLoadingCourses(true);
        fetch('/api/hod/course-approvals', { credentials: 'include' })
            .then(async (res) => {
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || 'Failed to load course approvals.');
                setCourses(result.courses || []);
            })
            .catch((err) => setCourseMessage(err.message))
            .finally(() => setLoadingCourses(false));
    }

    function loadCases() {
        setLoadingCases(true);
        fetch('/api/integrity-cases', { credentials: 'include' })
            .then(async (res) => {
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || 'Failed to load integrity cases.');
                setCases(result.cases || []);
            })
            .catch((err) => setCaseMessage(err.message))
            .finally(() => setLoadingCases(false));
    }

    useEffect(() => {
        loadCourses();
        loadCases();
    }, []);

    async function decideCourse(courseId: string, action: 'approve' | 'return', note?: string) {
        setBusyId(courseId);
        setCourseMessage('');
        try {
            const res = await fetch('/api/hod/course-approvals', {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId, action, note }),
            });
            const result = await res.json();
            if (res.ok) {
                setCourseMessage(action === 'approve' ? 'Course approved.' : 'Course returned for revision.');
                setReturnDraftId(null);
                setReturnNote('');
                loadCourses();
            } else {
                setCourseMessage(result.error || 'Failed to record this decision.');
            }
        } catch {
            setCourseMessage('An error occurred.');
        } finally {
            setBusyId(null);
        }
    }

    async function decideCase(caseId: string, action: 'resolve' | 'dismiss' | 'start_review') {
        setBusyId(caseId);
        setCaseMessage('');
        try {
            const res = await fetch(`/api/integrity-cases/${caseId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(
                    action === 'resolve'
                        ? { action, sanction: resolveDraft.sanction, standingActionTaken: resolveDraft.standingActionTaken }
                        : { action }
                ),
            });
            const result = await res.json();
            if (res.ok) {
                setCaseMessage('Case updated.');
                setResolveDraftId(null);
                setResolveDraft({ sanction: '', standingActionTaken: false });
                loadCases();
            } else {
                setCaseMessage(result.error || 'Failed to update this case.');
            }
        } catch {
            setCaseMessage('An error occurred.');
        } finally {
            setBusyId(null);
        }
    }

    const pendingCourses = courses.filter((c) => c.approvalStatus === 'UNDER_REVIEW');
    const otherCourses = courses.filter((c) => c.approvalStatus !== 'UNDER_REVIEW');
    const openCases = cases.filter((c) => c.status === 'REPORTED' || c.status === 'UNDER_REVIEW');
    const closedCases = cases.filter((c) => c.status === 'RESOLVED' || c.status === 'DISMISSED');

    return (
        <div style={{ display: 'grid', gap: 24 }}>
            <section className="ih-card">
                <h2 style={{ margin: '0 0 4px', fontSize: 16 }}>Course Approvals</h2>
                <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 0, marginBottom: 14 }}>
                    Courses a Programme Coordinator in your department has submitted for review.
                </p>
                {courseMessage && <div className="ih-card" style={{ background: 'var(--brand-tint)', padding: '8px 12px', marginBottom: 12, fontSize: 13 }}>{courseMessage}</div>}
                {loadingCourses ? (
                    <p>Loading…</p>
                ) : pendingCourses.length === 0 ? (
                    <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No courses currently awaiting your review.</p>
                ) : (
                    <div style={{ display: 'grid', gap: 12 }}>
                        {pendingCourses.map((c) => (
                            <div key={c.id} className="ih-card" style={{ background: 'var(--surface-2, var(--bg))' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{c.titleEn}</div>
                                        <div className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{c.courseCode} — {c.program?.nameEn}</div>
                                    </div>
                                    <span className={`ih-badge ${APPROVAL_BADGE[c.approvalStatus]}`}>{c.approvalStatus.replace(/_/g, ' ')}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                    <button disabled={busyId === c.id} className="ih-btn ih-btn-primary" onClick={() => decideCourse(c.id, 'approve')}>Approve</button>
                                    <button disabled={busyId === c.id} className="ih-btn ih-btn-secondary" onClick={() => setReturnDraftId(returnDraftId === c.id ? null : c.id)}>Return for Revision</button>
                                </div>
                                {returnDraftId === c.id && (
                                    <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                                        <input style={fieldStyle} placeholder="What needs revision?" value={returnNote} onChange={(e) => setReturnNote(e.target.value)} />
                                        <button disabled={busyId === c.id} className="ih-btn ih-btn-primary" onClick={() => decideCourse(c.id, 'return', returnNote)}>Send</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {otherCourses.length > 0 && (
                    <details style={{ marginTop: 16 }}>
                        <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--ink-soft)' }}>Other courses ({otherCourses.length})</summary>
                        <div className="ih-tbl-wrap" style={{ marginTop: 10 }}>
                            <table className="ih-tbl">
                                <thead><tr><th>Course</th><th>Programme</th><th>Approval</th></tr></thead>
                                <tbody>
                                    {otherCourses.map((c) => (
                                        <tr key={c.id}>
                                            <td>{c.titleEn} <span className="mono" style={{ color: 'var(--ink-soft)' }}>({c.courseCode})</span></td>
                                            <td>{c.program?.nameEn}</td>
                                            <td><span className={`ih-badge ${APPROVAL_BADGE[c.approvalStatus]}`}>{c.approvalStatus.replace(/_/g, ' ')}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </details>
                )}
            </section>

            <section className="ih-card">
                <h2 style={{ margin: '0 0 4px', fontSize: 16 }}>Academic Integrity Cases</h2>
                <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 0, marginBottom: 14 }}>
                    Cases in your department — a major case requires your resolution; a minor case is normally resolved by the reporting instructor, shown here for visibility.
                </p>
                {caseMessage && <div className="ih-card" style={{ background: 'var(--brand-tint)', padding: '8px 12px', marginBottom: 12, fontSize: 13 }}>{caseMessage}</div>}
                {loadingCases ? (
                    <p>Loading…</p>
                ) : openCases.length === 0 ? (
                    <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No open cases.</p>
                ) : (
                    <div style={{ display: 'grid', gap: 12 }}>
                        {openCases.map((k) => (
                            <div key={k.id} className="ih-card" style={{ background: 'var(--surface-2, var(--bg))' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{k.student?.user?.name} <span className="mono" style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>({k.student?.studentNo})</span></div>
                                        <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{k.violationType.replace(/_/g, ' ')}{k.course ? ` — ${k.course.titleEn}` : ''}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <span className={`ih-badge ${SEVERITY_BADGE[k.severity]}`}>{k.severity}</span>
                                        <span className={`ih-badge ${STATUS_BADGE[k.status]}`}>{k.status.replace(/_/g, ' ')}</span>
                                    </div>
                                </div>
                                <p style={{ fontSize: 13, margin: '8px 0' }}>{k.description}</p>
                                <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Reported by {k.reportedBy?.user?.name}</div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                    {k.status === 'REPORTED' && (
                                        <button disabled={busyId === k.id} className="ih-btn ih-btn-secondary" onClick={() => decideCase(k.id, 'start_review')}>Start Review</button>
                                    )}
                                    <button disabled={busyId === k.id} className="ih-btn ih-btn-secondary" onClick={() => decideCase(k.id, 'dismiss')}>Dismiss</button>
                                    <button disabled={busyId === k.id} className="ih-btn ih-btn-primary" onClick={() => setResolveDraftId(resolveDraftId === k.id ? null : k.id)}>Resolve</button>
                                </div>
                                {resolveDraftId === k.id && (
                                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <input style={fieldStyle} placeholder="Sanction applied (e.g. resubmission, grade penalty)" value={resolveDraft.sanction} onChange={(e) => setResolveDraft({ ...resolveDraft, sanction: e.target.value })} />
                                        <label style={{ fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <input type="checkbox" checked={resolveDraft.standingActionTaken} onChange={(e) => setResolveDraft({ ...resolveDraft, standingActionTaken: e.target.checked })} />
                                            This also engaged the Academic Standing process
                                        </label>
                                        <button disabled={busyId === k.id} className="ih-btn ih-btn-primary" onClick={() => decideCase(k.id, 'resolve')}>Save Resolution</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {closedCases.length > 0 && (
                    <details style={{ marginTop: 16 }}>
                        <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--ink-soft)' }}>Closed cases ({closedCases.length})</summary>
                        <div className="ih-tbl-wrap" style={{ marginTop: 10 }}>
                            <table className="ih-tbl">
                                <thead><tr><th>Student</th><th>Violation</th><th>Status</th><th>Sanction</th></tr></thead>
                                <tbody>
                                    {closedCases.map((k) => (
                                        <tr key={k.id}>
                                            <td>{k.student?.user?.name}</td>
                                            <td>{k.violationType.replace(/_/g, ' ')}</td>
                                            <td><span className={`ih-badge ${STATUS_BADGE[k.status]}`}>{k.status.replace(/_/g, ' ')}</span></td>
                                            <td>{k.sanction || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </details>
                )}
            </section>
        </div>
    );
}
