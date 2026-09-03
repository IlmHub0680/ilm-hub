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
    <main
      style={{
        minHeight: '100vh',
        background: '#f5f7fb',
        padding: '32px',
        fontFamily:
          'Inter, Arial, sans-serif',
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <BackToAdmin />
      </div>
      <div
        style={{
          maxWidth: '1450px',
          margin: '0 auto',
        }}
      >
        <header
          style={{
            background:
              'linear-gradient(135deg, #172554, #1e40af)',
            color: '#fff',
            borderRadius: '20px',
            padding: '30px',
            boxShadow:
              '0 10px 30px rgba(30,64,175,.16)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 20,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div
                style={{
                  color: '#bfdbfe',
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                }}
              >
                Bookstore Management
              </div>

              <h1
                style={{
                  margin: '7px 0',
                  fontSize: 32,
                }}
              >
                Books
              </h1>

              <p
                style={{
                  margin: 0,
                  color: '#dbeafe',
                }}
              >
                Manage the complete bookstore
                catalogue and publishing lifecycle.
              </p>
            </div>

            <Link
              href="/admin/bookstore/books/new"
              style={{
                background: '#fff',
                color: '#1d4ed8',
                padding: '12px 18px',
                borderRadius: 10,
                textDecoration: 'none',
                fontWeight: 800,
              }}
            >
              + Add Book
            </Link>
          </div>
        </header>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 12,
            marginTop: 20,
          }}
        >
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() =>
                setFilter(item.key)
              }
              style={{
                border:
                  filter === item.key
                    ? '2px solid #2563eb'
                    : '1px solid #e2e8f0',
                background:
                  filter === item.key
                    ? '#eff6ff'
                    : '#fff',
                borderRadius: 14,
                padding: '16px',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  color: '#64748b',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {item.label}
              </div>

              <div
                style={{
                  marginTop: 5,
                  color: '#0f172a',
                  fontSize: 25,
                  fontWeight: 800,
                }}
              >
                {counts[item.key]}
              </div>
            </button>
          ))}
        </section>

        {error && (
          <div
            style={{
              marginTop: 20,
              padding: 15,
              background: '#fee2e2',
              color: '#991b1b',
              borderRadius: 10,
              border: '1px solid #fecaca',
            }}
          >
            {error}
          </div>
        )}

        <section
          style={{
            background: '#fff',
            marginTop: 20,
            borderRadius: 16,
            padding: 18,
            boxShadow:
              '0 4px 18px rgba(15,23,42,.05)',
          }}
        >
          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search books, authors, categories..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '13px 15px',
              border:
                '1px solid #cbd5e1',
              borderRadius: 10,
              fontSize: 15,
              outline: 'none',
            }}
          />
        </section>

        <section
          style={{
            background: '#fff',
            marginTop: 20,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow:
              '0 4px 18px rgba(15,23,42,.05)',
          }}
        >
          {loading ? (
            <div
              style={{
                padding: 40,
                textAlign: 'center',
                color: '#64748b',
              }}
            >
              Loading bookstore catalogue...
            </div>
          ) : visibleBooks.length === 0 ? (
            <div
              style={{
                padding: 50,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 40,
                  marginBottom: 10,
                }}
              >
                📚
              </div>

              <h3>
                No books found
              </h3>

              <p
                style={{
                  color: '#64748b',
                }}
              >
                Try another filter or add a
                new book.
              </p>
            </div>
          ) : (
            visibleBooks.map((book) => (
              <article
                key={book.id}
                style={{
                  padding: 22,
                  borderBottom:
                    '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent:
                    'space-between',
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
                        background: '#e2e8f0',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 70,
                        height: 92,
                        borderRadius: 8,
                        background:
                          '#e2e8f0',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 24,
                      }}
                    >
                      📖
                    </div>
                  )}

                  <div>
                    <h3
                      style={{
                        margin: 0,
                        color: '#0f172a',
                      }}
                    >
                      {book.titleEn}
                    </h3>

                    {book.titleAr && (
                      <div
                        dir="rtl"
                        style={{
                          marginTop: 4,
                          color: '#64748b',
                        }}
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
                      <StatusBadge
                        status={book.status}
                      />

                      {book.isFeatured && (
                        <Badge>
                          Featured
                        </Badge>
                      )}

                      {book.isNewRelease && (
                        <Badge>
                          New Release
                        </Badge>
                      )}
                    </div>

                    <div
                      style={{
                        marginTop: 10,
                        color: '#64748b',
                        fontSize: 14,
                      }}
                    >
                      {book.category?.nameEn ||
                        'Uncategorized'}
                      {' · '}
                      {book.author?.name ||
                        'No author assigned'}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    minWidth: 270,
                    textAlign: 'right',
                  }}
                >
                  <div
                    style={{
                      fontSize: 19,
                      fontWeight: 800,
                      color: '#0f172a',
                    }}
                  >
                    $
                    {Number(
                      book.priceUSD || 0
                    ).toFixed(2)}
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      display: 'flex',
                      justifyContent:
                        'flex-end',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Link
                      href={`/admin/bookstore/books/${book.id}`}
                      style={{
                        padding:
                          '8px 12px',
                        borderRadius: 8,
                        background:
                          '#eff6ff',
                        color: '#1d4ed8',
                        textDecoration:
                          'none',
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      Manage
                    </Link>

                    {book.status !==
                      'PUBLISHED' && (
                      <button
                        type="button"
                        disabled={
                          actionId === book.id
                        }
                        onClick={() =>
                          updateBook(
                            book.id,
                            {
                              status:
                                'PUBLISHED',
                            },
                            `Publish "${book.titleEn}" to the public bookstore?`
                          )
                        }
                        style={buttonStyle(
                          '#166534',
                          '#dcfce7'
                        )}
                      >
                        Publish
                      </button>
                    )}

                    {book.status ===
                      'PUBLISHED' && (
                      <button
                        type="button"
                        disabled={
                          actionId === book.id
                        }
                        onClick={() =>
                          updateBook(
                            book.id,
                            {
                              status:
                                'DRAFT',
                            },
                            `Unpublish "${book.titleEn}"? It will disappear from the public bookstore.`
                          )
                        }
                        style={buttonStyle(
                          '#92400e',
                          '#fef3c7'
                        )}
                      >
                        Unpublish
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={
                        actionId === book.id
                      }
                      onClick={() =>
                        deleteBook(book)
                      }
                      style={buttonStyle(
                        '#991b1b',
                        '#fee2e2'
                      )}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}

function StatusBadge({ status }) {
  const styles = {
    PUBLISHED: ['#166534', '#dcfce7'],
    APPROVED: ['#1d4ed8', '#dbeafe'],
    DRAFT: ['#475569', '#e2e8f0'],
    PENDING_REVIEW: ['#92400e', '#fef3c7'],
    REJECTED: ['#991b1b', '#fee2e2'],
  };

  const [color, background] =
    styles[status] || styles.DRAFT;

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '5px 9px',
        borderRadius: 999,
        background,
        color,
        fontSize: 11,
        fontWeight: 800,
      }}
    >
      {status.replaceAll('_', ' ')}
    </span>
  );
}

function Badge({ children }) {
  return (
    <span
      style={{
        padding: '5px 9px',
        borderRadius: 999,
        background: '#f1f5f9',
        color: '#475569',
        fontSize: 11,
        fontWeight: 800,
      }}
    >
      {children}
    </span>
  );
}

function buttonStyle(color, background) {
  return {
    border: 0,
    padding: '8px 12px',
    borderRadius: 8,
    background,
    color,
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
  };
}
