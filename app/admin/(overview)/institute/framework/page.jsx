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

// Level 2 page for the Academy / Institutional Framework category.
// Renders instituteFrameworkSections from the shared AdminData context
// unchanged -- same items, same hrefs, same descriptions as before;
// only the presentation (its own page, reached from the Level 1
// Institute Management landing) is new.
export default function InstituteFrameworkPage() {
  const { instituteFrameworkSections } = useAdminData();

  return (
    <section>
      <Link href="/admin/institute" style={backLink}>← Institute Management</Link>
      <h2 style={sectionTitle}>🏛 Academy / Institutional Framework</h2>
      <p className="sub" style={{ marginBottom: 16 }}>
        Manage the Academy's institutional, academic, curriculum, governance,
        student, faculty, quality assurance, and academic integration
        framework. This area contains the Academy's core institutional and
        academic management infrastructure.
      </p>

      <div style={cardGrid}>
        {instituteFrameworkSections.map((s) => (
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
