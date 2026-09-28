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

export default function TranscriptRequestsPage() {
    const { requests, loadingRequests, requestsError, refetchRequests, refetchOverview, message, setMessage } = useRecords();
    const [busyId, setBusyId] = useState<string | null>(null);

    const handleAction = async (id: string, action: string) => {
        setBusyId(id);
        setMessage('');
        try {
            const res = await fetch(`/api/records/requests/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
            const result = await res.json();

            if (res.ok) {
                setMessage(action === 'issue' ? 'Transcript issued.' : 'Request rejected.');
                refetchRequests();
                refetchOverview();
            } else {
                setMessage(result.error || 'Failed to update request.');
            }
        } catch {
            setMessage('An error occurred.');
        } finally {
            setBusyId(null);
        }
    };

    const handleViewTranscript = async (transcriptId: string) => {
        try {
            const res = await fetch(`/api/student/requests/transcripts/${transcriptId}/download`, {
                credentials: 'include',
            });
            const result = await res.json();

            if (!result.success) {
                setMessage(result.error || 'Unable to open transcript.');
                return;
            }

            window.open(result.url, '_blank', 'noopener,noreferrer');
        } catch {
            setMessage('Unable to open transcript.');
        }
    };

    return (
        <div className="ih-card">
            {message && (
                <div style={{ background: 'var(--success-tint)', color: 'var(--success)', padding: '10px 14px', marginBottom: 20, borderRadius: 8 }}>
                    {message}
                </div>
            )}
            <h3 style={{ margin: '0 0 16px', fontSize: 17 }}>Transcript Requests</h3>

            {loadingRequests && <p>Loading requests…</p>}
            {requestsError && <p style={{ color: 'var(--danger)' }}>{requestsError}</p>}
            {!loadingRequests && requests.length === 0 && (
                <p style={{ color: 'var(--ink-soft)' }}>No transcript requests yet.</p>
            )}

            {!loadingRequests && requests.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {requests.map((r: any) => (
                        <div key={r.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>
                                        {r.studentName} <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}>({r.studentNo})</span>
                                    </div>
                                    <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                                        submitted {new Date(r.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <span className={`ih-badge ${STATUS_BADGE[r.status] || 'ih-b-neutral'}`}>
                                    {r.status.replace(/_/g, ' ')}
                                </span>
                            </div>

                            <p style={{ margin: '10px 0' }}>{r.details}</p>

                            {r.transcriptIssue && (
                                <p style={{ margin: '0 0 10px', fontSize: 13, background: 'var(--brand-tint)', borderRadius: 6, padding: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                    <span>
                                        <strong>Cumulative GPA:</strong> <span style={{ fontFamily: 'var(--font-mono)' }}>{r.transcriptIssue.cumulative}</span> · issued{' '}
                                        {new Date(r.transcriptIssue.issuedAt).toLocaleDateString()}
                                    </span>
                                    <button
                                        className="ih-btn ih-btn-ghost"
                                        style={{ fontSize: 12.5, padding: '5px 12px' }}
                                        onClick={() => handleViewTranscript(r.transcriptIssue!.id)}
                                    >
                                        View PDF
                                    </button>
                                </p>
                            )}

                            {r.status !== 'COMPLETED' && r.status !== 'REJECTED' && (
                                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                    <button disabled={busyId === r.id} onClick={() => handleAction(r.id, 'issue')} className="ih-btn ih-btn-gold">
                                        Issue Transcript
                                    </button>
                                    <button disabled={busyId === r.id} onClick={() => handleAction(r.id, 'reject')} className="ih-btn ih-btn-danger">
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
