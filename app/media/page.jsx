'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MEDIA_CATEGORIES, categoryLabel, formatDuration } from '@/lib/media';
import { useSectionBanner } from '@/components/SectionBannerProvider';

function MediaPageInner() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(() => searchParams.get('category') || 'ALL');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const bannerUrl = useSectionBanner();

  // Keeps the category filter in sync with the URL even when the user
  // is already on /media and clicks a different category link from the
  // header dropdown -- the component doesn't remount in that case, so
  // the useState initializer above alone wouldn't pick up the change.
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory) setCategoryFilter(urlCategory);
  }, [searchParams]);

  const refreshSubscription = () => {
    fetch('/api/media/my-subscription', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success) setSubscription(data.subscription);
      })
      .catch(() => {});
  };

  // Debounce the raw search box input so we don't hit the API on every
  // keystroke — the actual query still runs against the real database.
  useEffect(() => {
    const handle = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, 350);
    return () => clearTimeout(handle);
  }, [searchInput]);

  // Real, server-side query: refetches from /api/media whenever the
  // category or the (debounced) search term changes. This is NOT client-side
  // filtering of hardcoded data — every keystroke (once debounced) issues a
  // fresh database query via the search API.
  useEffect(() => {
    let active = true;
    setItemsLoading(true);

    const query = new URLSearchParams();
    if (categoryFilter !== 'ALL') query.set('category', categoryFilter);
    if (searchTerm) query.set('search', searchTerm);
    const qs = query.toString();

    fetch(`/api/media${qs ? `?${qs}` : ''}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.success) {
          setItems(data.items);
          setError('');
          // Only (re)establish the category chip list from an unfiltered
          // response, so chips don't disappear while the user is searching
          // or browsing a single category.
          if (categoryFilter === 'ALL' && !searchTerm) {
            const set = new Set(data.items.map((i) => i.category));
            setAvailableCategories(MEDIA_CATEGORIES.filter((c) => set.has(c.value)));
          }
        } else {
          setError('Unable to load the Media right now.');
        }
      })
      .catch(() => {
        if (active) setError('Unable to load the Media right now.');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, searchTerm]);

  useEffect(() => {
    async function loadPlansAndSubscription() {
      try {
        const plansRes = await fetch('/api/media/plans');
        const plansData = await plansRes.json();
        if (plansData.success) setPlans(plansData.plans);
        refreshSubscription();
      } catch (err) {
        // Non-fatal — the media grid loads independently of plans.
      }
    }
    loadPlansAndSubscription();

    // Handle return from Paystack checkout: ?reference=...
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference') || params.get('trxref');
    if (reference) {
      fetch('/api/media/subscribe/verify', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            alert(
              data.awaitingApproval
                ? 'Payment verified! An administrator will review and activate your subscription shortly.'
                : 'Subscription activated — enjoy the Media!'
            );
            window.history.replaceState({}, '', '/media');
            refreshSubscription();
          }
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleItems = items;
  const categoriesPresent = availableCategories;

  // Subscribing is no longer a single click straight to the payment
  // gateway -- it now goes to a review page first (price, terms
  // acknowledgment, choice of payment method), matching how Bookstore
  // checkout already works. See app/media/subscribe/[planId]/page.jsx,
  // which is itself a server component that redirects a signed-out
  // visitor to /account?next=... (same pattern as
  // app/account/bookstore and app/account/media), so this page doesn't
  // need its own client-side auth check just to decide where to send
  // a click -- the review page's own server-side check is the real,
  // authoritative gate.
  function goToSubscribe(planId) {
    window.location.href = `/media/subscribe/${planId}`;
  }

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
          <div style={eyebrow}>Ulul Azm Media</div>
          <h1 style={heroTitle}>Sermons, Texts &amp; Lectures — Anytime, Anywhere</h1>
          <p style={heroSub}>
            Khutbahs, classical Mutoon, poems, recorded lectures and educational
            programmes from Ulul Azm — stream freely from your preview
            selection, or subscribe for full access.
          </p>

          {subscription && (
            <div style={subActiveBadge}>
              ✓ Subscribed — access renews {new Date(subscription.expiresAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </section>

      <section id="search" style={toolbar}>
        <div style={searchWrap}>
          <span style={searchIconStyle} aria-hidden="true">🔍</span>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search khutbahs, mutoon, poems, lectures, programmes…"
            style={searchInputStyle}
            aria-label="Search the Media"
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

        <div id="categories" style={chipRow}>
          <button
            onClick={() => setCategoryFilter('ALL')}
            style={categoryFilter === 'ALL' ? chipActive : chip}
          >
            All
          </button>
          {categoriesPresent.map((c) => (
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
        {loading && <div style={{ color: 'var(--ink-soft)', padding: '40px 0' }}>Loading media…</div>}

        {!loading && visibleItems.length === 0 && (
          <div style={{ color: 'var(--ink-soft)', padding: '40px 0' }}>
            {searchTerm
              ? `No media items match "${searchTerm}"${categoryFilter !== 'ALL' ? ' in this category' : ''}. Try a different search term.`
              : 'No media items are published yet — please check back soon.'}
          </div>
        )}

        {visibleItems.map((item) => (
          <Link key={item.id} href={`/media/${item.slug}`} style={card}>
            <div style={thumbWrap}>
              {item.thumbnailUrl ? (
                <img src={item.thumbnailUrl} alt={item.titleEn} style={thumbImg} />
              ) : (
                <div style={thumbFallback}>{item.mediaType === 'AUDIO' ? '🎧' : '🎬'}</div>
              )}
              {item.locked && <div style={lockBadge}>🔒 Subscribers</div>}
              {!item.locked && item.isFreePreview && <div style={freeBadge}>Free</div>}
              <div style={durationBadge}>{formatDuration(item.durationSec)}</div>
            </div>
            <div style={cardBody}>
              <div style={cardCategory}>{categoryLabel(item.category)}</div>
              <div style={cardTitle}>{item.titleEn}</div>
              {item.speaker && <div style={cardSpeaker}>{item.speaker}</div>}
            </div>
          </Link>
        ))}
      </section>

      {plans.length > 0 && (
        <section id="plans" style={plansSection}>
          <h2 style={plansTitle}>Subscribe for Full Access</h2>
          <p style={plansSub}>
            One subscription unlocks every subscriber-only item in the Media.
          </p>
          <div style={plansGrid}>
            {plans.map((plan) => (
              <div key={plan.id} style={planCard}>
                <div style={planName}>{plan.name}</div>
                {plan.descriptionEn && <div style={planDesc}>{plan.descriptionEn}</div>}
                <div style={planPrice}>
                  ${plan.priceUSD.toFixed(2)}
                  <span style={planPeriod}> / {plan.durationDays} days</span>
                </div>
                <button
                  onClick={() => goToSubscribe(plan.id)}
                  disabled={Boolean(subscription)}
                  style={planButton}
                >
                  {subscription ? 'Already Subscribed' : 'Subscribe'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
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

const heroSub = { fontSize: 15.5, lineHeight: 1.6, color: 'var(--on-accent)', opacity: 0.92, margin: '0 auto' };

const subActiveBadge = {
  display: 'inline-block',
  marginTop: 20,
  padding: '8px 18px',
  borderRadius: 999,
  background: 'rgba(255,255,255,0.14)',
  border: '1px solid var(--gold)',
  color: 'var(--gold)',
  fontSize: 13,
  fontWeight: 600,
};

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

const lockBadge = {
  position: 'absolute',
  top: 10,
  left: 10,
  background: 'rgba(5,46,22,0.85)',
  color: 'var(--on-accent)',
  fontSize: 11.5,
  fontWeight: 700,
  padding: '4px 10px',
  borderRadius: 999,
};

const freeBadge = {
  position: 'absolute',
  top: 10,
  left: 10,
  background: 'var(--gold)',
  color: 'var(--on-accent)',
  fontSize: 11.5,
  fontWeight: 700,
  padding: '4px 10px',
  borderRadius: 999,
};

const durationBadge = {
  position: 'absolute',
  bottom: 10,
  right: 10,
  background: 'rgba(0,0,0,0.65)',
  color: '#fff',
  fontSize: 11,
  fontWeight: 600,
  padding: '3px 8px',
  borderRadius: 6,
  fontVariantNumeric: 'tabular-nums',
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

const cardSpeaker = { fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4 };

const plansSection = {
  background: 'var(--brand-tint)',
  padding: '48px 24px 60px',
  borderTop: '1px solid var(--border)',
};

const plansTitle = {
  fontFamily: 'var(--font-display)',
  fontSize: 26,
  textAlign: 'center',
  color: 'var(--ink)',
  margin: '0 0 8px',
};

const plansSub = {
  textAlign: 'center',
  color: 'var(--ink-soft)',
  fontSize: 14,
  maxWidth: 520,
  margin: '0 auto 30px',
};

const plansGrid = {
  maxWidth: 780,
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 20,
};

const planCard = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  padding: 24,
  textAlign: 'center',
  boxShadow: '0 1px 3px rgba(0,0,0,.06)',
};

const planName = { fontWeight: 700, fontSize: 16, color: 'var(--ink)', marginBottom: 6 };
const planDesc = { fontSize: 12.5, color: 'var(--ink-soft)', marginBottom: 14 };
const planPrice = { fontFamily: 'var(--font-display)', fontSize: 30, color: 'var(--brand-dark)', marginBottom: 4 };
const planPeriod = { fontSize: 13, color: 'var(--ink-soft)', fontWeight: 400 };

const planButton = {
  marginTop: 14,
  width: '100%',
  padding: '11px 0',
  borderRadius: 9,
  border: 'none',
  background: 'var(--gold)',
  color: 'var(--on-accent)',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
};


export default function MediaPage() {
  return (
    <Suspense fallback={null}>
      <MediaPageInner />
    </Suspense>
  );
}
