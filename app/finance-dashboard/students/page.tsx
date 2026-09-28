'use client';
import { useState } from 'react';
import { useFinance } from '../context';
import { STATUS_BADGE } from '../types';

export default function StudentsFeesPage() {
    const { students, loading, error, refetch } = useFinance();
    const [paymentInputs, setPaymentInputs] = useState<Record<string, string>>({});
    const [payingId, setPayingId] = useState<string | null>(null);
    const [message, setMessage] = useState('');

    const isErrorMessage = message.includes('rror') || message.includes('ailed') || message.toLowerCase().includes('enter');

    const handleRecordPayment = async (feeId: string) => {
        const amount = Number(paymentInputs[feeId]);
        if (!amount || amount <= 0) {
            setMessage('Enter a valid payment amount.');
            return;
        }

        setPayingId(feeId);
        setMessage('');
        try {
            const res = await fetch(`/api/finance/fees/${feeId}/payment`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentUSD: amount }),
            });
            const data = await res.json();

            if (res.ok) {
                setMessage('Payment recorded.');
                setPaymentInputs((prev) => ({ ...prev, [feeId]: '' }));
                refetch();
            } else {
                setMessage(data.error || 'Failed to record payment.');
            }
        } catch (err) {
            setMessage('An error occurred.');
        } finally {
            setPayingId(null);
        }
    };

    return (
        <>
            <h2 style={{ margin: '0 0 4px 0', fontSize: 20 }}>Students & Fees</h2>
            <p style={{ color: 'var(--ink-soft)', margin: '0 0 20px 0', fontSize: 14 }}>
                Every student's fee records and payment history.
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
                <div className="ih-card" style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>Loading students…</div>
            ) : (
                students.map((student) => (
                    <div key={student.id} className="ih-card" style={{ marginBottom: 16 }}>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: 16 }}>
                            {student.name} ({student.studentNo})
                        </h3>
                        <p style={{ color: 'var(--ink-soft)', margin: '0 0 12px 0', fontSize: 13 }}>
                            {student.program || 'No programme'} · {student.email}
                        </p>

                        {student.fees.length === 0 ? (
                            <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No fee records yet.</p>
                        ) : (
                            <div className="ih-tbl-wrap">
                                <table className="ih-tbl">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Term</th>
                                            <th>Amount</th>
                                            <th>Paid</th>
                                            <th>Balance</th>
                                            <th>Status</th>
                                            <th>Record Payment</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {student.fees.map((fee) => (
                                            <tr key={fee.id}>
                                                <td>{fee.feeType}</td>
                                                <td>{fee.term || '—'}</td>
                                                <td className="mono">${fee.amountUSD.toFixed(2)}</td>
                                                <td className="mono">${fee.paidUSD.toFixed(2)}</td>
                                                <td className="mono" style={{ fontWeight: 600, color: 'var(--ink)' }}>${fee.balanceUSD.toFixed(2)}</td>
                                                <td>
                                                    <span className={`ih-badge ${STATUS_BADGE[fee.status] || 'ih-b-neutral'}`}>
                                                        {fee.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {fee.status !== 'PAID' && (
                                                        <div style={{ display: 'flex', gap: 6 }}>
                                                            <input
                                                                type="number"
                                                                placeholder="Amount"
                                                                value={paymentInputs[fee.id] || ''}
                                                                onChange={(e) => setPaymentInputs((prev) => ({ ...prev, [fee.id]: e.target.value }))}
                                                                style={{ width: 80, border: '1px solid var(--border)', borderRadius: 6, padding: '4px 6px', background: 'var(--surface)', color: 'var(--ink)' }}
                                                            />
                                                            <button
                                                                onClick={() => handleRecordPayment(fee.id)}
                                                                disabled={payingId === fee.id}
                                                                className="ih-btn ih-btn-primary"
                                                                style={{ padding: '4px 10px', fontSize: 11 }}
                                                            >
                                                                {payingId === fee.id ? '…' : 'Pay'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))
            )}
        </>
    );
}
