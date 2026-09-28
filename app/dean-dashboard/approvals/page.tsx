'use client';
import { useEffect, useState } from 'react';

const fieldStyle = { border: '1px solid var(--border)', borderRadius: 6, padding: '9px 11px', fontSize: 13.5, background: 'var(--surface)', color: 'var(--ink)', width: '100%' };

const APPROVAL_BADGE: Record<string, string> = {
    DRAFT: 'ih-b-neutral',
    UNDER_REVIEW: 'ih-b-warning',
    APPROVED: 'ih-b-success',
    RETURNED_FOR_REVISION: 'ih-b-danger',
};

export default function DeanApprovalsPage() {
    const [programs, setPrograms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [returnDraftId, setReturnDraftId] = useState<string | null>(null);
    const [returnNote, setReturnNote] = useState('');
    const [busyId, setBusyId] = useState<string | null>(null);

    function load() {
        setLoading(true);
        fetch('/api/dean/program-approvals', { credentials: 'include' })
            .then(async (res) => {
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || 'Failed to load programme approvals.');
                setPrograms(result.programs || []);
            })
            .catch((err) => setMessage(err.message))
            .finally(() => setLoading(false));
    }

    useEffect(() => { load(); }, []);

    async function decide(programId: string, action: 'approve' | 'return', note?: string) {
        setBusyId(programId);
        setMessage('');
        try {
            const res = await fetch('/api/dean/program-approvals', {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ programId, action, note }),
            });
            const result = await res.json();
            if (res.ok) {
                setMessage(action === 'approve' ? 'Programme approved.' : 'Programme returned for revision.');
                setReturnDraftId(null);
                setReturnNote('');
                load();
            } else {
                setMessage(result.error || 'Failed to record this decision.');
            }
        } catch {
            setMessage('An error occurred.');
        } finally {
            setBusyId(null);
        }
    }

    const pending = programs.filter((p) => p.approvalStatus === 'UNDER_REVIEW');
    const other = programs.filter((p) => p.approvalStatus !== 'UNDER_REVIEW');

    return (
        <div style={{ display: 'grid', gap: 18 }}>
            <section className="ih-card">
                <h2 style={{ margin: '0 0 4px', fontSize: 16 }}>Programme Approvals</h2>
                <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 0, marginBottom: 14 }}>
                    Programmes a Head of Department in your faculty has submitted for review.
                </p>
                {message && <div className="ih-card" style={{ background: 'var(--brand-tint)', padding: '8px 12px', marginBottom: 12, fontSize: 13 }}>{message}</div>}
                {loading ? (
                    <p>Loading…</p>
                ) : pending.length === 0 ? (
                    <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No programmes currently awaiting your review.</p>
                ) : (
                    <div style={{ display: 'grid', gap: 12 }}>
                        {pending.map((p) => (
                            <div key={p.id} className="ih-card" style={{ background: 'var(--surface-2, var(--bg))' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{p.nameEn}</div>
                                        <div className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{p.code} — {p.department?.nameEn}</div>
                                    </div>
                                    <span className={`ih-badge ${APPROVAL_BADGE[p.approvalStatus]}`}>{p.approvalStatus.replace(/_/g, ' ')}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                    <button disabled={busyId === p.id} className="ih-btn ih-btn-primary" onClick={() => decide(p.id, 'approve')}>Approve</button>
                                    <button disabled={busyId === p.id} className="ih-btn ih-btn-secondary" onClick={() => setReturnDraftId(returnDraftId === p.id ? null : p.id)}>Return for Revision</button>
                                </div>
                                {returnDraftId === p.id && (
                                    <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                                        <input style={fieldStyle} placeholder="What needs revision?" value={returnNote} onChange={(e) => setReturnNote(e.target.value)} />
                                        <button disabled={busyId === p.id} className="ih-btn ih-btn-primary" onClick={() => decide(p.id, 'return', returnNote)}>Send</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {other.length > 0 && (
                    <details style={{ marginTop: 16 }}>
                        <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--ink-soft)' }}>Other programmes ({other.length})</summary>
                        <div className="ih-tbl-wrap" style={{ marginTop: 10 }}>
                            <table className="ih-tbl">
                                <thead><tr><th>Programme</th><th>Department</th><th>Approval</th></tr></thead>
                                <tbody>
                                    {other.map((p) => (
                                        <tr key={p.id}>
                                            <td>{p.nameEn} <span className="mono" style={{ color: 'var(--ink-soft)' }}>({p.code})</span></td>
                                            <td>{p.department?.nameEn}</td>
                                            <td><span className={`ih-badge ${APPROVAL_BADGE[p.approvalStatus]}`}>{p.approvalStatus.replace(/_/g, ' ')}</span></td>
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
