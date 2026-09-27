export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function AdminLibraryOversight() {
  const user = await getCurrentUser();

  if (!user) redirect('/staff-login');
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') redirect('/staff-login');

  const [items, loans, digitalStats] = await Promise.all([
    prisma.libraryItem.count(),
    prisma.libraryLoan.findMany({
      where: { status: { in: ['BORROWED', 'OVERDUE'] } },
      include: {
        item: { select: { title: true } },
        student: { include: { user: { select: { name: true } } } },
      },
      orderBy: { dueAt: 'asc' },
      take: 100,
    }),
    Promise.all([
      prisma.instituteLibraryResource.count(),
      prisma.instituteLibraryResource.count({ where: { isPublished: true } }),
      prisma.instituteLibraryResource.count({ where: { isPublished: true, visibility: 'PUBLIC' } }),
    ]).then(([total, published, publicTier]) => ({ total, published, publicTier })),
  ]);

  return (
    <main style={page}>
      <div style={container}>
        <Link href="/admin" style={backLink}>← Back to Admin Overview</Link>

        <h1 style={heading}>Library — Oversight View</h1>

        <p style={muted}>
          Read-only. Catalogue and loan management is handled by Library staff at their own dashboard.
        </p>

        <p style={muted}>
          Total catalogue items: <strong>{items}</strong>
        </p>

        <div className="ih-tbl-wrap" style={{ marginTop: 20 }}>
          <table className="ih-tbl">
            <thead>
              <tr>
                <th>Item</th>
                <th>Borrower</th>
                <th>Due</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {loans.length === 0 ? (
                <tr>
                  <td style={{ textAlign: 'center', color: 'var(--ink-soft)' }} colSpan={4}>
                    No active loans.
                  </td>
                </tr>
              ) : (
                loans.map((loan) => (
                  <tr key={loan.id}>
                    <td>{loan.item.title}</td>
                    <td>{loan.student.user.name}</td>
                    <td className="mono">{new Date(loan.dueAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`ih-badge ${loan.status === 'OVERDUE' ? 'ih-b-danger' : 'ih-b-info'}`}>
                        {loan.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <h2 style={{ ...heading, fontSize: '22px', marginTop: 40 }}>Digital Library — Oversight View</h2>

        <p style={muted}>
          Read-only. The institute's e-books, articles, fatwas, research
          papers, manuscripts and other digital resources are managed by
          Library staff at their own dashboard's Digital Library section.
          Deliberately separate from the platform owner's own personal
          Library (Personal Management, a different system entirely).
        </p>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 12 }}>
          <p style={muted}>
            Total resources: <strong>{digitalStats.total}</strong>
          </p>
          <p style={muted}>
            Published: <strong>{digitalStats.published}</strong>
          </p>
          <p style={muted}>
            Public tier: <strong>{digitalStats.publicTier}</strong>
          </p>
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
