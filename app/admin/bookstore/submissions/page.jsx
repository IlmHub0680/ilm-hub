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
        <h1>Book Submissions</h1>
        <p style={{ color: '#6b7280' }}>
          Review and manage submitted books through the publishing workflow.
        </p>

        {loading && <p>Loading submissions...</p>}

        {error && (
          <div
            style={{
              background: '#fee2e2',
              color: '#991b1b',
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
              background: '#fff',
              borderRadius: 14,
              padding: 24,
              boxShadow: '0 2px 10px rgba(0,0,0,.05)',
            }}
          >
            {submissions.length === 0 ? (
              <p>No submissions found.</p>
            ) : (
              submissions.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '16px 0',
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  <strong>
                    {item.titleEn ||
                      item.book?.titleEn ||
                      item.title ||
                      'Untitled submission'}
                  </strong>

                  <div
                    style={{
                      color: '#6b7280',
                      marginTop: 5,
                    }}
                  >
                    {item.status || '—'}
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
