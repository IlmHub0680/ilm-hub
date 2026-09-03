'use client';

import Link from 'next/link';

export default function SponsoredContentPage() {
  const sponsoredItems = [
    {
      id: '1',
      type: 'Sponsored Course Promotions',
      title: 'Advanced Tajweed Masterclass with Global Certification',
      sponsor: 'Quranic Scholars Academy',
      startDate: '2026-07-01',
      endDate: '2026-08-30',
      link: '/courses'
    },
    {
      id: '2',
      type: 'Sponsored Book Promotions',
      title: 'Exposition of Riyad as-Salihin (Hardcover Collector Edition)',
      sponsor: 'Darussalam Publications',
      startDate: '2026-07-05',
      endDate: '2026-08-05',
      link: '/books'
    },
    {
      id: '3',
      type: 'Sponsored Articles',
      title: 'The Role of Digital Platforms in Spreading Authentic Knowledge',
      sponsor: 'Islamic Tech Global',
      startDate: '2026-07-10',
      endDate: '2026-07-31',
      link: '#'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <Link href="/" style={{ color: '#059669', fontWeight: '600', textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>
          ? Back to Home
        </Link>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '10px' }}>Sponsored Content & Partnerships</h1>
        <p style={{ color: '#4b5563', marginBottom: '30px' }}>
          Discover certified partner programs, recommended publications, and sponsored academic opportunities. All sponsored listings clearly display transparency badges.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          {sponsoredItems.map((item) => (
            <div key={item.id} style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ backgroundColor: '#fef3c7', color: '#92400e', fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase' }}>
                  SPONSORED ({item.type})
                </span>
                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Active: {item.startDate} to {item.endDate}</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: '5px 0' }}>{item.title}</h3>
              <p style={{ fontSize: '0.9rem', color: '#374151' }}>Provided by: <strong>{item.sponsor}</strong></p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '15px', borderTop: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Transparency Notice: Verified partner content supporting Ilm Hub Institute.</span>
                <Link href={item.link} style={{ backgroundColor: '#059669', color: '#ffffff', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', textDecoration: 'none', fontSize: '0.9rem' }}>
                  Learn More
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
