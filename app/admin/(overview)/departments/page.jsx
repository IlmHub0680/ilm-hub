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

export default async function AdminDepartmentsOversight() {
  const user = await getCurrentUser();
  if (!user) redirect('/staff-login');
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') redirect('/staff-login');

  const departments = await prisma.department.findMany({
    include: {
      faculty: { select: { nameEn: true } },
      head: { include: { user: { select: { name: true } } } },
      _count: { select: { programs: true, staff: true, students: true } },
    },
    orderBy: { nameEn: 'asc' },
  });

  return (
    <section>
      <header style={oversightHeader}>
        <h1 style={oversightHeading}>Departments — Oversight View</h1>
        <p style={oversightSubtitle}>Deans manage departments within their own faculty, and Heads of Department manage programmes within each department, at their own dashboards.</p>
        <span style={oversightPageBadge}>🔒 Read-only oversight</span>
      </header>

      <div className="ih-tbl-wrap" style={oversightTableCard}>
          <table className="ih-tbl">
            <thead>
              <tr>
                <th>Department</th><th>Faculty</th><th>Head</th><th>Programmes</th><th>Staff</th><th>Students</th>
              </tr>
            </thead>
            <tbody>
              {departments.length === 0 ? (
                <tr><td style={{ textAlign: "center", color: "var(--ink-soft)" }} colSpan={6}>No departments yet.</td></tr>
              ) : (
                departments.map((d) => (
                  <tr key={d.id}>
                    <td>{d.nameEn}</td>
                    <td>{d.faculty.nameEn}</td>
                    <td>{d.head ? d.head.user.name : <span style={{ color: 'var(--ink-soft)' }}>Unassigned</span>}</td>
                    <td>{d._count.programs}</td>
                    <td>{d._count.staff}</td>
                    <td>{d._count.students}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
    </section>
  );
}
