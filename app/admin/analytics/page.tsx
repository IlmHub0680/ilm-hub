export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

export default async function AnalyticsDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect('/staff-login');
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') redirect('/staff-login');

  const [
    studentCount,
    staffCount,
    programCount,
    applicationCount,
    approvedApplicationCount,
    underReviewApplicationCount,
    orderCount,
    orderRevenue,
    bookItemsSold,
    publishedBookCount,
    approvedAuthorCount,
    authorEarnings,
    activeSubscriptionCount,
    subscriptionRevenue,
    publishedMediaCount,
    publishedLibraryCount,
    activeSponsorCount,
    sponsorshipValue,
    activeNewsletterCount,
    assistantOpenCount,
    assistantMatchedCount,
    assistantUnmatchedCount,
    assistantIdentityBreakdown,
    assistantTopQuickOptions,
    researchProjectCount,
    researchProposalUnderReviewCount,
    researchPublishedOutputCount,
  ] = await Promise.all([
    prisma.studentProfile.count(),
    prisma.staffProfile.count({ where: { isActive: true } }),
    prisma.program.count(),
    prisma.admissionApplication.count(),
    prisma.admissionApplication.count({ where: { status: 'APPROVED' } }),
    prisma.admissionApplication.count({
      where: { status: { in: ['UNDER_REVIEW', 'INITIAL_ACCEPTANCE', 'PENDING_FINAL_APPROVAL'] } },
    }),
    prisma.order.count(),
    prisma.order.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { paidAmount: true } }),
    prisma.orderItem.aggregate({ _sum: { quantity: true } }),
    prisma.book.count({ where: { status: 'PUBLISHED' } }),
    prisma.authorAdmission.count({ where: { status: 'APPROVED' } }),
    prisma.authorPayment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
    prisma.userMediaSubscription.count({ where: { status: 'ACTIVE', expiresAt: { gt: new Date() } } }),
    prisma.userMediaSubscription.aggregate({ where: { paidAmount: { not: null } }, _sum: { paidAmount: true } }),
    prisma.mediaItem.count({ where: { isPublished: true } }),
    prisma.libraryResource.count({ where: { isPublished: true } }),
    prisma.sponsor.count({ where: { status: 'ACTIVE' } }),
    prisma.sponsor.aggregate({ where: { status: 'ACTIVE' }, _sum: { amountUSD: true } }),
    prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    prisma.assistantEvent.count({ where: { type: 'open' } }),
    prisma.assistantEvent.count({ where: { type: 'query_matched' } }),
    prisma.assistantEvent.count({ where: { type: 'query_unmatched' } }),
    prisma.assistantEvent.groupBy({
      by: ['identity'],
      where: { type: 'identity_selected', identity: { not: null } },
      _count: { identity: true },
    }),
    prisma.assistantEvent.groupBy({
      by: ['label'],
      where: { type: 'quick_option', label: { not: null } },
      _count: { label: true },
      orderBy: { _count: { label: 'desc' } },
      take: 5,
    }),
    // Research & Scholarly Affairs -- additive to this same Promise.all,
    // per this page's own established architecture (see this file's
    // top comment on adding a section). No separate Research analytics
    // API route.
    prisma.researchProject.count(),
    prisma.researchProposal.count({ where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUESTED'] } } }),
    prisma.researchPublication.count({ where: { status: 'PUBLISHED' } }),
  ]);

  const bookstoreRevenue = Number(orderRevenue._sum.paidAmount || 0);
  const mediaRevenue = Number(subscriptionRevenue._sum.paidAmount || 0);
  const sponsorshipTotal = Number(sponsorshipValue._sum.amountUSD || 0);
  const authorEarningsTotal = Number(authorEarnings._sum.amount || 0);
  const totalRevenue = bookstoreRevenue + mediaRevenue;

  const sections: { title: string; tiles: { label: string; value: string }[] }[] = [
    {
      title: 'Bookstore & Revenue',
      tiles: [
        { label: 'Total Revenue (paid orders + media)', value: money(totalRevenue) },
        { label: 'Bookstore Revenue', value: money(bookstoreRevenue) },
        { label: 'Total Orders', value: String(orderCount) },
        { label: 'Books Sold (units)', value: String(Number(bookItemsSold._sum.quantity || 0)) },
        { label: 'Published Books', value: String(publishedBookCount) },
      ],
    },
    {
      title: 'Media',
      tiles: [
        { label: 'Active Subscriptions', value: String(activeSubscriptionCount) },
        { label: 'Subscription Revenue', value: money(mediaRevenue) },
        { label: 'Published Media Items', value: String(publishedMediaCount) },
      ],
    },
    {
      title: 'Library',
      tiles: [
        { label: 'Published Library Items', value: String(publishedLibraryCount) },
      ],
    },
    {
      title: 'Admissions & Academics',
      tiles: [
        { label: 'Total Applications', value: String(applicationCount) },
        { label: 'Approved Applications', value: String(approvedApplicationCount) },
        { label: 'In Review (Under Review + Initial Acceptance + Pending Final Approval)', value: String(underReviewApplicationCount) },
        { label: 'Programmes', value: String(programCount) },
      ],
    },
    {
      title: 'People',
      tiles: [
        { label: 'Students', value: String(studentCount) },
        { label: 'Active Staff', value: String(staffCount) },
      ],
    },
    {
      title: 'Authors',
      tiles: [
        { label: 'Approved Authors', value: String(approvedAuthorCount) },
        { label: 'Author Earnings Paid', value: money(authorEarningsTotal) },
      ],
    },
    {
      title: 'Sponsorship & Community',
      tiles: [
        { label: 'Active Sponsors', value: String(activeSponsorCount) },
        { label: 'Active Sponsorship Value', value: money(sponsorshipTotal) },
        { label: 'Newsletter Subscribers', value: String(activeNewsletterCount) },
      ],
    },
    {
      title: 'Research & Scholarly Affairs',
      tiles: [
        { label: 'Research Projects', value: String(researchProjectCount) },
        { label: 'Proposals Under Review', value: String(researchProposalUnderReviewCount) },
        { label: 'Published Scholarly Outputs', value: String(researchPublishedOutputCount) },
      ],
    },
    {
      title: 'AI Assistant',
      tiles: [
        { label: 'Assistant Opened', value: String(assistantOpenCount) },
        { label: 'Questions Answered', value: String(assistantMatchedCount) },
        { label: 'Questions Unanswered', value: String(assistantUnmatchedCount) },
        ...assistantIdentityBreakdown.map((row) => ({
          label: `Identity: ${row.identity}`,
          value: String(row._count.identity),
        })),
        ...assistantTopQuickOptions.map((row) => ({
          label: `Quick option: ${row.label}`,
          value: String(row._count.label),
        })),
      ],
    },
  ];

  return (
    <div style={page}>
      <div style={container}>
        <Link href="/admin" style={backLink}>
          ← Back to Admin
        </Link>

        <div style={{ marginBottom: 28 }}>
          <span style={eyebrow}>INSTITUTION OVERSIGHT</span>
          <h1 style={title}>Analytics</h1>
          <p style={subtitle}>
            Every figure below is computed live from the institute's own records —
            nothing here is estimated or fabricated. A metric that can't yet be
            reliably calculated is left out rather than guessed at.
          </p>
        </div>

        {sections.map((section) => (
          <section key={section.title} style={sectionStyle}>
            <h2 style={sectionTitle}>{section.title}</h2>
            <div style={grid}>
              {section.tiles.map((tile) => (
                <div key={tile.label} style={tileStyle}>
                  <span style={tileLabel}>{tile.label}</span>
                  <strong style={tileValue}>{tile.value}</strong>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

const page = {
  minHeight: '100vh',
  background: 'var(--paper)',
  padding: '40px 20px',
  fontFamily: 'var(--font-body)',
};

const container = {
  maxWidth: '1200px',
  margin: '0 auto',
};

const backLink = {
  display: 'inline-block',
  marginBottom: '20px',
  color: 'var(--brand)',
  fontWeight: 600,
  textDecoration: 'none',
  fontSize: '13.5px',
};

const eyebrow = {
  fontSize: '11.5px',
  fontWeight: 800,
  letterSpacing: '0.1em',
  color: 'var(--gold-dark)',
};

const title = {
  fontFamily: 'var(--font-display)',
  fontSize: '32px',
  color: 'var(--ink)',
  margin: '6px 0 8px',
};

const subtitle = {
  color: 'var(--ink-soft)',
  maxWidth: '680px',
  lineHeight: 1.6,
  margin: 0,
};

const sectionStyle = {
  marginTop: '28px',
};

const sectionTitle = {
  fontSize: '16px',
  fontWeight: 700,
  color: 'var(--brand-dark)',
  margin: '0 0 14px',
};

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
  gap: '16px',
};

const tileStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '8px',
  boxShadow: 'var(--shadow-card)',
};

const tileLabel = {
  fontSize: '11.5px',
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase' as const,
  color: 'var(--ink-soft)',
};

const tileValue = {
  fontSize: '26px',
  color: 'var(--brand)',
  fontFamily: 'var(--font-display)',
};
