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

export default async function AdminFeesOversight() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/staff-login');
  }

  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    redirect('/staff-login');
  }

  const fees = await prisma.studentFee.findMany({
    include: {
      student: {
        include: { user: { select: { name: true, email: true } } },
      },
      term: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const badgeClass = (status) =>
    status === 'PENDING' ? 'ih-b-warning'
    : status === 'PARTIAL' ? 'ih-b-info'
    : status === 'PAID' ? 'ih-b-success'
    : status === 'OVERDUE' ? 'ih-b-danger'
    : 'ih-b-neutral';

  return (
    <section>
      <header style={oversightHeader}>
        <h1 style={oversightHeading}>Student Fees — Oversight View</h1>
        <p style={oversightSubtitle}>Fee creation and payment recording are handled by Finance staff at their own dashboard.</p>
        <span style={oversightPageBadge}>🔒 Read-only oversight</span>
      </header>

      <div className="ih-tbl-wrap" style={oversightTableCard}>
          <table className="ih-tbl">
            <thead>
              <tr>
                <th>Student</th>
                <th>Fee Type</th>
                <th>Term</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.length === 0 ? (
                <tr>
                  <td style={{ textAlign: 'center', color: 'var(--ink-soft)' }} colSpan={7}>
                    No fee records yet.
                  </td>
                </tr>
              ) : (
                fees.map((fee) => (
                  <tr key={fee.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{fee.student.user.name}</div>
                      <div style={{ color: 'var(--ink-soft)', fontSize: '12px' }}>{fee.student.studentNo}</div>
                    </td>
                    <td>{fee.feeType}</td>
                    <td>{fee.term?.name ?? '—'}</td>
                    <td className="mono">${fee.amountUSD.toFixed(2)}</td>
                    <td className="mono">${fee.paidUSD.toFixed(2)}</td>
                    <td className="mono" style={{ fontWeight: 600 }}>${(fee.amountUSD - fee.paidUSD).toFixed(2)}</td>
                    <td>
                      <span className={`ih-badge ${badgeClass(fee.status)}`}>
                        {fee.status}
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
