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

// Level 2 page for the Institute Administration / Oversight category.
// Renders instituteAdministrationSections from the shared AdminData
// context unchanged -- same items, same hrefs, same descriptions.
export default function InstituteAdministrationPage() {
  const { instituteAdministrationSections } = useAdminData();

  return (
    <section>
      <Link href="/admin/institute" style={backLink}>← Institute Management</Link>
      <h2 style={sectionTitle}>👥 Institute Administration / Oversight</h2>
      <p className="sub" style={{ marginBottom: 16 }}>
        Manage institution-wide staff, positions, permissions, analytics,
        oversight workflows, audit activity, and permission reviews.
      </p>

      <div style={cardGrid}>
        {instituteAdministrationSections.map((s) => (
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
