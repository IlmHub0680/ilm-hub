'use client';
import { useEffect, useState } from 'react';

type TutoringRequestRow = {
    id: string;
    status: string;
    studentName: string;
    studentEmail: string;
    course: string;
    courseCode: string;
    instructor: string | null;
    preferredSchedule: string | null;
    notes: string | null;
    feeUSD: number | null;
    isPaid: boolean;
    paidAmount: number | null;
    createdAt: string;
};

const STATUS_BADGE: Record<string, string> = {
    PENDING: 'ih-b-warning',
    APPROVED: 'ih-b-success',
    REJECTED: 'ih-b-danger',
    COMPLETED: 'ih-b-neutral',
};

export default function TutoringRequestsPage() {
    const [requests, setRequests] = useState<TutoringRequestRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionId, setActionId] = useState<string | null>(null);
    const [fees, setFees] = useState<Record<string, string>>({});
    const [message, setMessage] = useState('');

    const fetchRequests = () => {
        setLoading(true);
        fetch('/api/student-affairs/tutoring-requests', { credentials: 'include' })
            .then(async (res) => {
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || 'Failed to load tutoring requests.');
                setRequests(result.requests || []);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (id: string, action: string) => {
        setActionId(id);
        setMessage('');
        try {
            const body: Record<string, unknown> = { action };
            if (action === 'approve') {
                const fee = Number(fees[id]);
                if (!Number.isFinite(fee) || fee <= 0) {
                    setMessage('Enter a valid fee (in USD) before approving.');
                    setActionId(null);
                    return;
                }
                body.feeUSD = fee;
            }

            const res = await fetch(`/api/student-affairs/tutoring-requests/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const result = await res.json();

            if (res.ok) {
                setMessage('Tutoring request updated.');
                fetchRequests();
            } else {
                setMessage(result.error || 'Failed to update tutoring request.');
            }
        } catch {
            setMessage('An error occurred.');
        } finally {
            setActionId(null);
        }
    };

    return (
        <div className="ih-card">
            <h3 style={{ margin: '0 0 4px', fontSize: 17 }}>Private Tutoring Requests</h3>
            <p style={{ color: 'var(--ink-soft)', marginTop: 0, marginBottom: 18 }}>
                Approve a request to set its fee and unlock payment for the student, or reject it. Once paid,
                mark it completed after the tutoring has taken place.
            </p>

            {message && (
                <div style={{ padding: '10px 14px', background: 'var(--success-tint)', color: 'var(--success)', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
                    {message}
                </div>
            )}

            {loading && <p>Loading tutoring requests…</p>}
            {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}

            {!loading && !error && requests.length === 0 && (
                <p style={{ color: 'var(--ink-soft)' }}>No private tutoring requests yet.</p>
            )}

            {!loading && requests.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {requests.map((r) => (
                        <div key={r.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>
                                        {r.studentName} <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}>({r.studentEmail})</span>
                                    </div>
                                    <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                                        {r.course} ({r.courseCode}) · {r.instructor || 'No instructor requested'} · submitted{' '}
                                        {new Date(r.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                <span className={`ih-badge ${STATUS_BADGE[r.status] || 'ih-b-neutral'}`}>
                                    {r.status}
                                </span>
                            </div>

                            {r.notes && (
                                <p style={{ margin: '10px 0', fontSize: 13.5 }}>
                                    <strong>Student notes:</strong> {r.notes}
                                </p>
                            )}

                            {r.preferredSchedule && (
                                <p style={{ margin: '0 0 10px', fontSize: 13.5, color: 'var(--ink-soft)' }}>
                                    Preferred schedule: {r.preferredSchedule}
                                </p>
                            )}

                            {r.feeUSD != null && (
                                <p style={{ margin: '0 0 10px', fontSize: 13.5 }}>
                                    Fee: ${r.feeUSD.toFixed(2)} —{' '}
                                    {r.isPaid ? (
                                        <span style={{ color: 'var(--success)' }}>
                                            Paid{r.paidAmount != null ? ` (${r.paidAmount.toFixed(2)} GHS)` : ''}
                                        </span>
                                    ) : (
                                        <span style={{ color: 'var(--warning)' }}>Not yet paid</span>
                                    )}
                                </p>
                            )}

                            {r.status === 'PENDING' && (
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 8 }}>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="Fee (USD)"
                                        value={fees[r.id] || ''}
                                        onChange={(e) => setFees({ ...fees, [r.id]: e.target.value })}
                                        style={{ width: 130, border: '1px solid var(--border)', borderRadius: 6, padding: '9px 11px', fontSize: 13.5, background: 'var(--surface)', color: 'var(--ink)' }}
                                    />
                                    <button disabled={actionId === r.id} onClick={() => handleAction(r.id, 'approve')} className="ih-btn ih-btn-primary">
                                        Approve
                                    </button>
                                    <button disabled={actionId === r.id} onClick={() => handleAction(r.id, 'reject')} className="ih-btn ih-btn-danger">
                                        Reject
                                    </button>
                                </div>
                            )}

                            {r.status === 'APPROVED' && (
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 8 }}>
                                    <button disabled={actionId === r.id} onClick={() => handleAction(r.id, 'complete')} className="ih-btn ih-btn-ghost">
                                        Mark Completed
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
