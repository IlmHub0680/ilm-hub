'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

const CATEGORY_LABELS = {
  ANNOUNCEMENT: 'Announcement',
  ACADEMIC: 'Academic',
  ADMISSIONS: 'Admissions',
  COMMUNITY: 'Community',
  ACHIEVEMENT: 'Achievement',
  GENERAL: 'General',
};

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatEventDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatNewsDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function matches(query, ...fields) {
  if (!query) return true;
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return fields.some((field) => (field || '').toLowerCase().includes(needle));
}

export default function UpdatesPage() {
  const [events, setEvents] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [shareStatus, setShareStatus] = useState('idle'); // idle | copied | unavailable

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      fetch('/api/events').then((res) => res.json()),
      fetch('/api/news').then((res) => res.json()),
    ]).then(([eventsResult, newsResult]) => {
      if (cancelled) return;

      const eventsOk = eventsResult.status === 'fulfilled' && eventsResult.value?.success;
      const newsOk = newsResult.status === 'fulfilled' && newsResult.value?.success;

      if (eventsOk) setEvents(eventsResult.value.data || []);
      if (newsOk) setArticles(newsResult.value.data || []);

      if (!eventsOk && !newsOk) {
        setError('Unable to load events and news right now -- please try again shortly.');
      }

      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const now = Date.now();

  const upcomingEvents = useMemo(
    () => events.filter((event) => new Date(event.eventDate).getTime() >= now),
    [events, now]
  );

  const pastEvents = useMemo(
    () =>
      events
        .filter((event) => new Date(event.eventDate).getTime() < now)
        .slice()
        .reverse(),
    [events, now]
  );

  const filteredUpcoming = useMemo(
    () => upcomingEvents.filter((event) => matches(query, event.titleEn, event.descriptionEn, event.location)),
    [upcomingEvents, query]
  );

  const filteredPast = useMemo(
    () => pastEvents.filter((event) => matches(query, event.titleEn, event.descriptionEn, event.location)),
    [pastEvents, query]
  );

  const filteredNews = useMemo(
    () =>
      articles.filter((article) =>
        matches(query, article.titleEn, stripHtml(article.bodyEnHtml), CATEGORY_LABELS[article.category])
      ),
    [articles, query]
  );

  const nothingPublishedAtAll = !loading && !error && events.length === 0 && articles.length === 0;
  const searchHasNoResults =
    !loading &&
    !error &&
    !nothingPublishedAtAll &&
    query.trim() !== '' &&
    filteredUpcoming.length === 0 &&
    filteredPast.length === 0 &&
    filteredNews.length === 0;

  async function handleShare() {
    const shareData = {
      title: 'Events & News | Ulul Azm Institute',
      text: 'See the latest events and news from Ulul Azm Institute.',
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        /* the visitor closed the share sheet without picking anything --
           not an error worth surfacing */
      }
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard && shareData.url) {
      try {
        await navigator.clipboard.writeText(shareData.url);
        setShareStatus('copied');
        setTimeout(() => setShareStatus('idle'), 2500);
      } catch (err) {
        setShareStatus('unavailable');
        setTimeout(() => setShareStatus('idle'), 2500);
      }
    } else {
      setShareStatus('unavailable');
      setTimeout(() => setShareStatus('idle'), 2500);
    }
  }

  return (
    <>
      <SiteHeader />
      <main style={page}>
        <section style={hero}>
          <div style={heroInner}>
            <div style={eyebrow}>Ulul Azm</div>
            <h1 style={heroTitle}>Events &amp; News</h1>
            <p style={heroSub}>
              Everything happening at the Institute, gathered in one elegant page --
              lectures and gatherings alongside the latest stories and announcements.
            </p>

            <div style={heroControls}>
              <div style={searchWrap}>
                <span aria-hidden="true" style={searchIcon}>&#128269;</span>
                <label htmlFor="updates-search" style={srOnlyLabel}>Search events and news</label>
                <input
                  id="updates-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search events and news…"
                  style={searchInput}
                />
              </div>

              <div style={shareWrap}>
                <button type="button" onClick={handleShare} style={shareButton}>
                  <span aria-hidden="true">&#128279;</span> Share this page
                </button>
                {shareStatus === 'copied' && <span style={shareHint}>Link copied!</span>}
                {shareStatus === 'unavailable' && <span style={shareHint}>Couldn&rsquo;t copy the link -- copy it from your address bar.</span>}
              </div>
            </div>
          </div>
        </section>

        <section style={container}>
          {loading && <div style={emptyState}>Loading events and news…</div>}
          {error && <div style={{ ...emptyState, color: 'var(--danger)' }}>{error}</div>}

          {nothingPublishedAtAll && (
            <div style={emptyState}>No events or news are published yet -- please check back soon.</div>
          )}

          {searchHasNoResults && (
            <div style={emptyState}>
              No events or news match &ldquo;{query.trim()}&rdquo;. Try a different search.
            </div>
          )}

          {!loading && !error && filteredUpcoming.length > 0 && (
            <>
              <h2 style={sectionHeading}>Upcoming Events</h2>
              <div style={grid}>
                {filteredUpcoming.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </>
          )}

          {!loading && !error && filteredNews.length > 0 && (
            <>
              <h2 style={{ ...sectionHeading, marginTop: filteredUpcoming.length > 0 ? 52 : 0 }}>Latest News</h2>
              <div style={grid}>
                {filteredNews.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            </>
          )}

          {!loading && !error && filteredPast.length > 0 && (
            <>
              <h2 style={{ ...sectionHeading, marginTop: (filteredUpcoming.length > 0 || filteredNews.length > 0) ? 52 : 0 }}>
                Past Events
              </h2>
              <div style={grid}>
                {filteredPast.map((event) => (
                  <EventCard key={event.id} event={event} past />
                ))}
              </div>
            </>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function EventCard({ event, past }) {
  return (
    <div id={`event-${event.id}`} style={{ ...card, ...(past ? { opacity: 0.75 } : {}), scrollMarginTop: 120 }}>
      {event.thumbnailUrl && (
        <div style={{ ...cardImage, backgroundImage: `url(${event.thumbnailUrl})` }} />
      )}
      <div style={cardEyebrow}>
        {formatEventDate(event.eventDate)}
        {event.eventTime ? ` · ${event.eventTime}` : ''}
      </div>
      <div style={cardTitle}>{event.titleEn}</div>
      {(event.location || event.onlineLink) && (
        <div style={cardMeta}>
          {event.location}
          {event.location && event.onlineLink ? ' · ' : ''}
          {event.onlineLink && 'Online'}
        </div>
      )}
      <p style={cardDesc}>{event.descriptionEn}</p>
      {!past && event.detailsLink && (
        <a href={event.detailsLink} target="_blank" rel="noopener noreferrer" style={cardCta}>
          Details &amp; Registration →
        </a>
      )}
    </div>
  );
}

function NewsCard({ article }) {
  return (
    <Link href={`/news/${article.id}`} style={card}>
      {article.featuredImageUrl && (
        <div style={{ ...cardImage, backgroundImage: `url(${article.featuredImageUrl})` }} />
      )}
      <div style={cardEyebrow}>
        {CATEGORY_LABELS[article.category] || article.category}
        {article.publishedAt ? ` · ${formatNewsDate(article.publishedAt)}` : ''}
      </div>
      <div style={cardTitle}>{article.titleEn}</div>
      <p style={cardDesc}>{stripHtml(article.bodyEnHtml)}</p>
      <span style={cardCta}>Read More →</span>
    </Link>
  );
}

const page = { minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--font-body)' };

const hero = {
  background: 'linear-gradient(135deg, var(--brand-dark), var(--brand))',
  padding: '64px 24px 40px',
  color: 'var(--on-accent)',
};

const heroInner = { maxWidth: 780, margin: '0 auto', textAlign: 'center' };

const eyebrow = {
  fontSize: 12.5,
  letterSpacing: 2,
  textTransform: 'uppercase',
  color: 'var(--gold)',
  fontWeight: 700,
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

const heroSub = {
  fontSize: 15.5,
  lineHeight: 1.6,
  color: 'var(--on-accent)',
  opacity: 0.92,
  margin: '0 auto',
  maxWidth: 620,
};

const heroControls = {
  marginTop: 28,
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 14,
};

const searchWrap = {
  position: 'relative',
  flex: '1 1 320px',
  maxWidth: 420,
};

const searchIcon = {
  position: 'absolute',
  left: 16,
  top: '50%',
  transform: 'translateY(-50%)',
  fontSize: 15,
  opacity: 0.7,
};

const srOnlyLabel = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
};

const searchInput = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 16px 12px 42px',
  borderRadius: 999,
  border: '1px solid rgba(255,255,255,.35)',
  background: 'rgba(255,255,255,.12)',
  color: 'var(--on-accent)',
  fontSize: 14.5,
  outline: 'none',
};

const shareWrap = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 6,
};

const shareButton = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '11px 20px',
  borderRadius: 999,
  border: '1px solid var(--gold)',
  background: 'rgba(197,157,95,.14)',
  color: 'var(--gold)',
  fontWeight: 700,
  fontSize: 13.5,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const shareHint = {
  fontSize: 12,
  color: 'var(--on-accent)',
  opacity: 0.85,
};

const container = { maxWidth: 1180, margin: '32px auto 0', padding: '0 24px 60px' };

const sectionHeading = {
  fontFamily: 'var(--font-display)',
  fontSize: 22,
  color: 'var(--ink)',
  margin: '0 0 18px',
};

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: 22,
};

const emptyState = { color: 'var(--ink-soft)', padding: '40px 0', textAlign: 'center' };

const card = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  textDecoration: 'none',
  color: 'inherit',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  padding: 22,
  boxShadow: '0 1px 3px rgba(0,0,0,.06)',
};

const cardImage = {
  height: 140,
  borderRadius: 10,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  marginBottom: 4,
};

const cardEyebrow = {
  fontSize: 11.5,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: 0.4,
  color: 'var(--gold-dark)',
};

const cardTitle = {
  fontFamily: 'var(--font-display)',
  fontSize: 18.5,
  fontWeight: 600,
  color: 'var(--ink)',
  lineHeight: 1.3,
};

const cardMeta = { fontSize: 12.5, color: 'var(--ink-soft)' };

const cardDesc = {
  fontSize: 13.5,
  lineHeight: 1.55,
  color: 'var(--ink-soft)',
  margin: 0,
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

const cardCta = {
  marginTop: 'auto',
  paddingTop: 8,
  color: 'var(--brand)',
  fontWeight: 700,
  fontSize: 13,
  textDecoration: 'none',
};
