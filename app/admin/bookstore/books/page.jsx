'use client';
import BackToAdmin from '../BackToAdmin';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'PUBLISHED', label: 'Published' },
  { key: 'DRAFT', label: 'Drafts' },
  { key: 'PENDING_REVIEW', label: 'Pending Approval' },
  { key: 'REJECTED', label: 'Rejected' },
  { key: 'APPROVED', label: 'Approved' },
];

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState('');

  async function loadBooks() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        '/api/admin/publishing/books',
        {
          cache: 'no-store',
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || 'Unable to load books.'
        );
      }

      setBooks(result.data || []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load books.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, []);

  async function updateBook(id, data, message) {
    if (!window.confirm(message)) return;

    try {
      setActionId(id);
      setError('');

      const response = await fetch(
        `/api/admin/publishing/books/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || 'Unable to update book.'
        );
      }

      await loadBooks();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update book.'
      );
    } finally {
      setActionId('');
    }
  }

  async function deleteBook(book) {
    if (
      !window.confirm(
        `Delete "${book.titleEn}" permanently?\n\nThis cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setActionId(book.id);
      setError('');

      const response = await fetch(
        `/api/admin/publishing/books/${book.id}`,
        {
          method: 'DELETE',
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || 'Unable to delete book.'
        );
      }

      await loadBooks();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to delete book.'
      );
    } finally {
      setActionId('');
    }
  }

  const counts = useMemo(() => {
    return {
      ALL: books.length,
      PUBLISHED: books.filter(
        (book) => book.status === 'PUBLISHED'
      ).length,
      DRAFT: books.filter(
        (book) => book.status === 'DRAFT'
      ).length,
      PENDING_REVIEW: books.filter(
        (book) => book.status === 'PENDING_REVIEW'
      ).length,
      REJECTED: books.filter(
        (book) => book.status === 'REJECTED'
      ).length,
      APPROVED: books.filter(
        (book) => book.status === 'APPROVED'
      ).length,
    };
  }, [books]);

  const visibleBooks = useMemo(() => {
    const term = search.trim().toLowerCase();

    return books.filter((book) => {
      if (
        filter !== 'ALL' &&
        book.status !== filter
      ) {
        return false;
      }

      if (!term) return true;

      const searchable = [
        book.titleEn,
        book.titleAr,
        book.slug,
        book.author?.name,
        book.category?.nameEn,
        book.category?.nameAr,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(term);
    });
  }, [books, filter, search]);

  return (
    <div style={{ padding: 'var(--sp-6, 32px)', maxWidth: 1450, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <BackToAdmin />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 22,
        }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 600, margin: 0 }}>Books</h1>
          <div style={{ color: 'var(--ink-soft)', fontSize: 13.5, marginTop: 4 }}>
            Manage the complete bookstore catalogue and publishing lifecycle.
          </div>
        </div>

        <Link href="/admin/bookstore/books/new" className="ih-btn ih-btn-primary">
          + Add Book
        </Link>
      </div>

      <div className="ih-stat-grid" style={{ marginBottom: 24 }}>
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={`ih-stat-tile${filter === item.key ? ' accent' : ''}`}
            style={{
              cursor: 'pointer',
              textAlign: 'left',
              border: filter === item.key ? '1px solid var(--gold)' : undefined,
            }}
          >
            <div className="n">{counts[item.key]}</div>
            <div className="l">{item.label}</div>
          </button>
        ))}
      </div>

      {error && (
        <div className="ih-card" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div className="ih-card" style={{ marginBottom: 20 }}>
        <div className="ih-field" style={{ gap: 0 }}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search books, authors, categories..."
          />
        </div>
      </div>

      <div className="ih-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>
            Loading bookstore catalogue...
          </div>
        ) : visibleBooks.length === 0 ? (
          <div style={{ padding: 50, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📚</div>
            <h3>No books found</h3>
            <p style={{ color: 'var(--ink-soft)' }}>
              Try another filter or add a new book.
            </p>
          </div>
        ) : (
          visibleBooks.map((book) => (
            <article
              key={book.id}
              style={{
                padding: 22,
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 24,
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 18,
                  flex: 1,
                  minWidth: 280,
                }}
              >
                {book.coverImageUrl ? (
                  <img
                    src={book.coverImageUrl}
                    alt=""
                    style={{
                      width: 70,
                      height: 92,
                      objectFit: 'cover',
                      borderRadius: 8,
                      background: 'var(--border)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 70,
                      height: 92,
                      borderRadius: 8,
                      background: 'var(--border)',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 24,
                    }}
                  >
                    📖
                  </div>
                )}

                <div>
                  <h3 style={{ margin: 0, color: 'var(--ink)' }}>
                    {book.titleEn}
                  </h3>

                  {book.titleAr && (
                    <div
                      dir="rtl"
                      style={{ marginTop: 4, color: 'var(--ink-soft)' }}
                    >
                      {book.titleAr}
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: 9,
                      display: 'flex',
                      gap: 8,
                      flexWrap: 'wrap',
                      alignItems: 'center',
                    }}
                  >
                    <StatusBadge status={book.status} />

                    {book.isFeatured && (
                      <span className="ih-badge ih-b-neutral">Featured</span>
                    )}

                    {book.isNewRelease && (
                      <span className="ih-badge ih-b-neutral">New Release</span>
                    )}
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      color: 'var(--ink-soft)',
                      fontSize: 14,
                    }}
                  >
                    {book.category?.nameEn || 'Uncategorized'}
                    {' · '}
                    {book.author?.name || 'No author assigned'}
                  </div>
                </div>
              </div>

              <div style={{ minWidth: 270, textAlign: 'right' }}>
                <div className="mono" style={{ fontSize: 19, fontWeight: 800, color: 'var(--ink)' }}>
                  ${Number(book.priceUSD || 0).toFixed(2)}
                </div>

                <div
                  style={{
                    marginTop: 12,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <Link
                    href={`/admin/bookstore/books/${book.id}`}
                    className="ih-btn ih-btn-secondary"
                    style={{ padding: '6px 12px', fontSize: 12.5 }}
                  >
                    Manage
                  </Link>

                  {book.status !== 'PUBLISHED' && (
                    <button
                      type="button"
                      disabled={actionId === book.id}
                      onClick={() =>
                        updateBook(
                          book.id,
                          { status: 'PUBLISHED' },
                          `Publish "${book.titleEn}" to the public bookstore?`
                        )
                      }
                      className="ih-btn ih-btn-primary"
                      style={{ padding: '6px 12px', fontSize: 12.5 }}
                    >
                      Publish
                    </button>
                  )}

                  {book.status === 'PUBLISHED' && (
                    <button
                      type="button"
                      disabled={actionId === book.id}
                      onClick={() =>
                        updateBook(
                          book.id,
                          { status: 'DRAFT' },
                          `Unpublish "${book.titleEn}"? It will disappear from the public bookstore.`
                        )
                      }
                      className="ih-btn ih-btn-gold"
                      style={{ padding: '6px 12px', fontSize: 12.5 }}
                    >
                      Unpublish
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={actionId === book.id}
                    onClick={() => deleteBook(book)}
                    className="ih-btn ih-btn-danger"
                    style={{ padding: '6px 12px', fontSize: 12.5 }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const tones = {
    PUBLISHED: 'ih-b-success',
    APPROVED: 'ih-b-info',
    DRAFT: 'ih-b-neutral',
    PENDING_REVIEW: 'ih-b-warning',
    REJECTED: 'ih-b-danger',
  };

  const tone = tones[status] || tones.DRAFT;

  return (
    <span className={`ih-badge ${tone}`}>
      {status.replaceAll('_', ' ')}
    </span>
  );
}
