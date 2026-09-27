'use client';

import { useEffect, useRef, useState } from 'react';

const MAX_ATTEMPTS = 8;
const RETRY_DELAY_MS = 4000;

export default function PaystackVerification({
  orderId,
  reference,
}) {
  const [message, setMessage] =
    useState('Confirming payment...');
  const [failed, setFailed] = useState(false);
  const [checking, setChecking] = useState(false);
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (!orderId || !reference) {
      // Without a real Paystack reference we cannot verify anything —
      // tell the user plainly instead of spinning forever.
      setMessage(
        'Unable to confirm this payment automatically. Please contact support with your order number.'
      );
      setFailed(true);
      return;
    }

    let cancelled = false;

    async function verifyPayment() {
      attemptsRef.current += 1;
      setChecking(true);

      try {
        const response =
          await fetch(
            '/api/payments/paystack/verify',
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body: JSON.stringify({
                orderId,
                reference,
              }),

              cache: 'no-store',
            }
          );

        const data =
          await response.json();

        if (cancelled) {
          return;
        }

        if (response.ok && data?.success) {
          setFailed(false);
          setMessage(
            'Payment confirmed.'
          );

          /*
           * Reload server-rendered page so
           * it reads the newly updated order.
           */
          setTimeout(() => {
            if (!cancelled) {
              window.location.reload();
            }
          }, 500);
          return;
        }

        /*
         * Paystack itself may not have marked the transaction
         * successful yet (mobile money confirmations can take a
         * little while) — keep polling up to MAX_ATTEMPTS before
         * giving up and asking the user to check back.
         */
        if (attemptsRef.current < MAX_ATTEMPTS) {
          setMessage(
            data?.error ||
              'Payment is still being confirmed with the provider…'
          );
          setChecking(false);
          setTimeout(
            verifyPayment,
            RETRY_DELAY_MS
          );
          return;
        }

        setChecking(false);
        setFailed(true);
        setMessage(
          data?.error ||
            'We could not confirm this payment yet. If you completed the payment on your phone, please wait a moment and check again.'
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          'PAYSTACK CLIENT VERIFICATION ERROR:',
          error
        );

        if (attemptsRef.current < MAX_ATTEMPTS) {
          setMessage(
            'Payment verification is still in progress…'
          );
          setChecking(false);
          setTimeout(
            verifyPayment,
            RETRY_DELAY_MS
          );
          return;
        }

        setChecking(false);
        setFailed(true);
        setMessage(
          'Unable to reach the payment verification service. Please check again in a moment.'
        );
      }
    }

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [orderId, reference]);

  function handleManualCheck() {
    attemptsRef.current = 0;
    setFailed(false);
    setMessage('Confirming payment...');
    // Re-trigger the effect's verification loop from scratch.
    setChecking(true);
    fetch('/api/payments/paystack/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, reference }),
      cache: 'no-store',
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok && data?.success) {
          setMessage('Payment confirmed.');
          setTimeout(() => window.location.reload(), 500);
          return;
        }
        setFailed(true);
        setChecking(false);
        setMessage(
          data?.error ||
            'Still not confirmed. If you completed the mobile money prompt, please wait a little longer and check again.'
        );
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
        background: failed ? 'var(--warning-tint, #fbf1e4)' : '#f8fafc',
        color: failed ? 'var(--warning, #b45309)' : '#475569',
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
