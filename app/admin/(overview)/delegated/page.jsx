'use client';

import Link from 'next/link';
import { useAdminData } from '../AdminShell';
import { sectionTitle, cardGrid, delegatedCard, cardIconGold, ownerTag, cardTitle, inlineLink, pendingNote } from '../_shared';

export default function DelegatedDutiesPage() {
  const { delegatedDuties } = useAdminData();

  return (
    <section>
      <h2 style={sectionTitle}>Delegated Operations (Oversight Only)</h2>
      <p className="sub" style={{ marginBottom: 16 }}>
        These are owned and operated by the designated role — Admin can view them, not perform them.
      </p>
      <div style={cardGrid}>
        {delegatedDuties.map((d) => (
          <div key={d.title} className="ih-card" style={delegatedCard}>
            <span style={cardIconGold} aria-hidden="true">{d.icon}</span>
            <span style={ownerTag}>Owner: {d.owner}</span>
            <h3 style={cardTitle}>{d.title}</h3>
            <Link href={d.href} style={inlineLink}>View dashboard →</Link>
            {d.note && <p style={pendingNote}>{d.note}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
