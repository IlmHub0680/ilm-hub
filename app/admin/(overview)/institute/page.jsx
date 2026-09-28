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

// 🏛 Institute Management -- everything Admin manages on behalf of the
// Islamic institute and its public website. This is the Level 1
// landing page: four category cards, each a doorway into its own
// Level 2 page (./framework, ./website, ./administration,
// ./configuration) which renders that category's real module grid.
// Never merged with Personal Management or with Delegated Operations
// (the 13 role-owned dashboards, which have their own separate nav item).
// `accent` alternates brand/gold across the four cards purely for
// visual rhythm -- see the accent comment in ../_shared.jsx.
const CATEGORIES = [
  {
    href: '/admin/institute/framework',
    icon: '🏛',
    title: 'Academy / Institutional Framework',
    description:
      "Manage the Academy's institutional, academic, curriculum, governance, student, faculty, quality assurance, and academic integration framework. This area contains the Academy's core institutional and academic management infrastructure.",
    accent: 'brand',
  },
  {
    href: '/admin/institute/website',
    icon: '🌐',
    title: 'Public Institute Website',
    description:
      'Manage the public-facing institute website, including its homepage, content, events, news, alumni, information pages, AI Assistant, newsletter, and sponsorships.',
    accent: 'gold',
  },
  {
    href: '/admin/institute/administration',
    icon: '👥',
    title: 'Institute Administration / Oversight',
    description:
      'Manage institution-wide staff, positions, permissions, analytics, oversight workflows, audit activity, and permission reviews.',
    accent: 'brand',
  },
  {
    href: '/admin/institute/configuration',
    icon: '⚙️',
    title: 'Institute Configuration',
    description:
      'Manage institution-wide policies and configuration frameworks, while providing oversight of delegated areas that are operated from their respective staff dashboards.',
    accent: 'gold',
  },
];

export default function AdminInstituteManagementPage() {
  const {
    personalManagementSections,
    instituteFrameworkSections,
    institutePublicWebsiteSections,
    instituteAdministrationSections,
    instituteConfigSections,
    delegatedDuties,
    searchQuery,
  } = useAdminData();

  // Same shared search box as Overview/Personal/Delegated (see the
  // comment on AdminSearchResults in ../_shared.jsx) -- while searching,
  // this page shows the same unified cross-scope results instead of its
  // own four category cards.
  const isSearching = (searchQuery || '').trim().length > 0;

  return (
    <section>
      <h2 style={sectionTitle}>🏛 Institute Management</h2>
      <p className="sub" style={{ marginBottom: 24 }}>
        Everything Admin manages on behalf of the Islamic institute and its
        public website.
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
          {CATEGORIES.map((c) => (
            <Link key={c.href} href={c.href} className="ih-card" style={primaryCardStyle(c.accent)}>
              <span style={primaryCardArrow} aria-hidden="true">→</span>
              <span style={primaryCardIconStyle(c.accent)} aria-hidden="true">{c.icon}</span>
              <h3 style={primaryCardTitle}>{c.title}</h3>
              <p style={primaryCardDesc}>{c.description}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
