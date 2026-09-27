export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function AdminAdmissionsOversight() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/staff-login');
  }

  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    redirect('/staff-login');
  }

  const applications = await prisma.admissionApplication.findMany({
    include: {
      payment: {
        select: { status: true, amount: true, currencyCode: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const badgeClass = (status) =>
    status === 'PENDING_PAYMENT' ? 'ih-b-warning'
    : status === 'PAID' ? 'ih-b-info'
    : status === 'UNDER_REVIEW' ? 'ih-b-warning'
    : status === 'INITIAL_ACCEPTANCE' ? 'ih-b-warning'
    : status === 'PENDING_FINAL_APPROVAL' ? 'ih-b-warning'
    : status === 'APPROVED' ? 'ih-b-success'
    : status === 'REJECTED' ? 'ih-b-danger'
    : 'ih-b-neutral';

  const STATUS_LABELS = {
    PENDING_PAYMENT: 'Pending Payment',
    PAID: 'Paid',
    UNDER_REVIEW: 'Under Review',
    INITIAL_ACCEPTANCE: 'Initial Acceptance',
    PENDING_FINAL_APPROVAL: 'Pending Final Approval',
    APPROVED: 'Approved',
    REJECTED: 'Declined',
  };

  return (
    <main style={page}>
      <div style={container}>
        <Link href="/admin" style={backLink}>
          ← Back to Admin Overview
        </Link>

        <h1 style={heading}>Admissions — Oversight View</h1>
        <p style={muted}>
          Open an application to review its full details, documents and
          make an admission decision.
        </p>

        <div className="ih-tbl-wrap">
          <table className="ih-tbl">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Application #</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td style={{ textAlign: 'center', color: 'var(--ink-soft)' }} colSpan={6}>
                    No admission applications yet.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{app.fullName}</div>
                      <div style={{ color: 'var(--ink-soft)', fontSize: '12px' }}>{app.email}</div>
                    </td>
                    <td className="mono">{app.applicationNumber}</td>
                    <td>
                      {app.payment
                        ? `${app.payment.status} — ${app.payment.currencyCode} ${app.payment.amount}`
                        : 'No payment'}
                    </td>
                    <td>
                      <span className={`ih-badge ${badgeClass(app.status)}`}>
                        {STATUS_LABELS[app.status] || app.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="mono">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link href={`/admin/admissions/${app.id}`} style={{ color: 'var(--brand)', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

const page = {
  minHeight: '100vh',
  background: 'var(--paper)',
  padding: '40px 20px',
  fontFamily: 'var(--font-body)',
  color: 'var(--ink)',
};

const container = {
  maxWidth: '1100px',
  margin: '0 auto',
};

const backLink = {
  color: 'var(--brand)',
  textDecoration: 'none',
  fontWeight: 700,
  fontSize: '14px',
};

const heading = {
  color: 'var(--ink)',
  fontFamily: 'var(--font-display)',
  fontSize: '28px',
  margin: '20px 0 6px',
};

const muted = {
  color: 'var(--ink-soft)',
  fontSize: '14px',
  marginBottom: '24px',
};
