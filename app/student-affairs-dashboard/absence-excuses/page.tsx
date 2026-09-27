'use client';
import { useEffect, useState } from 'react';

type AbsenceExcuseRow = {
    id: string;
    status: string;
    studentName: string;
    studentEmail: string;
    course: string;
    courseCode: string;
    type: string;
    absenceDate: string;
    reason: string;
    reviewNote: string | null;
    createdAt: string;
};

const STATUS_BADGE: Record<string, string> = {
    PENDING: 'ih-b-warning',
    APPROVED: 'ih-b-success',
    REJECTED: 'ih-b-danger',
};

export default function AbsenceExcusesPage() {
    const [excuses, setExcuses] = useState<AbsenceExcuseRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionId, setActionId] = useState<string | null>(null);
    const [notes, setNotes] = useState<Record<string, string>>({});
    const [message, setMessage] = useState('');

    const fetchExcuses = () => {
        setLoading(true);
        fetch('/api/student-affairs/absence-excuses', { credentials: 'include' })
            .then(async (res) => {
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || 'Failed to load absence excuses.');
                setExcuses(result.excuses || []);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchExcuses();
    }, []);

    const handleAction = async (id: string, action: string) => {
        setActionId(id);
        setMessage('');
        try {
            const res = await fetch(`/api/student-affairs/absence-excuses/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, reviewNote: notes[id] || '' }),
            });
            const result = await res.json();

            if (res.ok) {
                setMessage('Absence excuse updated.');
                fetchExcuses();
            } else {
                setMessage(result.error || 'Failed to update absence excuse.');
            }
        } catch {
            setMessage('An error occurred.');
        } finally {
            setActionId(null);
        }
    };

    return (
        <div className="ih-card">
            <h3 style={{ margin: '0 0 4px', fontSize: 17 }}>Absence Excuses</h3>
            <p style={{ color: 'var(--ink-soft)', marginTop: 0, marginBottom: 18 }}>
                Excuses students submit for missing a lecture, midterm or final examination.
            </p>

            {message && (
                <div style={{ padding: '10px 14px', background: 'var(--success-tint)', color: 'var(--success)', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
                    {message}
                </div>
            )}

            {loading && <p>Loading absence excuses…</p>}
            {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}

            {!loading && !error && excuses.length === 0 && (
                <p style={{ color: 'var(--ink-soft)' }}>No absence excuses yet.</p>
            )}

            {!loading && excuses.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {excuses.map((e) => (
                        <div key={e.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>
                                        {e.studentName} <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}>({e.studentEmail})</span>
                                    </div>
                                    <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                                        {e.course} ({e.courseCode}) · {e.type} absence on {new Date(e.absenceDate).toLocaleDateString()} · submitted{' '}
                                        {new Date(e.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                <span className={`ih-badge ${STATUS_BADGE[e.status] || 'ih-b-neutral'}`}>
                                    {e.status}
                                </span>
                            </div>

                            <p style={{ margin: '10px 0', fontSize: 13.5 }}>{e.reason}</p>

                            {e.reviewNote && (
                                <p style={{ margin: '0 0 10px', fontSize: 13, background: 'var(--brand-tint)', borderRadius: 6, padding: 8 }}>
                                    <strong>Review note:</strong> {e.reviewNote}
                                </p>
                            )}

                            {e.status === 'PENDING' && (
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 8 }}>
                                    <input
                                        type="text"
                                        placeholder="Add a review note (optional)"
                                        value={notes[e.id] || ''}
                                        onChange={(ev) => setNotes({ ...notes, [e.id]: ev.target.value })}
                                        style={{ flex: '1 1 220px', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 11px', fontSize: 13.5, background: 'var(--surface)', color: 'var(--ink)' }}
                                    />
                                    <button disabled={actionId === e.id} onClick={() => handleAction(e.id, 'approve')} className="ih-btn ih-btn-primary">
                                        Approve
                                    </button>
                                    <button disabled={actionId === e.id} onClick={() => handleAction(e.id, 'reject')} className="ih-btn ih-btn-danger">
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
