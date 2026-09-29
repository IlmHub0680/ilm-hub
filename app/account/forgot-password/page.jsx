'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      setMessage(
        data.message ||
          'If an account exists with that email, password reset instructions have been sent.'
      );
    } catch {
      setMessage('Unable to process the request. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={page}>
      <div style={card}>
        <Link href="/account" style={back}>
          ← Back to Sign In
        </Link>

        <div style={logo}>ع</div>

        <h1 style={title}>Forgot Password?</h1>

        <p style={subtitle}>
          Enter your email address and we will send you instructions to reset
          your password.
        </p>

        <form onSubmit={handleSubmit} style={form}>
          <label htmlFor="forgot-password-email" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}>
            Email address
          </label>
          <input
            id="forgot-password-email"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={input}
          />

          {message && <div style={messageBox}>{message}</div>}

          <button type="submit" disabled={loading} style={button}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </main>
  );
}

const page = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg,var(--brand-deepest),var(--brand))',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '30px 20px',
  fontFamily: 'Inter, sans-serif',
};

const card = {
  width: '100%',
  maxWidth: '470px',
  background: 'var(--surface)',
  borderRadius: '22px',
  padding: '40px',
  boxShadow: '0 30px 80px rgba(0,0,0,.25)',
};

const back = {
  color: 'var(--brand)',
  textDecoration: 'none',
  fontWeight: '700',
};

const logo = {
  width: '60px',
  height: '60px',
  borderRadius: '16px',
  background: 'var(--brand)',
  color: 'var(--gold)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '30px',
  fontWeight: '900',
  margin: '35px auto 20px',
};

const title = {
  textAlign: 'center',
  color: 'var(--brand)',
  fontFamily: 'Georgia, serif',
  fontSize: '32px',
  marginBottom: '10px',
};

const subtitle = {
  textAlign: 'center',
  color: 'var(--ink-soft)',
  lineHeight: 1.6,
};

const form = {
  display: 'flex',
  flexDirection: 'column',
  gap: '13px',
  marginTop: '25px',
};

const input = {
  padding: '14px',
  borderRadius: '9px',
  border: '1px solid var(--border)',
  fontSize: '15px',
  outline: 'none',
};

const button = {
  padding: '14px',
  borderRadius: '9px',
  border: 'none',
  background: 'var(--brand)',
  color: 'var(--on-accent)',
  fontWeight: '800',
  cursor: 'pointer',
};

const messageBox = {
  padding: '12px',
  background: 'var(--brand-tint)',
  border: '1px solid var(--success-tint)',
  color: 'var(--brand-light)',
  borderRadius: '8px',
  fontSize: '13px',
};
