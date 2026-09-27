export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function AdminExaminationsOversight() {
  const user = await getCurrentUser();
  if (!user) redirect('/staff-login');
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') redirect('/staff-login');

  const [exams, appeals] = await Promise.all([
    prisma.exam.findMany({
      include: { course: { select: { titleEn: true } }, term: { select: { name: true } } },
      orderBy: { scheduledAt: 'desc' },
      take: 50,
    }),
    prisma.request.findMany({
      where: { type: 'GRADE_APPEAL' },
      include: { student: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ]);

    return (
    <main style={page}>
      <div style={container}>
        <Link href="/admin" style={backLink}>← Back to Admin Overview</Link>
        <h1 style={heading}>Examinations — Oversight View</h1>
        <p style={muted}>Read-only. Exam scheduling and grade appeals are actioned by Examinations staff at their own dashboard.</p>

        <h2 style={subheading}>Exam Schedule</h2>
        <div className="ih-tbl-wrap">
          <table className="ih-tbl">
            <thead>
              <tr>
                <th>Course</th><th>Term</th><th>Type</th><th>When</th>
              </tr>
            </thead>
            <tbody>
              {exams.length === 0 ? (
                <tr><td style={{ textAlign: "center", color: "var(--ink-soft)" }} colSpan={4}>No exams scheduled yet.</td></tr>
              ) : (
                exams.map((e) => (
                  <tr key={e.id}>
                    <td>{e.course.titleEn}</td>
                    <td>{e.term.name}</td>
                    <td>{e.examType}</td>
                    <td>{new Date(e.scheduledAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <h2 style={subheading}>Grade Appeals</h2>
        <div className="ih-tbl-wrap">
          <table className="ih-tbl">
            <thead>
              <tr>
                <th>Student</th><th>Submitted</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appeals.length === 0 ? (
                <tr><td style={{ textAlign: "center", color: "var(--ink-soft)" }} colSpan={3}>No grade appeals yet.</td></tr>
              ) : (
                appeals.map((a) => (
                  <tr key={a.id}>
                    <td>{a.student.user.name}</td>
                    <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`ih-badge ${a.status === "SUBMITTED" ? "ih-b-info" : a.status === "UNDER_REVIEW" ? "ih-b-warning" : a.status === "APPROVED" ? "ih-b-success" : a.status === "REJECTED" ? "ih-b-danger" : a.status === "COMPLETED" ? "ih-b-success" : "ih-b-neutral"}`}>
                        {a.status.replace(/_/g, ' ')}
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

const page = { minHeight: '100vh', background: 'var(--paper)', padding: '40px 20px', fontFamily: 'var(--font-body)', color: 'var(--ink)' };
const container = { maxWidth: '1100px', margin: '0 auto' };
const backLink = { color: 'var(--brand)', textDecoration: 'none', fontWeight: 700, fontSize: '14px' };
const heading = { color: 'var(--ink)', fontFamily: 'var(--font-display)', fontSize: '28px', margin: '20px 0 6px' };
const subheading = { color: 'var(--ink)', fontFamily: 'var(--font-display)', fontSize: '18px', margin: '28px 0 12px' };
const muted = { color: 'var(--ink-soft)', fontSize: '14px', marginBottom: '24px' };