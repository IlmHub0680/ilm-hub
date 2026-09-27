'use client';
import { useEffect, useState, useCallback } from 'react';

type OverdueFee = {
    id: string;
    studentName: string;
    studentEmail: string;
    feeType: string;
    balanceUSD: number;
    status: string;
    dueDate: string | null;
    term: string | null;
};

type OrderNeedingVerification = {
    id: string;
    orderNumber: string;
    buyerName: string;
    buyerEmail: string;
    totalUSD: number;
    status: string;
    createdAt: string;
};

type RefundRequestRow = {
    id: string;
    orderNumber: string;
    requestedByName: string;
    requestedByEmail: string;
    amountUSD: number;
    reason: string;
    createdAt: string;
};

type QueueData = {
    overdueFees: OverdueFee[];
    overdueFeeCount: number;
    pendingFeeCount: number;
    ordersNeedingVerification: OrderNeedingVerification[];
    ordersNeedingVerificationCount: number;
    paymentsUnderVerificationCount: number;
    refundRequests: RefundRequestRow[];
    refundRequestCount: number;
};

export default function FinanceQueuePage() {
    const [data, setData] = useState<QueueData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [resolvingId, setResolvingId] = useState<string | null>(null);
    const [verifyingId, setVerifyingId] = useState<string | null>(null);
    const [message, setMessage] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/finance/queue', { credentials: 'include' });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Failed to load the finance work queue.');
            setData(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const resolveRefund = async (id: string, status: 'APPROVED' | 'REJECTED' | 'PROCESSED') => {
        setResolvingId(id);
        setMessage('');
        try {
            const res = await fetch(`/api/finance/refund-requests/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            const result = await res.json();
            if (res.ok) {
                setMessage(`Refund request ${status.toLowerCase()}.`);
                load();
            } else {
                setMessage(result.error || 'Failed to update refund request.');
            }
        } catch (err) {
            setMessage('An error occurred.');
        } finally {
            setResolvingId(null);
        }
    };

    const verifyPayment = async (id: string) => {
        setVerifyingId(id);
        setMessage('');
        try {
            const res = await fetch(`/api/finance/orders/${id}/verify-payment`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            const result = await res.json();
            if (res.ok) {
                setMessage('Payment verified.');
                load();
            } else {
                setMessage(result.error || 'Failed to verify payment.');
            }
        } catch (err) {
            setMessage('An error occurred.');
        } finally {
            setVerifyingId(null);
        }
    };

    return (
        <>
            <h2 style={{ margin: '0 0 4px 0', fontSize: 20 }}>Finance Work Queue</h2>
            <p style={{ color: 'var(--ink-soft)', margin: '0 0 20px 0', fontSize: 14 }}>
                Everything that needs Finance's attention right now — overdue fees, payments awaiting
                verification, and open refund requests.
            </p>

            {message && (
                <div className="ih-card" style={{ padding: '10px 14px', marginBottom: 20, background: 'var(--success-tint)', color: 'var(--success)' }}>
                    {message}
                </div>
            )}

            {loading && <div className="ih-card">Loading the work queue…</div>}
            {error && (
                <div className="ih-card" style={{ background: 'var(--danger-tint)', color: 'var(--danger)', border: '1px solid var(--danger)', marginBottom: 20 }}>
                    {error}
                </div>
            )}

            {data && (
                <>
                    <div className="ih-stat-grid" style={{ marginBottom: 28 }}>
                        <div className="ih-stat-tile"><div className="n">{data.overdueFeeCount}</div><div className="l">Overdue Fees</div></div>
                        <div className="ih-stat-tile"><div className="n">{data.pendingFeeCount}</div><div className="l">Pending / Partial Fees</div></div>
                        <div className="ih-stat-tile"><div className="n">{data.ordersNeedingVerificationCount}</div><div className="l">Orders Awaiting Verification</div></div>
                        <div className="ih-stat-tile accent"><div className="n">{data.refundRequestCount}</div><div className="l">Open Refund Requests</div></div>
                    </div>

                    <h3 style={{ margin: '0 0 12px 0', fontSize: 16 }}>Overdue Student Fees</h3>
                    {data.overdueFees.length === 0 ? (
                        <p className="sub" style={{ marginBottom: 24 }}>No overdue fees right now.</p>
                    ) : (
                        <div className="ih-card" style={{ padding: 0, marginBottom: 28, overflowX: 'auto' }}>
                            <table className="ih-tbl">
                                <thead>
                                    <tr><th>Student</th><th>Fee Type</th><th>Term</th><th>Balance</th><th>Due Date</th></tr>
                                </thead>
                                <tbody>
                                    {data.overdueFees.map((f) => (
                                        <tr key={f.id}>
                                            <td>{f.studentName}<br /><span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{f.studentEmail}</span></td>
                                            <td>{f.feeType}</td>
                                            <td>{f.term || '—'}</td>
                                            <td>${f.balanceUSD.toFixed(2)}</td>
                                            <td>{f.dueDate ? new Date(f.dueDate).toLocaleDateString() : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <h3 style={{ margin: '0 0 12px 0', fontSize: 16 }}>Orders Awaiting Payment Verification</h3>
                    {data.ordersNeedingVerification.length === 0 ? (
                        <p className="sub" style={{ marginBottom: 24 }}>No orders currently need verification.</p>
                    ) : (
                        <div className="ih-card" style={{ padding: 0, marginBottom: 28, overflowX: 'auto' }}>
                            <table className="ih-tbl">
                                <thead>
                                    <tr><th>Order #</th><th>Buyer</th><th>Total</th><th>Status</th><th>Submitted</th><th>Action</th></tr>
                                </thead>
                                <tbody>
                                    {data.ordersNeedingVerification.map((o) => (
                                        <tr key={o.id}>
                                            <td>{o.orderNumber}</td>
                                            <td>{o.buyerName}<br /><span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{o.buyerEmail}</span></td>
                                            <td>${Number(o.totalUSD).toFixed(2)}</td>
                                            <td><span className="ih-badge ih-b-warning">{o.status}</span></td>
                                            <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <button
                                                    className="ih-btn ih-btn-primary"
                                                    disabled={verifyingId === o.id}
                                                    onClick={() => verifyPayment(o.id)}
                                                >
                                                    {verifyingId === o.id ? 'Verifying…' : 'Verify Payment'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <h3 style={{ margin: '0 0 12px 0', fontSize: 16 }}>Open Refund Requests</h3>
                    {data.refundRequests.length === 0 ? (
                        <p className="sub">No open refund requests.</p>
                    ) : (
                        <div style={{ display: 'grid', gap: 12 }}>
                            {data.refundRequests.map((r) => (
                                <div key={r.id} className="ih-card" style={{ borderLeft: '4px solid var(--warning, #b8860b)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                                        <div>
                                            <strong>Order {r.orderNumber}</strong> — ${Number(r.amountUSD).toFixed(2)}
                                            <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>
                                                Requested by {r.requestedByName} ({r.requestedByEmail})
                                            </div>
                                            <div style={{ fontSize: 13, marginTop: 6 }}>{r.reason}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-start', flexWrap: 'wrap' }}>
                                            <button
                                                className="ih-btn ih-btn-primary"
                                                disabled={resolvingId === r.id}
                                                onClick={() => resolveRefund(r.id, 'APPROVED')}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="ih-btn ih-btn-ghost"
                                                disabled={resolvingId === r.id}
                                                onClick={() => resolveRefund(r.id, 'REJECTED')}
                                            >
                                                Reject
                                            </button>
                                            <button
                                                className="ih-btn ih-btn-ghost"
                                                disabled={resolvingId === r.id}
                                                onClick={() => resolveRefund(r.id, 'PROCESSED')}
                                            >
                                                Mark Processed
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </>
    );
}
