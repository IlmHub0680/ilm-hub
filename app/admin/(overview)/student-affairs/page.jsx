export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  oversightHeader,
  oversightHeading,
  oversightPageBadge,
  oversightSubtitle,
  oversightTableCard,
} from '../_shared';

export default async function AdminStudentAffairsOversight() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/staff-login');
  }

  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    redirect('/staff-login');
  }

  const requests = await prisma.request.findMany({
    include: {
      student: {
        include: { user: { select: { name: true, email: true } } },
      },
      assignedStaff: {
        include: { user: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const badgeClass = (status) =>
    status === 'SUBMITTED' ? 'ih-b-info'
    : status === 'UNDER_REVIEW' ? 'ih-b-warning'
    : status === 'APPROVED' ? 'ih-b-success'
    : status === 'REJECTED' ? 'ih-b-danger'
    : status === 'COMPLETED' ? 'ih-b-neutral'
    : 'ih-b-neutral';

  return (
    <section>
      <header style={oversightHeader}>
        <h1 style={oversightHeading}>Student Affairs — Oversight View</h1>
        <p style={oversightSubtitle}>Student requests are reviewed and actioned by Student Affairs staff at their own dashboard.</p>
        <span style={oversightPageBadge}>🔒 Read-only oversight</span>
      </header>

      <div className="ih-tbl-wrap" style={oversightTableCard}>
          <table className="ih-tbl">
            <thead>
              <tr>
                <th>Student</th>
                <th>Type</th>
                <th>Submitted</th>
                <th>Assigned To</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td style={{ textAlign: 'center', color: 'var(--ink-soft)' }} colSpan={5}>
                    No student requests yet.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.student.user.name}</div>
                      <div style={{ color: 'var(--ink-soft)', fontSize: '12px' }}>
                        {r.student.studentNo}
                      </div>
                    </td>
                    <td>{r.type.replace(/_/g, ' ')}</td>
                    <td className="mono">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>{r.assignedStaff?.user.name ?? '—'}</td>
                    <td>
                      <span className={`ih-badge ${badgeClass(r.status)}`}>
                        {r.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
    </section>
  );
}
