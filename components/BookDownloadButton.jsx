'use client';

import { useState } from 'react';

// Calls the real, entitlement-checked download endpoint
// (app/api/downloads/[orderId]/[bookId]) and opens the short-lived signed
// URL it returns. This is the only path that should ever start a book
// download — there is no static/public file URL to link to directly.
export default function BookDownloadButton({ orderId, bookId, style }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleClick() {
    if (busy) return;
    setBusy(true);
    setError('');

    try {
      const res = await fetch(`/api/downloads/${encodeURIComponent(orderId)}/${encodeURIComponent(bookId)}`);
      const result = await res.json();

      if (!res.ok || !result.success || !result.downloadUrl) {
        setError(result.error || 'Unable to start the download.');
        return;
      }

      window.location.href = result.downloadUrl;
    } catch (err) {
      console.error(err);
      setError('Unable to reach the server — please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={handleClick} disabled={busy} style={style}>
        {busy ? 'Preparing…' : 'Download Book ↓'}
      </button>
      {error && (
        <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '6px' }}>{error}</p>
      )}
    </div>
  );
}
