"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('moderation');

  // Manuscripts pending Admin approval
  const [manuscripts, setManuscripts] = useState([
    { id: 'MS-101', title: 'Foundations of Classical Fiqh', author: 'Dr. Ahmad Al-Mansoor', category: 'Fiqh', year: '2025', price: '$30.00', status: 'Pending Review' },
    { id: 'MS-102', title: 'Introductory Arabic Morphology', author: 'Bilal Ibn Rabah', category: 'Language', year: '2024', price: '$25.00', status: 'Approved & Live' }
  ]);

  // Store orders pending Admin payout release
  const [orders, setOrders] = useState([
    { orderId: 'ORD-8821', bookTitle: 'Introductory Arabic Morphology', author: 'Bilal Ibn Rabah', amount: 25.00, adminShare: 7.50, authorShare: 17.50, date: '2026-07-28', payoutStatus: 'Released' },
    { orderId: 'ORD-8825', bookTitle: 'Introductory Arabic Morphology', author: 'Bilal Ibn Rabah', amount: 25.00, adminShare: 7.50, authorShare: 17.50, date: '2026-07-27', payoutStatus: 'Pending Release' },
    { orderId: 'ORD-8829', bookTitle: 'Foundations of Classical Fiqh', author: 'Dr. Ahmad Al-Mansoor', amount: 30.00, adminShare: 9.00, authorShare: 21.00, date: '2026-07-25', payoutStatus: 'Pending Release' }
  ]);

  const totalStoreGross = orders.reduce((acc, curr) => acc + curr.amount, 0);
  const totalAdminNet = orders.reduce((acc, curr) => acc + curr.adminShare, 0);
  const totalAuthorPayouts = orders.reduce((acc, curr) => acc + curr.authorShare, 0);

  const approveBook = (id) => {
    setManuscripts(manuscripts.map(m => m.id === id ? { ...m, status: 'Approved & Live' } : m));
  };

  const releasePayout = (orderId) => {
    setOrders(orders.map(o => o.orderId === orderId ? { ...o, payoutStatus: 'Released' } : o));
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>???</span>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Ilm-Hub Admin Master Console</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', opacity: 0.9 }}>Administrator</span>
          <Link href="/" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff', padding: '6px 14px', borderRadius: '6px', textDecoration: 'none', fontSize: '14px' }}>Exit Admin</Link>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '32px auto', padding: '0 20px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0' }}>Platform Control Panel</h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>Manage book publishing approvals, sales payouts (30% Platform / 70% Author), and bookstore moderation.</p>
        </div>

        {/* Financial Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>TOTAL STORE REVENUE</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>${totalStoreGross.toFixed(2)}</div>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>ADMIN PLATFORM SHARE (30%)</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#166534' }}>${totalAdminNet.toFixed(2)}</div>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>AUTHOR PAYOUT OBLIGATION (70%)</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2563eb' }}>${totalAuthorPayouts.toFixed(2)}</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '24px' }}>
          <button onClick={() => setActiveTab('moderation')} style={{ padding: '12px 20px', border: 'none', background: 'none', fontWeight: 'bold', fontSize: '15px', color: activeTab === 'moderation' ? '#0f172a' : '#64748b', borderBottom: activeTab === 'moderation' ? '3px solid #0f172a' : 'none', cursor: 'pointer' }}>?? Book Approval Queue</button>
          <button onClick={() => setActiveTab('payouts')} style={{ padding: '12px 20px', border: 'none', background: 'none', fontWeight: 'bold', fontSize: '15px', color: activeTab === 'payouts' ? '#0f172a' : '#64748b', borderBottom: activeTab === 'payouts' ? '3px solid #0f172a' : 'none', cursor: 'pointer' }}>?? Sales & Author Payouts</button>
        </div>

        {/* TAB 1: BOOK APPROVAL QUEUE */}
        {activeTab === 'moderation' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', textTransform: 'uppercase', fontSize: '12px' }}>
                  <th style={{ padding: '14px 20px' }}>ID</th>
                  <th style={{ padding: '14px 20px' }}>Book Title</th>
                  <th style={{ padding: '14px 20px' }}>Author Name</th>
                  <th style={{ padding: '14px 20px' }}>Category</th>
                  <th style={{ padding: '14px 20px' }}>Year</th>
                  <th style={{ padding: '14px 20px' }}>Status</th>
                  <th style={{ padding: '14px 20px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {manuscripts.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 20px', fontWeight: '600' }}>{item.id}</td>
                    <td style={{ padding: '16px 20px', fontWeight: 'bold' }}>{item.title}</td>
                    <td style={{ padding: '16px 20px', color: '#64748b' }}>{item.author}</td>
                    <td style={{ padding: '16px 20px' }}>{item.category}</td>
                    <td style={{ padding: '16px 20px' }}>{item.year}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: item.status.includes('Approved') ? '#dcfce7' : '#fef3c7', color: item.status.includes('Approved') ? '#166534' : '#92400e' }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      {item.status !== 'Approved & Live' ? (
                        <button onClick={() => approveBook(item.id)} style={{ backgroundColor: '#166534', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                          Approve & Publish
                        </button>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '13px' }}>Published</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: SALES & AUTHOR PAYOUTS */}
        {activeTab === 'payouts' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', textTransform: 'uppercase', fontSize: '12px' }}>
                  <th style={{ padding: '14px 20px' }}>Order ID</th>
                  <th style={{ padding: '14px 20px' }}>Book Title</th>
                  <th style={{ padding: '14px 20px' }}>Author</th>
                  <th style={{ padding: '14px 20px' }}>Gross Paid</th>
                  <th style={{ padding: '14px 20px' }}>Admin Fee (30%)</th>
                  <th style={{ padding: '14px 20px' }}>Author Payout (70%)</th>
                  <th style={{ padding: '14px 20px' }}>Payout Status</th>
                  <th style={{ padding: '14px 20px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 20px', fontWeight: '600' }}>{o.orderId}</td>
                    <td style={{ padding: '16px 20px', fontWeight: 'bold' }}>{o.bookTitle}</td>
                    <td style={{ padding: '16px 20px', color: '#64748b' }}>{o.author}</td>
                    <td style={{ padding: '16px 20px' }}>${o.amount.toFixed(2)}</td>
                    <td style={{ padding: '16px 20px', color: '#166534', fontWeight: 'bold' }}>${o.adminShare.toFixed(2)}</td>
                    <td style={{ padding: '16px 20px', color: '#2563eb', fontWeight: 'bold' }}>${o.authorShare.toFixed(2)}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: o.payoutStatus === 'Released' ? '#dcfce7' : '#fef3c7', color: o.payoutStatus === 'Released' ? '#166534' : '#92400e' }}>
                        {o.payoutStatus}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      {o.payoutStatus !== 'Released' ? (
                        <button onClick={() => releasePayout(o.orderId)} style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                          Release Payout
                        </button>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '13px' }}>Paid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
