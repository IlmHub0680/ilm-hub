'use client';
import { useState } from 'react';
import { useRecords } from '../context';

const STATUS_BADGE: Record<string, string> = {
    SUBMITTED: 'ih-b-info',
    UNDER_REVIEW: 'ih-b-warning',
    APPROVED: 'ih-b-success',
    COMPLETED: 'ih-b-success',
    REJECTED: 'ih-b-danger',
};

export default function CourseRequestsPage() {
    const { courseRequests, loadingCourseRequests, courseRequestsError, refetchCourseRequests, message, setMessage } = useRecords();
    const [busyCourseRequestId, setBusyCourseRequestId] = useState<string | null>(null);

    const handleCourseRequestAction = async (id: string, action: string) => {
        setBusyCourseRequestId(id);
        setMessage('');
        try {
            const res = await fetch(`/api/records/course-requests/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
            const result = await res.json();

            if (res.ok) {
                setMessage(action === 'approve' ? "Request approved — the student's registered courses were updated." : 'Request rejected.');
                refetchCourseRequests();
            } else {
                setMessage(result.error || 'Failed to update request.');
            }
        } catch {
            setMessage('An error occurred.');
        } finally {
            setBusyCourseRequestId(null);
        }
    };

    return (
        <div className="ih-card">
            {message && (
                <div style={{ background: 'var(--success-tint)', color: 'var(--success)', padding: '10px 14px', marginBottom: 20, borderRadius: 8 }}>
                    {message}
                </div>
            )}
            <h3 style={{ margin: '0 0 6px', fontSize: 17 }}>Course Add/Drop Requests</h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--ink-soft)' }}>
                Approving an "Add" request registers the student in the course; approving a
                "Drop" request removes it from their record. Students can only request these
                changes — see Study Plan &amp; Curriculum in their own portal.
            </p>

            {loadingCourseRequests && <p>Loading requests…</p>}
            {courseRequestsError && <p style={{ color: 'var(--danger)' }}>{courseRequestsError}</p>}
            {!loadingCourseRequests && courseRequests.length === 0 && (
                <p style={{ color: 'var(--ink-soft)' }}>No course add/drop requests yet.</p>
            )}

            {!loadingCourseRequests && courseRequests.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {courseRequests.map((r: any) => (
                        <div key={r.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>
                                        {r.studentName} <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}>({r.studentNo})</span>
                                    </div>
                                    <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                                        {r.courseAction === 'DROP' ? 'Drop request' : 'Add request'}
                                        {r.course ? ` — ${r.course.titleEn} (${r.course.courseCode})` : ''} · submitted{' '}
                                        {new Date(r.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <span className={`ih-badge ${STATUS_BADGE[r.status] || 'ih-b-neutral'}`}>
                                    {r.status.replace(/_/g, ' ')}
                                </span>
                            </div>

                            <p style={{ margin: '10px 0' }}>{r.details}</p>

                            {r.responseNote && (
                                <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--ink-soft)' }}>
                                    <strong>Response:</strong> {r.responseNote}
                                </p>
                            )}

                            {r.status !== 'APPROVED' && r.status !== 'COMPLETED' && r.status !== 'REJECTED' && (
                                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                    <button
                                        disabled={busyCourseRequestId === r.id || !r.course}
                                        onClick={() => handleCourseRequestAction(r.id, 'approve')}
                                        className="ih-btn ih-btn-gold"
                                        title={!r.course ? "This request predates structured course tracking and must be handled manually." : undefined}
                                    >
                                        Approve
                                    </button>
                                    <button disabled={busyCourseRequestId === r.id} onClick={() => handleCourseRequestAction(r.id, 'reject')} className="ih-btn ih-btn-danger">
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
