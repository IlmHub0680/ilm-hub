'use client';
import { useState } from 'react';
import { useLibraryDash } from '../context';

export default function ActiveLoansPage() {
    const { loans, loading, error, refetch } = useLibraryDash();
    const [message, setMessage] = useState('');
    const [busyId, setBusyId] = useState<string | null>(null);
    const [waiveNoteById, setWaiveNoteById] = useState<Record<string, string>>({});

    const isErrorMessage = (msg: string) => msg.includes('rror') || msg.includes('ailed');

    const handleReturn = async (loanId: string) => {
        setBusyId(loanId);
        setMessage('');
        try {
            const res = await fetch(`/api/library/loans/${loanId}/return`, {
                method: 'POST',
                credentials: 'include',
            });
            const data = await res.json();

            if (res.ok) {
                setMessage('Item marked as returned.');
                refetch();
            } else {
                setMessage(data.error || 'Failed to record return.');
            }
        } catch (err) {
            setMessage('An error occurred.');
        } finally {
            setBusyId(null);
        }
    };

    const handleRenew = async (loanId: string) => {
        setBusyId(loanId);
        setMessage('');
        try {
            const res = await fetch(`/api/library/loans/${loanId}/renew`, {
                method: 'POST',
                credentials: 'include',
            });
            const data = await res.json();

            if (res.ok) {
                setMessage('Loan renewed.');
                refetch();
            } else {
                setMessage(data.error || 'Failed to renew loan.');
            }
        } catch (err) {
            setMessage('An error occurred.');
        } finally {
            setBusyId(null);
        }
    };

    const handleResolveFine = async (loanId: string, action: 'PAID' | 'WAIVED') => {
        const note = waiveNoteById[loanId] || '';
        if (action === 'WAIVED' && !note.trim()) {
            setMessage('A note is required to waive a fine.');
            return;
        }

        setBusyId(loanId);
        setMessage('');
        try {
            const res = await fetch(`/api/library/loans/${loanId}/fine`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, note }),
            });
            const data = await res.json();

            if (res.ok) {
                setMessage(action === 'PAID' ? 'Fine marked as paid.' : 'Fine waived.');
                refetch();
            } else {
                setMessage(data.error || 'Failed to update fine.');
            }
        } catch (err) {
            setMessage('An error occurred.');
        } finally {
            setBusyId(null);
        }
    };

    const MAX_RENEWALS = 2;

    return (
        <>
            {message && (
                <div className="ih-card" style={{ padding: '10px 14px', marginBottom: 20, background: isErrorMessage(message) ? 'var(--danger-tint)' : 'var(--success-tint)', color: isErrorMessage(message) ? 'var(--danger)' : 'var(--success)' }}>
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
            ) : (
                <div className="ih-tbl-wrap">
                    <table className="ih-tbl">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Student</th>
                                <th>Due</th>
                                <th>Status</th>
                                <th>Renewals</th>
                                <th>Fine</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loans.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>No active loans.</td></tr>
                            ) : (
                                loans.map((loan: any) => {
                                    return (
                                        <tr key={loan.id}>
                                            <td>{loan.item}</td>
                                            <td>{loan.studentName}</td>
                                            <td className="mono">{new Date(loan.dueAt).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`ih-badge ${loan.status === 'OVERDUE' ? 'ih-b-danger' : 'ih-b-info'}`}>
                                                    {loan.status}
                                                </span>
                                            </td>
                                            <td className="mono">{loan.renewalCount}/{MAX_RENEWALS}</td>
                                            <td>
                                                {loan.fineStatus === 'UNPAID' ? (
                                                    <span className="ih-badge ih-b-danger">
                                                        ${loan.fineAmountUSD.toFixed(2)} unpaid
                                                    </span>
                                                ) : loan.fineStatus === 'PAID' ? (
                                                    <span className="ih-badge ih-b-success">${loan.fineAmountUSD.toFixed(2)} paid</span>
                                                ) : loan.fineStatus === 'WAIVED' ? (
                                                    <span className="ih-badge ih-b-neutral">Waived</span>
                                                ) : loan.projectedFineUSD > 0 ? (
                                                    <span className="ih-badge ih-b-warning">${loan.projectedFineUSD.toFixed(2)} if overdue</span>
                                                ) : (
                                                    <span style={{ color: 'var(--ink-soft)' }}>—</span>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 160 }}>
                                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                        {loan.status !== 'RETURNED' && (
                                                            <>
                                                                <button onClick={() => handleReturn(loan.id)} disabled={busyId === loan.id} className="ih-btn ih-btn-secondary" style={{ padding: '5px 10px', fontSize: 12 }}>
                                                                    {busyId === loan.id ? '…' : 'Mark Returned'}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRenew(loan.id)}
                                                                    disabled={busyId === loan.id || loan.renewalCount >= MAX_RENEWALS || loan.fineStatus === 'UNPAID'}
                                                                    className="ih-btn ih-btn-ghost"
                                                                    style={{ padding: '5px 10px', fontSize: 12 }}
                                                                    title={loan.renewalCount >= MAX_RENEWALS ? 'Renewal limit reached' : loan.fineStatus === 'UNPAID' ? 'Resolve the unpaid fine first' : ''}
                                                                >
                                                                    Renew
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                    {loan.fineStatus === 'UNPAID' && (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                            <input
                                                                type="text"
                                                                placeholder="Waive note…"
                                                                value={waiveNoteById[loan.id] || ''}
                                                                onChange={(e) => setWaiveNoteById({ ...waiveNoteById, [loan.id]: e.target.value })}
                                                                style={{ border: '1px solid var(--border)', borderRadius: 5, padding: '4px 7px', fontSize: 12, background: 'var(--surface)', color: 'var(--ink)' }}
                                                            />
                                                            <div style={{ display: 'flex', gap: 6 }}>
                                                                <button onClick={() => handleResolveFine(loan.id, 'PAID')} disabled={busyId === loan.id} className="ih-btn ih-btn-primary" style={{ padding: '4px 9px', fontSize: 12 }}>
                                                                    Mark Paid
                                                                </button>
                                                                <button onClick={() => handleResolveFine(loan.id, 'WAIVED')} disabled={busyId === loan.id} className="ih-btn ih-btn-ghost" style={{ padding: '4px 9px', fontSize: 12 }}>
                                                                    Waive
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
