'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const COLORS = {
  primary: '#14532d',
  primaryDark: '#0f3d22',
  primaryLight: '#f0fdf4',
  primaryBorder: '#bbf7d0',

  text: '#0f172a',
  textMuted: '#64748b',
  textLight: '#94a3b8',

  border: '#e2e8f0',
  borderLight: '#f1f5f9',

  background: '#f8fafc',
  white: '#ffffff',

  blue: '#0369a1',
  blueLight: '#eff6ff',

  orange: '#c2410c',
  orangeLight: '#fff7ed',

  purple: '#7c3aed',
  purpleLight: '#f5f3ff',

  red: '#b91c1c',
  redLight: '#fef2f2',

  teal: '#0f766e',
  tealLight: '#f0fdfa',
};

const NAVIGATION = [
  {
    group: 'Workspace',
    items: [
      { id: 'overview', label: 'Overview', icon: '⌂' },
      { id: 'books', label: 'My Books', icon: '▣' },
      { id: 'publishing', label: 'Publishing', icon: '◇' },
    ],
  },
  {
    group: 'Performance',
    items: [
      { id: 'sales', label: 'Sales', icon: '↗' },
      { id: 'analytics', label: 'Analytics', icon: '◫' },
      { id: 'readers', label: 'Readers & Downloads', icon: '◉' },
      { id: 'reviews', label: 'Reviews & Ratings', icon: '★' },
    ],
  },
  {
    group: 'Financial',
    items: [
      { id: 'royalties', label: 'Royalties & Earnings', icon: '◈' },
      { id: 'payouts', label: 'Payouts', icon: '▤' },
    ],
  },
  {
    group: 'Growth',
    items: [
      { id: 'marketing', label: 'Marketing', icon: '◆' },
      { id: 'profile', label: 'Author Profile', icon: '◎' },
    ],
  },
  {
    group: 'Account',
    items: [
      { id: 'notifications', label: 'Notifications', icon: '◌' },
      { id: 'settings', label: 'Settings', icon: '⚙' },
      { id: 'support', label: 'Support', icon: '?' },
    ],
  },
];

export default function AuthorDashboard() {
  const [activePage, setActivePage] = useState('overview');

  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenueUSD: 0,
    activeBooks: 0,
    totalDownloads: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    refunds: 0,
    averageRating: 0,
    totalReviews: 0,
    recentSales: [],
  });

  const [books, setBooks] = useState([]);

  const [author, setAuthor] = useState({
    name: 'Dr. Ahmad Al-Mansoor',
    specialty: 'Fiqh & Arabic Language',
    verified: true,
    bio:
      'Specialist in Islamic Jurisprudence and Arabic Morphology with over 15 years of academic teaching experience.',
    books: 0,
    followers: 0,
  });

  const fetchDashboard = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      const res = await fetch(
        `/api/author/analytics?period=${selectedPeriod}`,
        {
          cache: 'no-store',
        }
      );

      if (!res.ok) {
        throw new Error('Failed to load author analytics.');
      }

      const json = await res.json();

      if (!json.success) {
        throw new Error(
          json.error || 'Unable to load author analytics.'
        );
      }

      const data = json.data || {};

      setStats({
        totalSales: Number(data.totalSales || 0),
        totalRevenueUSD: Number(data.totalRevenueUSD || 0),
        activeBooks: Number(data.activeBooks || 0),
        totalDownloads: Number(data.totalDownloads || 0),
        pendingEarnings: Number(data.pendingEarnings || 0),
        paidEarnings: Number(data.paidEarnings || 0),
        refunds: Number(data.refunds || 0),
        averageRating: Number(data.averageRating || 0),
        totalReviews: Number(data.totalReviews || 0),
        recentSales: Array.isArray(data.recentSales)
          ? data.recentSales
          : [],
      });

      if (Array.isArray(data.books)) {
        setBooks(data.books);
      }

      if (data.author) {
        setAuthor((previous) => ({
          ...previous,
          ...data.author,
        }));
      }
    } catch (err) {
      console.error('Author dashboard error:', err);

      setError(
        err?.message ||
          'We could not load your dashboard. Please try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [selectedPeriod]);

  const authorRevenue = useMemo(
    () => stats.totalRevenueUSD * 0.7,
    [stats.totalRevenueUSD]
  );

  const platformRevenue = useMemo(
    () => stats.totalRevenueUSD * 0.3,
    [stats.totalRevenueUSD]
  );

  const averageSale = useMemo(() => {
    if (!stats.totalSales) return 0;

    return stats.totalRevenueUSD / stats.totalSales;
  }, [stats.totalRevenueUSD, stats.totalSales]);

  const downloadRate = useMemo(() => {
    if (!stats.totalSales) return 0;

    return (
      (stats.totalDownloads / stats.totalSales) *
      100
    ).toFixed(1);
  }, [stats.totalDownloads, stats.totalSales]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(Number(amount || 0));

  const formatNumber = (number) =>
    new Intl.NumberFormat('en-US').format(
      Number(number || 0)
    );

  const formatDate = (date) => {
    if (!date) return '—';

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return String(date);
    }

    return parsed.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const navigate = (page) => {
    setActivePage(page);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}

      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.brandArea}>
            <div style={styles.logo}>
              ILM-HUB
            </div>

            <div style={styles.brandDivider} />

            <div>
              <div style={styles.portalLabel}>
                AUTHOR PORTAL
              </div>

              <div style={styles.portalTitle}>
                Publishing & Intelligence
              </div>
            </div>
          </div>

          <div style={styles.headerActions}>
            <button
              type="button"
              onClick={() => fetchDashboard(true)}
              disabled={refreshing}
              style={styles.secondaryButton}
            >
              {refreshing
                ? 'Refreshing...'
                : '↻ Refresh'}
            </button>

            <Link
              href="/"
              style={styles.secondaryLink}
            >
              Home
            </Link>

            <button
              type="button"
              onClick={() => navigate('profile')}
              style={styles.profileButton}
            >
              <span style={styles.headerAvatar}>
                {getInitials(author.name)}
              </span>

              <span>{author.name}</span>
            </button>
          </div>
        </div>
      </header>

      <div style={styles.layout}>
        {/* SIDEBAR */}

        <aside style={styles.sidebar}>
          <div style={styles.sidebarTop}>
            <div style={styles.sidebarEyebrow}>
              AUTHOR WORKSPACE
            </div>

            <div style={styles.sidebarName}>
              {author.name}
            </div>

            <div style={styles.sidebarSpecialty}>
              {author.specialty}
            </div>
          </div>

          {NAVIGATION.map((group) => (
            <div
              key={group.group}
              style={styles.navGroup}
            >
              <div style={styles.navGroupTitle}>
                {group.group}
              </div>

              {group.items.map((item) => {
                const active =
                  activePage === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      navigate(item.id)
                    }
                    style={{
                      ...styles.navItem,
                      ...(active
                        ? styles.navItemActive
                        : {}),
                    }}
                  >
                    <span
                      style={{
                        ...styles.navIcon,
                        ...(active
                          ? styles.navIconActive
                          : {}),
                      }}
                    >
                      {item.icon}
                    </span>

                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}

          <div style={styles.sidebarFooter}>
            <div style={styles.helpCard}>
              <div style={styles.helpTitle}>
                Need assistance?
              </div>

              <div style={styles.helpText}>
                Contact the Ilm-Hub publishing team.
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate('support')
                }
                style={styles.helpButton}
              >
                Open Support →
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN */}

        <main style={styles.main}>
          {error && (
            <div style={styles.errorBanner}>
              <div>
                <strong>
                  Unable to load live analytics.
                </strong>

                <div style={{ marginTop: 4 }}>
                  {error}
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  fetchDashboard()
                }
                style={styles.errorButton}
              >
                Try Again
              </button>
            </div>
          )}

          {activePage === 'overview' && (
            <Overview
              author={author}
              stats={stats}
              books={books}
              selectedPeriod={selectedPeriod}
              setSelectedPeriod={setSelectedPeriod}
              authorRevenue={authorRevenue}
              platformRevenue={platformRevenue}
              averageSale={averageSale}
              downloadRate={downloadRate}
              formatCurrency={formatCurrency}
              formatNumber={formatNumber}
              formatDate={formatDate}
              navigate={navigate}
            />
          )}

          {activePage === 'books' && (
            <BooksPage
              books={books}
              navigate={navigate}
              formatCurrency={formatCurrency}
              formatNumber={formatNumber}
            />
          )}

          {activePage === 'publishing' && (
            <PublishingPage
              navigate={navigate}
            />
          )}

          {activePage === 'sales' && (
            <SalesPage
              stats={stats}
              formatCurrency={formatCurrency}
              formatNumber={formatNumber}
              formatDate={formatDate}
            />
          )}

          {activePage === 'analytics' && (
            <AnalyticsPage
              stats={stats}
              books={books}
              formatCurrency={formatCurrency}
              formatNumber={formatNumber}
            />
          )}

          {activePage === 'readers' && (
            <ReadersPage
              stats={stats}
              formatNumber={formatNumber}
            />
          )}

          {activePage === 'reviews' && (
            <ReviewsPage
              stats={stats}
              formatNumber={formatNumber}
            />
          )}

          {activePage === 'royalties' && (
            <RoyaltiesPage
              stats={stats}
              authorRevenue={authorRevenue}
              platformRevenue={platformRevenue}
              formatCurrency={formatCurrency}
            />
          )}

          {activePage === 'payouts' && (
            <PayoutsPage
              stats={stats}
              formatCurrency={formatCurrency}
            />
          )}

          {activePage === 'marketing' && (
            <MarketingPage />
          )}

          {activePage === 'profile' && (
            <ProfilePage
              author={author}
              setAuthor={setAuthor}
            />
          )}

          {activePage === 'notifications' && (
            <NotificationsPage />
          )}

          {activePage === 'settings' && (
            <SettingsPage />
          )}

          {activePage === 'support' && (
            <SupportPage />
          )}

          <footer style={styles.footer}>
            <div>
              <strong>
                Ilm-Hub Author Portal
              </strong>

              <span>
                {' '}
                · Professional publishing workspace
              </span>
            </div>

            <div style={styles.footerLinks}>
              <button
                type="button"
                onClick={() =>
                  navigate('support')
                }
              >
                Support
              </button>

              <Link href="/">
                Home
              </Link>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

/* =====================================================
   OVERVIEW
===================================================== */

function Overview({
  author,
  stats,
  books,
  selectedPeriod,
  setSelectedPeriod,
  authorRevenue,
  platformRevenue,
  averageSale,
  downloadRate,
  formatCurrency,
  formatNumber,
  formatDate,
  navigate,
}) {
  return (
    <>
      <section style={styles.welcomeSection}>
        <div>
          <div style={styles.eyebrow}>
            SCHOLAR PERFORMANCE OVERVIEW
          </div>

          <h1 style={styles.pageTitle}>
            Welcome back, {author.name}
          </h1>

          <p style={styles.pageDescription}>
            Manage your publications, monitor readership,
            review earnings, and oversee your entire
            publishing operation from one place.
          </p>
        </div>

        <div style={styles.authorBadge}>
          <div style={styles.avatar}>
            {getInitials(author.name)}
          </div>

          <div>
            <div style={styles.authorBadgeName}>
              {author.name}
            </div>

            <div style={styles.authorBadgeRole}>
              {author.verified
                ? '✓ Verified Author'
                : 'Author'}
            </div>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}

      <div style={styles.quickBar}>
        <QuickAction
          label="Publish New Book"
          icon="+"
          onClick={() =>
            navigate('publishing')
          }
          primary
        />

        <QuickAction
          label="Manage Books"
          icon="▣"
          onClick={() =>
            navigate('books')
          }
        />

        <QuickAction
          label="View Earnings"
          icon="◈"
          onClick={() =>
            navigate('royalties')
          }
        />

        <QuickAction
          label="Marketing"
          icon="◆"
          onClick={() =>
            navigate('marketing')
          }
        />
      </div>

      {/* PERFORMANCE */}

      <section style={styles.toolbar}>
        <div>
          <h2 style={styles.sectionTitle}>
            Performance Overview
          </h2>

          <p style={styles.sectionDescription}>
            Your publishing and commercial performance.
          </p>
        </div>

        <PeriodSelector
          value={selectedPeriod}
          onChange={setSelectedPeriod}
        />
      </section>

      <section style={styles.metricsGrid}>
        <MetricCard
          label="Gross Revenue"
          value={formatCurrency(
            stats.totalRevenueUSD
          )}
          description="Total book sales revenue"
          accent={COLORS.primary}
          icon="↗"
        />

        <MetricCard
          label="Your Earnings"
          value={formatCurrency(
            authorRevenue
          )}
          description="Author royalty allocation"
          accent={COLORS.blue}
          icon="◈"
        />

        <MetricCard
          label="Book Sales"
          value={formatNumber(
            stats.totalSales
          )}
          description="Completed purchases"
          accent={COLORS.orange}
          icon="▣"
        />

        <MetricCard
          label="Active Books"
          value={formatNumber(
            stats.activeBooks
          )}
          description="Currently published"
          accent={COLORS.purple}
          icon="□"
        />
      </section>

      <section style={styles.secondaryGrid}>
        <SmallMetric
          label="Downloads"
          value={formatNumber(
            stats.totalDownloads
          )}
          description="Digital downloads"
        />

        <SmallMetric
          label="Average Sale"
          value={formatCurrency(
            averageSale
          )}
          description="Average order value"
        />

        <SmallMetric
          label="Download / Sale"
          value={`${downloadRate}%`}
          description="Recorded engagement"
        />

        <SmallMetric
          label="Pending Earnings"
          value={formatCurrency(
            stats.pendingEarnings
          )}
          description="Awaiting payout"
        />

        <SmallMetric
          label="Average Rating"
          value={`${Number(
            stats.averageRating || 0
          ).toFixed(1)} / 5`}
          description={`${formatNumber(
            stats.totalReviews
          )} reader reviews`}
        />
      </section>

      {/* ROYALTIES */}

      <RoyaltyCard
        authorRevenue={authorRevenue}
        platformRevenue={platformRevenue}
        formatCurrency={formatCurrency}
      />

      {/* CONTENT */}

      <section style={styles.contentGrid}>
        <div style={styles.panel}>
          <PanelHeader
            title="Recent Book Sales"
            description="Latest completed transactions."
            action="View Sales →"
            onAction={() =>
              navigate('sales')
            }
          />

          {stats.recentSales.length === 0 ? (
            <EmptyState
              icon="▣"
              title="No sales recorded yet"
              description="Your recent transactions will appear here when your books begin selling."
            />
          ) : (
            <div style={styles.salesList}>
              {stats.recentSales
                .slice(0, 6)
                .map((sale, index) => (
                  <div
                    key={
                      sale.id || index
                    }
                    style={styles.saleRow}
                  >
                    <div
                      style={
                        styles.saleBookIcon
                      }
                    >
                      {String(
                        sale.bookTitle ||
                          'B'
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div
                      style={styles.saleMain}
                    >
                      <div
                        style={
                          styles.saleTitle
                        }
                      >
                        {sale.bookTitle ||
                          'Untitled Book'}
                      </div>

                      <div
                        style={
                          styles.saleMeta
                        }
                      >
                        {sale.buyer ||
                          'Customer'}{' '}
                        ·{' '}
                        {formatDate(
                          sale.date
                        )}
                      </div>
                    </div>

                    <div
                      style={
                        styles.saleAmount
                      }
                    >
                      {formatCurrency(
                        sale.amount
                      )}
                    </div>

                    <StatusPill status="Completed" />
                  </div>
                ))}
            </div>
          )}
        </div>

        <div style={styles.panel}>
          <PanelHeader
            title="Author Insights"
            description="Important indicators from your catalog."
          />

          <div style={styles.insightList}>
            <Insight
              number="01"
              title="Catalog"
              text={
                stats.activeBooks
                  ? `You currently have ${formatNumber(
                      stats.activeBooks
                    )} active publication${
                      stats.activeBooks ===
                      1
                        ? ''
                        : 's'
                    }.`
                  : 'Your catalog is ready for your first publication.'
              }
            />

            <Insight
              number="02"
              title="Revenue"
              text={
                stats.totalRevenueUSD
                  ? `Your catalog has generated ${formatCurrency(
                      stats.totalRevenueUSD
                    )} in gross sales.`
                  : 'Revenue information will appear after your first sale.'
              }
            />

            <Insight
              number="03"
              title="Reader engagement"
              text={
                stats.totalDownloads
                  ? `${formatNumber(
                      stats.totalDownloads
                    )} downloads have been recorded.`
                  : 'Reader activity will appear as publications are accessed.'
              }
            />

            <Insight
              number="04"
              title="Reader satisfaction"
              text={
                stats.totalReviews
                  ? `Your publications currently have an average rating of ${Number(
                      stats.averageRating ||
                        0
                    ).toFixed(1)} out of 5.`
                  : 'Reader ratings will appear after reviews are submitted.'
              }
            />
          </div>
        </div>
      </section>

      {/* BOOK PERFORMANCE */}

      <section style={styles.panel}>
        <PanelHeader
          title="Publication Performance"
          description="Your books and their current performance."
          action="Open Library →"
          onAction={() =>
            navigate('books')
          }
        />

        {books.length === 0 ? (
          <EmptyState
            icon="□"
            title="No publication data"
            description="Book performance will appear here when your analytics API returns publication data."
          />
        ) : (
          <BookTable
            books={books}
            formatCurrency={formatCurrency}
            formatNumber={formatNumber}
          />
        )}
      </section>
    </>
  );
}

/* =====================================================
   BOOKS
===================================================== */

function BooksPage({
  books,
  navigate,
  formatCurrency,
  formatNumber,
}) {
  return (
    <PageHeader
      eyebrow="PUBLICATIONS"
      title="My Books"
      description="Manage every publication associated with your author account."
      action="+ Add New Book"
      onAction={() =>
        navigate('publishing')
      }
    >
      {books.length === 0 ? (
        <EmptyState
          icon="□"
          title="Your library is empty"
          description="Create your first publication to begin building your author catalog."
        />
      ) : (
        <BookTable
          books={books}
          formatCurrency={formatCurrency}
          formatNumber={formatNumber}
          detailed
        />
      )}
    </PageHeader>
  );
}

/* =====================================================
   PUBLISHING
===================================================== */

function PublishingPage() {
  return (
    <PageHeader
      eyebrow="PUBLISHING WORKFLOW"
      title="Publishing Center"
      description="Submit, manage, revise, and schedule your publications."
    >
      <div style={styles.workflowGrid}>
        <WorkflowCard
          number="01"
          title="Create Manuscript"
          description="Start a new publication and enter its title, description, category, language, and metadata."
          button="Create Book"
        />

        <WorkflowCard
          number="02"
          title="Upload Files"
          description="Upload the manuscript, cover, preview, and supporting publication files."
          button="Upload Files"
        />

        <WorkflowCard
          number="03"
          title="Editorial Review"
          description="Submit your publication for review and track revision requests."
          button="View Reviews"
        />

        <WorkflowCard
          number="04"
          title="Publication"
          description="Choose your publication date, pricing, distribution, and visibility."
          button="Publication Settings"
        />
      </div>

      <div style={styles.panel} >
        <PanelHeader
          title="Publication Checklist"
          description="Everything a professional publication should contain."
        />

        <Checklist items={[
          'Book title and subtitle',
          'Author and contributor information',
          'Book description',
          'Cover image',
          'Manuscript file',
          'Language',
          'Category and subject',
          'Keywords and tags',
          'ISBN / edition information',
          'Pricing',
          'Copyright information',
          'Publication date',
          'Reader preview',
          'Distribution settings',
          'Review and approval',
        ]} />
      </div>
    </PageHeader>
  );
}

/* =====================================================
   SALES
===================================================== */

function SalesPage({
  stats,
  formatCurrency,
  formatNumber,
  formatDate,
}) {
  return (
    <PageHeader
      eyebrow="COMMERCIAL PERFORMANCE"
      title="Sales"
      description="Review transactions, orders, refunds, and sales performance."
    >
      <section style={styles.metricsGrid}>
        <MetricCard
          label="Total Sales"
          value={formatNumber(
            stats.totalSales
          )}
          description="Completed orders"
          accent={COLORS.primary}
          icon="↗"
        />

        <MetricCard
          label="Gross Revenue"
          value={formatCurrency(
            stats.totalRevenueUSD
          )}
          description="Before author split"
          accent={COLORS.blue}
          icon="◈"
        />

        <MetricCard
          label="Refunds"
          value={formatNumber(
            stats.refunds
          )}
          description="Returned orders"
          accent={COLORS.red}
          icon="!"
        />

        <MetricCard
          label="Average Order"
          value={formatCurrency(
            stats.totalSales
              ? stats.totalRevenueUSD /
                  stats.totalSales
              : 0
          )}
          description="Average sale value"
          accent={COLORS.orange}
          icon="▤"
        />
      </section>

      <div style={styles.panel}>
        <PanelHeader
          title="Transaction History"
          description="Latest customer purchases."
        />

        {stats.recentSales.length === 0 ? (
          <EmptyState
            icon="↗"
            title="No transactions"
            description="Sales will appear here after customers purchase your publications."
          />
        ) : (
          <div style={styles.tableScroll}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>
                    Book
                  </th>
                  <th style={styles.th}>
                    Customer
                  </th>
                  <th style={styles.th}>
                    Amount
                  </th>
                  <th style={styles.th}>
                    Date
                  </th>
                  <th style={styles.th}>
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {stats.recentSales.map(
                  (sale, index) => (
                    <tr
                      key={
                        sale.id || index
                      }
                    >
                      <td style={styles.td}>
                        {sale.bookTitle ||
                          'Untitled'}
                      </td>

                      <td style={styles.td}>
                        {sale.buyer ||
                          'Customer'}
                      </td>

                      <td
                        style={{
                          ...styles.td,
                          color:
                            COLORS.primary,
                          fontWeight: 800,
                        }}
                      >
                        {formatCurrency(
                          sale.amount
                        )}
                      </td>

                      <td style={styles.td}>
                        {formatDate(
                          sale.date
                        )}
                      </td>

                      <td style={styles.td}>
                        <StatusPill status="Completed" />
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageHeader>
  );
}

/* =====================================================
   ANALYTICS
===================================================== */

function AnalyticsPage({
  stats,
  books,
  formatCurrency,
  formatNumber,
}) {
  return (
    <PageHeader
      eyebrow="DATA & INTELLIGENCE"
      title="Analytics"
      description="Understand how your publications perform across sales, readers, and engagement."
    >
      <section style={styles.analyticsGrid}>
        <AnalyticsCard
          title="Revenue Trend"
          value={formatCurrency(
            stats.totalRevenueUSD
          )}
          description="Gross revenue"
          color={COLORS.primary}
        />

        <AnalyticsCard
          title="Sales Volume"
          value={formatNumber(
            stats.totalSales
          )}
          description="Completed purchases"
          color={COLORS.blue}
        />

        <AnalyticsCard
          title="Reader Downloads"
          value={formatNumber(
            stats.totalDownloads
          )}
          description="Total downloads"
          color={COLORS.purple}
        />

        <AnalyticsCard
          title="Reader Rating"
          value={`${Number(
            stats.averageRating || 0
          ).toFixed(1)} / 5`}
          description={`${formatNumber(
            stats.totalReviews
          )} reviews`}
          color={COLORS.orange}
        />
      </section>

      <div style={styles.panel}>
        <PanelHeader
          title="Book Performance Ranking"
          description="Compare your publications by commercial performance."
        />

        {books.length === 0 ? (
          <EmptyState
            icon="◫"
            title="No analytics available"
            description="Publication analytics will appear when book data becomes available."
          />
        ) : (
          books
            .slice()
            .sort(
              (a, b) =>
                Number(b.revenue || 0) -
                Number(a.revenue || 0)
            )
            .map((book, index) => (
              <div
                key={book.id || index}
                style={styles.rankingRow}
              >
                <div
                  style={styles.rankNumber}
                >
                  {index + 1}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={
                      styles.bookName
                    }
                  >
                    {book.title ||
                      book.bookTitle ||
                      'Untitled'}
                  </div>

                  <div
                    style={
                      styles.bookCategory
                    }
                  >
                    {formatNumber(
                      book.sales
                    )}{' '}
                    sales ·{' '}
                    {formatNumber(
                      book.downloads
                    )}{' '}
                    downloads
                  </div>
                </div>

                <strong
                  style={{
                    color:
                      COLORS.primary,
                  }}
                >
                  {formatCurrency(
                    book.revenue
                  )}
                </strong>
              </div>
            ))
        )}
      </div>
    </PageHeader>
  );
}

/* =====================================================
   READERS
===================================================== */

function ReadersPage({
  stats,
  formatNumber,
}) {
  return (
    <PageHeader
      eyebrow="AUDIENCE"
      title="Readers & Downloads"
      description="Monitor readership, downloads, and audience engagement."
    >
      <section style={styles.metricsGrid}>
        <MetricCard
          label="Total Downloads"
          value={formatNumber(
            stats.totalDownloads
          )}
          description="Digital access events"
          accent={COLORS.primary}
          icon="↓"
        />

        <MetricCard
          label="Sales"
          value={formatNumber(
            stats.totalSales
          )}
          description="Completed purchases"
          accent={COLORS.blue}
          icon="↗"
        />

        <MetricCard
          label="Download / Sale"
          value={`${stats.totalSales ? (
            (stats.totalDownloads /
              stats.totalSales) *
            100
          ).toFixed(1) : 0}%`}
          description="Recorded engagement"
          accent={COLORS.purple}
          icon="◉"
        />
      </section>

      <div style={styles.twoColumnGrid}>
        <InfoCard
          title="Reader Geography"
          description="Country and region readership data."
          icon="◎"
        />

        <InfoCard
          title="Popular Publications"
          description="Books receiving the highest reader activity."
          icon="★"
        />
      </div>

      <Notice
        title="Detailed reader analytics"
        text="The dashboard is ready for country, city, device, language, repeat-reader, and download-date analytics once those fields are returned by your backend."
      />
    </PageHeader>
  );
}

/* =====================================================
   REVIEWS
===================================================== */

function ReviewsPage({
  stats,
  formatNumber,
}) {
  return (
    <PageHeader
      eyebrow="READER FEEDBACK"
      title="Reviews & Ratings"
      description="Monitor reader satisfaction and feedback across your publications."
    >
      <section style={styles.metricsGrid}>
        <MetricCard
          label="Average Rating"
          value={`${Number(
            stats.averageRating || 0
          ).toFixed(1)} / 5`}
          description="Overall catalog rating"
          accent={COLORS.orange}
          icon="★"
        />

        <MetricCard
          label="Total Reviews"
          value={formatNumber(
            stats.totalReviews
          )}
          description="Reader reviews"
          accent={COLORS.blue}
          icon="◉"
        />
      </section>

      <div style={styles.panel}>
        <PanelHeader
          title="Reader Reviews"
          description="Recent feedback from your audience."
        />

        <EmptyState
          icon="★"
          title="Review feed ready"
          description="Connect your reviews API to display individual reviews, ratings, responses, moderation status, and publication-level feedback here."
        />
      </div>
    </PageHeader>
  );
}

/* =====================================================
   ROYALTIES
===================================================== */

function RoyaltiesPage({
  stats,
  authorRevenue,
  platformRevenue,
  formatCurrency,
}) {
  return (
    <PageHeader
      eyebrow="FINANCIAL MANAGEMENT"
      title="Royalties & Earnings"
      description="Track gross revenue, author earnings, pending balances, and platform allocations."
    >
      <section style={styles.metricsGrid}>
        <MetricCard
          label="Gross Revenue"
          value={formatCurrency(
            stats.totalRevenueUSD
          )}
          description="Total catalog revenue"
          accent={COLORS.primary}
          icon="↗"
        />

        <MetricCard
          label="Author Earnings"
          value={formatCurrency(
            authorRevenue
          )}
          description="70% author allocation"
          accent={COLORS.blue}
          icon="◈"
        />

        <MetricCard
          label="Pending"
          value={formatCurrency(
            stats.pendingEarnings
          )}
          description="Awaiting payout"
          accent={COLORS.orange}
          icon="◷"
        />

        <MetricCard
          label="Paid"
          value={formatCurrency(
            stats.paidEarnings
          )}
          description="Previously paid"
          accent={COLORS.teal}
          icon="✓"
        />
      </section>

      <RoyaltyCard
        authorRevenue={authorRevenue}
        platformRevenue={platformRevenue}
        formatCurrency={formatCurrency}
      />

      <Notice
        title="Royalty accounting"
        text="For production use, calculate royalties from your backend using the actual transaction ledger rather than trusting frontend calculations."
      />
    </PageHeader>
  );
}

/* =====================================================
   PAYOUTS
===================================================== */

function PayoutsPage({
  stats,
  formatCurrency,
}) {
  return (
    <PageHeader
      eyebrow="FINANCIAL ACCOUNT"
      title="Payouts"
      description="Manage payout information and review your payout history."
    >
      <section style={styles.twoColumnGrid}>
        <InfoCard
          title="Available Balance"
          description={formatCurrency(
            stats.pendingEarnings
          )}
          icon="◈"
        />

        <InfoCard
          title="Payout Method"
          description="Configure your bank or supported payout method."
          icon="▤"
        />
      </section>

      <div style={styles.panel}>
        <PanelHeader
          title="Payout History"
          description="Completed and pending author payouts."
        />

        <EmptyState
          icon="▤"
          title="No payout history"
          description="Payout records will appear here once your backend begins recording author disbursements."
        />
      </div>
    </PageHeader>
  );
}

/* =====================================================
   MARKETING
===================================================== */

function MarketingPage() {
  return (
    <PageHeader
      eyebrow="CATALOG GROWTH"
      title="Marketing"
      description="Promote your publications and grow your readership."
    >
      <div style={styles.workflowGrid}>
        <WorkflowCard
          number="01"
          title="Featured Book"
          description="Request that one of your publications be considered for featured placement."
          button="Request Feature"
        />

        <WorkflowCard
          number="02"
          title="Promotion"
          description="Create a promotional campaign for a selected publication."
          button="Create Campaign"
        />

        <WorkflowCard
          number="03"
          title="Discounts"
          description="Configure temporary pricing promotions and special offers."
          button="Manage Discounts"
        />

        <WorkflowCard
          number="04"
          title="Share Links"
          description="Generate trackable links for social media, websites, and campaigns."
          button="Create Link"
        />
      </div>
    </PageHeader>
  );
}

/* =====================================================
   PROFILE
===================================================== */

function ProfilePage({
  author,
  setAuthor,
}) {
  return (
    <PageHeader
      eyebrow="AUTHOR IDENTITY"
      title="Author Profile"
      description="Manage the public information readers see about you."
    >
      <div style={styles.formGrid}>
        <FormField
          label="Author Name"
          value={author.name}
          onChange={(value) =>
            setAuthor({
              ...author,
              name: value,
            })
          }
        />

        <FormField
          label="Specialty"
          value={author.specialty}
          onChange={(value) =>
            setAuthor({
              ...author,
              specialty: value,
            })
          }
        />

        <div style={styles.formFull}>
          <FormField
            label="Biography"
            value={author.bio}
            textarea
            onChange={(value) =>
              setAuthor({
                ...author,
                bio: value,
              })
            }
          />
        </div>
      </div>

      <div style={styles.formActions}>
        <button
          type="button"
          style={styles.primaryButton}
        >
          Save Profile
        </button>
      </div>
    </PageHeader>
  );
}

/* =====================================================
   NOTIFICATIONS
===================================================== */

function NotificationsPage() {
  return (
    <PageHeader
      eyebrow="ACCOUNT ACTIVITY"
      title="Notifications"
      description="Stay informed about your books, readers, sales, reviews, and payouts."
    >
      <div style={styles.notificationList}>
        <Notification
          title="Sales notifications"
          description="Receive alerts when a publication is purchased."
        />

        <Notification
          title="Publishing notifications"
          description="Receive updates when manuscripts are approved or require revisions."
        />

        <Notification
          title="Review notifications"
          description="Receive alerts when readers leave reviews."
        />

        <Notification
          title="Payout notifications"
          description="Receive confirmation when earnings are paid."
        />

        <Notification
          title="Platform announcements"
          description="Receive important Ilm-Hub publishing announcements."
        />
      </div>
    </PageHeader>
  );
}

/* =====================================================
   SETTINGS
===================================================== */

function SettingsPage() {
  return (
    <PageHeader
      eyebrow="ACCOUNT MANAGEMENT"
      title="Settings"
      description="Manage account security, preferences, and publishing configuration."
    >
      <div style={styles.settingsList}>
        <SettingsRow
          title="Account Information"
          description="Email, name, contact details, and account identity."
        />

        <SettingsRow
          title="Password & Security"
          description="Password, sessions, authentication, and security preferences."
        />

        <SettingsRow
          title="Payout Settings"
          description="Bank account and payout configuration."
        />

        <SettingsRow
          title="Notification Preferences"
          description="Control which email and dashboard notifications you receive."
        />

        <SettingsRow
          title="Privacy"
          description="Manage public author profile visibility and privacy preferences."
        />
      </div>
    </PageHeader>
  );
}

/* =====================================================
   SUPPORT
===================================================== */

function SupportPage() {
  return (
    <PageHeader
      eyebrow="PUBLISHING ASSISTANCE"
      title="Support"
      description="Get help with publishing, sales, payments, readers, and your author account."
    >
      <div style={styles.workflowGrid}>
        <WorkflowCard
          number="01"
          title="Publishing Support"
          description="Questions about manuscript submission, revisions, metadata, or publication."
          button="Contact Publishing"
        />

        <WorkflowCard
          number="02"
          title="Payment Support"
          description="Questions about royalties, payouts, refunds, or transactions."
          button="Contact Finance"
        />

        <WorkflowCard
          number="03"
          title="Technical Support"
          description="Report dashboard, account, upload, or platform problems."
          button="Open Technical Ticket"
        />

        <WorkflowCard
          number="04"
          title="General Inquiry"
          description="Contact the Ilm-Hub team about anything else."
          button="Send Message"
        />
      </div>
    </PageHeader>
  );
}

/* =====================================================
   REUSABLE COMPONENTS
===================================================== */

function PageHeader({
  eyebrow,
  title,
  description,
  action,
  onAction,
  children,
}) {
  return (
    <>
      <section style={styles.pageHeader}>
        <div>
          <div style={styles.eyebrow}>
            {eyebrow}
          </div>

          <h1 style={styles.pageTitle}>
            {title}
          </h1>

          <p style={styles.pageDescription}>
            {description}
          </p>
        </div>

        {action && (
          <button
            type="button"
            onClick={onAction}
            style={styles.primaryButton}
          >
            {action}
          </button>
        )}
      </section>

      <div style={styles.pageContent}>
        {children}
      </div>
    </>
  );
}

function PanelHeader({
  title,
  description,
  action,
  onAction,
}) {
  return (
    <div style={styles.panelHeader}>
      <div>
        <h2 style={styles.panelTitle}>
          {title}
        </h2>

        <p style={styles.panelDescription}>
          {description}
        </p>
      </div>

      {action && (
        <button
          type="button"
          onClick={onAction}
          style={styles.textButton}
        >
          {action}
        </button>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
  accent,
  icon,
}) {
  return (
    <div
      style={{
        ...styles.metricCard,
        borderTop: `3px solid ${accent}`,
      }}
    >
      <div style={styles.metricTop}>
        <span style={styles.metricLabel}>
          {label}
        </span>

        <span
          style={{
            ...styles.metricIcon,
            color: accent,
            backgroundColor: `${accent}12`,
          }}
        >
          {icon}
        </span>
      </div>

      <div style={styles.metricValue}>
        {value}
      </div>

      <div style={styles.metricDescription}>
        {description}
      </div>
    </div>
  );
}

function SmallMetric({
  label,
  value,
  description,
}) {
  return (
    <div style={styles.smallMetric}>
      <div style={styles.smallMetricLabel}>
        {label}
      </div>

      <div style={styles.smallMetricValue}>
        {value}
      </div>

      <div
        style={
          styles.smallMetricDescription
        }
      >
        {description}
      </div>
    </div>
  );
}

function QuickAction({
  label,
  icon,
  onClick,
  primary,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.quickAction,
        ...(primary
          ? styles.quickActionPrimary
          : {}),
      }}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}

function PeriodSelector({
  value,
  onChange,
}) {
  return (
    <div style={styles.periodGroup}>
      {[
        ['7d', '7 Days'],
        ['30d', '30 Days'],
        ['90d', '90 Days'],
        ['all', 'All Time'],
      ].map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() =>
            onChange(key)
          }
          style={{
            ...styles.periodButton,
            ...(value === key
              ? styles.periodButtonActive
              : {}),
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function RoyaltyCard({
  authorRevenue,
  platformRevenue,
  formatCurrency,
}) {
  return (
    <section style={styles.royaltyCard}>
      <div style={styles.royaltyHeader}>
        <div>
          <div style={styles.eyebrow}>
            ROYALTY STRUCTURE
          </div>

          <h2 style={styles.royaltyTitle}>
            Your 70 / 30 Revenue Split
          </h2>

          <p
            style={
              styles.royaltyDescription
            }
          >
            Gross book revenue is allocated
            between your author earnings and
            the platform share.
          </p>
        </div>

        <div style={styles.splitBadge}>
          <strong>70%</strong>
          <span>Author</span>
        </div>
      </div>

      <div style={styles.splitTrack}>
        <div
          style={{
            width: '70%',
            backgroundColor:
              COLORS.primary,
          }}
        />

        <div
          style={{
            width: '30%',
            backgroundColor:
              '#cbd5e1',
          }}
        />
      </div>

      <div style={styles.splitLegend}>
        <Legend
          color={COLORS.primary}
          title={formatCurrency(
            authorRevenue
          )}
          description="Your earnings · 70%"
        />

        <Legend
          color="#cbd5e1"
          title={formatCurrency(
            platformRevenue
          )}
          description="Platform allocation · 30%"
        />
      </div>
    </section>
  );
}

function Legend({
  color,
  title,
  description,
}) {
  return (
    <div style={styles.legendItem}>
      <span
        style={{
          ...styles.legendDot,
          backgroundColor: color,
        }}
      />

      <div>
        <strong>{title}</strong>

        <span>{description}</span>
      </div>
    </div>
  );
}

function BookTable({
  books,
  formatCurrency,
  formatNumber,
  detailed,
}) {
  return (
    <div style={styles.tableScroll}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>
              Publication
            </th>

            <th style={styles.th}>
              Status
            </th>

            <th style={styles.th}>
              Sales
            </th>

            <th style={styles.th}>
              Downloads
            </th>

            <th style={styles.th}>
              Revenue
            </th>

            {detailed && (
              <th style={styles.th}>
                Actions
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {books.map((book, index) => (
            <tr
              key={book.id || index}
            >
              <td style={styles.td}>
                <div style={styles.bookName}>
                  {book.title ||
                    book.bookTitle ||
                    'Untitled Book'}
                </div>

                {book.category && (
                  <div
                    style={
                      styles.bookCategory
                    }
                  >
                    {book.category}
                  </div>
                )}
              </td>

              <td style={styles.td}>
                <StatusPill
                  status={
                    book.status ||
                    'Active'
                  }
                />
              </td>

              <td style={styles.td}>
                {formatNumber(
                  book.sales
                )}
              </td>

              <td style={styles.td}>
                {formatNumber(
                  book.downloads
                )}
              </td>

              <td
                style={{
                  ...styles.td,
                  color:
                    COLORS.primary,
                  fontWeight: 800,
                }}
              >
                {formatCurrency(
                  book.revenue
                )}
              </td>

              {detailed && (
                <td style={styles.td}>
                  <button
                    type="button"
                    style={
                      styles.tableAction
                    }
                  >
                    Manage
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusPill({
  status,
}) {
  const value = String(
    status || ''
  ).toLowerCase();

  let style = {
    backgroundColor: '#f8fafc',
    color: COLORS.textMuted,
    border: `1px solid ${COLORS.border}`,
  };

  if (
    value.includes('active') ||
    value.includes('approved') ||
    value.includes('published') ||
    value.includes('completed') ||
    value.includes('live')
  ) {
    style = {
      backgroundColor:
        COLORS.primaryLight,
      color: '#166534',
      border: `1px solid ${COLORS.primaryBorder}`,
    };
  }

  if (
    value.includes('pending') ||
    value.includes('review') ||
    value.includes('draft')
  ) {
    style = {
      backgroundColor:
        COLORS.orangeLight,
      color: COLORS.orange,
      border: '1px solid #fed7aa',
    };
  }

  if (
    value.includes('reject') ||
    value.includes('failed')
  ) {
    style = {
      backgroundColor:
        COLORS.redLight,
      color: COLORS.red,
      border: '1px solid #fecaca',
    };
  }

  return (
    <span
      style={{
        ...styles.statusPill,
        ...style,
      }}
    >
      {status || 'Unknown'}
    </span>
  );
}

function Insight({
  number,
  title,
  text,
}) {
  return (
    <div style={styles.insight}>
      <div style={styles.insightNumber}>
        {number}
      </div>

      <div>
        <div style={styles.insightTitle}>
          {title}
        </div>

        <div style={styles.insightText}>
          {text}
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}) {
  return (
    <div style={styles.emptyState}>
      <div style={styles.emptyIcon}>
        {icon}
      </div>

      <div style={styles.emptyTitle}>
        {title}
      </div>

      <div
        style={
          styles.emptyDescription
        }
      >
        {description}
      </div>
    </div>
  );
}

function WorkflowCard({
  number,
  title,
  description,
  button,
}) {
  return (
    <div style={styles.workflowCard}>
      <div style={styles.workflowNumber}>
        {number}
      </div>

      <h3 style={styles.workflowTitle}>
        {title}
      </h3>

      <p style={styles.workflowDescription}>
        {description}
      </p>

      <button
        type="button"
        style={styles.workflowButton}
      >
        {button} →
      </button>
    </div>
  );
}

function Checklist({
  items,
}) {
  return (
    <div style={styles.checklist}>
      {items.map((item) => (
        <div
          key={item}
          style={styles.checklistItem}
        >
          <span
            style={styles.checkIcon}
          >
            ✓
          </span>

          {item}
        </div>
      ))}
    </div>
  );
}

function AnalyticsCard({
  title,
  value,
  description,
  color,
}) {
  return (
    <div style={styles.analyticsCard}>
      <div
        style={{
          ...styles.analyticsIndicator,
          backgroundColor: color,
        }}
      />

      <div style={styles.analyticsTitle}>
        {title}
      </div>

      <div style={styles.analyticsValue}>
        {value}
      </div>

      <div
        style={
          styles.analyticsDescription
        }
      >
        {description}
      </div>

      <div style={styles.fakeChart}>
        <span style={{ height: '25%' }} />
        <span style={{ height: '45%' }} />
        <span style={{ height: '35%' }} />
        <span style={{ height: '70%' }} />
        <span style={{ height: '55%' }} />
        <span style={{ height: '90%' }} />
      </div>
    </div>
  );
}

function InfoCard({
  title,
  description,
  icon,
}) {
  return (
    <div style={styles.infoCard}>
      <div style={styles.infoIcon}>
        {icon}
      </div>

      <div>
        <h3 style={styles.infoTitle}>
          {title}
        </h3>

        <p style={styles.infoDescription}>
          {description}
        </p>
      </div>
    </div>
  );
}

function Notice({
  title,
  text,
}) {
  return (
    <div style={styles.notice}>
      <div style={styles.noticeIcon}>
        i
      </div>

      <div>
        <strong>{title}</strong>

        <p>{text}</p>
      </div>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  textarea,
}) {
  return (
    <label style={styles.formField}>
      <span style={styles.formLabel}>
        {label}
      </span>

      {textarea ? (
        <textarea
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          style={styles.textarea}
          rows={6}
        />
      ) : (
        <input
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          style={styles.input}
        />
      )}
    </label>
  );
}

function Notification({
  title,
  description,
}) {
  const [enabled, setEnabled] =
    useState(true);

  return (
    <div style={styles.notification}>
      <div>
        <strong>{title}</strong>

        <p>{description}</p>
      </div>

      <button
        type="button"
        onClick={() =>
          setEnabled(!enabled)
        }
        style={{
          ...styles.toggle,
          backgroundColor: enabled
            ? COLORS.primary
            : '#cbd5e1',
        }}
      >
        <span
          style={{
            ...styles.toggleKnob,
            transform: enabled
              ? 'translateX(18px)'
              : 'translateX(2px)',
          }}
        />
      </button>
    </div>
  );
}

function SettingsRow({
  title,
  description,
}) {
  return (
    <div style={styles.settingsRow}>
      <div>
        <strong>{title}</strong>

        <p>{description}</p>
      </div>

      <button
        type="button"
        style={styles.tableAction}
      >
        Manage →
      </button>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={styles.loadingPage}>
      <div style={styles.loadingCard}>
        <div style={styles.loadingLogo}>
          ILM-HUB
        </div>

        <div style={styles.spinner} />

        <h2 style={styles.loadingTitle}>
          Preparing your author workspace
        </h2>

        <p style={styles.loadingText}>
          Loading publications, sales,
          readers, earnings, and account
          information...
        </p>
      </div>
    </div>
  );
}

function getInitials(name) {
  return String(name || 'A')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) =>
      word.charAt(0).toUpperCase()
    )
    .join('');
}

/* =====================================================
   STYLES
===================================================== */

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: COLORS.background,
    color: COLORS.text,
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  header: {
    backgroundColor: COLORS.white,
    borderBottom: `1px solid ${COLORS.border}`,
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },

  headerInner: {
    maxWidth: '1440px',
    margin: '0 auto',
    padding: '13px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
  },

  brandArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },

  logo: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    padding: '9px 12px',
    borderRadius: '7px',
    fontSize: '13px',
    fontWeight: 800,
    letterSpacing: '0.08em',
  },

  brandDivider: {
    width: '1px',
    height: '32px',
    backgroundColor: COLORS.border,
  },

  portalLabel: {
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '0.14em',
    color: COLORS.primary,
  },

  portalTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: COLORS.text,
    marginTop: '2px',
  },

  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  secondaryButton: {
    backgroundColor: COLORS.white,
    color: '#334155',
    border: `1px solid ${COLORS.border}`,
    padding: '8px 12px',
    borderRadius: '7px',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
  },

  secondaryLink: {
    backgroundColor: COLORS.white,
    color: '#334155',
    border: `1px solid ${COLORS.border}`,
    padding: '8px 12px',
    borderRadius: '7px',
    fontSize: '12px',
    fontWeight: 700,
    textDecoration: 'none',
  },

  profileButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: COLORS.white,
    color: COLORS.text,
    border: `1px solid ${COLORS.border}`,
    padding: '5px 10px 5px 5px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
  },

  headerAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: COLORS.primaryLight,
    color: COLORS.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 800,
  },

  layout: {
    maxWidth: '1440px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '235px minmax(0, 1fr)',
    minHeight: 'calc(100vh - 63px)',
  },

  sidebar: {
    backgroundColor: COLORS.white,
    borderRight: `1px solid ${COLORS.border}`,
    padding: '25px 13px',
    position: 'sticky',
    top: '63px',
    height: 'calc(100vh - 63px)',
    overflowY: 'auto',
  },

  sidebarTop: {
    padding: '0 11px 22px',
    borderBottom: `1px solid ${COLORS.border}`,
    marginBottom: '18px',
  },

  sidebarEyebrow: {
    color: COLORS.primary,
    fontSize: '9px',
    fontWeight: 800,
    letterSpacing: '0.13em',
  },

  sidebarName: {
    color: COLORS.text,
    fontSize: '13px',
    fontWeight: 800,
    marginTop: '7px',
  },

  sidebarSpecialty: {
    color: COLORS.textMuted,
    fontSize: '10px',
    lineHeight: 1.4,
    marginTop: '3px',
  },

  navGroup: {
    marginBottom: '19px',
  },

  navGroupTitle: {
    color: '#94a3b8',
    fontSize: '9px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.11em',
    padding: '0 11px 7px',
  },

  navItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#475569',
    padding: '8px 11px',
    borderRadius: '7px',
    fontSize: '11px',
    fontWeight: 650,
    cursor: 'pointer',
    textAlign: 'left',
    marginBottom: '2px',
  },

  navItemActive: {
    backgroundColor: COLORS.primaryLight,
    color: COLORS.primary,
    fontWeight: 800,
  },

  navIcon: {
    width: '19px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '13px',
  },

  navIconActive: {
    color: COLORS.primary,
  },

  sidebarFooter: {
    marginTop: '25px',
  },

  helpCard: {
    backgroundColor: COLORS.primaryLight,
    border: `1px solid ${COLORS.primaryBorder}`,
    borderRadius: '9px',
    padding: '13px',
  },

  helpTitle: {
    color: COLORS.primary,
    fontSize: '11px',
    fontWeight: 800,
  },

  helpText: {
    color: COLORS.textMuted,
    fontSize: '10px',
    lineHeight: 1.5,
    marginTop: '4px',
  },

  helpButton: {
    marginTop: '9px',
    backgroundColor: COLORS.white,
    color: COLORS.primary,
    border: `1px solid ${COLORS.primaryBorder}`,
    borderRadius: '6px',
    padding: '6px 8px',
    fontSize: '9px',
    fontWeight: 800,
    cursor: 'pointer',
  },

  main: {
    minWidth: 0,
    padding: '32px 34px 60px',
  },

  welcomeSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '24px',
    marginBottom: '22px',
  },

  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: '25px',
    marginBottom: '25px',
  },

  pageContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  eyebrow: {
    color: COLORS.primary,
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '0.14em',
    marginBottom: '7px',
  },

  pageTitle: {
    fontSize: '27px',
    lineHeight: 1.2,
    fontWeight: 800,
    margin: 0,
    color: COLORS.text,
  },

  pageDescription: {
    margin: '8px 0 0',
    color: COLORS.textMuted,
    fontSize: '13px',
    lineHeight: 1.6,
    maxWidth: '760px',
  },

  authorBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 13px',
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '10px',
  },

  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: COLORS.primaryLight,
    border: `1px solid ${COLORS.primaryBorder}`,
    color: COLORS.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 800,
  },

  authorBadgeName: {
    fontSize: '12px',
    fontWeight: 700,
    color: COLORS.text,
  },

  authorBadgeRole: {
    fontSize: '10px',
    color: COLORS.primary,
    marginTop: '2px',
    fontWeight: 700,
  },

  quickBar: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(4, minmax(0, 1fr))',
    gap: '9px',
    marginBottom: '27px',
  },

  quickAction: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    backgroundColor: COLORS.white,
    color: '#334155',
    border: `1px solid ${COLORS.border}`,
    padding: '10px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: 750,
    cursor: 'pointer',
  },

  quickActionPrimary: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    borderColor: COLORS.primary,
  },

  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: '20px',
    marginBottom: '13px',
  },

  sectionTitle: {
    margin: 0,
    fontSize: '17px',
    fontWeight: 800,
  },

  sectionDescription: {
    margin: '4px 0 0',
    color: COLORS.textMuted,
    fontSize: '12px',
  },

  periodGroup: {
    display: 'flex',
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    padding: '3px',
    borderRadius: '8px',
  },

  periodButton: {
    border: 'none',
    backgroundColor: 'transparent',
    color: COLORS.textMuted,
    padding: '7px 10px',
    borderRadius: '6px',
    fontSize: '10px',
    fontWeight: 750,
    cursor: 'pointer',
  },

  periodButtonActive: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(190px, 1fr))',
    gap: '12px',
  },

  metricCard: {
    backgroundColor: COLORS.white,
    borderRadius: '10px',
    padding: '17px',
    borderLeft: `1px solid ${COLORS.border}`,
    borderRight: `1px solid ${COLORS.border}`,
    borderBottom: `1px solid ${COLORS.border}`,
    boxShadow:
      '0 2px 7px rgba(15,23,42,0.035)',
  },

  metricTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  metricLabel: {
    color: COLORS.textMuted,
    fontSize: '10px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },

  metricIcon: {
    width: '27px',
    height: '27px',
    borderRadius: '7px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 800,
  },

  metricValue: {
    color: COLORS.text,
    fontSize: '24px',
    fontWeight: 800,
    marginTop: '12px',
  },

  metricDescription: {
    color: COLORS.textMuted,
    fontSize: '10px',
    marginTop: '4px',
  },

  secondaryGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(170px, 1fr))',
    gap: '10px',
  },

  smallMetric: {
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '9px',
    padding: '14px 16px',
  },

  smallMetricLabel: {
    fontSize: '10px',
    fontWeight: 700,
    color: COLORS.textMuted,
  },

  smallMetricValue: {
    fontSize: '18px',
    fontWeight: 800,
    color: COLORS.text,
    marginTop: '5px',
  },

  smallMetricDescription: {
    fontSize: '9px',
    color: COLORS.textLight,
    marginTop: '3px',
  },

  royaltyCard: {
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '11px',
    padding: '21px',
    boxShadow:
      '0 2px 8px rgba(15,23,42,0.035)',
  },

  royaltyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    marginBottom: '18px',
  },

  royaltyTitle: {
    fontSize: '17px',
    fontWeight: 800,
    margin: 0,
  },

  royaltyDescription: {
    fontSize: '11px',
    color: COLORS.textMuted,
    margin: '5px 0 0',
    maxWidth: '650px',
    lineHeight: 1.5,
  },

  splitBadge: {
    backgroundColor: COLORS.primaryLight,
    border: `1px solid ${COLORS.primaryBorder}`,
    color: COLORS.primary,
    borderRadius: '9px',
    padding: '9px 14px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '65px',
  },

  splitTrack: {
    width: '100%',
    height: '11px',
    display: 'flex',
    overflow: 'hidden',
    borderRadius: '20px',
    backgroundColor: '#e2e8f0',
  },

  splitLegend: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    marginTop: '13px',
  },

  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11px',
  },

  legendItemText: {
    display: 'flex',
  },

  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },

  contentGrid: {
    display: 'grid',
    gridTemplateColumns:
      'minmax(0, 1.5fr) minmax(290px, 0.9fr)',
    gap: '17px',
  },

  panel: {
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '11px',
    overflow: 'hidden',
    boxShadow:
      '0 2px 8px rgba(15,23,42,0.035)',
  },

  panelHeader: {
    padding: '18px 19px',
    borderBottom: `1px solid ${COLORS.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '15px',
  },

  panelTitle: {
    fontSize: '15px',
    fontWeight: 800,
    margin: 0,
  },

  panelDescription: {
    fontSize: '10px',
    color: COLORS.textMuted,
    margin: '4px 0 0',
  },

  textButton: {
    border: 'none',
    background: 'transparent',
    color: COLORS.primary,
    fontSize: '10px',
    fontWeight: 800,
    cursor: 'pointer',
  },

  salesList: {
    display: 'flex',
    flexDirection: 'column',
  },

  saleRow: {
    display: 'grid',
    gridTemplateColumns:
      '36px minmax(0,1fr) auto auto',
    alignItems: 'center',
    gap: '11px',
    padding: '13px 19px',
    borderBottom: `1px solid ${COLORS.borderLight}`,
  },

  saleBookIcon: {
    width: '35px',
    height: '43px',
    borderRadius: '5px',
    backgroundColor: COLORS.primaryLight,
    border: `1px solid ${COLORS.primaryBorder}`,
    color: COLORS.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 800,
  },

  saleMain: {
    minWidth: 0,
  },

  saleTitle: {
    color: COLORS.text,
    fontSize: '11px',
    fontWeight: 750,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  saleMeta: {
    color: COLORS.textMuted,
    fontSize: '9px',
    marginTop: '4px',
  },

  saleAmount: {
    color: COLORS.primary,
    fontSize: '11px',
    fontWeight: 800,
  },

  statusPill: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '20px',
    padding: '4px 8px',
    fontSize: '8px',
    fontWeight: 800,
    whiteSpace: 'nowrap',
  },

  insightList: {
    padding: '4px 19px 15px',
  },

  insight: {
    display: 'flex',
    gap: '11px',
    padding: '13px 0',
    borderBottom: `1px solid ${COLORS.borderLight}`,
  },

  insightNumber: {
    color: COLORS.primary,
    fontSize: '9px',
    fontWeight: 900,
    paddingTop: '2px',
  },

  insightTitle: {
    fontSize: '11px',
    fontWeight: 800,
    marginBottom: '3px',
  },

  insightText: {
    color: COLORS.textMuted,
    fontSize: '10px',
    lineHeight: 1.5,
  },

  tableScroll: {
    overflowX: 'auto',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '11px',
  },

  th: {
    padding: '11px 17px',
    backgroundColor: '#f8fafc',
    color: COLORS.textMuted,
    fontSize: '9px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    borderBottom: `1px solid ${COLORS.border}`,
    whiteSpace: 'nowrap',
  },

  td: {
    padding: '13px 17px',
    borderBottom: `1px solid ${COLORS.borderLight}`,
    color: '#334155',
    whiteSpace: 'nowrap',
  },

  bookName: {
    fontWeight: 750,
    color: COLORS.text,
    whiteSpace: 'normal',
    minWidth: '180px',
  },

  bookCategory: {
    fontSize: '9px',
    color: COLORS.textMuted,
    marginTop: '3px',
  },

  tableAction: {
    border: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.white,
    color: COLORS.primary,
    padding: '6px 9px',
    borderRadius: '6px',
    fontSize: '9px',
    fontWeight: 800,
    cursor: 'pointer',
  },

  workflowGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px',
  },

  workflowCard: {
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '10px',
    padding: '18px',
  },

  workflowNumber: {
    color: COLORS.primary,
    fontSize: '10px',
    fontWeight: 900,
  },

  workflowTitle: {
    fontSize: '14px',
    fontWeight: 800,
    margin: '9px 0 0',
  },

  workflowDescription: {
    color: COLORS.textMuted,
    fontSize: '10px',
    lineHeight: 1.55,
    minHeight: '50px',
  },

  workflowButton: {
    backgroundColor: COLORS.white,
    color: COLORS.primary,
    border: `1px solid ${COLORS.primaryBorder}`,
    borderRadius: '6px',
    padding: '7px 9px',
    fontSize: '9px',
    fontWeight: 800,
    cursor: 'pointer',
  },

  checklist: {
    padding: '16px 19px',
    display: 'grid',
    gridTemplateColumns:
      'repeat(2, minmax(0, 1fr))',
  },

  checklistItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#475569',
    fontSize: '10px',
    padding: '8px 0',
  },

  checkIcon: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: COLORS.primaryLight,
    color: COLORS.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '9px',
    fontWeight: 900,
  },

  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(4, minmax(0, 1fr))',
    gap: '12px',
  },

  analyticsCard: {
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '10px',
    padding: '17px',
    overflow: 'hidden',
  },

  analyticsIndicator: {
    width: '28px',
    height: '3px',
    borderRadius: '4px',
    marginBottom: '12px',
  },

  analyticsTitle: {
    fontSize: '10px',
    color: COLORS.textMuted,
    fontWeight: 700,
  },

  analyticsValue: {
    fontSize: '21px',
    fontWeight: 800,
    marginTop: '5px',
  },

  analyticsDescription: {
    fontSize: '9px',
    color: COLORS.textMuted,
    marginTop: '3px',
  },

  fakeChart: {
    height: '45px',
    display: 'flex',
    alignItems: 'flex-end',
    gap: '4px',
    marginTop: '15px',
  },

  rankingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '13px 19px',
    borderBottom: `1px solid ${COLORS.borderLight}`,
  },

  rankNumber: {
    width: '27px',
    height: '27px',
    borderRadius: '50%',
    backgroundColor: COLORS.primaryLight,
    color: COLORS.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 900,
  },

  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(2, minmax(0, 1fr))',
    gap: '12px',
  },

  infoCard: {
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '10px',
    padding: '19px',
    display: 'flex',
    gap: '12px',
  },

  infoIcon: {
    width: '35px',
    height: '35px',
    borderRadius: '8px',
    backgroundColor: COLORS.primaryLight,
    color: COLORS.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
  },

  infoTitle: {
    fontSize: '13px',
    margin: 0,
    fontWeight: 800,
  },

  infoDescription: {
    color: COLORS.textMuted,
    fontSize: '10px',
    lineHeight: 1.5,
    margin: '4px 0 0',
  },

  notice: {
    display: 'flex',
    gap: '11px',
    backgroundColor: COLORS.blueLight,
    border: '1px solid #bfdbfe',
    borderRadius: '9px',
    padding: '13px',
    color: '#1e40af',
    fontSize: '10px',
  },

  noticeIcon: {
    width: '21px',
    height: '21px',
    borderRadius: '50%',
    backgroundColor: '#dbeafe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    flexShrink: 0,
  },

  formGrid: {
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '10px',
    padding: '20px',
    display: 'grid',
    gridTemplateColumns:
      'repeat(2, minmax(0, 1fr))',
    gap: '17px',
  },

  formFull: {
    gridColumn: '1 / -1',
  },

  formField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },

  formLabel: {
    fontSize: '10px',
    fontWeight: 800,
    color: COLORS.text,
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '7px',
    padding: '9px 10px',
    fontSize: '11px',
    color: COLORS.text,
    outline: 'none',
  },

  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '7px',
    padding: '9px 10px',
    fontSize: '11px',
    color: COLORS.text,
    resize: 'vertical',
    outline: 'none',
    fontFamily: 'inherit',
  },

  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },

  primaryButton: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    border: `1px solid ${COLORS.primary}`,
    borderRadius: '7px',
    padding: '9px 14px',
    fontSize: '10px',
    fontWeight: 800,
    cursor: 'pointer',
  },

  notificationList: {
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '10px',
    overflow: 'hidden',
  },

  notification: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    padding: '16px 19px',
    borderBottom: `1px solid ${COLORS.borderLight}`,
  },

  notificationListItem: {
    display: 'flex',
  },

  notification: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 19px',
    borderBottom: `1px solid ${COLORS.borderLight}`,
  },

  notificationText: {
    fontSize: '10px',
  },

  toggle: {
    width: '38px',
    height: '21px',
    border: 'none',
    borderRadius: '20px',
    position: 'relative',
    cursor: 'pointer',
    flexShrink: 0,
  },

  toggleKnob: {
    position: 'absolute',
    top: '2px',
    left: 0,
    width: '17px',
    height: '17px',
    backgroundColor: COLORS.white,
    borderRadius: '50%',
    transition: 'transform 0.15s',
  },

  settingsList: {
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '10px',
    overflow: 'hidden',
  },

  settingsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    padding: '17px 19px',
    borderBottom: `1px solid ${COLORS.borderLight}`,
  },

  errorBanner: {
    backgroundColor: COLORS.redLight,
    border: '1px solid #fecaca',
    color: COLORS.red,
    borderRadius: '9px',
    padding: '13px 15px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '15px',
    fontSize: '11px',
  },

  errorButton: {
    backgroundColor: COLORS.white,
    border: '1px solid #fecaca',
    color: COLORS.red,
    padding: '7px 11px',
    borderRadius: '6px',
    fontWeight: 700,
    cursor: 'pointer',
  },

  emptyState: {
    textAlign: 'center',
    padding: '42px 24px',
  },

  emptyIcon: {
    width: '40px',
    height: '40px',
    margin: '0 auto 11px',
    borderRadius: '50%',
    backgroundColor: COLORS.primaryLight,
    color: COLORS.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
  },

  emptyTitle: {
    fontSize: '12px',
    fontWeight: 800,
  },

  emptyDescription: {
    maxWidth: '470px',
    margin: '5px auto 0',
    color: COLORS.textMuted,
    fontSize: '10px',
    lineHeight: 1.5,
  },

  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    padding: '25px 0 0',
    marginTop: '35px',
    borderTop: `1px solid ${COLORS.border}`,
    fontSize: '10px',
    color: COLORS.textMuted,
  },

  footerLinks: {
    display: 'flex',
    gap: '14px',
  },

  loadingPage: {
    minHeight: '100vh',
    backgroundColor: COLORS.background,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, sans-serif',
  },

  loadingCard: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '14px',
    padding: '40px',
    textAlign: 'center',
    boxShadow:
      '0 8px 30px rgba(15,23,42,0.06)',
  },

  loadingLogo: {
    display: 'inline-block',
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    padding: '9px 12px',
    borderRadius: '7px',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.08em',
    marginBottom: '25px',
  },

  spinner: {
    width: '30px',
    height: '30px',
    border: '3px solid #dcfce7',
    borderTopColor: COLORS.primary,
    borderRadius: '50%',
    margin: '0 auto 18px',
    animation:
      'spin 0.8s linear infinite',
  },

  loadingTitle: {
    fontSize: '17px',
    fontWeight: 800,
    color: COLORS.text,
    margin: 0,
  },

  loadingText: {
    color: COLORS.textMuted,
    fontSize: '12px',
    lineHeight: 1.5,
    margin: '7px 0 0',
  },
};
