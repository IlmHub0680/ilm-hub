'use client';
import { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';

type Application = {
    id: string;
    applicationNumber: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    status: string;
    payment: {
        status: string;
        amount: string;
        currencyCode: string;
        paidAt: string | null;
    } | null;
    createdAt: string;
};

const STATUS_BADGE: Record<string, string> = {
    PENDING_PAYMENT: 'ih-b-warning',
    PAID: 'ih-b-info',
    UNDER_REVIEW: 'ih-b-warning',
    INITIAL_ACCEPTANCE: 'ih-b-warning',
    PENDING_FINAL_APPROVAL: 'ih-b-warning',
    APPROVED: 'ih-b-success',
    REJECTED: 'ih-b-danger',
};

// Initial Acceptance / Pending Final Approval are intentionally NOT
// final -- mirrors the labels already shown on /admin/admissions and
// the applicant-facing tracker, so staff and applicants see the same
// wording for the same status everywhere in the app.
const STATUS_LABELS: Record<string, string> = {
    PENDING_PAYMENT: 'Pending Payment',
    PAID: 'Paid',
    UNDER_REVIEW: 'Under Review',
    INITIAL_ACCEPTANCE: 'Initial Acceptance',
    PENDING_FINAL_APPROVAL: 'Pending Final Approval',
    APPROVED: 'Approved',
    REJECTED: 'Declined',
};

const NAV_ITEMS = [
    { href: '/registry-dashboard', label: 'Admission Applications', icon: '📥' },
    { href: '/registry-dashboard/fees', label: 'Application Fee Settings', icon: '💵' },
];

export default function RegistryDashboard() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');
    const [actioningId, setActioningId] = useState<string | null>(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchApplications();
    }, [statusFilter]);

    const fetchApplications = async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.set('status', statusFilter);
            if (search) params.set('search', search);

            const res = await fetch(`/api/admin/admissions?${params.toString()}`, {
                credentials: 'include',
            });
            const data = await res.json();

            if (data.success) {
                setApplications(data.data || []);
            } else {
                setError(data.error || 'Failed to load applications.');
            }
        } catch (err) {
            setError('An error occurred while loading applications.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchApplications();
    };

    const handleMoveToReview = async (id: string) => {
        setActioningId(id);
        setMessage('');
        try {
            const res = await fetch(`/api/admin/admissions/${id}/review`, {
                method: 'POST',
                credentials: 'include',
            });
            const data = await res.json();

            if (data.success) {
                setMessage('Application moved to review.');
                fetchApplications();
            } else {
                setMessage(data.error || 'Failed to move to review.');
            }
        } catch (err) {
            setMessage('An error occurred.');
        } finally {
            setActioningId(null);
        }
    };

    const handleMoveToInitialAcceptance = async (id: string) => {
        setActioningId(id);
        setMessage('');
        try {
            const res = await fetch(`/api/admin/admissions/${id}/initial-acceptance`, {
                method: 'POST',
                credentials: 'include',
            });
            const data = await res.json();

            if (data.success) {
                setMessage('Application moved to Initial Acceptance (not yet final).');
                fetchApplications();
            } else {
                setMessage(data.error || 'Failed to move to Initial Acceptance.');
            }
        } catch (err) {
            setMessage('An error occurred.');
        } finally {
            setActioningId(null);
        }
    };

    const handleMoveToPendingFinalApproval = async (id: string) => {
        setActioningId(id);
        setMessage('');
        try {
            const res = await fetch(`/api/admin/admissions/${id}/pending-final-approval`, {
                method: 'POST',
                credentials: 'include',
            });
            const data = await res.json();

            if (data.success) {
                setMessage('Application moved to Pending Final Approval (not yet final).');
                fetchApplications();
            } else {
                setMessage(data.error || 'Failed to move to Pending Final Approval.');
            }
        } catch (err) {
            setMessage('An error occurred.');
        } finally {
            setActioningId(null);
        }
    };

    const isErrorMessage = message.includes('rror') || message.includes('ailed');

    return (
        <DashboardShell
            brandSub="Registry / Admissions"
            brandIcon="📥"
            navItems={NAV_ITEMS}
            activeId="applications"
            title="Admission Applications"
            subtitle="Review payments, move applications to review, and record admission decisions."
        >
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

            <section id="applications">
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '9px 11px', fontSize: 13.5, background: 'var(--surface)', color: 'var(--ink)' }}
                    >
                        <option value="">All Statuses</option>
                        <option value="PENDING_PAYMENT">Pending Payment</option>
                        <option value="PAID">Paid</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="INITIAL_ACCEPTANCE">Initial Acceptance</option>
                        <option value="PENDING_FINAL_APPROVAL">Pending Final Approval</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Declined</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Search name, email, application #…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '9px 11px', fontSize: 13.5, flex: 1, minWidth: 240, background: 'var(--surface)', color: 'var(--ink)' }}
                    />
                    <button type="submit" className="ih-btn ih-btn-primary">
                        Search
                    </button>
                </form>

                {loading ? (
                    <div className="ih-card" style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>Loading applications…</div>
                ) : (
                    <div className="ih-tbl-wrap">
                        <table className="ih-tbl">
                            <thead>
                                <tr>
                                    <th>Applicant</th>
                                    <th>Application #</th>
                                    <th>Payment</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>
                                            No applications found.
                                        </td>
                                    </tr>
                                ) : (
                                    applications.map((app) => (
                                        <tr key={app.id}>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{app.fullName}</div>
                                                <div style={{ color: 'var(--ink-soft)', fontSize: 12 }}>{app.email}</div>
                                            </td>
                                            <td className="mono">{app.applicationNumber}</td>
                                            <td>
                                                {app.payment ? `${app.payment.status} — ${app.payment.currencyCode} ${app.payment.amount}` : 'No payment'}
                                            </td>
                                            <td>
                                                <span className={`ih-badge ${STATUS_BADGE[app.status] || 'ih-b-neutral'}`}>
                                                    {STATUS_LABELS[app.status] || app.status.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                    {app.status === 'PAID' && (
                                                        <button
                                                            onClick={() => handleMoveToReview(app.id)}
                                                            disabled={actioningId === app.id}
                                                            className="ih-btn ih-btn-secondary"
                                                            style={{ padding: '6px 12px', fontSize: 12 }}
                                                        >
                                                            Move to Review
                                                        </button>
                                                    )}
                                                    {app.status === 'UNDER_REVIEW' && (
                                                        <button
                                                            onClick={() => handleMoveToInitialAcceptance(app.id)}
                                                            disabled={actioningId === app.id}
                                                            className="ih-btn ih-btn-secondary"
                                                            style={{ padding: '6px 12px', fontSize: 12 }}
                                                        >
                                                            Move to Initial Acceptance
                                                        </button>
                                                    )}
                                                    {app.status === 'INITIAL_ACCEPTANCE' && (
                                                        <button
                                                            onClick={() => handleMoveToPendingFinalApproval(app.id)}
                                                            disabled={actioningId === app.id}
                                                            className="ih-btn ih-btn-secondary"
                                                            style={{ padding: '6px 12px', fontSize: 12 }}
                                                        >
                                                            Move to Pending Final Approval
                                                        </button>
                                                    )}
                                                    {['UNDER_REVIEW', 'INITIAL_ACCEPTANCE', 'PENDING_FINAL_APPROVAL'].includes(app.status) && (
                                                        <a
                                                            href={`/admin/admissions/${app.id}`}
                                                            className="ih-btn ih-btn-primary"
                                                            style={{ padding: '6px 12px', fontSize: 12, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                                                        >
                                                            Review &amp; Decide →
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </DashboardShell>
    );
}
