export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getGraduateSupportStatusLabel, getGraduateSupportTopicLabel } from '@/lib/graduateAssistance';

const STATUS_BADGE = {
  SUBMITTED: 'ih-b-info',
  UNDER_REVIEW: 'ih-b-warning',
  APPROVED: 'ih-b-success',
  REJECTED: 'ih-b-danger',
  COMPLETED: 'ih-b-neutral',
};

export default async function AdminGraduateSupportOversight() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/staff-login');
  }

  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    redirect('/staff-login');
  }

  const requests = await prisma.request.findMany({
    where: { type: 'GRADUATE_SUPPORT' },
    include: {
      student: { include: { user: { select: { name: true, email: true } } } },
      assignedStaff: { include: { user: { select: { name: true } } } },
      assignedUnit: { select: { nameEn: true } },
      recipientDepartment: { select: { nameEn: true } },
    },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  });

  return (
    <main style={page}>
      <div style={container}>
        <Link href="/admin" style={backLink}>
          ← Back to Admin Overview
        </Link>

        <h1 style={heading}>Graduate Assistant Requests — Oversight View</h1>
        <p style={muted}>
          Read-only. Post-graduation support requests are reviewed, responded to, transferred, and
          closed by Student Affairs staff at their own dashboard.
        </p>

        <div className="ih-tbl-wrap">
          <table className="ih-tbl">
            <thead>
              <tr>
                <th>Student</th>
                <th>Topic</th>
                <th>Submitted</th>
                <th>Assigned To</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td style={{ textAlign: 'center', color: 'var(--ink-soft)' }} colSpan={5}>
                    No graduate support requests yet.
                  </td>
                </tr>
              ) : (
                requests.map((r) => {
                  const recipientLabel = r.assignedUnit?.nameEn || r.recipientDepartment?.nameEn || '—';

                  return (
                    <tr key={r.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{r.student.user.name}</div>
                        <div style={{ color: 'var(--ink-soft)', fontSize: '12px' }}>
                          {r.student.studentNo}
                        </div>
                      </td>
                      <td>
                        {r.topic ? getGraduateSupportTopicLabel(r.topic) : '—'}
                        <div style={{ color: 'var(--ink-soft)', fontSize: '12px' }}>
                          To: {recipientLabel}
                        </div>
                      </td>
                      <td className="mono">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td>{r.assignedStaff?.user.name ?? '—'}</td>
                      <td>
                        <span className={`ih-badge ${STATUS_BADGE[r.status] || 'ih-b-neutral'}`}>
                          {getGraduateSupportStatusLabel(r.status)}
                        </span>
                      </td>
                    </tr>
                  );
                })
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
