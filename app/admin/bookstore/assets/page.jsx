'use client';
import BackToAdmin from '../BackToAdmin';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

/*
 * Real digital-asset health view: reuses the same real Books admin API
 * (/api/admin/bookstore/books) already used by the Books admin page —
 * no separate mock data, no duplicate system. This page's job is simply
 * to surface which books are missing a real uploaded digital file
 * (r2FileKey), or missing a cover image, so an admin can catch a book
 * that would otherwise silently sell without a working download.
 */
export default function AssetsPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    let active = true;

    fetch('/api/admin/bookstore/books', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (!data.success) {
          throw new Error(data.error || 'Unable to load books.');
        }
        setBooks(data.books || []);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Unable to load books.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const missingFile = useMemo(
    () => books.filter((b) => !b.r2FileKey || !b.r2FileKey.trim()),
    [books]
  );

  const missingCover = useMemo(
    () => books.filter((b) => !b.coverImageUrl || !b.coverImageUrl.trim()),
    [books]
  );

  const publishedMissingFile = useMemo(
    () =>
      books.filter(
        (b) => b.status === 'PUBLISHED' && (!b.r2FileKey || !b.r2FileKey.trim())
      ),
    [books]
  );

  const visibleBooks = useMemo(() => {
    if (filter === 'MISSING_FILE') return missingFile;
    if (filter === 'MISSING_COVER') return missingCover;
    return books;
  }, [filter, books, missingFile, missingCover]);

  return (
    <main style={{ padding: 32 }}>
      <div style={{ marginBottom: 20 }}>
        <BackToAdmin />
      </div>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, margin: '0 0 6px', color: 'var(--ink)' }}>
          Digital Assets
        </h1>
        <p style={{ color: 'var(--ink-soft)' }}>
          Real-time file health for every book in the catalog — a digital
          file (r2FileKey) is what the download endpoint actually serves;
          a book without one cannot be downloaded even if a customer's
          order is fully paid and activated.
        </p>

        {publishedMissingFile.length > 0 && (
          <div
            style={{
              marginTop: 18,
              background: 'var(--danger-tint)',
              border: '1px solid var(--danger)',
              color: 'var(--danger)',
              borderRadius: 12,
              padding: '14px 16px',
              fontSize: 13.5,
              fontWeight: 600,
            }}
          >
            ⚠ {publishedMissingFile.length} published book
            {publishedMissingFile.length === 1 ? '' : 's'} currently{' '}
            {publishedMissingFile.length === 1 ? 'has' : 'have'} no digital
            file uploaded — customers could pay for{' '}
            {publishedMissingFile.length === 1 ? 'it' : 'them'} but never
            receive a working download.
          </div>
        )}

        {error && (
          <div style={{ marginTop: 18, color: 'var(--danger)', fontSize: 13.5 }}>
            {error}
          </div>
        )}

        <div
          style={{
            marginTop: 20,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: 14,
          }}
        >
          <SummaryTile
            label="Total Books"
            value={books.length}
            active={filter === 'ALL'}
            onClick={() => setFilter('ALL')}
          />
          <SummaryTile
            label="Missing Digital File"
            value={missingFile.length}
            accent="var(--danger)"
            active={filter === 'MISSING_FILE'}
            onClick={() => setFilter('MISSING_FILE')}
          />
          <SummaryTile
            label="Missing Cover Image"
            value={missingCover.length}
            accent="var(--warning)"
            active={filter === 'MISSING_COVER'}
            onClick={() => setFilter('MISSING_COVER')}
          />
        </div>

        <div
          style={{
            marginTop: 24,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 4px 18px rgba(27,36,31,.08)',
          }}
        >
          {loading ? (
            <div style={{ padding: 28, color: 'var(--ink-soft)' }}>Loading books…</div>
          ) : visibleBooks.length === 0 ? (
            <div style={{ padding: 28, color: 'var(--ink-soft)' }}>
              {filter === 'ALL'
                ? 'No books in the catalog yet.'
                : 'Nothing in this view — every book is covered.'}
            </div>
          ) : (
            visibleBooks.map((book) => {
              const hasFile = Boolean(book.r2FileKey && book.r2FileKey.trim());
              const hasCover = Boolean(book.coverImageUrl && book.coverImageUrl.trim());

              return (
                <div
                  key={book.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 18px',
                    borderBottom: '1px solid var(--border-soft)',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 60,
                      borderRadius: 6,
                      overflow: 'hidden',
                      background: 'var(--brand-tint)',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                    }}
                  >
                    {hasCover ? (
                      <img
                        src={book.coverImageUrl}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      '📕'
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>
                      {book.titleEn}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>
                      {book.category?.nameEn || 'Uncategorized'} · {book.status}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <Badge ok={hasFile} okLabel="File ✓" missingLabel="No file" />
                    <Badge ok={hasCover} okLabel="Cover ✓" missingLabel="No cover" />
                  </div>

                  <Link
                    href={`/admin/bookstore/books/${book.id}`}
                    style={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: 'var(--brand)',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Manage →
                  </Link>
                </div>
              );
            })
          )}
        </div>

        <div
          style={{
            marginTop: 20,
            background: 'var(--paper)',
            border: '1px dashed var(--border)',
            borderRadius: 12,
            padding: '14px 16px',
            color: 'var(--ink-soft)',
            fontSize: 12.5,
            lineHeight: 1.6,
          }}
        >
          Uploading or replacing a book's cover image or digital file is
          done from that book's own edit page. Publishing status is
          controlled separately (a book can exist, or even have a file,
          before it is made publicly visible).
        </div>
      </div>
    </main>
  );
}

function SummaryTile({ label, value, accent = 'var(--ink)', active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: 'left',
        background: 'var(--surface)',
        border: active ? '2px solid var(--brand)' : '1px solid var(--border)',
        borderRadius: 12,
        padding: '16px 18px',
        cursor: 'pointer',
        boxShadow: '0 4px 18px rgba(27,36,31,.08)',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--ink-soft)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 8,
          fontFamily: 'var(--font-display)',
          fontSize: 26,
          fontWeight: 800,
          color: accent,
        }}
      >
        {value}
      </div>
    </button>
  );
}

function Badge({ ok, okLabel, missingLabel }) {
  return (
    <span
      style={{
        fontSize: 10.5,
        fontWeight: 800,
        letterSpacing: '0.02em',
        color: ok ? 'var(--brand-light)' : 'var(--danger)',
        background: 'var(--paper)',
        border: `1px solid ${ok ? 'var(--brand-light)' : 'var(--danger)'}`,
        borderRadius: 999,
        padding: '3px 9px',
        whiteSpace: 'nowrap',
      }}
    >
      {ok ? okLabel : missingLabel}
    </span>
  );
}
