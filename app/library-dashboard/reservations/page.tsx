'use client';
import { useState } from 'react';
import { useLibraryDash } from '../context';

const fieldStyle = { border: '1px solid var(--border)', borderRadius: 6, padding: 9, background: 'var(--surface)', color: 'var(--ink)', fontSize: 13.5 };

export default function ReservationsPage() {
    const { reservations, loading, error, refetch } = useLibraryDash();
    const [message, setMessage] = useState('');
    const [busyId, setBusyId] = useState<string | null>(null);
    const [dueAtById, setDueAtById] = useState<Record<string, string>>({});
    const isErrorMessage = message.includes('rror') || message.includes('ailed');

    const handleCancel = async (id: string) => {
        setBusyId(id);
        setMessage('');
        try {
            const res = await fetch(`/api/library/reservations/${id}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'cancel' }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('Reservation cancelled.');
                refetch();
            } else {
                setMessage(data.error || 'Failed to cancel reservation.');
            }
        } catch {
            setMessage('An error occurred.');
        } finally {
            setBusyId(null);
        }
    };

    const handleFulfill = async (id: string) => {
        const dueAt = dueAtById[id];
        if (!dueAt) {
            setMessage('Pick a due date before fulfilling this reservation.');
            return;
        }

        setBusyId(id);
        setMessage('');
        try {
            const res = await fetch(`/api/library/reservations/${id}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'fulfill', dueAt }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('Reservation fulfilled — loan issued.');
                refetch();
            } else {
                setMessage(data.error || 'Failed to fulfill reservation.');
            }
        } catch {
            setMessage('An error occurred.');
        } finally {
            setBusyId(null);
        }
    };

    return (
        <>
            <h2 style={{ margin: '0 0 4px 0', fontSize: 20 }}>Reservations</h2>
            <p style={{ color: 'var(--ink-soft)', margin: '0 0 20px 0', fontSize: 14 }}>
                Students queued for items that had no available copies when they asked.
            </p>

            {message && (
                <div className="ih-card" style={{ padding: '10px 14px', marginBottom: 20, background: isErrorMessage ? 'var(--danger-tint)' : 'var(--success-tint)', color: isErrorMessage ? 'var(--danger)' : 'var(--success)' }}>
                    {message}
                </div>
            )}
            {error && (
                <div className="ih-card" style={{ background: 'var(--danger-tint)', color: 'var(--danger)', border: '1px solid var(--danger)', marginBottom: 20 }}>
                    {error}
                </div>
            )}

            {loading ? (
                <div className="ih-card" style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>Loading…</div>
            ) : reservations.length === 0 ? (
                <div className="ih-card" style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>No pending reservations.</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {reservations.map((r: any) => (
                        <div key={r.id} className="ih-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>{r.item}</div>
                                    <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{r.author}</div>
                                    <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>
                                        Reserved by {r.studentName} · {new Date(r.requestedAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <span className={`ih-badge ${r.itemAvailable > 0 ? 'ih-b-success' : 'ih-b-warning'}`}>
                                    {r.itemAvailable > 0 ? 'Copy available' : 'Still unavailable'}
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                                <input
                                    type="date"
                                    value={dueAtById[r.id] || ''}
                                    onChange={(e) => setDueAtById({ ...dueAtById, [r.id]: e.target.value })}
                                    style={{ ...fieldStyle, width: 160 }}
                                />
                                <button
                                    onClick={() => handleFulfill(r.id)}
                                    disabled={busyId === r.id || r.itemAvailable <= 0}
                                    className="ih-btn ih-btn-gold"
                                    style={{ padding: '6px 12px', fontSize: 12 }}
                                >
                                    {busyId === r.id ? '…' : 'Fulfill (issue loan)'}
                                </button>
                                <button
                                    onClick={() => handleCancel(r.id)}
                                    disabled={busyId === r.id}
                                    className="ih-btn ih-btn-ghost"
                                    style={{ padding: '6px 12px', fontSize: 12 }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
