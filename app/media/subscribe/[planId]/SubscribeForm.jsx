'use client';

import { useState } from 'react';
import Link from 'next/link';

// The actual review form: choose Stripe or Paystack (same two "existing
// payment methods" as Bookstore checkout -- see app/checkout/page.jsx),
// check the Terms of Use / Refund Policy acknowledgment, then submit to
// /api/media/subscribe. The checkbox has to be checked before Continue
// is even clickable; the API also re-checks termsAccepted server-side
// as a backstop (see app/api/media/subscribe/route.js), since a client
// check alone is never enough on its own.
export default function SubscribeForm({ plan, userEmail }) {
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!termsAccepted || submitting) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/media/subscribe', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, paymentMethod, termsAccepted: true }),
      });
      const data = await res.json();

      if (!data.success) {
        if (res.status === 401) {
          window.location.href = `/account?next=${encodeURIComponent(`/media/subscribe/${plan.id}`)}`;
          return;
        }
        throw new Error(data.error || 'Unable to start subscription.');
      }

      window.location.href = data.data.authorizationUrl;
    } catch (err) {
      setError(err.message || 'Unable to start subscription. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={formCard}>
      <h2 style={formTitle}>Choose Payment Method</h2>

      <div style={paymentOptions}>
        <button
          type="button"
          onClick={() => setPaymentMethod('stripe')}
          style={{
            ...paymentOption,
            ...(paymentMethod === 'stripe' ? selectedPayment : {}),
          }}
        >
          <div style={paymentIcon}>💳</div>
          <div style={paymentText}>
            <strong>Stripe</strong>
            <span>Pay securely with card</span>
          </div>
          <div style={radio(paymentMethod === 'stripe')}>
            {paymentMethod === 'stripe' && '✓'}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setPaymentMethod('paystack')}
          style={{
            ...paymentOption,
            ...(paymentMethod === 'paystack' ? selectedPayment : {}),
          }}
        >
          <div style={paymentIcon}>💰</div>
          <div style={paymentText}>
            <strong>Paystack</strong>
            <span>Card, Mobile Money &amp; more</span>
          </div>
          <div style={radio(paymentMethod === 'paystack')}>
            {paymentMethod === 'paystack' && '✓'}
          </div>
        </button>
      </div>

      <p style={payingAs}>
        Paying as <strong>{userEmail}</strong>
      </p>

      <label style={termsRow}>
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          style={termsCheckbox}
        />
        <span>
          I have read and agree to the{' '}
          <Link href="/terms" target="_blank" style={termsLink}>
            Terms of Use
          </Link>{' '}
          and{' '}
          <Link href="/refund" target="_blank" style={termsLink}>
            Refund Policy
          </Link>
          , and understand that access is granted once an administrator
          reviews and approves my payment.
        </span>
      </label>

      {error && <p style={errorText}>{error}</p>}

      <button
        type="submit"
        disabled={!termsAccepted || submitting}
        style={{
          ...submitButton,
          ...(!termsAccepted || submitting ? submitButtonDisabled : {}),
        }}
      >
        {submitting
          ? 'Redirecting…'
          : `Continue to Payment — $${plan.priceUSD.toFixed(2)}`}
      </button>
    </form>
  );
}

const formCard = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  padding: '28px',
  display: 'flex',
  flexDirection: 'column',
  gap: '18px',
};

const formTitle = {
  color: 'var(--brand)',
  fontSize: '18px',
  margin: 0,
};

const paymentOptions = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
  gap: '12px',
};

const paymentOption = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '16px',
  borderRadius: '12px',
  border: '2px solid var(--border)',
  background: 'var(--paper)',
  cursor: 'pointer',
  textAlign: 'left',
  fontFamily: 'inherit',
};

const selectedPayment = {
  borderColor: 'var(--brand)',
  background: 'var(--brand-tint)',
};

const paymentIcon = {
  fontSize: '22px',
};

const paymentText = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  flex: 1,
  fontSize: '13.5px',
  color: 'var(--ink-soft)',
};

function radio(active) {
  return {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: `2px solid ${active ? 'var(--brand)' : 'var(--border)'}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '800',
    color: 'var(--brand)',
    flexShrink: 0,
  };
}

const payingAs = {
  color: 'var(--ink-soft)',
  fontSize: '13px',
  margin: 0,
};

const termsRow = {
  display: 'flex',
  gap: '10px',
  alignItems: 'flex-start',
  fontSize: '13px',
  color: 'var(--ink-soft)',
  lineHeight: 1.6,
  cursor: 'pointer',
};

const termsCheckbox = {
  marginTop: '3px',
  width: '16px',
  height: '16px',
  flexShrink: 0,
  cursor: 'pointer',
};

const termsLink = {
  color: 'var(--brand)',
  fontWeight: '700',
  textDecoration: 'underline',
};

const errorText = {
  color: 'var(--danger)',
  fontSize: '13px',
  margin: 0,
};

const submitButton = {
  background: 'var(--brand)',
  color: 'var(--on-accent)',
  border: 'none',
  borderRadius: '10px',
  padding: '15px 20px',
  fontWeight: '800',
  fontSize: '15px',
  cursor: 'pointer',
};

const submitButtonDisabled = {
  opacity: 0.55,
  cursor: 'not-allowed',
};
