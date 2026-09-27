'use client';

import Link from 'next/link';
import { useAdminData } from '../AdminShell';
import { sectionTitle, cardGrid, sectionCard, cardIcon, cardTitle, cardDesc } from '../_shared';

// 👤 Personal Management -- the user's own personal/platform-owned
// commercial operations (Bookstore, Media, personal Library,
// Publishing, Author Management). These are NOT institute departments
// and are never merged with Institute Management below.
export default function AdminPersonalManagementPage() {
  const { personalManagementSections } = useAdminData();

  return (
    <section>
      <h2 style={sectionTitle}>👤 Personal Management</h2>
      <p className="sub" style={{ marginBottom: 16 }}>
        Your own personal/platform-owned businesses, content systems, and
        publishing operations — not departments of the Islamic institute.
      </p>
      <div style={cardGrid}>
        {personalManagementSections.map((s) => (
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
