'use client';

import Link from 'next/link';
import { useAdminData } from '../AdminShell';
import {
  sectionTitle,
  primaryCardGrid,
  primaryCardStyle,
  primaryCardIconStyle,
  primaryCardTitle,
  ownerTag,
  inlineLink,
  pendingNote,
  buildSearchIndex,
  AdminSearchResults,
} from '../_shared';

export default function DelegatedDutiesPage() {
  const {
    personalManagementSections,
    instituteFrameworkSections,
    institutePublicWebsiteSections,
    instituteAdministrationSections,
    instituteConfigSections,
    delegatedDuties,
    searchQuery,
  } = useAdminData();

  // Same shared search box as Overview/Personal/Institute (see the
  // comment on AdminSearchResults in ../_shared.jsx) -- while searching,
  // this page shows the same unified cross-scope results instead of its
  // own delegated-duties grid.
  const isSearching = (searchQuery || '').trim().length > 0;

  return (
    <section>
      <h2 style={sectionTitle}>Delegated Operations (Oversight Only)</h2>
      <p className="sub" style={{ marginBottom: 16 }}>
        These are owned and operated by the designated role — Admin can view them, not perform them.
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
          {delegatedDuties.map((d, i) => {
            const accent = i % 2 === 0 ? 'brand' : 'gold';
            return (
              <div key={d.title} className="ih-card" style={primaryCardStyle(accent)}>
                <span style={primaryCardIconStyle(accent)} aria-hidden="true">{d.icon}</span>
                <span style={ownerTag}>Owner: {d.owner}</span>
                <h3 style={primaryCardTitle}>{d.title}</h3>
                <Link href={d.href} style={inlineLink}>View dashboard →</Link>
                {d.note && <p style={pendingNote}>{d.note}</p>}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
