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

export default async function AdminAcademicRecordsOversight() {
  const user = await getCurrentUser();
  if (!user) redirect('/staff-login');
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') redirect('/staff-login');

  const requests = await prisma.request.findMany({
    where: { type: 'TRANSCRIPT' },
    include: {
      student: { include: { user: { select: { name: true } } } },
      transcriptIssue: { select: { cumulative: true, issuedAt: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const badgeClass = (status) =>
    status === 'SUBMITTED' ? 'ih-b-info'
    : status === 'UNDER_REVIEW' ? 'ih-b-warning'
    : status === 'COMPLETED' ? 'ih-b-success'
    : status === 'REJECTED' ? 'ih-b-danger'
    : 'ih-b-neutral';

  return (
    <section>
      <header style={oversightHeader}>
        <h1 style={oversightHeading}>Academic Records — Oversight View</h1>
        <p style={oversightSubtitle}>Transcript requests are actioned by Academic Records staff at their own dashboard.</p>
        <span style={oversightPageBadge}>🔒 Read-only oversight</span>
      </header>

      <div className="ih-tbl-wrap" style={oversightTableCard}>
          <table className="ih-tbl">
            <thead>
              <tr>
                <th>Student</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Cumulative GPA</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr><td style={{ textAlign: 'center', color: 'var(--ink-soft)' }} colSpan={4}>No transcript requests yet.</td></tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id}>
                    <td>{r.student.user.name}</td>
                    <td className="mono">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`ih-badge ${badgeClass(r.status)}`}>
                        {r.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="mono">{r.transcriptIssue ? r.transcriptIssue.cumulative : '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
    </section>
  );
}
