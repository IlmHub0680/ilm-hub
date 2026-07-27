'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SponsorManagerDashboard() {
  const [ads, setAds] = useState([
    { id: 1, slot: 'Homepage Banner', url: 'https://example.com/banner1', status: 'Active', startDate: '2026-07-01', endDate: '2026-08-01' },
    { id: 2, slot: 'Sidebar', url: 'https://example.com/sidebar2', status: 'Active', startDate: '2026-07-10', endDate: '2026-08-10' },
    { id: 3, slot: 'In-Content', url: 'https://example.com/content3', status: 'Inactive', startDate: '2026-06-01', endDate: '2026-06-30' }
  ]);

  const toggleStatus = (id) => {
    setAds(ads.map(ad => ad.id === id ? { ...ad, status: ad.status === 'Active' ? 'Inactive' : 'Active' } : ad));
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <Link href="/" style={{ color: '#059669', fontWeight: '600', textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>
          ← Back to Home
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#111827' }}>Sponsor Manager Dashboard</h1>
            <p style={{ color: '#4b5563' }}>Role: Limited Permissions (Ads Slot & Sponsored Content Management)</p>
          </div>
          <span style={{ backgroundColor: '#059669', color: '#ffffff', padding: '6px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>
            Authorized Manager
          </span>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '15px' }}>Manage Ad Slots & Banners</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', fontSize: '0.9rem', color: '#374151' }}>Slot Type</th>
                  <th style={{ padding: '12px', fontSize: '0.9rem', color: '#374151' }}>Target URL</th>
                  <th style={{ padding: '12px', fontSize: '0.9rem', color: '#374151' }}>Schedule</th>
                  <th style={{ padding: '12px', fontSize: '0.9rem', color: '#374151' }}>Status</th>
                  <th style={{ padding: '12px', fontSize: '0.9rem', color: '#374151' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {ads.map((ad) => (
                  <tr key={ad.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', fontWeight: '600', color: '#111827' }}>{ad.slot}</td>
                    <td style={{ padding: '12px', color: '#059669', textDecoration: 'underline' }}>{ad.url}</td>
                    <td style={{ padding: '12px', fontSize: '0.85rem', color: '#6b7280' }}>{ad.startDate} to {ad.endDate}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        backgroundColor: ad.status === 'Active' ? '#ecfdf5' : '#fef2f2',
                        color: ad.status === 'Active' ? '#047857' : '#dc2626',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}>
                        {ad.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => toggleStatus(ad.id)}
                        style={{
                          backgroundColor: ad.status === 'Active' ? '#dc2626' : '#059669',
                          color: '#ffffff',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}
                      >
                        {ad.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ backgroundColor: '#ecfdf5', padding: '20px', borderRadius: '12px', border: '1px solid #d1fae5' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#065f46', marginBottom: '8px' }}>Transparency & Compliance Notice</h3>
          <p style={{ fontSize: '0.9rem', color: '#047857', lineHeight: '1.5' }}>
            As a Sponsor Manager, ensure all banner uploads and sponsored content carry clear visibility notices in accordance with <Link href="/policies" style={{ color: '#047857', fontWeight: 'bold' }}>Institute Policies</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}