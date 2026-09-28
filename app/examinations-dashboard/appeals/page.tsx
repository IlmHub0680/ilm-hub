'use client';
import { useState } from 'react';
import { useExams } from '../context';

const STATUS_BADGE: Record<string, string> = {
    SUBMITTED: 'ih-b-info',
    UNDER_REVIEW: 'ih-b-warning',
    APPROVED: 'ih-b-success',
    REJECTED: 'ih-b-danger',
};

export default function GradeAppealsPage() {
    const { appeals, loadingAppeals, refetchAppeals, refetchOverview, message, setMessage } = useExams();
    const [busyId, setBusyId] = useState<string | null>(null);

    const handleAppealAction = async (id: string, action: string) => {
        setBusyId(id);
        setMessage('');
        try {
            const res = await fetch(`/api/examinations/appeals/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
            const result = await res.json();
            if (res.ok) {
                refetchAppeals();
                refetchOverview();
            } else {
                setMessage(result.error || 'Failed to update appeal.');
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
            <h3 style={{ margin: '0 0 16px', fontSize: 17 }}>Grade Appeals</h3>
            {loadingAppeals && <p>Loading appeals…</p>}
            {!loadingAppeals && appeals.length === 0 && <p style={{ color: 'var(--ink-soft)' }}>No grade appeals yet.</p>}
            {!loadingAppeals && appeals.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {appeals.map((a: any) => (
                        <div key={a.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>
                                        {a.studentName} <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}>({a.studentNo})</span>
                                    </div>
                                    <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>submitted {new Date(a.createdAt).toLocaleDateString()}</div>
                                </div>
                                <span className={`ih-badge ${STATUS_BADGE[a.status] || 'ih-b-neutral'}`}>
                                    {a.status.replace(/_/g, ' ')}
                                </span>
                            </div>
                            <p style={{ margin: '10px 0' }}>{a.details}</p>
                            {a.status !== 'APPROVED' && a.status !== 'REJECTED' && (
                                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                    {a.status === 'SUBMITTED' && (
                                        <button disabled={busyId === a.id} onClick={() => handleAppealAction(a.id, 'review')} className="ih-btn ih-btn-secondary">
                                            Start Review
                                        </button>
                                    )}
                                    <button disabled={busyId === a.id} onClick={() => handleAppealAction(a.id, 'approve')} className="ih-btn ih-btn-primary">
                                        Approve
                                    </button>
                                    <button disabled={busyId === a.id} onClick={() => handleAppealAction(a.id, 'reject')} className="ih-btn ih-btn-danger">
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
