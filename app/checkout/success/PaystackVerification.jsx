'use client';

import { useEffect, useState } from 'react';

export default function PaystackVerification({
  orderId,
}) {
  const [message, setMessage] =
    useState('Confirming payment...');

  useEffect(() => {
    if (!orderId) {
      return;
    }

    let cancelled = false;

    async function verifyPayment() {
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
              }),

              cache: 'no-store',
            }
          );

        const data =
          await response.json();

        if (cancelled) {
          return;
        }

        if (
          !response.ok ||
          !data?.success
        ) {
          setMessage(
            data?.error ||
              'Unable to verify payment.'
          );

          return;
        }

        if (!data.verified) {
          setMessage(
            data?.message ||
              'Payment is still being confirmed.'
          );

          /*
           * Try again shortly.
           */
          setTimeout(
            verifyPayment,
            3000
          );

          return;
        }

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
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          'PAYSTACK CLIENT VERIFICATION ERROR:',
          error
        );

        setMessage(
          'Payment verification is still in progress.'
        );

        setTimeout(
          verifyPayment,
          4000
        );
      }
    }

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return (
    <div
      style={{
        marginBottom: '20px',
        padding: '12px 14px',
        borderRadius: '8px',
        background: '#f8fafc',
        color: '#475569',
        fontSize: '13px',
      }}
    >
      {message}
    </div>
  );
}
