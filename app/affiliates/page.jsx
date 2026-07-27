'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AffiliatesPage() {
  const [clicks, setClicks] = useState(142);

  const handleSimulateClick = (programName) => {
    setClicks(prev => prev + 1);
    alert(`Affiliate tracking recorded click for: ${programName}. Referrer: Direct Partner Link. Date: ${new Date().toISOString().split('T')[0]}`);
  };

  const programs = [
    { id: 1, name: 'Classical Arabic Learning App Affiliate', commission: '15% per sale', link: '#' },
    { id: 2, name: 'Islamic Bookstore Partner Program', commission: '10% per book order', link: '#' },
    { id: 3, name: 'Hajj & Umrah Travel Advisory Affiliate', commission: '$50 per confirmed booking', link: '#' }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <Link href="/" style={{ color: '#059669', fontWeight: '600', textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>
          ← Back to Home
        </Link>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '10px' }}>Affiliate Programs & Transparency</h1>
        <p style={{ color: '#4b5563', marginBottom: '30px' }}>
          Ilm Hub Institute collaborates with trusted organizations. We may earn a commission from qualifying purchases made through our affiliate links at no extra cost to you.
        </p>

        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '15px' }}>Active Affiliate Tracking Dashboard</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>Total Tracked Clicks</p>
              <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#059669' }}>{clicks}</p>
            </div>
            <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>Primary Referrer</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#374151' }}>Ilm Hub Partner Network</p>
            </div>
            <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>Last Tracking Date</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#374151' }}>2026-07-27</p>
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '15px' }}>Available Affiliate Programs</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {programs.map((prog) => (
            <div key={prog.id} style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>{prog.name}</h3>
                <p style={{ fontSize: '0.85rem', color: '#047857', fontWeight: '600' }}>Commission Structure: {prog.commission}</p>
              </div>
              <button
                onClick={() => handleSimulateClick(prog.name)}
                style={{ backgroundColor: '#059669', color: '#ffffff', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', border: 'none', cursor: 'pointer' }}
              >
                Access Affiliate Link
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}