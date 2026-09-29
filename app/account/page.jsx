'use client';

// GENERAL sign-in/registration form for bookstore customers, media
// subscribers and authors -- NOT the student portal (that's /login,
// despite the confusing overlap in names) and NOT staff sign-in
// (that's /staff-login). After authenticating, resolveDefaultDestination()
// below sends the signed-in user to whichever account page is actually
// theirs -- see lib/permissions.ts's getAccountDestination().

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Same plain-text country picker approach app/admission/page.js already
// uses (not tied to the Country DB table's countryId relation on User,
// which is real seeded reference data for currency/exchange-rate
// purposes and must not be guessed into from a signup form).
const ACCOUNT_COUNTRY_OPTIONS = [
  'Ghana', 'Nigeria', 'Kenya', 'South Africa', 'Egypt', 'Uganda', 'Tanzania',
  'United Kingdom', 'United States', 'Canada', 'Saudi Arabia',
  'United Arab Emirates', 'Germany', 'France', 'Pakistan', 'India', 'Other',
];

export default function AccountPage() {
  return (
    <Suspense fallback={<main style={page} />}>
      <AccountForm />
    </Suspense>
  );
}

// Where to send a signed-in user when no explicit ?next= destination
// was given. Previously always '/dashboard' -- that's really the
// bookstore/media account page, so a student (or staff member) who
// happened to sign in from this general /account form instead of
// /login or /staff-login landed somewhere that wasn't theirs. Now asks
// /api/auth/account-destination, which knows about student and staff
// profiles too (see lib/permissions.ts's getAccountDestination()), and
// falls back to the bookstore account page only if that lookup fails.
async function resolveDefaultDestination(next) {
  if (next && next.startsWith('/')) {
    return next;
  }

  try {
    const res = await fetch('/api/auth/account-destination', {
      credentials: 'include',
      cache: 'no-store',
    });
    const result = await res.json();

    if (result?.success && result.destination?.href) {
      return result.destination.href;
    }
  } catch (error) {
    console.error('Account destination lookup error:', error);
  }

  return '/account/dashboard';
}

// Which section the visitor came from (?from=bookstore|media), so the
// sign-in form can say what it's actually signing them into instead of
// always saying "bookstore" even for a Media visitor. Falls back to a
// neutral "Ulul Azm account" phrasing for authors or anyone landing
// here without that param -- never guesses a specific section that
// might be wrong.
const SECTION_COPY = {
  bookstore: {
    backHref: '/bookstore',
    backLabel: '← Back to Bookstore',
    subject: 'bookstore',
    signupBody: 'Create your Ulul Azm account to purchase and access your books.',
  },
  media: {
    backHref: '/media',
    backLabel: '← Back to Media',
    subject: 'media',
    signupBody: 'Create your Ulul Azm account to subscribe and access media content.',
  },
};

function getSectionCopy(from) {
  return SECTION_COPY[from] || {
    backHref: '/',
    backLabel: '← Back to Home',
    subject: 'account',
    signupBody: 'Create your Ulul Azm account to get started.',
  };
}

function AccountForm() {
const router = useRouter();
const searchParams = useSearchParams();
const sectionCopy = getSectionCopy(searchParams.get('from'));

const [mode, setMode] = useState('login');
const [checkingSession, setCheckingSession] = useState(true);
const [loginBackgroundUrl, setLoginBackgroundUrl] = useState('');

// Admin-managed institute banner behind the login form (Homepage
// Hero's brand assets). Public, unauthenticated content -- a failure
// here just leaves the page on its existing plain gradient
// background.
useEffect(() => {
  let active = true;
  fetch('/api/homepage-content', { cache: 'no-store' })
    .then((res) => (res.ok ? res.json() : null))
    .then((result) => {
      if (active && result?.success && result.data?.hero?.loginBackgroundUrl) {
        setLoginBackgroundUrl(result.data.hero.loginBackgroundUrl);
      }
    })
    .catch(() => {});
  return () => {
    active = false;
  };
}, []);

// Already signed in? Skip the form and go straight to the account —
// "User Login" should feel like one click back into your account, not
// a login screen you have to fight through when you're already in.
useEffect(() => {
  let active = true;

  fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' })
    .then((res) => (res.ok ? res.json() : null))
    .then(async (data) => {
      if (!active) return;
      if (data?.user) {
        const next = searchParams.get('next');
        const destination = await resolveDefaultDestination(next);
        if (active) router.replace(destination);
      } else {
        setCheckingSession(false);
      }
    })
    .catch(() => {
      if (active) setCheckingSession(false);
    });

  return () => {
    active = false;
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
const [fullName, setFullName] = useState('');
const [phone, setPhone] = useState('');
const [country, setCountry] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState('');
const [loginSuccess, setLoginSuccess] = useState(false);

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
        phone: phone.trim(),
        country,
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
      setLoading(false);
      return;
    }

    /*
     * Registration creates the custom
     * memo_session cookie automatically.
     *
     * Play the success micro-interaction, then send the user
     * directly to the requested destination.
     */
    if (data?.success) {
      const next = searchParams.get('next');
      const destination = await resolveDefaultDestination(next);

      setLoading(false);
      setLoginSuccess(true);
      setTimeout(() => {
        router.push(destination);
        router.refresh();
      }, 700);

      return;
    }

    setMessage(
      'Account created, but we could not establish your session. Please sign in.'
    );

    setMode('login');
    setLoading(false);
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
    setLoading(false);
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
    setLoading(false);
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
    setLoading(false);
    return;
  }

  /*
   * If checkout sent the user here with:
   *
   * /account?next=/checkout
   *
   * send them back to checkout. Play the same form-exit + checkmark
   * micro-interaction used on the other login pages before leaving.
   */
  const next = searchParams.get('next');
  const destination = await resolveDefaultDestination(next);

  setLoading(false);
  setLoginSuccess(true);
  setTimeout(() => {
    router.push(destination);
    router.refresh();
  }, 700);
} catch (error) {
  console.error(
    'Authentication error:',
    error
  );

  setMessage(
    error?.message ||
      'Something went wrong. Please try again.'
  );
  setLoading(false);
}


}

if (checkingSession) {
  return <main style={page} />;
}

return (
<main
  style={{
    ...page,
    ...(loginBackgroundUrl ? { backgroundImage: `url(${loginBackgroundUrl})` } : {}),
  }}
  className={loginBackgroundUrl ? 'ih-login-page-bg' : ''}
>
<div style={cardOuter}>
<div style={card} className={loginSuccess ? 'ih-login-form-exit' : ''}>

    <Link
      href={sectionCopy.backHref}
      style={back}
    >
      {sectionCopy.backLabel}
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
        ? `Sign in to continue to your Ulul Azm ${sectionCopy.subject} account.`
        : sectionCopy.signupBody}
    </p>

    <form
      onSubmit={handleSubmit}
      style={form}
    >

      {mode === 'signup' && (
        <>
          <label htmlFor="account-fullname" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}>
            Full name
          </label>
          <input
            id="account-fullname"
            placeholder="Full name"
            value={fullName}
            onChange={(e) =>
              setFullName(e.target.value)
            }
            required
            disabled={loginSuccess}
            className="ih-login-input"
            style={input}
          />

          <label htmlFor="account-phone" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}>
            Phone number (optional)
          </label>
          <input
            id="account-phone"
            type="tel"
            placeholder="Phone number (optional)"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            disabled={loginSuccess}
            className="ih-login-input"
            style={input}
          />

          <label htmlFor="account-country" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}>
            Country / location (optional)
          </label>
          <select
            id="account-country"
            value={country}
            onChange={(e) =>
              setCountry(e.target.value)
            }
            disabled={loginSuccess}
            className="ih-login-input"
            style={input}
          >
            <option value="">Country / location (optional)</option>
            {ACCOUNT_COUNTRY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </>
      )}

      <label htmlFor="account-email" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}>
        Email address
      </label>
      <input
        id="account-email"
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
        required
        disabled={loginSuccess}
        className="ih-login-input"
        style={input}
      />

      <label htmlFor="account-password" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}>
        Password
      </label>
      <input
        id="account-password"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
        required
        minLength={6}
        disabled={loginSuccess}
        className="ih-login-input"
        style={input}
      />

      {message && (
        <div style={messageBox}>
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || loginSuccess}
        style={{
          ...button,
          opacity: loading || loginSuccess ? 0.7 : 1,
          cursor: loading || loginSuccess ? 'not-allowed' : 'pointer',
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

  {loginSuccess && (
    <div style={successOverlay} className="ih-login-success">
      <svg
        width="72"
        height="72"
        viewBox="0 0 72 72"
        fill="none"
        className="ih-login-success-ring"
      >
        <circle
          cx="36"
          cy="36"
          r="34"
          fill="var(--success-tint)"
          stroke="var(--success)"
          strokeWidth="2"
        />
        <path
          d="M22 37 L31 46 L50 25"
          stroke="var(--success)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="ih-login-success-check"
          pathLength="48"
        />
      </svg>
      <p style={successText}>
        {mode === 'signup' ? 'Account created — taking you in…' : 'Signed in — taking you in…'}
      </p>
    </div>
  )}
</div>
</main>


);
}

const page = {
minHeight: '100vh',
background:
'linear-gradient(135deg, var(--brand-deepest) 0%, var(--brand-dark) 100%)',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
padding: '30px 20px',
fontFamily: 'Inter, sans-serif',
};

const cardOuter = {
position: 'relative',
width: '100%',
maxWidth: '470px',
};

const card = {
width: '100%',
background: 'var(--surface)',
borderRadius: '22px',
padding: '40px',
boxShadow:
'0 30px 80px rgba(0,0,0,.25)',
backdropFilter: 'blur(6px)',
WebkitBackdropFilter: 'blur(6px)',
};

const back = {
color: 'var(--brand-dark)',
textDecoration: 'none',
fontWeight: '700',
};

const logo = {
width: '60px',
height: '60px',
borderRadius: '16px',
background: 'var(--brand-dark)',
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
color: 'var(--brand-dark)',
fontFamily: 'var(--font-display)',
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
boxSizing: 'border-box',
width: '100%',
};

const forgotPassword = {
display: 'block',
marginTop: '18px',
textAlign: 'center',
color: 'var(--brand-dark)',
fontWeight: '700',
textDecoration: 'none',
};

const button = {
padding: '14px',
borderRadius: '9px',
border: 'none',
background: 'var(--brand-dark)',
color: 'var(--on-accent)',
fontWeight: '800',
cursor: 'pointer',
};

const switchButton = {
marginTop: '20px',
width: '100%',
border: 'none',
background: 'transparent',
color: 'var(--gold-dark)',
fontWeight: '700',
cursor: 'pointer',
};

const messageBox = {
padding: '12px',
background: 'var(--success-tint)',
border: '1px solid var(--success-tint)',
color: 'var(--success)',
borderRadius: '8px',
fontSize: '13px',
};

const successOverlay = {
position: 'absolute',
inset: 0,
display: 'flex',
flexDirection: 'column',
alignItems: 'center',
justifyContent: 'center',
gap: '16px',
textAlign: 'center',
};

const successText = {
color: 'var(--brand-dark)',
fontWeight: 700,
fontSize: '15px',
margin: 0,
background: 'var(--surface)',
padding: '8px 16px',
borderRadius: '999px',
};
