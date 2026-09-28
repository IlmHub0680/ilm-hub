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

// Read-only oversight -- Research & Scholarly Affairs is a Delegated
// Operation. Projects, proposals, publications, funding and
// supervision are actioned at the Research & Scholarly Affairs
// Officer's own dashboard (/research-dashboard); Admin gets visibility
// only, never an operational write path here.
//
// Confidential Research Integrity cases are deliberately NOT listed
// here (unlike the other sections below) -- that data is strictly
// scoped to RESEARCH_OPS edit access and Admin/SUPER_ADMIN at the
// application layer (see app/api/research/integrity's own comment),
// and this oversight page only ever does a direct Prisma read with no
// operational gate of its own, so it stays out of the confidential
// case detail entirely and shows only an aggregate open-case count.
export default async function AdminResearchOversight() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/staff-login');
  }

  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    redirect('/staff-login');
  }

  const [projects, proposals, publications, grants, supervisionCount, openIntegrityCaseCount] = await Promise.all([
    prisma.researchProject.findMany({
      include: {
        area: { select: { nameEn: true } },
        principalInvestigator: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.researchProposal.findMany({
      include: { submittedBy: { include: { user: { select: { name: true } } } } },
      orderBy: { submittedAt: 'desc' },
      take: 50,
    }),
    prisma.researchPublication.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.researchGrant.findMany({
      include: { project: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.researchSupervision.count(),
    prisma.researchIntegrityCase.count({ where: { status: { in: ['REPORTED', 'UNDER_INVESTIGATION'] } } }),
  ]);

  const badgeClass = (status) =>
    ['ACTIVE', 'APPROVED', 'AWARDED', 'PUBLISHED', 'COMPLETED'].includes(status) ? 'ih-b-success'
    : ['REJECTED', 'DECLINED', 'SUSPENDED', 'RETRACTED'].includes(status) ? 'ih-b-danger'
    : ['UNDER_REVIEW', 'REVISION_REQUESTED', 'SUBMITTED'].includes(status) ? 'ih-b-warning'
    : 'ih-b-neutral';

  const STAT_ACCENTS = ['brand', 'gold', 'brand', 'gold', 'brand'];

  return (
    <section>
      <header style={oversightHeader}>
        <h1 style={oversightHeading}>Research & Scholarly Affairs</h1>
        <p style={oversightSubtitle}>
          Research management, the proposal workflow, scholarly publications, collaboration,
          supervision and funding are all actioned by the Research & Scholarly Affairs Officer at their own dashboard.
        </p>
        <span style={oversightPageBadge}>🔒 Read-only oversight</span>
      </header>

      <div style={{ ...overviewStatGrid, marginBottom: 28 }}>
        <div style={overviewStatTileStyle(STAT_ACCENTS[0])}>
          <div style={overviewStatValue}>{projects.length}</div>
          <div style={overviewStatLabel}>Research Projects</div>
        </div>
        <div style={overviewStatTileStyle(STAT_ACCENTS[1])}>
          <div style={overviewStatValue}>{proposals.length}</div>
          <div style={overviewStatLabel}>Proposals</div>
        </div>
        <div style={overviewStatTileStyle(STAT_ACCENTS[2])}>
          <div style={overviewStatValue}>{publications.length}</div>
          <div style={overviewStatLabel}>Scholarly Outputs</div>
        </div>
        <div style={overviewStatTileStyle(STAT_ACCENTS[3])}>
          <div style={overviewStatValue}>{grants.length}</div>
          <div style={overviewStatLabel}>Grant Records</div>
        </div>
        <div style={overviewStatTileStyle(STAT_ACCENTS[4])}>
          <div style={overviewStatValue}>{supervisionCount}</div>
          <div style={overviewStatLabel}>Supervisions</div>
        </div>
        {openIntegrityCaseCount > 0 && (
          <div style={{ ...overviewStatTileStyle('gold'), borderTopColor: 'var(--danger)' }}>
            <div style={{ ...overviewStatValue, color: 'var(--danger)' }}>{openIntegrityCaseCount}</div>
            <div style={overviewStatLabel}>Open Integrity Cases (confidential)</div>
          </div>
        )}
      </div>

      <h2 style={oversightSectionHeading}>Research Projects</h2>
      <div className="ih-tbl-wrap" style={{ ...oversightTableCard, marginBottom: 28 }}>
          <table className="ih-tbl">
            <thead>
              <tr>
                <th>Title</th>
                <th>Principal Investigator</th>
                <th>Area</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr><td style={{ textAlign: 'center', color: 'var(--ink-soft)' }} colSpan={4}>No research projects yet.</td></tr>
              ) : (
                projects.map((p) => (
                  <tr key={p.id}>
                    <td>{p.title}</td>
                    <td>{p.principalInvestigator?.user?.name || 'Unknown'}</td>
                    <td>{p.area?.nameEn || '—'}</td>
                    <td><span className={`ih-badge ${badgeClass(p.status)}`}>{p.status.replace(/_/g, ' ')}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      <h2 style={oversightSectionHeading}>Proposals</h2>
      <div className="ih-tbl-wrap" style={{ ...oversightTableCard, marginBottom: 28 }}>
          <table className="ih-tbl">
            <thead>
              <tr>
                <th>Title</th>
                <th>Submitted By</th>
                <th>Submitted</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {proposals.length === 0 ? (
                <tr><td style={{ textAlign: 'center', color: 'var(--ink-soft)' }} colSpan={4}>No proposals yet.</td></tr>
              ) : (
                proposals.map((p) => (
                  <tr key={p.id}>
                    <td>{p.title}</td>
                    <td>{p.submittedBy?.user?.name || 'Unknown'}</td>
                    <td className="mono">{new Date(p.submittedAt).toLocaleDateString()}</td>
                    <td><span className={`ih-badge ${badgeClass(p.status)}`}>{p.status.replace(/_/g, ' ')}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      <h2 style={oversightSectionHeading}>Scholarly Publications</h2>
      <div className="ih-tbl-wrap" style={{ ...oversightTableCard, marginBottom: 28 }}>
          <table className="ih-tbl">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Year</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {publications.length === 0 ? (
                <tr><td style={{ textAlign: 'center', color: 'var(--ink-soft)' }} colSpan={4}>No publications recorded yet.</td></tr>
              ) : (
                publications.map((p) => (
                  <tr key={p.id}>
                    <td>{p.title}</td>
                    <td>{p.type.replace(/_/g, ' ')}</td>
                    <td className="mono">{p.year ?? '—'}</td>
                    <td><span className={`ih-badge ${badgeClass(p.status)}`}>{p.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      <h2 style={oversightSectionHeading}>Research Funding</h2>
      <div className="ih-tbl-wrap" style={oversightTableCard}>
          <table className="ih-tbl">
            <thead>
              <tr>
                <th>Project</th>
                <th>Funding Source</th>
                <th>Requested</th>
                <th>Awarded</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {grants.length === 0 ? (
                <tr><td style={{ textAlign: 'center', color: 'var(--ink-soft)' }} colSpan={5}>No grant records yet.</td></tr>
              ) : (
                grants.map((g) => (
                  <tr key={g.id}>
                    <td>{g.project?.title || '—'}</td>
                    <td>{g.fundingSource}</td>
                    <td className="mono">{g.currency} {g.amountRequested?.toString() ?? '—'}</td>
                    <td className="mono">{g.amountAwarded != null ? `${g.currency} ${g.amountAwarded.toString()}` : '—'}</td>
                    <td><span className={`ih-badge ${badgeClass(g.status)}`}>{g.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
    </section>
  );
}
