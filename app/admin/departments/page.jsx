export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    <main style={page}>
      <div style={container}>
        <Link href="/admin" style={backLink}>← Back to Admin Overview</Link>
        <h1 style={heading}>Departments — Oversight View</h1>
        <p style={muted}>Read-only. Deans manage departments within their own faculty, and Heads of Department manage programmes within each department, at their own dashboards.</p>

        <div className="ih-tbl-wrap">
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
      </div>
    </main>
  );
}

const page = { minHeight: '100vh', background: 'var(--paper)', padding: '40px 20px', fontFamily: 'var(--font-body)', color: 'var(--ink)' };
const container = { maxWidth: '1100px', margin: '0 auto' };
const backLink = { color: 'var(--brand)', textDecoration: 'none', fontWeight: 700, fontSize: '14px' };
const heading = { color: 'var(--ink)', fontFamily: 'var(--font-display)', fontSize: '28px', margin: '20px 0 6px' };
const muted = { color: 'var(--ink-soft)', fontSize: '14px', marginBottom: '24px' };