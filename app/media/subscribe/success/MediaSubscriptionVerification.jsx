'use client';

import { useEffect, useRef, useState } from 'react';

// Client-side polling companion for the Media subscribe success page --
// same pattern as app/checkout/success/PaystackVerification.jsx, but
// calls /api/media/subscribe/verify, which is already gateway-aware
// (branches on the subscription's own stored paymentGateway) so this
// component doesn't need to know or care whether the payment went
// through Stripe or Paystack.

const MAX_ATTEMPTS = 8;
const RETRY_DELAY_MS = 4000;

export default function MediaSubscriptionVerification({ reference }) {
  const [message, setMessage] = useState('Confirming payment...');
  const [failed, setFailed] = useState(false);
  const [checking, setChecking] = useState(false);
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (!reference) {
      setMessage(
        'Unable to confirm this payment automatically. Please contact support with your subscription details.'
      );
      setFailed(true);
      return;
    }

    let cancelled = false;

    async function verifyPayment() {
      attemptsRef.current += 1;
      setChecking(true);

      try {
        const response = await fetch('/api/media/subscribe/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference }),
          cache: 'no-store',
        });

        const data = await response.json();

        if (cancelled) return;

        if (response.ok && data?.success) {
          setFailed(false);
          setMessage(
            data?.awaitingApproval
              ? 'Payment confirmed — awaiting admin approval.'
              : 'Payment confirmed.'
          );
          setTimeout(() => {
            if (!cancelled) window.location.reload();
          }, 500);
          return;
        }

        if (attemptsRef.current < MAX_ATTEMPTS) {
          setMessage(
            data?.error || 'Payment is still being confirmed with the provider…'
          );
          setChecking(false);
          setTimeout(verifyPayment, RETRY_DELAY_MS);
          return;
        }

        setChecking(false);
        setFailed(true);
        setMessage(
          data?.error ||
            'We could not confirm this payment yet. If you completed the payment, please wait a moment and check again.'
        );
      } catch (error) {
        if (cancelled) return;

        console.error('MEDIA SUBSCRIPTION CLIENT VERIFICATION ERROR:', error);

        if (attemptsRef.current < MAX_ATTEMPTS) {
          setMessage('Payment verification is still in progress…');
          setChecking(false);
          setTimeout(verifyPayment, RETRY_DELAY_MS);
          return;
        }

        setChecking(false);
        setFailed(true);
        setMessage('Unable to reach the payment verification service. Please check again in a moment.');
      }
    }

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [reference]);

  function handleManualCheck() {
    attemptsRef.current = 0;
    setFailed(false);
    setMessage('Confirming payment...');
    setChecking(true);
    fetch('/api/media/subscribe/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference }),
      cache: 'no-store',
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok && data?.success) {
          setMessage(
            data?.awaitingApproval
              ? 'Payment confirmed — awaiting admin approval.'
              : 'Payment confirmed.'
          );
          setTimeout(() => window.location.reload(), 500);
          return;
        }
        setFailed(true);
        setChecking(false);
        setMessage(data?.error || 'Still not confirmed. Please wait a little longer and check again.');
      })
      .catch(() => {
        setFailed(true);
        setChecking(false);
        setMessage('Unable to reach the payment verification service.');
      });
  }

  return (
    <div
      style={{
        marginBottom: '20px',
        padding: '12px 14px',
        borderRadius: '8px',
        background: failed ? 'var(--warning-tint, #fbf1e4)' : '#fff7ed',
        color: failed ? 'var(--warning, #b45309)' : '#7c2d12',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'wrap',
      }}
    >
      <span>{message}</span>
      {failed && (
        <button
          type="button"
          onClick={handleManualCheck}
          disabled={checking}
          style={{
            border: '1px solid currentColor',
            background: 'transparent',
            color: 'inherit',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: checking ? 'default' : 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {checking ? 'Checking…' : 'Check again'}
        </button>
      )}
    </div>
  );
}
