'use client';

import Link from 'next/link';
import { useAdminData } from '../../AdminShell';
import {
  sectionTitle,
  backLink,
  cardGrid,
  sectionCard,
  cardIcon,
  cardTitle,
  cardDesc,
  oversightBadge,
  isOversightSection,
} from '../../_shared';

// Level 2 page for the Institute Configuration category. Renders
// instituteConfigSections from the shared AdminData context unchanged
// -- same items, same hrefs, same descriptions. Keeps this category's
// own intro explaining that most of these cards are currently
// read-only mirrors of a delegated role's own dashboard, not distinct
// configuration surfaces in their own right.
export default function InstituteConfigurationPage() {
  const { instituteConfigSections } = useAdminData();

  return (
    <section>
      <Link href="/admin/institute" style={backLink}>← Institute Management</Link>
      <h2 style={sectionTitle}>⚙️ Institute Configuration</h2>
      <p className="sub" style={{ marginBottom: 8 }}>
        Manage institution-wide policies and configuration frameworks, while
        providing oversight of delegated areas that are operated from their
        respective staff dashboards.
      </p>
      <p className="sub" style={{ margin: '0 0 16px' }}>
        Admin owns institution-wide policy/framework here; the delegated role
        operates day to day within it. Several of these are currently
        read-only mirrors rather than distinct configuration surfaces — each
        card says exactly which.
      </p>

      <div style={cardGrid}>
        {instituteConfigSections.map((s) => (
          <Link key={s.href} href={s.href} className="ih-card" style={sectionCard}>
            <span style={cardIcon} aria-hidden="true">{s.icon}</span>
            <h3 style={cardTitle}>
              {s.title}
              {isOversightSection(s) && <span style={oversightBadge}>Oversight</span>}
            </h3>
            <p style={cardDesc}>{s.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
