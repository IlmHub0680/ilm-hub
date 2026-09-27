export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function AdminICTOversight() {
  const user = await getCurrentUser();

  if (!user) redirect('/staff-login');
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') redirect('/staff-login');

  const tickets = await prisma.iCTTicket.findMany({
    include: {
      raisedBy: { select: { name: true } },
      assignedStaff: {
        include: {
          user: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const badgeClass = (status: string) =>
    status === 'OPEN' ? 'ih-b-warning'
    : status === 'IN_PROGRESS' ? 'ih-b-info'
    : status === 'RESOLVED' ? 'ih-b-success'
    : status === 'CLOSED' ? 'ih-b-neutral'
    : 'ih-b-neutral';

  return (
    <main style={page}>
      <div style={container}>
        <Link href="/admin" style={backLink}>← Back to Admin Overview</Link>

        <h1 style={heading}>IT Support — Oversight View</h1>

        <p style={muted}>
          Read-only. Ticket handling is managed by ICT staff at their own dashboard.
        </p>

        <div className="ih-tbl-wrap" style={{ marginTop: 20 }}>
          <table className="ih-tbl">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Raised By</th>
                <th>Assigned To</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td style={{ textAlign: 'center', color: 'var(--ink-soft)' }} colSpan={4}>
                    No tickets yet.
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t.id}>
                    <td>{t.subject}</td>
                    <td>{t.raisedBy.name}</td>
                    <td>{t.assignedStaff?.user?.name ?? '—'}</td>
                    <td>
                      <span className={`ih-badge ${badgeClass(t.status)}`}>
                        {t.status.replace(/_/g, ' ')}
                      </span>
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
  marginBottom: '10px',
};
