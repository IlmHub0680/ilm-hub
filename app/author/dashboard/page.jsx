'use client';
import { useState, useEffect } from 'react';

export default function AuthorDashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenueUSD: 0,
    activeBooks: 0,
    totalDownloads: 0,
    recentSales: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/author/analytics');
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#14532d', fontFamily: 'sans-serif' }}>Loading Dashboard...</div>;
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#14532d', margin: 0 }}>Author Analytics & Intelligence</h1>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>Monitor your book performance, revenue, and distribution metrics.</p>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            style={{ padding: '8px 16px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#334155', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Home
          </button>
        </div>

        {/* Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Total Revenue</span>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#14532d', margin: '8px 0 0 0' }}>${stats.totalRevenueUSD.toFixed(2)}</h2>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Total Sales</span>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#14532d', margin: '8px 0 0 0' }}>{stats.totalSales}</h2>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Active Books</span>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#14532d', margin: '8px 0 0 0' }}>{stats.activeBooks}</h2>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Total Downloads</span>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#14532d', margin: '8px 0 0 0' }}>{stats.totalDownloads}</h2>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 16px 0' }}>Recent Book Sales</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                <th style={{ padding: '10px' }}>Book Title</th>
                <th style={{ padding: '10px' }}>Customer</th>
                <th style={{ padding: '10px' }}>Amount</th>
                <th style={{ padding: '10px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentSales.map((sale) => (
                <tr key={sale.id} style={{ borderBottom: '1px solid #f1f5f9', color: '#334155' }}>
                  <td style={{ padding: '12px', fontWeight: '600' }}>{sale.bookTitle}</td>
                  <td style={{ padding: '12px' }}>{sale.buyer}</td>
                  <td style={{ padding: '12px', color: '#166534', fontWeight: 'bold' }}>${sale.amount.toFixed(2)}</td>
                  <td style={{ padding: '12px', color: '#64748b' }}>{sale.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}