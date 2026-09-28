'use client';
import { useCallback, useEffect, useState } from 'react';

type Clearance = {
    id: string;
    status: 'PENDING' | 'CLEARED' | 'FLAGGED';
    note: string | null;
    application: {
        id: string;
        status: string;
        student: { studentNo: string; user: { name: string } };
        program: { nameEn: string } | null;
    };
};

export default function FinanceGraduationClearancePage() {
    const [clearances, setClearances] = useState<Clearance[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [busyId, setBusyId] = useState<string | null>(null);
    const [notes, setNotes] = useState<Record<string, string>>({});

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/finance/graduation-clearances', { credentials: 'include', cache: 'no-store' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to load graduation clearances.');
            setClearances(data.data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const decide = async (applicationId: string, clearanceId: string, status: 'CLEARED' | 'FLAGGED') => {
        setBusyId(clearanceId);
        setMessage('');
        try {
            const res = await fetch(`/api/admin/graduation/${applicationId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'clear-unit', clearanceId, status, note: notes[clearanceId] || '' }),
            });
            const result = await res.json();
            if (res.ok) {
                setMessage(status === 'CLEARED' ? 'Clearance cleared.' : 'Clearance flagged.');
                load();
            } else {
                setMessage(result.error || 'Failed to update clearance.');
            }
        } catch (err) {
            setMessage('An error occurred.');
        } finally {
            setBusyId(null);
        }
    };

    return (
        <>
            <h2 style={{ margin: '0 0 4px 0', fontSize: 20 }}>Graduation Clearance</h2>
            <p style={{ color: 'var(--ink-soft)', margin: '0 0 20px 0', fontSize: 14 }}>
                Students awaiting Finance's sign-off on their graduation application.
            </p>

            {message && (
                <div className="ih-card" style={{ padding: '10px 14px', marginBottom: 20, background: message.includes('rror') || message.includes('ailed') ? 'var(--danger-tint)' : 'var(--success-tint)', color: message.includes('rror') || message.includes('ailed') ? 'var(--danger)' : 'var(--success)' }}>
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
            ) : clearances.length === 0 ? (
                <div className="ih-card" style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>
                    No graduation applications are currently awaiting Finance clearance.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {clearances.map((c) => (
                        <div key={c.id} className="ih-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                                 <div>
                                    <div style={{ fontWeight: 700 }}>
                                         {c.application.student.user.name}{' '}
                                        <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}>
                                            ({c.application.student.studentNo})
                                        </span>
                                  </div>
                                <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                                        {c.application.program?.nameEn || 'No programme on file'}
                                  </div>
                            </div>
                                <span className={`ih-badge ${c.status === 'FLAGGED' ? 'ih-b-danger' : 'ih-b-warning'}`}>
                                    {c.status === 'FLAGGED' ? 'Flagged' : 'Pending'}
                                </span>
                            </div>

                            <textarea
                                placeholder="Note (optional)…"
                                value={notes[c.id] || ''}
                                onChange={(e) => setNotes({ ...notes, [c.id]: e.target.value })}
                                rows={2}
                                style={{
                                    marginTop: 10,
                                    width: '100%',
                                    border: '1px solid var(--border)',
                                    borderRadius: 6,
                                    padding: '9px 11px',
                                    fontSize: 13.5,
                                   background: 'var(--surface)',
                                    color: 'var(--ink)',
                                    fontFamily: 'inherit',
                                }}
                            />

                            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                <button
                                      disabled={busyId === c.id}
                                    onClick={() => decide(c.application.id, c.id, 'CLEARED')}
                                      className="ih-btn ih-btn-secondary"
                                    >
                                    Clear
                                </button>
                                <button
                                      disabled={busyId === c.id}
                                    onClick={() => decide(c.application.id, c.id, 'FLAGGED')}
                                    className="ih-btn ih-btn-danger"
                                >
                                    Flag
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
