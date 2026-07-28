"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function AuthorDashboard() {
  const [activeTab, setActiveTab] = useState('manuscripts');
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);

  const [manuscriptTitle, setManuscriptTitle] = useState('');
  const [category, setCategory] = useState('Fiqh');
  const [yearPublished, setYearPublished] = useState('2026');
  const [manuscriptFile, setManuscriptFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);

  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('10');
  const [selectedBook, setSelectedBook] = useState('All Books');

  const [manuscripts, setManuscripts] = useState([
    { id: 'MS-101', title: 'Foundations of Classical Fiqh', category: 'Fiqh', year: '2025', status: 'In Review', date: '2026-07-20', quote: 'Pending Admin Review', coverUrl: 'fiqh_cover.jpg' },
    { id: 'MS-102', title: 'Introductory Arabic Morphology', category: 'Language', year: '2024', status: 'Approved', date: '2026-07-15', quote: '$450.00', coverUrl: 'arabic_cover.jpg' }
  ]);

  const [coupons, setCoupons] = useState([
    { code: 'ILM10OFF', discount: '10%', book: 'Introductory Arabic Morphology', uses: 14, status: 'Active' },
    { code: 'EID2026', discount: '20%', book: 'All Books', uses: 28, status: 'Active' }
  ]);

  // Fixed object keys: pricePaid
  const [sales] = useState([
    { orderId: 'ORD-8821', bookTitle: 'Introductory Arabic Morphology', buyer: 'Usman Ali', pricePaid: 25.00, authorRoyalty: 17.50, date: '2026-07-28', paymentStatus: 'Paid to Admin', payoutStatus: 'Approved by Admin' },
    { orderId: 'ORD-8825', bookTitle: 'Introductory Arabic Morphology', buyer: 'Fatima Zohra', pricePaid: 25.00, authorRoyalty: 17.50, date: '2026-07-27', paymentStatus: 'Paid to Admin', payoutStatus: 'Pending Admin Release' },
    { orderId: 'ORD-8829', bookTitle: 'Foundations of Classical Fiqh', buyer: 'Ibrahim Musa', pricePaid: 30.00, authorRoyalty: 21.00, date: '2026-07-25', paymentStatus: 'Paid to Admin', payoutStatus: 'Pending Admin Release' }
  ]);

  const totalGross = sales.reduce((acc, curr) => acc + curr.pricePaid, 0);
  const totalRoyalty = sales.reduce((acc, curr) => acc + curr.authorRoyalty, 0);

  const handleCreateSubmission = (e) => {
    e.preventDefault();
    if (!manuscriptTitle) return;

    const newEntry = {
      id: `MS-${Math.floor(100 + Math.random() * 900)}`,
      title: manuscriptTitle,
      category: category,
      year: yearPublished,
      status: 'In Review',
      date: new Date().toISOString().split('T')[0],
      quote: 'Pending Admin Review',
      coverUrl: coverImageFile ? coverImageFile.name : 'Cover Uploaded'
    };

    setManuscripts([newEntry, ...manuscripts]);
    setManuscriptTitle('');
    setShowSubmissionModal(false);
  };

  const handleCreateCoupon = (e) => {
    e.preventDefault();
    if (!couponCode) return;

    const newCoupon = {
      code: couponCode.toUpperCase(),
      discount: `${discountPercent}%`,
      book: selectedBook,
      uses: 0,
      status: 'Active'
    };

    setCoupons([newCoupon, ...coupons]);
    setCouponCode('');
    setShowCouponModal(false);
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ backgroundColor: '#14532d', color: '#ffffff', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>📚</span>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Ilm-Hub Author Portal</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', opacity: 0.9 }}>Welcome, Author</span>
          <Link href="/" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff', padding: '6px 14px', borderRadius: '6px', textDecoration: 'none', fontSize: '14px' }}>Logout</Link>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '32px auto', padding: '0 20px' }}>
        <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0' }}>Author Dashboard</h2>
            <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>Standard Royalty Split: <strong>70% Author / 30% Platform</strong></p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setShowCouponModal(true)} style={{ backgroundColor: '#ffffff', color: '#14532d', border: '1px solid #14532d', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>🏷️ Create Coupon</button>
            <button onClick={() => setShowSubmissionModal(true)} style={{ backgroundColor: '#14532d', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>+ Submit Manuscript</button>
          </div>
        </div>

        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>GROSS STORE SALES</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>${totalGross.toFixed(2)}</div>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>YOUR 70% ROYALTY EARNINGS</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#14532d' }}>${totalRoyalty.toFixed(2)}</div>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>APPROVED BOOKS</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#166534' }}>{manuscripts.filter(m => m.status === 'Approved').length}</div>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>ACTIVE COUPONS</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2563eb' }}>{coupons.length}</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '24px' }}>
          <button onClick={() => setActiveTab('manuscripts')} style={{ padding: '12px 20px', border: 'none', background: 'none', fontWeight: 'bold', fontSize: '15px', color: activeTab === 'manuscripts' ? '#14532d' : '#64748b', borderBottom: activeTab === 'manuscripts' ? '3px solid #14532d' : 'none', cursor: 'pointer' }}>📚 My Manuscripts</button>
          <button onClick={() => setActiveTab('coupons')} style={{ padding: '12px 20px', border: 'none', background: 'none', fontWeight: 'bold', fontSize: '15px', color: activeTab === 'coupons' ? '#14532d' : '#64748b', borderBottom: activeTab === 'coupons' ? '3px solid #14532d' : 'none', cursor: 'pointer' }}>🏷️ Coupons</button>
          <button onClick={() => setActiveTab('sales')} style={{ padding: '12px 20px', border: 'none', background: 'none', fontWeight: 'bold', fontSize: '15px', color: activeTab === 'sales' ? '#14532d' : '#64748b', borderBottom: activeTab === 'sales' ? '3px solid #14532d' : 'none', cursor: 'pointer' }}>📊 Sales & Royalty Analytics</button>
        </div>

        {/* Tab Content */}
        {activeTab === 'manuscripts' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', textTransform: 'uppercase', fontSize: '12px' }}>
                  <th style={{ padding: '14px 20px' }}>ID</th>
                  <th style={{ padding: '14px 20px' }}>Book Title</th>
                  <th style={{ padding: '14px 20px' }}>Category</th>
                  <th style={{ padding: '14px 20px' }}>Year</th>
                  <th style={{ padding: '14px 20px' }}>Cover Image</th>
                  <th style={{ padding: '14px 20px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {manuscripts.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 20px', fontWeight: '600' }}>{item.id}</td>
                    <td style={{ padding: '16px 20px', fontWeight: 'bold' }}>{item.title}</td>
                    <td style={{ padding: '16px 20px', color: '#64748b' }}>{item.category}</td>
                    <td style={{ padding: '16px 20px' }}>{item.year}</td>
                    <td style={{ padding: '16px 20px', color: '#2563eb' }}>🖼️ {item.coverUrl}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: item.status === 'Approved' ? '#dcfce7' : '#fef3c7', color: item.status === 'Approved' ? '#166534' : '#92400e' }}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', textTransform: 'uppercase', fontSize: '12px' }}>
                  <th style={{ padding: '14px 20px' }}>Code</th>
                  <th style={{ padding: '14px 20px' }}>Discount</th>
                  <th style={{ padding: '14px 20px' }}>Applies To</th>
                  <th style={{ padding: '14px 20px' }}>Uses</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 20px', fontWeight: 'bold', color: '#14532d' }}>{c.code}</td>
                    <td style={{ padding: '16px 20px' }}>{c.discount}</td>
                    <td style={{ padding: '16px 20px', color: '#64748b' }}>{c.book}</td>
                    <td style={{ padding: '16px 20px' }}>{c.uses}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'sales' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', backgroundColor: '#f0fdf4', borderBottom: '1px solid #bbf7d0', color: '#166534', fontSize: '13px' }}>
              ℹ️ Payments go to Admin first. Customer download links unlock automatically upon payment approval, and payouts are calculated at 70% author royalty.
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', textTransform: 'uppercase', fontSize: '12px' }}>
                  <th style={{ padding: '14px 20px' }}>Order ID</th>
                  <th style={{ padding: '14px 20px' }}>Book Title</th>
                  <th style={{ padding: '14px 20px' }}>Buyer</th>
                  <th style={{ padding: '14px 20px' }}>Total Paid</th>
                  <th style={{ padding: '14px 20px' }}>Author Royalty (70%)</th>
                  <th style={{ padding: '14px 20px' }}>Admin Payout Status</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 20px', fontWeight: '600' }}>{s.orderId}</td>
                    <td style={{ padding: '16px 20px', fontWeight: 'bold' }}>{s.bookTitle}</td>
                    <td style={{ padding: '16px 20px', color: '#64748b' }}>{s.buyer}</td>
                    <td style={{ padding: '16px 20px' }}>${s.pricePaid.toFixed(2)}</td>
                    <td style={{ padding: '16px 20px', fontWeight: 'bold', color: '#14532d' }}>${s.authorRoyalty.toFixed(2)}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: s.payoutStatus.includes('Approved') ? '#dcfce7' : '#fef3c7', color: s.payoutStatus.includes('Approved') ? '#166534' : '#92400e' }}>
                        {s.payoutStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: SUBMIT NEW MANUSCRIPT */}
      {showSubmissionModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '520px', borderRadius: '12px', padding: '28px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 'bold' }}>Submit New Manuscript</h3>
            <form onSubmit={handleCreateSubmission} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Book Title</label>
                <input type="text" required placeholder="e.g. Principles of Tafsir" value={manuscriptTitle} onChange={(e) => setManuscriptTitle(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}>
                    <option value="Fiqh">Fiqh &amp; Islamic Law</option>
                    <option value="Hadith">Hadith Sciences</option>
                    <option value="Language">Arabic Language</option>
                    <option value="Tafsir">Tafsir &amp; Qur&apos;an Studies</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Year Authored</label>
                  <input type="text" required value={yearPublished} onChange={(e) => setYearPublished(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Upload Manuscript (PDF / DOCX)</label>
                <input type="file" accept=".pdf,.docx" onChange={(e) => setManuscriptFile(e.target.files[0])} style={{ width: '100%', padding: '8px', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Upload Cover Image (Store Front)</label>
                <input type="file" accept="image/*" onChange={(e) => setCoverImageFile(e.target.files[0])} style={{ width: '100%', padding: '8px', fontSize: '14px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowSubmissionModal(false)} style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 18px', borderRadius: '6px', border: 'none', backgroundColor: '#14532d', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer' }}>Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: GENERATE COUPON */}
      {showCouponModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '480px', borderRadius: '12px', padding: '28px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 'bold' }}>Create Coupon Code</h3>
            <form onSubmit={handleCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Code</label>
                <input type="text" required placeholder="e.g. READ2026" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Discount (%)</label>
                <input type="number" min="1" max="100" required value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowCouponModal(false)} style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 18px', borderRadius: '6px', border: 'none', backgroundColor: '#14532d', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer' }}>Generate Code</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
