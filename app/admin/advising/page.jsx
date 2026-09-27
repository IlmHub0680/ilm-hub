export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    <main style={page}>
      <div style={container}>
        <Link href="/admin" style={backLink}>← Back to Admin Overview</Link>
        <h1 style={heading}>Academic Advising — Oversight View</h1>
        <p style={muted}>Read-only. Advisors correspond with their assigned students at their own dashboard.</p>

        <div className="ih-tbl-wrap">
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
      </div>
    </main>
  );
}

const page = { minHeight: '100vh', background: 'var(--paper)', padding: '40px 20px', fontFamily: 'var(--font-body)', color: 'var(--ink)' };
const container = { maxWidth: '1100px', margin: '0 auto' };
const backLink = { color: 'var(--brand)', textDecoration: 'none', fontWeight: 700, fontSize: '14px' };
const heading = { color: 'var(--ink)', fontFamily: 'var(--font-display)', fontSize: '28px', margin: '20px 0 6px' };
const muted = { color: 'var(--ink-soft)', fontSize: '14px', marginBottom: '24px' };