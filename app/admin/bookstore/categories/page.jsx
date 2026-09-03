'use client';
import BackToAdmin from '../BackToAdmin';

import { useEffect, useState } from 'react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(
          '/api/admin/publishing/categories',
          { cache: 'no-store' }
        );

        const result = await response.json();

        setCategories(
          Array.isArray(result)
            ? result
            : result.data || result.categories || []
        );
      } catch {
        setCategories([]);
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
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1>Book Categories</h1>
        <p style={{ color: '#6b7280' }}>
          Organize the books displayed in the bookstore.
        </p>

        <div
          style={{
            marginTop: 24,
            background: '#fff',
            borderRadius: 14,
            padding: 24,
          }}
        >
          {loading ? (
            <p>Loading categories...</p>
          ) : categories.length === 0 ? (
            <p>No categories were returned.</p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fill,minmax(220px,1fr))',
                gap: 14,
              }}
            >
              {categories.map((category) => (
                <div
                  key={category.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 10,
                    padding: 16,
                  }}
                >
                  <strong>
                    {category.nameEn || category.name || 'Unnamed'}
                  </strong>

                  {category.nameAr && (
                    <div
                      dir="rtl"
                      style={{
                        marginTop: 6,
                        color: '#6b7280',
                      }}
                    >
                      {category.nameAr}
                    </div>
                  )}

                  {category.slug && (
                    <small
                      style={{
                        display: 'block',
                        marginTop: 8,
                        color: '#9ca3af',
                      }}
                    >
                      /{category.slug}
                    </small>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
