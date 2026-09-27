export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    <main style={page}>
      <div style={container}>
        <Link href="/admin" style={backLink}>← Back to Admin Overview</Link>
        <h1 style={heading}>Academic Records — Oversight View</h1>
        <p style={muted}>Read-only. Transcript requests are actioned by Academic Records staff at their own dashboard.</p>

        <div className="ih-tbl-wrap">
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
      </div>
    </main>
  );
}

const page = { minHeight: '100vh', background: 'var(--paper)', padding: '40px 20px', fontFamily: 'var(--font-body)', color: 'var(--ink)' };
const container = { maxWidth: '1100px', margin: '0 auto' };
const backLink = { color: 'var(--brand)', textDecoration: 'none', fontWeight: 700, fontSize: '14px' };
const heading = { color: 'var(--ink)', fontFamily: 'var(--font-display)', fontSize: '28px', margin: '20px 0 6px' };
const muted = { color: 'var(--ink-soft)', fontSize: '14px', marginBottom: '24px' };
