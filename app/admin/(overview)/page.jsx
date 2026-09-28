'use client';

import { useAdminData } from './AdminShell';
import { useSiteBranding } from '@/components/SiteBrandingProvider';
import {
  bannerWrap,
  welcomeBanner,
  welcomeBannerAccentLine,
  welcomeBannerPhotoStyle,
  bannerTitle,
  bannerDescription,
  bannerPillRow,
  bannerPill,
  overviewStatGrid,
  overviewStatTileStyle,
  overviewStatValue,
  overviewStatLabel,
  buildSearchIndex,
  AdminSearchResults,
} from './_shared';

const STAT_ACCENTS = ['brand', 'gold'];

export default function AdminOverviewPage() {
  const {
    user,
    stats,
    personalManagementSections,
    instituteFrameworkSections,
    institutePublicWebsiteSections,
    instituteAdministrationSections,
    instituteConfigSections,
    delegatedDuties,
    searchQuery,
  } = useAdminData();

  const { heroImageUrl } = useSiteBranding();

  // The search bar in the shell's top area (see AdminShell) is shared
  // chrome visible on all four sidebar pages (Overview, Personal
  // Management, Institute Management, Delegated Operations). Overview
  // itself carries no Quick Links list of its own any more -- every
  // section is already one click away via the sidebar, and the old
  // curated shortcut list just duplicated Personal Management /
  // Institute Management with an extra step in between. Search still
  // works here exactly like the other three tabs, built from ALL
  // sections across every scope (including Delegated Operations).
  const trimmedQuery = (searchQuery || '').trim();
  const isSearching = trimmedQuery.length > 0;

  return (
    <section>
      {/* WELCOME BANNER -- matches the student portal's pattern
          (app/login/page.jsx, styles.welcomeBanner et al.) including
          its institute-photo background treatment, scoped to this
          page since it's overview content, not shell chrome. */}
      <header style={bannerWrap}>
        <div style={{ ...welcomeBanner, ...welcomeBannerPhotoStyle(heroImageUrl) }}>
          <div style={welcomeBannerAccentLine} aria-hidden="true" />

          <h1 style={bannerTitle}>Assalamu Alaikum, {user.name}</h1>

          <p style={bannerDescription}>
            Institute administration and oversight.
          </p>

          <div style={bannerPillRow}>
            <span style={bannerPill}>
              <span aria-hidden="true">🛡</span>
              Role: {user.role}
            </span>
          </div>
        </div>
      </header>

      <div style={overviewStatGrid}>
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="ih-overview-stat"
            style={overviewStatTileStyle(STAT_ACCENTS[i % STAT_ACCENTS.length])}
          >
            <div style={overviewStatValue}>{s.value}</div>
            <div style={overviewStatLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {isSearching && (
        <div style={{ marginTop: 28 }}>
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
        </div>
      )}

      <style jsx>{`
        .ih-overview-stat:hover {
          box-shadow: 0 12px 28px rgba(27, 36, 31, 0.14);
          transform: translateY(-2px);
        }
      `}</style>
    </section>
  );
}
