'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StaffLoginPage() {
  const router = useRouter();

  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginBackgroundUrl, setLoginBackgroundUrl] = useState('');

  // Admin-managed institute banner behind the login form (Homepage
  // Hero's brand assets). Public, unauthenticated content -- a
  // failure here just leaves the page on its existing plain
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

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const meResponse = await fetch('/api/auth/me', {
          credentials: 'include',
          cache: 'no-store',
        });
        const meData = await meResponse.json();

        if (!mounted) return;

        if (!meData?.user) {
          return;
        }

        // Already signed in — send them straight to their own dashboard
        // instead of showing the login form again.
        const destResponse = await fetch('/api/auth/staff-destination', {
          credentials: 'include',
          cache: 'no-store',
        });
        const destData = await destResponse.json();

        if (!mounted) return;

        if (destData?.success && destData.destination) {
          router.push(destData.destination);
          return;
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || 'Invalid email or password.');
        setSubmitting(false);
        return;
      }

      // Route-based on the account's actual role/position — never assume
      // every staff account belongs on the Admin Dashboard. This is the
      // single source of truth server-side (see getStaffDestination in
      // lib/permissions.ts), so it cannot be bypassed from the client.
      const destResponse = await fetch('/api/auth/staff-destination', {
        credentials: 'include',
        cache: 'no-store',
      });
      const destData = await destResponse.json();

      if (!destData?.success || !destData.destination) {
        setError(
          'This account is not set up with staff dashboard access. Please contact an administrator.'
        );
        setSubmitting(false);
        return;
      }

      // Play the same form-exit + checkmark micro-interaction used on the
      // student login page before navigating away. Unlike that page, this
      // one DOES leave via router.push, so the animation plays briefly
      // first and the navigation follows once it's mostly through (timing
      // matches the .ih-login-form-out/.ih-login-check-ring durations
      // defined in globals.css).
      setSubmitting(false);
      setLoginSuccess(true);
      setTimeout(() => {
        router.push(destData.destination);
        router.refresh();
      }, 700);
    } catch (err) {
      console.error('Staff login error:', err);
      setError('Unable to log in. Please try again.');
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div style={styles.page}>
        <p style={styles.loadingText}>Loading your session…</p>
      </div>
    );
  }

  return (
    <div
      style={{
        ...styles.page,
        ...(loginBackgroundUrl
          ? { backgroundImage: `url(${loginBackgroundUrl})` }
          : { background: styles.pageGradient.background }),
      }}
      className={loginBackgroundUrl ? 'ih-login-page-bg' : ''}
    >
      <div style={styles.topBar}>
        <Link
          href="/"
          className={`ih-login-backlink${loginBackgroundUrl ? ' on-image' : ''}`}
          style={{
            ...styles.backLink,
            ...(loginBackgroundUrl ? styles.backLinkOnImage : {}),
          }}
        >
          ← Back to Home
        </Link>
      </div>

      <div style={styles.cardOuter}>
        <div
          style={styles.card}
          className={loginSuccess ? 'ih-login-form-exit' : ''}
        >
          <div style={styles.kicker}>Ulul Azm Institute</div>
          <h1 style={styles.heading}>Staff Portal</h1>
          <p style={styles.subheading}>
            Sign in with your staff account. You'll be taken to the right
            dashboard automatically based on your role.
          </p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                className="ih-login-input"
                autoComplete="username"
                disabled={loginSuccess}
              />
            </label>

            <label style={styles.label}>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                className="ih-login-input"
                autoComplete="current-password"
                disabled={loginSuccess}
              />
            </label>

            <div style={{ textAlign: 'right' }}>
              <Link href="/account/forgot-password" style={{ ...styles.inlineLink, fontSize: '13px' }}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={submitting || loginSuccess}
              className="ih-login-submit"
              style={{
                ...styles.submitButton,
                opacity: submitting || loginSuccess ? 0.7 : 1,
                cursor: submitting || loginSuccess ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p style={styles.footNote}>
            Are you a student?{' '}
            <Link href="/login" style={styles.inlineLink}>
              Go to the student portal
            </Link>
          </p>
        </div>

        {loginSuccess && (
          <div style={styles.successOverlay} className="ih-login-success">
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
            <p style={styles.successText}>Signed in — taking you to your dashboard…</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--paper)',
    fontFamily: 'Inter, sans-serif',
    padding: '40px 20px',
    display: 'flex',
    flexDirection: 'column',
  },
  // Understated backdrop used only when no admin banner image is set
  // (see loginBackgroundUrl above) -- keeps the page from reading as
  // flat unstyled white without competing with an uploaded photo.
  pageGradient: {
    background:
      'radial-gradient(circle at top right, var(--brand-tint) 0%, transparent 45%), ' +
      'radial-gradient(circle at bottom left, var(--brand-tint-2) 0%, transparent 40%), ' +
      'var(--paper)',
  },
  topBar: {
    maxWidth: '440px',
    margin: '0 auto 20px',
  },
  backLink: {
    color: 'var(--brand)',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '14px',
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 14px',
    borderRadius: '999px',
    transition: 'background .15s ease',
  },
  // Applied on top of backLink whenever an admin-uploaded banner image is
  // showing behind the page (loginBackgroundUrl set) -- the banner can be
  // any color/brightness, so the link needs a real backdrop + text-shadow
  // rather than a fixed text color, or it can go invisible on the wrong
  // photo. A semi-opaque dark pill + light text + drop shadow reads
  // clearly against any uploaded image, light or dark.
  backLinkOnImage: {
    color: '#fff',
    background: 'rgba(5, 46, 22, 0.55)',
    textShadow: '0 1px 3px rgba(0,0,0,.45)',
    backdropFilter: 'blur(3px)',
    WebkitBackdropFilter: 'blur(3px)',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: '100px',
    color: 'var(--ink-soft)',
  },
  cardOuter: {
    position: 'relative',
    maxWidth: '440px',
    margin: '0 auto',
  },
  card: {
    background: 'var(--surface)',
    borderRadius: '20px',
    padding: '44px 38px',
    border: '1px solid var(--border)',
    boxShadow: '0 20px 50px rgba(5,46,22,.10)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
  },
  kicker: {
    color: 'var(--gold-dark)',
    fontSize: '11.5px',
    fontWeight: 700,
    letterSpacing: '.08em',
    textTransform: 'uppercase',
    margin: '0 0 10px',
  },
  heading: {
    color: 'var(--brand)',
    fontFamily: 'var(--font-display), Georgia, serif',
    fontSize: '29px',
    fontWeight: 600,
    margin: '0 0 8px',
    letterSpacing: '-0.2px',
  },
  subheading: {
    color: 'var(--ink-soft)',
    fontSize: '14px',
    margin: '0 0 26px',
    lineHeight: 1.55,
  },
  errorBox: {
    background: 'var(--danger-tint)',
    color: 'var(--danger)',
    border: '1px solid var(--danger-tint)',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '14px',
    marginBottom: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--ink-soft)',
  },
  input: {
    border: '1px solid var(--border)',
    borderRadius: '9px',
    padding: '11px 13px',
    fontSize: '14px',
    outline: 'none',
    background: 'var(--surface)',
    color: 'var(--ink)',
  },
  submitButton: {
    marginTop: '8px',
    background: 'var(--brand)',
    color: 'var(--on-accent)',
    border: 'none',
    borderRadius: '9px',
    padding: '13px',
    fontWeight: 700,
    fontSize: '14.5px',
    cursor: 'pointer',
    transition: 'background .15s ease, transform .1s ease, box-shadow .15s ease',
    boxShadow: '0 6px 16px rgba(5,46,22,.16)',
  },
  footNote: {
    marginTop: '20px',
    fontSize: '13px',
    color: 'var(--ink-soft)',
    textAlign: 'center',
  },
  inlineLink: {
    color: 'var(--brand)',
    fontWeight: 700,
    textDecoration: 'none',
  },
  successOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    textAlign: 'center',
    // Opaque themed panel behind the check + message -- this overlay's
    // own transparent inset:0 layer sits in front of `card` (which is
    // simultaneously fading out via .ih-login-form-exit) and, once
    // that card has faded, in front of whatever the PAGE background
    // is -- which can be an arbitrary admin-uploaded banner photo (see
    // loginBackgroundUrl above). Deep-green text with no backdrop of
    // its own had no guaranteed contrast against that. A solid surface
    // fixes it regardless of what's behind it.
    background: 'var(--surface)',
    borderRadius: '20px',
    padding: '28px 24px',
  },
  successText: {
    color: 'var(--brand)',
    fontWeight: 700,
    fontSize: '15px',
    margin: 0,
  },
};
