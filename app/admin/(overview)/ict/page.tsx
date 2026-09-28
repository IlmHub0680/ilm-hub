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
  overviewStatGrid,
  overviewStatTileStyle,
  overviewStatValue,
  overviewStatLabel,
} from '../_shared';
import type { CSSProperties } from 'react';

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

  const openCount = tickets.filter((t) => t.status === 'OPEN' || t.status === 'REOPENED').length;
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

  return (
    <section>
      <header style={oversightHeader}>
        <h1 style={oversightHeading}>IT Support Tickets</h1>
        <p style={oversightSubtitle}>
          Ticket handling is managed by ICT staff at their own dashboard.
        </p>
        <span style={oversightPageBadge}>🔒 Read-only oversight</span>
      </header>

      <div style={{ ...overviewStatGrid, marginBottom: 28 }}>
        <div style={(overviewStatTileStyle('gold') as CSSProperties)}>
          <div style={overviewStatValue}>{openCount}</div>
          <div style={overviewStatLabel}>Open</div>
        </div>
        <div style={(overviewStatTileStyle('brand') as CSSProperties)}>
          <div style={overviewStatValue}>{inProgressCount}</div>
          <div style={overviewStatLabel}>In Progress</div>
        </div>
        <div style={(overviewStatTileStyle('brand') as CSSProperties)}>
          <div style={overviewStatValue}>{resolvedCount}</div>
          <div style={overviewStatLabel}>Resolved / Closed</div>
        </div>
      </div>

      <div className="ih-tbl-wrap" style={oversightTableCard}>
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
    </section>
  );
}
