'use client';

import { useEffect, useState } from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function SponsoredContentPage() {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    fetch('/api/sponsors')
      .then((res) => res.json())
      .then((result) => {
        if (cancelled) return;
        if (!result.success) {
          setError(result.error || 'Unable to load sponsors.');
          return;
        }
        setSponsors(result.sponsors);
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load sponsors.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <SiteHeader />
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--paper)', padding: '40px 20px', fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--ink)', marginBottom: '10px' }}>Our Sponsors & Partners</h1>
        <p style={{ color: 'var(--ink-soft)', marginBottom: '30px', maxWidth: 640, lineHeight: 1.6 }}>
          Ulul Azm is grateful to the organizations and individuals who support our
          mission of accessible, authentic Islamic education.
        </p>

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--danger-tint)', color: 'var(--danger)', fontSize: 13.5, marginBottom: 20 }}>
            {error}
          </div>
        )}

        {loading ? (
          <p style={{ color: 'var(--ink-soft)' }}>Loading…</p>
        ) : sponsors.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--ink-soft)', background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 12 }}>
            No sponsors to show yet. Check back soon.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '20px' }}>
            {sponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                style={{
                  backgroundColor: 'var(--surface)',
                  padding: '24px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  alignItems: sponsor.logoUrl ? 'center' : 'flex-start',
                  textAlign: sponsor.logoUrl ? 'center' : 'left',
                }}
              >
                {sponsor.logoUrl && (
                  <img
                    src={sponsor.logoUrl}
                    alt={sponsor.name}
                    style={{ width: 72, height: 72, objectFit: 'contain', marginBottom: 4 }}
                  />
                )}

                <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', color: 'var(--ink)', margin: 0 }}>
                  {sponsor.name}
                </h3>

                {sponsor.description && (
                  <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', margin: 0 }}>{sponsor.description}</p>
                )}

                {sponsor.websiteUrl && (
                  <a
                    href={sponsor.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      marginTop: 6,
                      backgroundColor: 'var(--brand)',
                      color: 'var(--on-accent)',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontWeight: '600',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                    }}
                  >
                    Visit Website
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
      <SiteFooter />
    </>
  );
}
