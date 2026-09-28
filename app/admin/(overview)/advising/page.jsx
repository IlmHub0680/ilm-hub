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

export default async function AdminAdvisingOversight() {
  const user = await getCurrentUser();
  if (!user) redirect('/staff-login');
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') redirect('/staff-login');

  const students = await prisma.studentProfile.findMany({
    where: { academicAdvisorId: { not: null } },
    include: {
      user: { select: { name: true } },
      academicAdvisor: { include: { user: { select: { name: true } } } },
      _count: { select: { advisorMessages: true } },
    },
    orderBy: { studentNo: 'asc' },
  });

  return (
    <section>
      <header style={oversightHeader}>
        <h1 style={oversightHeading}>Academic Advising — Oversight View</h1>
        <p style={oversightSubtitle}>Advisors correspond with their assigned students at their own dashboard.</p>
        <span style={oversightPageBadge}>🔒 Read-only oversight</span>
      </header>

      <div className="ih-tbl-wrap" style={oversightTableCard}>
          <table className="ih-tbl">
            <thead>
              <tr>
                <th>Student</th><th>Advisor</th><th>Messages</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr><td style={{ textAlign: "center", color: "var(--ink-soft)" }} colSpan={3}>No advisor assignments yet.</td></tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id}>
                    <td>{s.user.name} <span style={{ color: 'var(--ink-soft)', fontSize: 12 }}>({s.studentNo})</span></td>
                    <td>{s.academicAdvisor.user.name}</td>
                    <td>{s._count.advisorMessages}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
    </section>
  );
}
