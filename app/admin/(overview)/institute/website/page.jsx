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

// Level 2 page for the Public Institute Website category. Renders
// institutePublicWebsiteSections from the shared AdminData context
// unchanged -- same items, same hrefs, same descriptions as before.
export default function InstituteWebsitePage() {
  const { institutePublicWebsiteSections } = useAdminData();

  return (
    <section>
      <Link href="/admin/institute" style={backLink}>← Institute Management</Link>
      <h2 style={sectionTitle}>🌐 Public Institute Website</h2>
      <p className="sub" style={{ marginBottom: 16 }}>
        Manage the public-facing institute website, including its homepage,
        content, events, news, alumni, information pages, AI Assistant,
        newsletter, and sponsorships.
      </p>

      <div style={cardGrid}>
        {institutePublicWebsiteSections.map((s) => (
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
