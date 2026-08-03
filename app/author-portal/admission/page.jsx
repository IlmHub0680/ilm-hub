"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function AuthorPortal() {
  const [viewMode, setViewMode] = useState('login'); // 'login' | 'register' | 'reset' | 'dashboard' | 'add-book' | 'profile' | 'payouts'
  
  // Auth state
  const [formData, setFormData] = useState({
    name: 'Dr. Ahmad Al-Mansoor',
    email: 'ahmad.mansoor@ilmhub.edu',
    bio: 'Specialist in Islamic Jurisprudence and Arabic Morphology with over 15 years of academic teaching experience.',
    specialty: 'Fiqh & Arabic Language',
    password: '',
    bankAccount: '•••• •••• •••• 4892',
    bankName: 'Global Islamic Bank',
  });
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successProfileMsg, setSuccessProfileMsg] = useState('');

  // Author Dashboard / Book Management state
  const [books, setBooks] = useState([
    {
      id: 1,
      title: 'Foundations of Islamic Jurisprudence',
      publishDate: '2026-05-12',
      status: 'Approved',
      price: '$18.50',
      category: 'Fiqh',
      sales: 142,
      coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 2,
      title: 'Advanced Arabic Morphology & Syntax',
      publishDate: '2026-06-20',
      status: 'Pending Review',
      price: '$22.00',
      category: 'Arabic Language',
      sales: 0,
      coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=300&q=80',
    }
  ]);

  // New Book Form State
  const [newBook, setNewBook] = useState({
    title: '',
    category: '',
    price: '',
    publishDate: new Date().toISOString().split('T')[0],
    description: '',
    coverImage: null,
    bookFile: null,
  });
  const [uploadingBook, setUploadingBook] = useState(false);
  const [successBookMsg, setSuccessBookMsg] = useState('');

  // Payout / Earnings ledger state
  const [payoutHistory] = useState([
    { id: 'PO-1082', date: '2026-07-01', amount: '$1,240.00', status: 'Completed', method: 'Direct Bank Transfer' },
    { id: 'PO-1051', date: '2026-06-01', amount: '$980.50', status: 'Completed', method: 'Direct Bank Transfer' },
    { id: 'PO-1019', date: '2026-05-01', amount: '$408.00', status: 'Completed', method: 'Direct Bank Transfer' },
  ]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    try {
      const res = await fetch('/api/author/admission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to submit application. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (formData.email && formData.password) {
        setViewMode('dashboard');
      } else {
        setErrorMsg('Please enter both email and password.');
      }
    } catch (err) {
      setErrorMsg('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      setLoading(false);
      setResetSent(true);
    }, 800);
  };

  const handleAddBookSubmit = (e) => {
    e.preventDefault();
    setUploadingBook(true);
    setSuccessBookMsg('');

    setTimeout(() => {
      const createdBook = {
        id: books.length + 1,
        title: newBook.title,
        publishDate: newBook.publishDate,
        status: 'Pending Review',
        price: `$${parseFloat(newBook.price || 0).toFixed(2)}`,
        category: newBook.category || 'General',
        sales: 0,
        coverUrl: newBook.coverImage ? URL.createObjectURL(newBook.coverImage) : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=300&q=80',
      };

      setBooks([createdBook, ...books]);
      setUploadingBook(false);
      setSuccessBookMsg('Book submitted successfully! Sent to Admin queue for review before appearing in the store.');
      
      setNewBook({
        title: '',
        category: '',
        price: '',
        publishDate: new Date().toISOString().split('T')[0],
        description: '',
        coverImage: null,
        bookFile: null,
      });
    }, 1000);
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    setSuccessProfileMsg('Author profile and payout settings updated successfully.');
    setTimeout(() => setSuccessProfileMsg(''), 4000);
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '60px 20px', fontFamily: 'sans-serif' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#166534' }}>SUCCESS</div>
          <h1 style={{ fontSize: '28px', color: '#14532d', marginBottom: '12px', fontWeight: 'bold' }}>Application Submitted!</h1>
          <p style={{ color: '#475569', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' }}>
            Thank you for applying to sell your books on Ilm-Hub. Your application has been sent to the administration team for review.
          </p>
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '8px', color: '#166534', fontSize: '14px', marginBottom: '24px' }}>
            Once an Admin approves your seller profile, you will gain full access to your Author Dashboard to upload and manage your publications.
          </div>
          <button 
            onClick={() => { setSubmitted(false); setViewMode('login'); }}
            style={{ backgroundColor: '#14532d', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Go to Author Login
          </button>
        </div>
      </div>
    );
  }

  // PROFESSIONAL AUTHOR DASHBOARD VIEW WITH ANALYTICS, PROFILE, & PAYOUT EXPANSIONS
  if (['dashboard', 'add-book', 'profile', 'payouts'].includes(viewMode)) {
    return (
      <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        {/* Top Navigation Bar */}
        <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ backgroundColor: '#14532d', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px' }}>ILM-HUB</span>
            <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Author Control Center</h1>
          </div>
          
          {/* Internal Navigation Tabs */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setViewMode('dashboard')}
              style={{ background: viewMode === 'dashboard' ? '#f0fdf4' : 'transparent', border: viewMode === 'dashboard' ? '1px solid #bbf7d0' : 'none', color: viewMode === 'dashboard' ? '#166534' : '#475569', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
            >
              Books & Analytics
            </button>
            <button
              onClick={() => setViewMode('payouts')}
              style={{ background: viewMode === 'payouts' ? '#f0fdf4' : 'transparent', border: viewMode === 'payouts' ? '1px solid #bbf7d0' : 'none', color: viewMode === 'payouts' ? '#166534' : '#475569', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
            >
              Earnings & Payouts
            </button>
            <button
              onClick={() => setViewMode('profile')}
              style={{ background: viewMode === 'profile' ? '#f0fdf4' : 'transparent', border: viewMode === 'profile' ? '1px solid #bbf7d0' : 'none', color: viewMode === 'profile' ? '#166534' : '#475569', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
            >
              Author Profile & Settings
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>{formData.name}</span>
            <button 
              onClick={() => setViewMode('login')} 
              style={{ background: 'none', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}
            >
              Sign Out
            </button>
          </div>
        </header>

        <div style={{ maxWidth: '1100px', margin: '32px auto', padding: '0 20px' }}>
          
          {/* Subheader Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px 0' }}>
                {viewMode === 'dashboard' && 'My Published Books'}
                {viewMode === 'add-book' && 'Publish New Book'}
                {viewMode === 'payouts' && 'Financial Ledger & Payouts'}
                {viewMode === 'profile' && 'Author Profile & Bio Settings'}
              </h2>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                {viewMode === 'dashboard' && 'Manage your library, track approval statuses, and monitor performance.'}
                {viewMode === 'add-book' && 'Upload publication assets with title, cover image, file, and publish date for admin review.'}
                {viewMode === 'payouts' && 'Review royalty calculations, commission splits, and bank payout history.'}
                {viewMode === 'profile' && 'Update your public scholar bio, academic specialty, and banking details.'}
              </p>
            </div>
            <div>
              {viewMode === 'dashboard' && (
                <button
                  onClick={() => { setViewMode('add-book'); setSuccessBookMsg(''); }}
                  style={{ backgroundColor: '#14532d', color: '#ffffff', padding: '10px 20px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  + Add New Book
                </button>
              )}
              {['add-book', 'payouts', 'profile'].includes(viewMode) && (
                <button
                  onClick={() => setViewMode('dashboard')}
                  style={{ background: 'none', border: '1px solid #cbd5e1', color: '#334155', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
                >
                  &larr; Back to Dashboard
                </button>
              )}
            </div>
          </div>

          {/* AUTHOR ANALYTICS & INTELLIGENCE MONITOR (Only visible in main dashboard view) */}
          {viewMode === 'dashboard' && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px 0' }}>Author Analytics & Intelligence Monitor</h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Monitor your book performance, revenue, and distribution metrics.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: '4px solid #14532d' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Total Revenue</span>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginTop: '6px' }}>$2,628.50</div>
                  <span style={{ fontSize: '12px', color: '#166534', fontWeight: 'bold' }}>+12.4% this month</span>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: '4px solid #0284c7' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Total Book Sales</span>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginTop: '6px' }}>142 Copies</div>
                  <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: 'bold' }}>Across active catalog</span>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: '4px solid #d97706' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Active / Live Books</span>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginTop: '6px' }}>{books.filter(b => b.status === 'Approved').length} Approved</div>
                  <span style={{ fontSize: '12px', color: '#d97706', fontWeight: 'bold' }}>{books.filter(b => b.status === 'Pending Review').length} pending review</span>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: '4px solid #7c3aed' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Distribution Reach</span>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginTop: '6px' }}>Global Store</div>
                  <span style={{ fontSize: '12px', color: '#7c3aed', fontWeight: 'bold' }}>Student & Scholar Portal</span>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: ADD NEW BOOK FORM */}
          {viewMode === 'add-book' && (
            <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
              {successBookMsg && (
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '16px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px' }}>
                  {successBookMsg}
                </div>
              )}

              <form onSubmit={handleAddBookSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Book Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Principles of Islamic Finance"
                      value={newBook.title}
                      onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Category / Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Fiqh, Aqeedah, Hadith, History"
                      value={newBook.category}
                      onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Price (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="15.00"
                      value={newBook.price}
                      onChange={(e) => setNewBook({ ...newBook, price: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Publish Day / Date</label>
                    <input
                      type="date"
                      required
                      value={newBook.publishDate}
                      onChange={(e) => setNewBook({ ...newBook, publishDate: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Book Description / Synopsis</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide an overview of the book contents..."
                    value={newBook.description}
                    onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Book Cover Picture</label>
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={(e) => setNewBook({ ...newBook, coverImage: e.target.files[0] })}
                      style={{ fontSize: '13px' }}
                    />
                    <span style={{ display: 'block', fontSize: '12px', color: '#64748b', marginTop: '4px' }}>PNG, JPG or WEBP (Cover image)</span>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Book File (PDF / EPUB)</label>
                    <input
                      type="file"
                      accept=".pdf,.epub"
                      required
                      onChange={(e) => setNewBook({ ...newBook, bookFile: e.target.files[0] })}
                      style={{ fontSize: '13px' }}
                    />
                    <span style={{ display: 'block', fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Digital book file for store delivery</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setViewMode('dashboard')}
                    style={{ background: 'none', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingBook}
                    style={{ backgroundColor: '#14532d', color: '#ffffff', padding: '10px 24px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}
                  >
                    {uploadingBook ? 'Uploading Book Assets...' : 'Submit Book for Admin Approval'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* VIEW: DASHBOARD BOOK LIST */}
          {viewMode === 'dashboard' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Library Submissions & Status Queue</h3>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Admin review workflow active</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {books.map((b) => (
                  <div key={b.id} style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <img src={b.coverUrl} alt={b.title} style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '6px', backgroundColor: '#e2e8f0' }} />
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#166534', backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: '4px' }}>{b.category}</span>
                        <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: '6px 0 4px 0' }}>{b.title}</h4>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#64748b' }}>
                          <span>Publish Day: {b.publishDate}</span>
                          <span>Price: {b.price}</span>
                          <span>Sales: {b.sales}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: 'bold', 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        backgroundColor: b.status === 'Approved' ? '#f0fdf4' : '#fff7ed',
                        color: b.status === 'Approved' ? '#166534' : '#c2410c',
                        border: `1px solid ${b.status === 'Approved' ? '#bbf7d0' : '#ffedd5'}`
                      }}>
                        {b.status === 'Approved' ? 'Approved & Live in Store' : 'Pending Admin Approval'}
                      </span>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {b.status === 'Approved' ? 'Book visible to shoppers' : 'Awaiting admin review queue'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NEW EXPANSION VIEW: FINANCIAL LEDGER & PAYOUTS */}
          {viewMode === 'payouts' && (
            <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px 0' }}>Royalty & Payout History</h3>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Track past automated disbursements and pending balances.</p>
                </div>
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 20px', borderRadius: '8px', textAlign: 'right' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#166534', display: 'block' }}>Next Payout Balance</span>
                  <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#14532d' }}>$412.50</span>
                </div>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#334155' }}>
                      <th style={{ padding: '12px 16px', fontWeight: '600' }}>Reference ID</th>
                      <th style={{ padding: '12px 16px', fontWeight: '600' }}>Date</th>
                      <th style={{ padding: '12px 16px', fontWeight: '600' }}>Method</th>
                      <th style={{ padding: '12px 16px', fontWeight: '600' }}>Amount</th>
                      <th style={{ padding: '12px 16px', fontWeight: '600' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payoutHistory.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#0f172a' }}>{p.id}</td>
                        <td style={{ padding: '12px 16px', color: '#64748b' }}>{p.date}</td>
                        <td style={{ padding: '12px 16px', color: '#334155' }}>{p.method}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#166534' }}>{p.amount}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* NEW EXPANSION VIEW: AUTHOR PROFILE & SETTINGS */}
          {viewMode === 'profile' && (
            <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
              {successProfileMsg && (
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '16px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px' }}>
                  {successProfileMsg}
                </div>
              )}

              <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px 0' }}>Public Scholar Profile</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Full Name / Title</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Academic Specialization</label>
                    <input
                      type="text"
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Scholar Bio & Credentials</label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '10px 0' }} />

                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px 0' }}>Banking & Payout Destination</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Bank Name</label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Account Number / IBAN</label>
                    <input
                      type="text"
                      value={formData.bankAccount}
                      onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button
                    type="submit"
                    style={{ backgroundColor: '#14532d', color: '#ffffff', padding: '10px 24px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    );
  }

  // STANDARD AUTHENTICATION VIEW (Login / Register / Reset)
  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '550px', margin: '0 auto' }}>
        
        {/* Back to Home Button */}
        <div style={{ marginBottom: '16px' }}>
          <Link href="/" style={{ color: '#14532d', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            &larr; Back to Home
          </Link>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          
          {/* Toggle Header */}
          {viewMode !== 'reset' && (
            <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: '24px' }}>
              <button
                onClick={() => { setViewMode('login'); setErrorMsg(''); }}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: viewMode === 'login' ? '#14532d' : '#64748b',
                  borderBottom: viewMode === 'login' ? '3px solid #14532d' : 'none',
                  cursor: 'pointer'
                }}
              >
                Author Sign In
              </button>
              <button
                onClick={() => { setViewMode('register'); setErrorMsg(''); }}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: viewMode === 'register' ? '#14532d' : '#64748b',
                  borderBottom: viewMode === 'register' ? '3px solid #14532d' : 'none',
                  cursor: 'pointer'
                }}
              >
                Register as Author
              </button>
            </div>
          )}

          {errorMsg && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px', borderRadius: '6px', fontSize: '14px', marginBottom: '16px' }}>
              {errorMsg}
            </div>
          )}

          {/* VIEW: LOGIN FORM */}
          {viewMode === 'login' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px 0' }}>Author Portal Sign In</h2>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 12px 0' }}>Log in to access your author dashboard, book catalog, and earnings.</p>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="author@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>Password</label>
                  <button
                    type="button"
                    onClick={() => { setViewMode('reset'); setErrorMsg(''); setResetSent(false); }}
                    style={{ background: 'none', border: 'none', color: '#14532d', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: '#14532d', color: '#ffffff', padding: '12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '8px' }}
              >
                {loading ? 'Signing In...' : 'Log In to Author Dashboard'}
              </button>
            </form>
          )}

          {/* VIEW: REGISTRATION FORM */}
          {viewMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px 0' }}>Create Author Account</h2>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 12px 0' }}>Submit your profile for admin review to begin selling books.</p>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ahmad Al-Mansoor"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="author@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Field / Specialization</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fiqh, Hadith Sciences, Arabic Grammar"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Author Bio & Publications Summary</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Brief summary of your background and published works..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Account Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: '#14532d', color: '#ffffff', padding: '12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '8px' }}
              >
                {loading ? 'Submitting Application...' : 'Register as Author'}
              </button>
            </form>
          )}

          {/* VIEW: RESET PASSWORD FORM */}
          {viewMode === 'reset' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0' }}>Reset Your Password</h2>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 20px 0' }}>Enter your registered email address and we'll send you instructions to reset your password.</p>

              {resetSent ? (
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '16px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px' }}>
                  <strong>Reset Link Sent!</strong> Check your email inbox at <strong>{resetEmail}</strong> for instructions to reset your password.
                </div>
              ) : (
                <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="author@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{ backgroundColor: '#14532d', color: '#ffffff', padding: '12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '8px' }}
                  >
                    {loading ? 'Sending Reset Link...' : 'Send Password Reset Link'}
                  </button>
                </form>
              )}

              <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => { setViewMode('login'); setErrorMsg(''); setResetSent(false); }}
                  style={{ background: 'none', border: 'none', color: '#14532d', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  &larr; Back to Sign In
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}