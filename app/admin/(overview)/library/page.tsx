export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  oversightHeader,
  oversightHeading,
  oversightPageBadge,
  oversightSubtitle,
  oversightSectionHeading,
  oversightTableCard,
  overviewStatGrid,
  overviewStatTileStyle,
  overviewStatValue,
  overviewStatLabel,
} from '../_shared';
import type { CSSProperties } from 'react';

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

  const activeCount = loans.filter((l) => l.status === 'BORROWED').length;
  const overdueCount = loans.filter((l) => l.status === 'OVERDUE').length;

  return (
    <section>
      <header style={oversightHeader}>
        <h1 style={oversightHeading}>Library</h1>
        <p style={oversightSubtitle}>
          Catalogue and loan management is handled by Library staff at their own dashboard.
        </p>
        <span style={oversightPageBadge}>🔒 Read-only oversight</span>
      </header>

      <div style={{ ...overviewStatGrid, marginBottom: 28 }}>
        <div style={(overviewStatTileStyle('brand') as CSSProperties)}>
          <div style={overviewStatValue}>{items}</div>
          <div style={overviewStatLabel}>Catalogue Items</div>
        </div>
        <div style={(overviewStatTileStyle('gold') as CSSProperties)}>
          <div style={overviewStatValue}>{activeCount}</div>
          <div style={overviewStatLabel}>Active Loans</div>
        </div>
        <div style={{ ...(overviewStatTileStyle('gold') as CSSProperties), borderTopColor: overdueCount > 0 ? 'var(--danger)' : undefined }}>
          <div style={{ ...overviewStatValue, color: overdueCount > 0 ? 'var(--danger)' : undefined }}>{overdueCount}</div>
          <div style={overviewStatLabel}>Overdue</div>
        </div>
      </div>

      <h2 style={oversightSectionHeading}>Active &amp; Overdue Loans</h2>
      <div className="ih-tbl-wrap" style={oversightTableCard}>
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

      <h2 style={oversightSectionHeading}>Digital Library</h2>
      <p style={oversightSubtitle}>
        The institute's e-books, articles, fatwas, research papers, manuscripts and other digital
        resources are managed by Library staff at their own dashboard's Digital Library section.
        Deliberately separate from the platform owner's own personal Library (Personal Management,
        a different system entirely).
      </p>
      <div style={{ ...overviewStatGrid, marginTop: 16 }}>
        <div style={(overviewStatTileStyle('brand') as CSSProperties)}>
          <div style={overviewStatValue}>{digitalStats.total}</div>
          <div style={overviewStatLabel}>Total Resources</div>
        </div>
        <div style={(overviewStatTileStyle('gold') as CSSProperties)}>
          <div style={overviewStatValue}>{digitalStats.published}</div>
          <div style={overviewStatLabel}>Published</div>
        </div>
        <div style={(overviewStatTileStyle('brand') as CSSProperties)}>
          <div style={overviewStatValue}>{digitalStats.publicTier}</div>
          <div style={overviewStatLabel}>Public Tier</div>
        </div>
      </div>
    </section>
  );
}
