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
} from '../_shared';

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
    <section>
      <header style={oversightHeader}>
        <h1 style={oversightHeading}>Examinations — Oversight View</h1>
        <p style={oversightSubtitle}>Exam scheduling and grade appeals are actioned by Examinations staff at their own dashboard.</p>
        <span style={oversightPageBadge}>🔒 Read-only oversight</span>
      </header>

      <h2 style={oversightSectionHeading}>Exam Schedule</h2>
      <div className="ih-tbl-wrap" style={{ ...oversightTableCard, marginBottom: 28 }}>
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

      <h2 style={oversightSectionHeading}>Grade Appeals</h2>
      <div className="ih-tbl-wrap" style={oversightTableCard}>
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
    </section>
  );
}
