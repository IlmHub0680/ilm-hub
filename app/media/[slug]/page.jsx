'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { categoryLabel, formatDuration } from '@/lib/media';

export default function MediaDetailPage() {
  const params = useParams();
  const slug = params?.slug;

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/media/${slug}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) throw new Error(data.error || 'Media item not found.');
        setItem(data.item);
      })
      .catch((err) => setError(err.message || 'Media item not found.'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <main style={page}><div style={{ padding: 60, textAlign: 'center', color: 'var(--ink-soft)' }}>Loading…</div></main>;
  }

  if (error || !item) {
    return (
      <main style={page}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--danger)', marginBottom: 16 }}>{error || 'Media item not found.'}</p>
          <Link href="/media" style={{ color: 'var(--brand)' }}>← Back to Media</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={page}>
      <div style={container}>
        <Link href="/media" style={backLink}>← Back to Media</Link>

        <div style={playerWrap}>
          {item.locked ? (
            <div style={lockedPanel}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🔒</div>
              <h2 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)' }}>Subscribers Only</h2>
              <p style={{ color: 'var(--ink-soft)', marginBottom: 18 }}>
                Subscribe to the Media to watch/listen to this item.
              </p>
              <Link href="/media#plans" style={subscribeCta}>
                See Subscription Plans
              </Link>
            </div>
          ) : item.mediaType === 'AUDIO' ? (
            <audio controls style={{ width: '100%' }} src={item.mediaUrl} />
          ) : (
            <video controls style={{ width: '100%', borderRadius: 12, background: '#000' }} src={item.mediaUrl} />
          )}
        </div>

        <div style={meta}>
          <div style={cardCategory}>{categoryLabel(item.category)}</div>
          <h1 style={title}>{item.titleEn}</h1>
          <div style={titleAr} dir="rtl">{item.titleAr}</div>
          <div style={subMeta}>
            {item.speaker && <span>{item.speaker}</span>}
            {item.speaker && <span>·</span>}
            <span>{formatDuration(item.durationSec)}</span>
          </div>
          <p style={description}>{item.descriptionEn}</p>
          <p style={descriptionAr} dir="rtl">{item.descriptionAr}</p>
        </div>
      </div>
    </main>
  );
}

const page = { minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--font-body)' };
const container = { maxWidth: 820, margin: '0 auto', padding: '32px 24px 60px' };
const backLink = { display: 'inline-block', marginBottom: 20, color: 'var(--brand)', fontSize: 13.5, textDecoration: 'none' };

const playerWrap = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  overflow: 'hidden',
  marginBottom: 24,
};

const lockedPanel = {
  padding: '60px 24px',
  textAlign: 'center',
  background: 'var(--brand-tint)',
};

const subscribeCta = {
  display: 'inline-block',
  padding: '11px 24px',
  borderRadius: 9,
  background: 'var(--gold)',
  color: 'var(--on-accent)',
  fontWeight: 700,
  fontSize: 14,
  textDecoration: 'none',
};

const meta = {};
const cardCategory = { fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--gold-dark)', marginBottom: 6 };
const title = { fontFamily: 'var(--font-display)', fontSize: 28, margin: '0 0 4px', color: 'var(--ink)' };
// Arabic counterpart of the title above — give it the same "display"
// treatment as the Latin title (Amiri, not the plain body Arabic
// face), since [dir="rtl"] alone only applies the body Arabic font.
const titleAr = { fontFamily: 'var(--font-arabic-display)', fontSize: 20, color: 'var(--ink-soft)', marginBottom: 10 };
const subMeta = { display: 'flex', gap: 8, fontSize: 13, color: 'var(--ink-soft)', marginBottom: 18 };
const description = { fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink)', marginBottom: 10 };
const descriptionAr = { fontSize: 14.5, lineHeight: 1.9, color: 'var(--ink-soft)' };
