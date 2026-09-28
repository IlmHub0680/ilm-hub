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

export default async function AdminQAOversight() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/staff-login');
  }

  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    redirect('/staff-login');
  }

  const reviews = await prisma.qualityReview.findMany({
    include: {
      program: { select: { nameEn: true } },
      course: { select: { titleEn: true } },
      department: { select: { nameEn: true } },
      faculty: { select: { nameEn: true } },
      reviewedBy: { include: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const statusBadge = (status) =>
    status === 'SCHEDULED' ? 'ih-b-info'
    : status === 'IN_PROGRESS' ? 'ih-b-warning'
    : status === 'COMPLETED' ? 'ih-b-success'
    : 'ih-b-neutral';

  const outcomeBadge = (outcome) =>
    outcome === 'COMPLIANT' ? 'ih-b-success'
    : outcome === 'MINOR_NON_COMPLIANCE' ? 'ih-b-warning'
    : outcome === 'MAJOR_NON_COMPLIANCE' ? 'ih-b-danger'
    : 'ih-b-neutral';

  return (
    <section>
      <header style={oversightHeader}>
        <h1 style={oversightHeading}>Quality Assurance — Oversight View</h1>
        <p style={oversightSubtitle}>Reviews are scheduled and actioned by Quality Assurance staff at their own dashboard.</p>
        <span style={oversightPageBadge}>🔒 Read-only oversight</span>
      </header>

      <div className="ih-tbl-wrap" style={oversightTableCard}>
          <table className="ih-tbl">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Review Type</th>
                <th>Reviewer</th>
                <th>Scheduled</th>
                <th>Status</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr>
                  <td style={{ textAlign: 'center', color: 'var(--ink-soft)' }} colSpan={6}>
                    No quality reviews yet.
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {r.program?.nameEn ||
                          r.course?.titleEn ||
                          r.department?.nameEn ||
                          r.faculty?.nameEn ||
                          'Unknown'}
                      </div>
                      <div style={{ color: 'var(--ink-soft)', fontSize: '12px' }}>
                        {r.subjectType}
                      </div>
                    </td>
                    <td>{r.reviewType}</td>
                    <td>{r.reviewedBy.user.name}</td>
                    <td className="mono">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`ih-badge ${statusBadge(r.status)}`}>
                        {r.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      {r.outcome ? (
                        <span className={`ih-badge ${outcomeBadge(r.outcome)}`}>
                          {r.outcome.replace(/_/g, ' ')}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--ink-soft)' }}>—</span>
                      )}
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
