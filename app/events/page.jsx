'use client';

import { useEffect, useState } from 'react';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEvents(data.data);
        } else {
          setError('Unable to load events right now.');
        }
      })
      .catch(() => setError('Unable to load events right now.'))
      .finally(() => setLoading(false));
  }, []);

  const now = Date.now();
  const upcoming = events.filter((e) => new Date(e.eventDate).getTime() >= now);
  const past = events.filter((e) => new Date(e.eventDate).getTime() < now).reverse();

  return (
    <>
      <SiteHeader />
      <main style={page}>
        <section style={hero}>
          <div style={heroInner}>
            <div style={eyebrow}>Ulul Azm</div>
            <h1 style={heroTitle}>Events</h1>
            <p style={heroSub}>
              Lectures, orientations, and gatherings hosted by the Institute —
              in person and online.
            </p>
          </div>
        </section>

        <section style={container}>
          {loading && <div style={emptyState}>Loading events…</div>}
          {error && <div style={{ ...emptyState, color: 'var(--danger)' }}>{error}</div>}

          {!loading && !error && events.length === 0 && (
            <div style={emptyState}>No events are published yet — please check back soon.</div>
          )}

          {!loading && !error && upcoming.length > 0 && (
            <>
              <h2 style={sectionHeading}>Upcoming</h2>
              <div style={grid}>
                {upcoming.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </>
          )}

          {!loading && !error && past.length > 0 && (
            <>
              <h2 style={{ ...sectionHeading, marginTop: 48 }}>Past Events</h2>
              <div style={grid}>
                {past.map((event) => (
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
    <div style={{ ...card, opacity: past ? 0.75 : 1 }}>
      {event.thumbnailUrl && (
        <div style={{ ...cardImage, backgroundImage: `url(${event.thumbnailUrl})` }} />
      )}
      <div style={cardEyebrow}>{formatDate(event.eventDate)}{event.eventTime ? ` · ${event.eventTime}` : ''}</div>
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

const page = { minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--font-body)' };

const hero = {
  background: 'linear-gradient(135deg, var(--brand-dark), var(--brand))',
  padding: '64px 24px 56px',
  color: 'var(--on-accent)',
};

const heroInner = { maxWidth: 980, margin: '0 auto', textAlign: 'center' };

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

const heroSub = { fontSize: 15.5, lineHeight: 1.6, color: 'var(--on-accent)', opacity: 0.92, margin: '0 auto', maxWidth: 640 };

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

const emptyState = { color: 'var(--ink-soft)', padding: '40px 0' };

const card = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
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
