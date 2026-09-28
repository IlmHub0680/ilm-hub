'use client';

import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const STATUS_TONE = {
  PENDING: { label: 'Payment Required', className: 'ih-b-warning' },
  PAID: { label: 'Under Review', className: 'ih-b-neutral' },
  UNDER_REVIEW: { label: 'Under Review', className: 'ih-b-neutral' },
  APPROVED: { label: 'Approved', className: 'ih-b-success' },
  REJECTED: { label: 'Not Approved', className: 'ih-b-danger' },
};

function TrackAuthorApplicationInner() {
  const searchParams = useSearchParams();
  const admissionIdFromUrl = searchParams.get('admissionId') || '';
  const stripeSessionId = searchParams.get('stripe_session_id') || '';

  const [admissionId, setAdmissionId] = useState(admissionIdFromUrl);
  const [email, setEmail] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [payingNow, setPayingNow] = useState('');

  async function lookup(query) {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams(query);
      const res = await fetch(`/api/author/track?${params.toString()}`);
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Unable to find that application.');
      }

      setData(result.data);
    } catch (err) {
      setData(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!admissionIdFromUrl) return;

    // Returning from a Stripe Checkout redirect — confirm payment
    // immediately client-side rather than waiting on the webhook, so
    // the status shown here is never stale for however long that
    // takes to arrive.
    if (stripeSessionId) {
      fetch('/api/author/stripe/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: stripeSessionId, admissionId: admissionIdFromUrl }),
      })
        .catch(() => {})
        .finally(() => lookup({ admissionId: admissionIdFromUrl }));
    } else {
      lookup({ admissionId: admissionIdFromUrl });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admissionIdFromUrl, stripeSessionId]);

  // A signed-in AUTHOR-role account lands here via getAccountDestination()
  // (lib/permissions.ts) whenever their application isn't APPROVED yet --
  // with no admissionId/email in the URL, since they didn't type one in.
  // Rather than show them an empty lookup form for an application they
  // already know they submitted, auto-fill and look up their own status
  // by their session email the moment the page loads with nothing else
  // to go on.
  useEffect(() => {
    if (admissionIdFromUrl) return;

    let cancelled = false;
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((result) => {
        if (cancelled) return;
        const sessionEmail = result?.user?.email;
        if (sessionEmail && result.user.role === 'AUTHOR') {
          setEmail(sessionEmail);
          lookup({ email: sessionEmail });
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admissionIdFromUrl]);

  function handleSubmit(e) {
    e.preventDefault();

    if (admissionId.trim()) {
      lookup({ admissionId: admissionId.trim() });
    } else if (email.trim()) {
      lookup({ email: email.trim() });
    } else {
      setError('Enter your application reference or the email you applied with.');
    }
  }

  async function handlePayNow(method) {
    if (!data) return;

    setPayingNow(method);
    setError('');

    try {
      const endpoint =
        method === 'stripe' ? '/api/author/stripe/initialize' : '/api/author/paystack/initialize';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admissionId: data.admissionId }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Unable to start payment.');
      }

      window.location.href = result.data.authorizationUrl;
    } catch (err) {
      setError(err.message);
      setPayingNow('');
    }
  }

  const tone = data ? STATUS_TONE[data.status] || STATUS_TONE.PENDING : null;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--paper)',
        color: 'var(--ink)',
        padding: '48px 20px 80px',
      }}
    >
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <Link
          href="/author-portal/admission"
          style={{ display: 'inline-block', marginBottom: 18, color: 'var(--brand)', fontWeight: 600, fontSize: 13.5, textDecoration: 'none' }}
        >
          ← Back to Author Portal
        </Link>

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            Author Application
          </div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>Track Your Application</h1>
          <p style={{ marginTop: 10, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
            Check the status of your author application and pay the application
            fee if it is still outstanding.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="ih-card"
          style={{ padding: 24, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          <label>
            <span style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 13.5 }}>Application Reference</span>
            <input
              value={admissionId}
              onChange={(e) => setAdmissionId(e.target.value)}
              placeholder="e.g. cklk3f9..."
              style={{ width: '100%', boxSizing: 'border-box', padding: '11px 13px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--ink)' }}
            />
          </label>

          <div style={{ textAlign: 'center', color: 'var(--ink-soft)', fontSize: 12.5 }}>— or —</div>

          <label>
            <span style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 13.5 }}>Email you applied with</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', boxSizing: 'border-box', padding: '11px 13px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--ink)' }}
            />
          </label>

          <button type="submit" disabled={loading} className="ih-btn ih-btn-primary" style={{ marginTop: 6 }}>
            {loading ? 'Looking up…' : 'Check Status'}
          </button>
        </form>

        {error && (
          <div className="ih-card" style={{ padding: '12px 14px', marginBottom: 20, background: 'var(--danger-tint)', color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        {data && (
          <div className="ih-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{data.name}</div>
                <div style={{ color: 'var(--ink-soft)', fontSize: 13 }}>{data.email}</div>
              </div>
              <span className={`ih-badge ${tone.className}`}>{tone.label}</span>
            </div>

            <p style={{ margin: '0 0 16px', color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.6 }}>{data.message}</p>

            {data.applicationFee !== null && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--border)', fontSize: 14 }}>
                <span style={{ color: 'var(--ink-soft)' }}>Application Fee ({data.feeBasis})</span>
                <span style={{ fontWeight: 700 }}>
                  {data.currencyCode} {data.applicationFee.toFixed(2)}
                </span>
              </div>
            )}

            {data.status === 'PENDING' && (
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={() => handlePayNow('paystack')}
                  disabled={!!payingNow}
                  className="ih-btn ih-btn-primary"
                  style={{ width: '100%' }}
                >
                  {payingNow === 'paystack' ? 'Redirecting to Paystack…' : 'Pay with Paystack'}
                </button>

                {data.currencyCode === 'USD' && (
                  <button
                    onClick={() => handlePayNow('stripe')}
                    disabled={!!payingNow}
                    className="ih-btn"
                    style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink)' }}
                  >
                    {payingNow === 'stripe' ? 'Redirecting to Stripe…' : 'Pay with Stripe (Card)'}
                  </button>
                )}
              </div>
            )}

            {data.status === 'APPROVED' && (
              <Link href="/author-portal/admission" className="ih-btn ih-btn-primary" style={{ width: '100%', marginTop: 16, textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
                Go to Author Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function TrackAuthorApplicationPage() {
  return (
    <Suspense fallback={null}>
      <TrackAuthorApplicationInner />
    </Suspense>
  );
}
