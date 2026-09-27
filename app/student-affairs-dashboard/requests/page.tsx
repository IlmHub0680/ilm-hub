'use client';
import { useEffect, useState } from 'react';

type Recipient = { id: string; nameEn: string };

type StudentRequest = {
    id: string;
    type: string;
    status: string;
    details: string;
    attachmentUrl: boolean | null;
    responseNote: string | null;
    createdAt: string;
    resolvedAt: string | null;
    studentName: string;
    studentEmail: string;
    studentNo: string;
    assignedStaffName: string | null;
};

const STATUS_BADGE: Record<string, string> = {
    SUBMITTED: 'ih-b-info',
    UNDER_REVIEW: 'ih-b-warning',
    APPROVED: 'ih-b-success',
    REJECTED: 'ih-b-danger',
    COMPLETED: 'ih-b-neutral',
};

export default function StudentRequestsPage() {
    const [requests, setRequests] = useState<StudentRequest[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [requestsError, setRequestsError] = useState('');
    const [actionId, setActionId] = useState<string | null>(null);
    const [notes, setNotes] = useState<Record<string, string>>({});
    const [message, setMessage] = useState('');
    const [transferSelection, setTransferSelection] = useState<Record<string, string>>({});
    const [recipients, setRecipients] = useState<{ units: Recipient[]; departments: Recipient[] } | null>(null);

    const fetchRequests = () => {
        setLoadingRequests(true);
        fetch('/api/student-affairs/requests', { credentials: 'include' })
            .then(async (res) => {
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || 'Failed to load requests.');
                setRequests(result.requests || []);
            })
            .catch((err) => setRequestsError(err.message))
            .finally(() => setLoadingRequests(false));
    };

    useEffect(() => {
        fetchRequests();

        fetch('/api/student/recipients', { credentials: 'include' })
            .then(async (res) => {
                const result = await res.json();
                if (res.ok && result.success) {
                    setRecipients({ units: result.units || [], departments: result.departments || [] });
                }
            })
            .catch(() => {});
    }, []);

    const handleAction = async (id: string, action: string, extra: Record<string, unknown> = {}) => {
        setActionId(id);
        setMessage('');
        try {
            const res = await fetch(`/api/student-affairs/requests/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, responseNote: notes[id] || '', ...extra }),
            });
            const result = await res.json();

            if (res.ok) {
                setMessage('Request updated.');
                fetchRequests();
            } else {
                setMessage(result.error || 'Failed to update request.');
            }
        } catch (err) {
            setMessage('An error occurred.');
        } finally {
            setActionId(null);
        }
    };

    const handleTransfer = (id: string) => {
        const sel = transferSelection[id];
        if (!sel) {
            setMessage('Choose who to transfer this request to first.');
            return;
        }
        const [recipientType, recipientId] = sel.split(':');
        handleAction(id, 'transfer', { recipientType, recipientId, note: notes[id] || '' });
    };

    const handleViewAttachment = async (id: string) => {
        try {
            const res = await fetch(`/api/student/requests/${id}/download`, { credentials: 'include' });
            const result = await res.json();
            if (!result.success) {
                setMessage(result.error || 'Unable to open attachment.');
                return;
            }
            window.open(result.url, '_blank', 'noopener,noreferrer');
        } catch {
            setMessage('Unable to open attachment.');
        }
    };

    return (
        <div className="ih-card">
            <h3 style={{ margin: '0 0 4px', fontSize: 17 }}>Student Requests</h3>
            <p style={{ color: 'var(--ink-soft)', marginTop: 0, marginBottom: 18 }}>
                Leave of absence, deferment, course add/drop, complaints, graduate support and other
                student matters submitted for review. Respond, transfer to another office, or move each
                one through its lifecycle here.
            </p>

            {message && (
                <div style={{ padding: '10px 14px', background: 'var(--success-tint)', color: 'var(--success)', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
                    {message}
                </div>
            )}

            {loadingRequests && <p>Loading requests…</p>}
            {requestsError && <p style={{ color: 'var(--danger)' }}>{requestsError}</p>}

            {!loadingRequests && !requestsError && requests.length === 0 && (
                <p style={{ color: 'var(--ink-soft)' }}>No student requests yet.</p>
            )}

            {!loadingRequests && requests.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {requests.map((r) => {
                        const closed = r.status === 'COMPLETED' || r.status === 'REJECTED';

                        return (
                        <div key={r.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>
                                        {r.studentName} <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}>({r.studentNo})</span>
                                    </div>
                                    <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                                        {r.type.replace(/_/g, ' ')} · submitted {new Date(r.createdAt).toLocaleDateString()}
                                        {r.assignedStaffName ? ` · assigned to ${r.assignedStaffName}` : ''}
                                    </div>
                                </div>

                                <span className={`ih-badge ${STATUS_BADGE[r.status] || 'ih-b-neutral'}`}>
                                    {r.status.replace(/_/g, ' ')}
                                </span>
                            </div>

                            <p style={{ margin: '10px 0' }}>{r.details}</p>

                            {r.responseNote && (
                                <p style={{ margin: '0 0 10px', fontSize: 13, background: 'var(--brand-tint)', borderRadius: 6, padding: 8 }}>
                                    <strong>Note:</strong> {r.responseNote}
                                </p>
                            )}

                            {r.attachmentUrl && (
                                <button onClick={() => handleViewAttachment(r.id)} className="ih-btn ih-btn-ghost" style={{ fontSize: 12.5, marginBottom: 10 }}>
                                    View attachment
                                </button>
                            )}

                            {!closed && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                                    <input
                                        type="text"
                                        placeholder="Add a note or response (optional)"
                                        value={notes[r.id] || ''}
                                        onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })}
                                        style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '9px 11px', fontSize: 13.5, background: 'var(--surface)', color: 'var(--ink)' }}
                                    />

                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                                        {r.status === 'SUBMITTED' && (
                                            <button disabled={actionId === r.id} onClick={() => handleAction(r.id, 'claim')} className="ih-btn ih-btn-secondary">
                                                Claim
                                            </button>
                                        )}

                                        <button
                                            disabled={actionId === r.id || !notes[r.id]?.trim()}
                                            onClick={() => handleAction(r.id, 'respond', { responseNote: notes[r.id] })}
                                            className="ih-btn ih-btn-secondary"
                                        >
                                            Send Response
                                        </button>

                                        <select
                                            value={transferSelection[r.id] || ''}
                                            onChange={(e) => setTransferSelection({ ...transferSelection, [r.id]: e.target.value })}
                                            style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px', fontSize: 13, background: 'var(--surface)', color: 'var(--ink)' }}
                                        >
                                            <option value="">Transfer to…</option>
                                            {(recipients?.units || []).map((u) => (
                                                <option key={u.id} value={`unit:${u.id}`}>
                                                    {u.nameEn}
                                                </option>
                                            ))}
                                            {(recipients?.departments || []).map((d) => (
                                                <option key={d.id} value={`department:${d.id}`}>
                                                    {d.nameEn}
                                                </option>
                                            ))}
                                        </select>
                                        <button disabled={actionId === r.id} onClick={() => handleTransfer(r.id)} className="ih-btn ih-btn-secondary">
                                            Transfer
                                        </button>

                                        {r.status === 'APPROVED' ? (
                                            <button disabled={actionId === r.id} onClick={() => handleAction(r.id, 'complete')} className="ih-btn ih-btn-ghost">
                                                Mark Completed
                                            </button>
                                        ) : (
                                            <>
                                                <button disabled={actionId === r.id} onClick={() => handleAction(r.id, 'approve')} className="ih-btn ih-btn-primary">
                                                    Approve
                                                </button>
                                                <button disabled={actionId === r.id} onClick={() => handleAction(r.id, 'reject')} className="ih-btn ih-btn-danger">
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                    </div>
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
