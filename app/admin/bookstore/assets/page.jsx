'use client';
import BackToAdmin from '../BackToAdmin';

import Link from 'next/link';

export default function AssetsPage() {
  return (
    <main style={{ padding: 32 }}>
      <div style={{ marginBottom: 20 }}>
        <BackToAdmin />
      </div>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <h1>Digital Assets</h1>
        <p style={{ color: '#6b7280' }}>
          Manage covers, previews and protected digital book files.
        </p>

        <div
          style={{
            marginTop: 24,
            background: '#fff',
            padding: 28,
            borderRadius: 14,
          }}
        >
          <h2>Controlled digital publishing</h2>

          <p style={{ color: '#4b5563', lineHeight: 1.7 }}>
            A book may exist before its digital file is uploaded.
            Uploading an asset does not automatically publish the book.
            Public visibility remains controlled by the book publishing status.
          </p>

          <Link
            href="/admin/bookstore/books"
            style={{
              display: 'inline-block',
              marginTop: 12,
              background: '#2563eb',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: 8,
              textDecoration: 'none',
            }}
          >
            Manage Book Assets
          </Link>
        </div>
      </div>
    </main>
  );
}
