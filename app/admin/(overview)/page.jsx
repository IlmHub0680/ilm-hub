'use client';

import Link from 'next/link';
import { useAdminData } from './AdminShell';
import { QUICK_LINK_TITLES, sectionTitle, cardGrid, sectionCard, cardIcon, cardTitle, cardDesc } from './_shared';

export default function AdminOverviewPage() {
  const {
    stats,
    personalManagementSections,
    instituteFrameworkSections,
    institutePublicWebsiteSections,
    instituteAdministrationSections,
    instituteConfigSections,
  } = useAdminData();

  const allSections = [
    ...personalManagementSections,
    ...instituteFrameworkSections,
    ...institutePublicWebsiteSections,
    ...instituteAdministrationSections,
    ...instituteConfigSections,
  ];

  return (
    <section>
      <div className="ih-stat-grid">
        {stats.map((s) => (
          <div key={s.label} className="ih-stat-tile">
            <div className="n">{s.value}</div>
            <div className="l">{s.label}</div>
          </div>
        ))}
      </div>

      <h2 style={{ ...sectionTitle, marginTop: 28 }}>Quick Links</h2>
      <p className="sub" style={{ marginBottom: 16 }}>
        The sections admins reach most often — the full list is under
        Personal Management and Institute Management.
      </p>
      <div style={cardGrid}>
        {allSections
          .filter((s) => QUICK_LINK_TITLES.includes(s.title))
          .sort(
            (a, b) =>
              QUICK_LINK_TITLES.indexOf(a.title) -
              QUICK_LINK_TITLES.indexOf(b.title)
          )
          .map((s) => (
            <Link key={s.href} href={s.href} className="ih-card" style={sectionCard}>
              <span style={cardIcon} aria-hidden="true">{s.icon}</span>
              <h3 style={cardTitle}>{s.title}</h3>
              <p style={cardDesc}>{s.description}</p>
            </Link>
          ))}
      </div>
    </section>
  );
}
