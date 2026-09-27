'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LIBRARY_CATEGORIES, categoryLabel } from '@/lib/library';
import { useSectionBanner } from '@/components/SectionBannerProvider';

export default function LibraryPage() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(() => searchParams.get('category') || 'ALL');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const bannerUrl = useSectionBanner();

  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory) setCategoryFilter(urlCategory);
  }, [searchParams]);

  // Debounce the raw search box input so we don't hit the API on every
  // keystroke — the actual query still runs against the real database.
  useEffect(() => {
    const handle = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, 350);
    return () => clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    let active = true;
    setItemsLoading(true);

    const query = new URLSearchParams();
    if (categoryFilter !== 'ALL') query.set('category', categoryFilter);
    if (searchTerm) query.set('search', searchTerm);
    const qs = query.toString();

    fetch(`/api/library-resources${qs ? `?${qs}` : ''}`)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.success) {
          setItems(data.items);
          setError('');
          if (categoryFilter === 'ALL' && !searchTerm) {
            const set = new Set(data.items.map((i) => i.category));
            setAvailableCategories(LIBRARY_CATEGORIES.filter((c) => set.has(c.value)));
          }
        } else {
          setError('Unable to load the Library right now.');
        }
      })
      .catch(() => {
        if (active) setError('Unable to load the Library right now.');
      })
      .finally(() => {
        if (active) {
          setItemsLoading(false);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [categoryFilter, searchTerm]);

  return (
    <main style={page}>
      <section
        style={
          bannerUrl
            ? {
                ...hero,
                backgroundImage: `linear-gradient(135deg, rgba(8,32,24,.78), rgba(8,32,24,.5)), url(${bannerUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : hero
        }
      >
        <div style={heroInner}>
          <div style={eyebrow}>Ulul Azm Library</div>
          <h1 style={heroTitle}>Articles, Fatwas &amp; Classical Texts — Free to Read</h1>
          <p style={heroSub}>
            Research papers, historical materials, manuscripts and educational
            resources from Ulul Azm — open to everyone, no subscription
            required.
          </p>
        </div>
      </section>

      <section id="search" style={toolbar}>
        <div style={searchWrap}>
          <span style={searchIconStyle} aria-hidden="true">🔍</span>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search articles, fatwas, research papers, manuscripts…"
            style={searchInputStyle}
            aria-label="Search the Library"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              style={searchClearBtn}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
          {itemsLoading && <span style={searchSpinner}>Searching…</span>}
        </div>

        <div style={chipRow}>
          <button
            onClick={() => setCategoryFilter('ALL')}
            style={categoryFilter === 'ALL' ? chipActive : chip}
          >
            All
          </button>
          {availableCategories.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategoryFilter(c.value)}
              style={categoryFilter === c.value ? chipActive : chip}
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      <section style={grid}>
        {loading && <div style={{ color: 'var(--ink-soft)', padding: '40px 0' }}>Loading Library…</div>}

        {!loading && items.length === 0 && (
          <div style={{ color: 'var(--ink-soft)', padding: '40px 0' }}>
            {searchTerm
              ? `No Library items match "${searchTerm}"${categoryFilter !== 'ALL' ? ' in this category' : ''}. Try a different search term.`
              : 'No Library items are published yet — please check back soon.'}
          </div>
        )}

        {items.map((item) => (
          <Link key={item.id} href={`/library/${item.slug}`} style={card}>
            <div style={thumbWrap}>
              {item.thumbnailUrl ? (
                <img src={item.thumbnailUrl} alt={item.titleEn} style={thumbImg} />
              ) : (
                <div style={thumbFallback}>📄</div>
              )}
            </div>
            <div style={cardBody}>
              <div style={cardCategory}>{categoryLabel(item.category)}</div>
              <div style={cardTitle}>{item.titleEn}</div>
              {item.author && <div style={cardAuthor}>{item.author}</div>}
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}

const page = {
  minHeight: '100vh',
  background: 'var(--paper)',
  fontFamily: 'var(--font-body)',
};

const hero = {
  background: 'linear-gradient(135deg, var(--brand-dark), var(--brand))',
  padding: '64px 24px 56px',
  color: 'var(--on-accent)',
};

const heroInner = { maxWidth: 980, margin: '0 auto', textAlign: 'center' };

const eyebrow = {
  fontSize: 15,
  letterSpacing: 2,
  textTransform: 'uppercase',
  color: 'var(--gold)',
  fontWeight: 800,
  marginBottom: 10,
};

const heroTitle = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(26px, 3.4vw, 40px)',
  lineHeight: 1.15,
  margin: '0 0 14px',
  color: 'var(--on-accent)',
  textWrap: 'balance',
};

const heroSub = { fontSize: 15.5, lineHeight: 1.6, color: 'var(--on-accent)', opacity: 0.92, margin: '0 auto', maxWidth: 640 };

const toolbar = {
  maxWidth: 1180,
  margin: '28px auto 0',
  padding: '0 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

const searchWrap = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  maxWidth: 560,
  width: '100%',
};

const searchIconStyle = {
  position: 'absolute',
  left: 16,
  fontSize: 15,
  opacity: 0.55,
  pointerEvents: 'none',
};

const searchInputStyle = {
  width: '100%',
  padding: '13px 44px',
  borderRadius: 999,
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--ink)',
  fontSize: 14.5,
  fontFamily: 'var(--font-body)',
  boxSizing: 'border-box',
};

const searchClearBtn = {
  position: 'absolute',
  right: 14,
  border: 'none',
  background: 'transparent',
  color: 'var(--ink-soft)',
  cursor: 'pointer',
  fontSize: 14,
  lineHeight: 1,
  padding: 4,
};

const searchSpinner = {
  marginLeft: 12,
  fontSize: 12.5,
  color: 'var(--gold-dark)',
  fontWeight: 600,
  whiteSpace: 'nowrap',
};

const chipRow = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap',
};

const chip = {
  padding: '8px 16px',
  borderRadius: 999,
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--ink-soft)',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
};

const chipActive = {
  ...chip,
  background: 'var(--brand)',
  borderColor: 'var(--brand)',
  color: 'var(--on-accent)',
};

const grid = {
  maxWidth: 1180,
  margin: '24px auto 0',
  padding: '0 24px 60px',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
  gap: 22,
};

const card = {
  display: 'block',
  textDecoration: 'none',
  color: 'inherit',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  overflow: 'hidden',
  boxShadow: '0 1px 3px rgba(0,0,0,.06)',
};

const thumbWrap = {
  position: 'relative',
  aspectRatio: '16 / 10',
  background: 'var(--brand-tint)',
};

const thumbImg = { width: '100%', height: '100%', objectFit: 'cover' };

const thumbFallback = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 40,
  color: 'var(--brand)',
};

const cardBody = { padding: '14px 16px 16px' };

const cardCategory = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: 0.4,
  color: 'var(--gold-dark)',
  marginBottom: 4,
};

const cardTitle = {
  fontFamily: 'var(--font-display)',
  fontSize: 16.5,
  fontWeight: 600,
  color: 'var(--ink)',
  lineHeight: 1.35,
};

const cardAuthor = { fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4 };
