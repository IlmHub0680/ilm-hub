'use client';
import BackToAdmin from '../BackToAdmin';

import { useEffect, useState } from 'react';

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(
          '/api/admin/publishing/submissions',
          { cache: 'no-store' }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.error || 'Unable to load submissions.'
          );
        }

        setSubmissions(result.data || []);
      } catch (err) {
        setError(err.message || 'Unable to load submissions.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <main style={{ padding: 32 }}>
      <div style={{ marginBottom: 20 }}>
        <BackToAdmin />
      </div>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, margin: '0 0 6px', color: 'var(--ink)' }}>
          Book Submissions
        </h1>
        <p style={{ color: 'var(--ink-soft)' }}>
          Review and manage submitted books through the publishing workflow.
        </p>

        {loading && <p>Loading submissions...</p>}

        {error && (
          <div
            style={{
              background: 'var(--danger-tint)',
              color: 'var(--danger)',
              padding: 14,
              borderRadius: 8,
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && (
          <div
            style={{
              marginTop: 24,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 4px 18px rgba(27,36,31,.08)',
            }}
          >
            {submissions.length === 0 ? (
              <p>No submissions found.</p>
            ) : (
              submissions.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '16px 4px',
                    borderBottom: '1px solid var(--border-soft)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <strong>
                    {item.titleEn ||
                      item.book?.titleEn ||
                      item.title ||
                      'Untitled submission'}
                  </strong>

                  <div style={{ marginTop: 7 }}>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: 11.5,
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: 999,
                        background: 'var(--brand-tint)',
                        color: 'var(--brand-dark)',
                      }}
                    >
                      {item.status || 'UNKNOWN'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
