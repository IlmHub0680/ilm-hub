'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

// Real donation flow -- replaces the earlier honest holding page now
// that real Paystack/Stripe processing exists (see
// app/api/donations/{paystack,stripe}/{initialize,verify,webhook}).
// Mirrors app/admission/page.js's own initialize -> redirect ->
// verify pattern: GHS goes through Paystack (which also accepts
// international cards), USD goes through Stripe, and on return from
// either provider this page reads the callback query string
// (?reference= from Paystack, ?stripe_session_id= from Stripe) and
// calls the matching verify route server-side before ever showing a
// success state -- unlike the old page, "successful" here always
// means a real, provider-confirmed payment.
//
// Recurring donations are intentionally not offered yet -- that
// needs real subscription/auto-charge billing, a meaningfully bigger
// build than a one-time charge, so offering it now would repeat the
// exact problem being fixed here (a control that doesn't do what it
// claims).

const PURPOSES = [
  'General Institute Support',
  'Student Scholarship Fund',
  'Library & Publication Expansion',
  'Online Media & Broadcasting',
];

export default function DonationsPage() {
  const [amount, setAmount] = useState('50');
  const [currency, setCurrency] = useState('USD');
  const [purpose, setPurpose] = useState(PURPOSES[0]);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cancelledNotice, setCancelledNotice] = useState(false);
  const [receipt, setReceipt] = useState(null);

  // Handle returning from Paystack (?reference=) or Stripe
  // (?stripe_session_id=), and the cancelled-checkout case.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference');
    const stripeSessionId = params.get('stripe_session_id');
    const cancelled = params.get('payment') === 'cancelled';

    if (cancelled) {
      setCancelledNotice(true);
      const cleanUrl = `${window.location.pathname}${window.location.hash || ''}`;
      window.history.replaceState({}, document.title, cleanUrl);
      return;
    }

    if (reference) {
      verifyPaystack(reference);
    } else if (stripeSessionId) {
      verifyStripe(stripeSessionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function verifyPaystack(reference) {
    setVerifying(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/donations/paystack/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      });
      const result = await res.json();

      if (!res.ok || !result.success || !result.data) {
        throw new Error(result.error || 'Unable to verify your donation.');
      }

      setReceipt(result.data);

      const cleanUrl = `${window.location.pathname}${window.location.hash || ''}`;
      window.history.replaceState({}, document.title, cleanUrl);
    } catch (err) {
      setErrorMessage(err.message || 'Unable to verify your donation.');
    } finally {
      setVerifying(false);
    }
  }

  async function verifyStripe(sessionId) {
    setVerifying(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/donations/stripe/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const result = await res.json();

      if (!res.ok || !result.success || !result.data) {
        throw new Error(result.error || 'Unable to verify your donation.');
      }

      setReceipt(result.data);

      const cleanUrl = `${window.location.pathname}${window.location.hash || ''}`;
      window.history.replaceState({}, document.title, cleanUrl);
    } catch (err) {
      setErrorMessage(err.message || 'Unable to verify your donation.');
    } finally {
      setVerifying(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage('');

    const amountNumber = Number(amount);

    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      setErrorMessage('Enter a valid donation amount.');
      return;
    }

    setSubmitting(true);

    try {
      if (currency === 'USD') {
        const res = await fetch('/api/donations/stripe/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amountNumber,
            purpose,
            donorName,
            donorEmail,
          }),
        });
        const result = await res.json();

        if (!res.ok || !result.success || !result.data?.checkoutUrl) {
          throw new Error(result.error || 'Unable to start your donation.');
        }

        window.location.href = result.data.checkoutUrl;
        return;
      }

      // GHS goes through Paystack.
      const res = await fetch('/api/donations/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountNumber,
          currency,
          purpose,
          donorName,
          donorEmail,
        }),
      });
      const result = await res.json();

      if (!res.ok || !result.success || !result.data?.authorizationUrl) {
        throw new Error(result.error || 'Unable to start your donation.');
      }

      window.location.href = result.data.authorizationUrl;
    } catch (err) {
      setErrorMessage(err.message || 'Unable to start your donation.');
      setSubmitting(false);
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    fontSize: 14,
    fontFamily: 'inherit',
    color: 'var(--ink)',
    background: 'var(--surface)',
  };

  const labelStyle = {
    display: 'block',
    fontWeight: 600,
    marginBottom: 8,
    color: 'var(--ink-soft)',
    fontSize: 13.5,
  };

  return (
    <>
      <SiteHeader />

      <div style={{ minHeight: '100vh', backgroundColor: 'var(--paper)', padding: '48px 20px 90px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: '36px 34px',
              boxShadow: '0 4px 20px rgba(27,36,31,.06)',
            }}
          >
            {verifying ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    margin: '0 auto 18px',
                    borderRadius: '50%',
                    border: '3px solid var(--border)',
                    borderTopColor: 'var(--brand)',
                    animation: 'ih-donate-spin .8s linear infinite',
                  }}
                />
                <p style={{ color: 'var(--ink-soft)' }}>Confirming your donation…</p>
                <style>{`@keyframes ih-donate-spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : receipt ? (
              <div
                style={{
                  background: 'var(--brand-tint)',
                  padding: 24,
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 34, marginBottom: 10 }} aria-hidden="true">🤲</div>
                <h2 style={{ color: 'var(--brand)', margin: '0 0 6px', fontSize: 22 }}>
                  Thank You for Your Donation
                </h2>
                <p style={{ color: 'var(--ink-soft)', marginBottom: 20 }}>
                  Your gift has been received and confirmed.
                </p>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    color: 'var(--ink)',
                    textAlign: 'left',
                    background: 'var(--surface)',
                    padding: 18,
                    borderRadius: 8,
                    marginBottom: 20,
                  }}
                >
                  <p style={{ margin: 0 }}>
                    <strong>Amount:</strong> {receipt.amount} {receipt.currency}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Purpose:</strong> {receipt.purpose}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Status:</strong>{' '}
                    <span style={{ color: 'var(--brand)', fontWeight: 700 }}>Confirmed</span>
                  </p>
                  {receipt.paidAt && (
                    <p style={{ margin: 0 }}>
                      <strong>Date:</strong>{' '}
                      {new Date(receipt.paidAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Link
                  href="/"
                  style={{
                    display: 'inline-block',
                    background: 'var(--brand)',
                    color: 'var(--on-accent)',
                    padding: '11px 24px',
                    borderRadius: 8,
                    fontWeight: 700,
                    textDecoration: 'none',
                    fontSize: 14.5,
                  }}
                >
                  Return to Homepage
                </Link>
              </div>
            ) : (
              <>
                <h1 style={{ margin: '0 0 10px', fontSize: 28, fontWeight: 800, color: 'var(--ink)' }}>
                  Support Ulul Azm Institute
                </h1>
                <p style={{ color: 'var(--ink-soft)', marginBottom: 26, lineHeight: 1.6 }}>
                  Your contributions directly fund authentic Islamic education, student support, and
                  community outreach.
                </p>

                {cancelledNotice && (
                  <div
                    style={{
                      background: 'var(--warning-tint)',
                      color: 'var(--warning)',
                      padding: '11px 14px',
                      borderRadius: 8,
                      marginBottom: 20,
                      fontSize: 13.5,
                    }}
                  >
                    Your checkout was cancelled. No payment was made — feel free to try again below.
                  </div>
                )}

                {errorMessage && (
                  <div
                    role="alert"
                    style={{
                      background: 'var(--danger-tint)',
                      color: 'var(--danger)',
                      padding: '11px 14px',
                      borderRadius: 8,
                      marginBottom: 20,
                      fontSize: 13.5,
                    }}
                  >
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                    <div>
                      <label style={labelStyle} htmlFor="donate-amount">Amount</label>
                      <input
                        id="donate-amount"
                        type="number"
                        min="1"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        style={inputStyle}
                        required
                      />
                    </div>
                    <div>
                      <label style={labelStyle} htmlFor="donate-currency">Currency</label>
                      <select
                        id="donate-currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        style={inputStyle}
                      >
                        <option value="USD">USD ($)</option>
                        <option value="GHS">GHS (₵)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle} htmlFor="donate-purpose">Purpose / Fund</label>
                    <select
                      id="donate-purpose"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      style={inputStyle}
                    >
                      {PURPOSES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle} htmlFor="donate-donor-name">Donor Name (Optional)</label>
                    <input
                      id="donate-donor-name"
                      type="text"
                      placeholder="Leave blank for Anonymous"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle} htmlFor="donate-donor-email">Email (Optional — for your receipt)</label>
                    <input
                      id="donate-donor-email"
                      type="email"
                      placeholder="you@example.com"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      backgroundColor: 'var(--brand)',
                      color: 'var(--on-accent)',
                      padding: 14,
                      borderRadius: 8,
                      fontWeight: 700,
                      border: 'none',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      fontSize: 15,
                      marginTop: 8,
                      opacity: submitting ? 0.7 : 1,
                    }}
                  >
                    {submitting ? 'Redirecting to secure checkout…' : 'Proceed with Secure Donation'}
                  </button>

                  <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', textAlign: 'center', margin: 0 }}>
                    You'll be redirected to {currency === 'USD' ? 'Stripe' : 'Paystack'} to complete your
                    donation securely.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
