'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AccountPage() {
const router = useRouter();
const searchParams = useSearchParams();

const [mode, setMode] = useState('login');
const [fullName, setFullName] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState('');

async function handleSubmit(e) {
e.preventDefault();

setLoading(true);
setMessage('');

try {
  /*
   * -------------------------------
   * SIGN UP
   * -------------------------------
   */
  if (mode === 'signup') {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        name: fullName.trim(),
        email: email.trim(),
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(
        data?.error ||
          'Unable to create your account.'
      );
      return;
    }

    /*
     * Registration creates the custom
     * memo_session cookie automatically.
     *
     * Send the user directly to the
     * requested destination.
     */
    if (data?.success) {
      const next = searchParams.get('next');

      const destination =
        next && next.startsWith('/')
          ? next
          : '/dashboard';

      router.push(destination);
      router.refresh();

      return;
    }

    setMessage(
      'Account created, but we could not establish your session. Please sign in.'
    );

    setMode('login');
    return;
  }

  /*
   * -------------------------------
   * LOGIN
   * -------------------------------
   */
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      email: email.trim(),
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    setMessage(
      data?.error ||
        'Invalid email or password.'
    );
    return;
  }

  /*
   * The login endpoint creates the
   * memo_session HTTP-only cookie.
   */
  if (!data?.success || !data?.user) {
    setMessage(
      'Login succeeded, but your session could not be established.'
    );
    return;
  }

  /*
   * Verify that the browser can immediately
   * see the authenticated session.
   */
  const meResponse = await fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

  const meData = await meResponse.json();

  if (!meResponse.ok || !meData?.success) {
    setMessage(
      'Login succeeded, but your session was not established. Please try again.'
    );
    return;
  }

  /*
   * If checkout sent the user here with:
   *
   * /account?next=/checkout
   *
   * send them back to checkout.
   */
  const next = searchParams.get('next');

  const destination =
    next && next.startsWith('/')
      ? next
      : '/dashboard';

  router.push(destination);
  router.refresh();
} catch (error) {
  console.error(
    'Authentication error:',
    error
  );

  setMessage(
    error?.message ||
      'Something went wrong. Please try again.'
  );
} finally {
  setLoading(false);
}


}

return (
<main style={page}>
<div style={card}>

    <Link
      href="/bookstore"
      style={back}
    >
      ← Back to Bookstore
    </Link>

    <div style={logo}>
      ع
    </div>

    <h1 style={title}>
      {mode === 'login'
        ? 'Welcome Back'
        : 'Create Your Account'}
    </h1>

    <p style={subtitle}>
      {mode === 'login'
        ? 'Sign in to continue to your Ilm-Hub bookstore account.'
        : 'Create your Ilm-Hub account to purchase and access your books.'}
    </p>

    <form
      onSubmit={handleSubmit}
      style={form}
    >

      {mode === 'signup' && (
        <input
          placeholder="Full name"
          value={fullName}
          onChange={(e) =>
            setFullName(e.target.value)
          }
          required
          style={input}
        />
      )}

      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
        required
        style={input}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
        required
        minLength={6}
        style={input}
      />

      {message && (
        <div style={messageBox}>
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          ...button,
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading
          ? 'Please wait...'
          : mode === 'login'
          ? 'Sign In'
          : 'Create Account'}
      </button>
    </form>

    {mode === 'login' && (
      <Link
        href="/account/forgot-password"
        style={forgotPassword}
      >
        Forgot your password?
      </Link>
    )}

    <button
      type="button"
      onClick={() => {
        setMessage('');

        setMode(
          mode === 'login'
            ? 'signup'
            : 'login'
        );
      }}
      style={switchButton}
    >
      {mode === 'login'
        ? "Don't have an account? Create one"
        : 'Already have an account? Sign in'}
    </button>

  </div>
</main>


);
}

const page = {
minHeight: '100vh',
background:
'linear-gradient(135deg,#052e16,#14532d)',
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
boxShadow:
'0 30px 80px rgba(0,0,0,.25)',
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

const forgotPassword = {
display: 'block',
marginTop: '18px',
textAlign: 'center',
color: '#14532d',
fontWeight: '700',
textDecoration: 'none',
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

const switchButton = {
marginTop: '20px',
width: '100%',
border: 'none',
background: 'transparent',
color: '#a16207',
fontWeight: '700',
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