'use client';

import Link from 'next/link';
import {
  sectionTitle,
  primaryCardGrid,
  primaryCard,
  primaryCardIcon,
  primaryCardTitle,
  primaryCardDesc,
  primaryCardArrow,
} from '../_shared';

// 🏛 Institute Management -- everything Admin manages on behalf of the
// Islamic institute and its public website. This is the Level 1
// landing page: four large category cards, each a doorway into its
// own Level 2 page (./framework, ./website, ./administration,
// ./configuration) which renders that category's real module grid.
// Never merged with Personal Management or with Delegated Operations
// (the 13 role-owned dashboards, which have their own separate nav item).
const CATEGORIES = [
  {
    href: '/admin/institute/framework',
    icon: '🏛',
    title: 'Academy / Institutional Framework',
    description:
      "Manage the Academy's institutional, academic, curriculum, governance, student, faculty, quality assurance, and academic integration framework. This area contains the Academy's core institutional and academic management infrastructure.",
  },
  {
    href: '/admin/institute/website',
    icon: '🌐',
    title: 'Public Institute Website',
    description:
      'Manage the public-facing institute website, including its homepage, content, events, news, alumni, information pages, AI Assistant, newsletter, and sponsorships.',
  },
  {
    href: '/admin/institute/administration',
    icon: '👥',
    title: 'Institute Administration / Oversight',
    description:
      'Manage institution-wide staff, positions, permissions, analytics, oversight workflows, audit activity, and permission reviews.',
  },
  {
    href: '/admin/institute/configuration',
    icon: '⚙️',
    title: 'Institute Configuration',
    description:
      'Manage institution-wide policies and configuration frameworks, while providing oversight of delegated areas that are operated from their respective staff dashboards.',
  },
];

export default function AdminInstituteManagementPage() {
  return (
    <section>
      <h2 style={sectionTitle}>🏛 Institute Management</h2>
      <p className="sub" style={{ marginBottom: 24 }}>
        Everything Admin manages on behalf of the Islamic institute and its
        public website.
      </p>

      <div style={primaryCardGrid}>
        {CATEGORIES.map((c) => (
          <Link key={c.href} href={c.href} className="ih-card" style={primaryCard}>
            <span style={primaryCardArrow} aria-hidden="true">→</span>
            <span style={primaryCardIcon} aria-hidden="true">{c.icon}</span>
            <h3 style={primaryCardTitle}>{c.title}</h3>
            <p style={primaryCardDesc}>{c.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
