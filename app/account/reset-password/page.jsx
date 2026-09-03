'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          token: new URLSearchParams(window.location.search).get('token'),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Unable to reset password.');
        return;
      }

      setMessage(
        'Password updated successfully. Redirecting to sign in...'
      );

      setTimeout(() => {
        router.push('/account');
      }, 1500);
    } catch {
      setMessage('Unable to reset password. Please try again.');
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

        <h1 style={title}>Reset Your Password</h1>

        <p style={subtitle}>
          Choose a new password for your Ilm-Hub account.
        </p>

        <form onSubmit={handleSubmit} style={form}>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={input}
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            style={input}
          />

          {message && <div style={messageBox}>{message}</div>}

          <button type="submit" disabled={loading} style={button}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </main>
  );
}

const page = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg,#052e16,#14532d)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '30px 20px',
  fontFamily: 'Inter, sans-serif',
};

const card = {
  width: '100%',
  maxWidth: '470px',
  background: '#fff',
  borderRadius: '22px',
  padding: '40px',
  boxShadow: '0 30px 80px rgba(0,0,0,.25)',
};

const back = {
  color: '#14532d',
  textDecoration: 'none',
  fontWeight: '700',
};

const logo = {
  width: '60px',
  height: '60px',
  borderRadius: '16px',
  background: '#14532d',
  color: '#c59d5f',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '30px',
  fontWeight: '900',
  margin: '35px auto 20px',
};

const title = {
  textAlign: 'center',
  color: '#14532d',
  fontFamily: 'Georgia, serif',
  fontSize: '32px',
  marginBottom: '10px',
};

const subtitle = {
  textAlign: 'center',
  color: '#64748b',
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
  border: '1px solid #dbe4e8',
  fontSize: '15px',
  outline: 'none',
};

const button = {
  padding: '14px',
  borderRadius: '9px',
  border: 'none',
  background: '#14532d',
  color: '#fff',
  fontWeight: '800',
  cursor: 'pointer',
};

const messageBox = {
  padding: '12px',
  background: '#f0fdf4',
  border: '1px solid #bbf7d0',
  color: '#166534',
  borderRadius: '8px',
  fontSize: '13px',
};
