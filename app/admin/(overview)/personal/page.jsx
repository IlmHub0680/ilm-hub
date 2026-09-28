'use client';

import Link from 'next/link';
import { useAdminData } from '../AdminShell';
import {
  sectionTitle,
  primaryCardGrid,
  primaryCardStyle,
  primaryCardIconStyle,
  primaryCardTitle,
  primaryCardDesc,
  primaryCardArrow,
  buildSearchIndex,
  AdminSearchResults,
} from '../_shared';

// 👤 Personal Management -- the user's own personal/platform-owned
// commercial operations (Bookstore, Media, personal Library,
// Publishing, Author Management). These are NOT institute departments
// and are never merged with Institute Management below.
export default function AdminPersonalManagementPage() {
  const {
    personalManagementSections,
    instituteFrameworkSections,
    institutePublicWebsiteSections,
    instituteAdministrationSections,
    instituteConfigSections,
    delegatedDuties,
    searchQuery,
  } = useAdminData();

  // Same shared search box as Overview/Institute/Delegated (see the
  // comment on AdminSearchResults in ../_shared.jsx) -- while searching,
  // this page shows the same unified cross-scope results instead of its
  // own Personal Management grid.
  const isSearching = (searchQuery || '').trim().length > 0;

  return (
    <section>
      <h2 style={sectionTitle}>👤 Personal Management</h2>
      <p className="sub" style={{ marginBottom: 16 }}>
        Your own personal/platform-owned businesses, content systems, and
        publishing operations — not departments of the Islamic institute.
      </p>
      {isSearching ? (
        <AdminSearchResults
          query={searchQuery}
          index={buildSearchIndex({
            personalManagementSections,
            instituteFrameworkSections,
            institutePublicWebsiteSections,
            instituteAdministrationSections,
            instituteConfigSections,
            delegatedDuties,
          })}
        />
      ) : (
        <div style={primaryCardGrid}>
          {personalManagementSections.map((s, i) => {
            const accent = i % 2 === 0 ? 'brand' : 'gold';
            return (
              <Link key={s.href} href={s.href} className="ih-card" style={primaryCardStyle(accent)}>
                <span style={primaryCardArrow} aria-hidden="true">→</span>
                <span style={primaryCardIconStyle(accent)} aria-hidden="true">{s.icon}</span>
                <h3 style={primaryCardTitle}>{s.title}</h3>
                <p style={primaryCardDesc}>{s.description}</p>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
