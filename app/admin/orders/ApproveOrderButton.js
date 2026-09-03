'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ApproveOrderButton({
  orderId,
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleApprove() {
    const confirmed = window.confirm(
      'Approve this payment and activate the customer’s book access?'
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/orders/${encodeURIComponent(
          orderId
        )}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error ||
            'Unable to activate this order.'
        );
      }

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to activate this order.'
      );
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleApprove}
        disabled={loading}
        style={{
          width: '100%',
          padding: '14px 20px',
          border: 'none',
          borderRadius: '10px',
          background: loading
            ? '#86efac'
            : '#166534',
          color: '#fff',
          fontSize: '15px',
          fontWeight: '800',
          cursor: loading
            ? 'not-allowed'
            : 'pointer',
        }}
      >
        {loading
          ? 'Activating...'
          : '✓ Approve Payment & Activate Order'}
      </button>

      {error && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            borderRadius: '8px',
            background: '#fef2f2',
            color: '#b91c1c',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
