'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// Read-only oversight view. Application Fee settings are professionally
// Admission & Registration's responsibility (they run admissions day
// to day), so the editable form lives at /registry-dashboard/fees —
// Admin/Super Admin can see the current configuration here, but the
// only place it's edited is the Registry portal, avoiding two
// duplicate editable Application Fee systems.
export default function AdmissionFeesOversightPage() {
  const [fees, setFees] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/admissions/fees');
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to load application fees.');
        }

        setFees(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const rowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid var(--border)',
    fontSize: 14.5,
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--paper)', padding: '40px 24px 80px', color: 'var(--ink)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Link href="/admin" style={{ display: 'inline-block', marginBottom: 18, color: 'var(--brand)', fontWeight: 600, fontSize: 13.5, textDecoration: 'none' }}>
          ← Back to Admin
        </Link>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            Administration — Oversight
          </div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>Application Fees</h1>
          <p style={{ marginTop: 10, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
            The student admission application fee is configured by Admission &amp; Registration, since they run
            the admissions process day to day. This page is a read-only overview of the current settings; to
            change them, use the Registry portal's Application Fee Settings.
          </p>
        </div>

        {loading ? (
          <div className="ih-card" style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>Loading…</div>
        ) : error ? (
          <div className="ih-card" style={{ background: 'var(--danger-tint)', color: 'var(--danger)' }}>{error}</div>
        ) : (
          <>
            <div className="ih-card" style={{ marginBottom: 20 }}>
              <h2 style={{ margin: '0 0 14px', fontSize: 18, color: 'var(--brand)' }}>Ghana Resident Fees</h2>
              <div style={rowStyle}><span>Junior Learner</span><strong>GHS {fees.juniorGhana.toFixed(2)}</strong></div>
              <div style={rowStyle}><span>Senior Learner</span><strong>GHS {fees.seniorGhana.toFixed(2)}</strong></div>
              <div style={{ ...rowStyle, borderBottom: 'none' }}><span>Mature Learner</span><strong>GHS {fees.matureGhana.toFixed(2)}</strong></div>
            </div>

            <div className="ih-card" style={{ marginBottom: 20 }}>
              <h2 style={{ margin: '0 0 14px', fontSize: 18, color: 'var(--brand)' }}>International Resident Fees</h2>
              <div style={rowStyle}><span>Junior Learner</span><strong>USD {fees.juniorInternational.toFixed(2)}</strong></div>
              <div style={rowStyle}><span>Senior Learner</span><strong>USD {fees.seniorInternational.toFixed(2)}</strong></div>
              <div style={{ ...rowStyle, borderBottom: 'none' }}><span>Mature Learner</span><strong>USD {fees.matureInternational.toFixed(2)}</strong></div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
