"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function AuthorPortal() {
  const [viewMode, setViewMode] = useState('register'); // 'register' | 'login' | 'reset'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    specialty: '',
    password: '',
  });
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
        window.location.href = '/author/dashboard';
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

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '60px 20px', fontFamily: 'sans-serif' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>??</div>
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

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '550px', margin: '0 auto' }}>
        
        {/* Back to Home Button */}
        <div style={{ marginBottom: '16px' }}>
          <Link href="/" style={{ color: '#14532d', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            ? Back to Home
          </Link>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          
          {/* Toggle Header */}
          {viewMode !== 'reset' && (
            <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: '24px' }}>
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
            </div>
          )}

          {errorMsg && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px', borderRadius: '6px', fontSize: '14px', marginBottom: '16px' }}>
              {errorMsg}
            </div>
          )}

          {/* VIEW 1: REGISTRATION FORM */}
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

          {/* VIEW 2: LOGIN FORM */}
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

          {/* VIEW 3: RESET PASSWORD FORM */}
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
                  ? Back to Sign In
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
