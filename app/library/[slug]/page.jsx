'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { categoryLabel } from '@/lib/library';

export default function LibraryDetailPage() {
  const params = useParams();
  const slug = params?.slug;

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/library-resources/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) throw new Error(data.error || 'Library item not found.');
        setItem(data.item);
      })
      .catch((err) => setError(err.message || 'Library item not found.'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <main style={page}><div style={{ padding: 60, textAlign: 'center', color: 'var(--ink-soft)' }}>Loading…</div></main>;
  }

  if (error || !item) {
    return (
      <main style={page}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--danger)', marginBottom: 16 }}>{error || 'Library item not found.'}</p>
          <Link href="/library" style={{ color: 'var(--brand)' }}>← Back to Library</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={page}>
      <div style={container}>
        <Link href="/library" style={backLink}>← Back to Library</Link>

        {item.thumbnailUrl && (
          <div style={thumbWrap}>
            <img src={item.thumbnailUrl} alt={item.titleEn} style={thumbImg} />
          </div>
        )}

        <div style={meta}>
          <div style={cardCategory}>{categoryLabel(item.category)}</div>
          <h1 style={title}>{item.titleEn}</h1>
          <div style={titleAr} dir="rtl">{item.titleAr}</div>
          {item.author && <div style={subMeta}>{item.author}</div>}
          <p style={description}>{item.descriptionEn}</p>
          <p style={descriptionAr} dir="rtl">{item.descriptionAr}</p>

          <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" style={openButton}>
            Open / Download →
          </a>
        </div>
      </div>
    </main>
  );
}

const page = { minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--font-body)' };
const container = { maxWidth: 820, margin: '0 auto', padding: '32px 24px 60px' };
const backLink = { display: 'inline-block', marginBottom: 20, color: 'var(--brand)', fontSize: 13.5, textDecoration: 'none' };

const thumbWrap = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  overflow: 'hidden',
  marginBottom: 24,
  aspectRatio: '16 / 9',
};

const thumbImg = { width: '100%', height: '100%', objectFit: 'cover' };

const meta = {};
const cardCategory = { fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--gold-dark)', marginBottom: 6 };
const title = { fontFamily: 'var(--font-display)', fontSize: 28, margin: '0 0 4px', color: 'var(--ink)' };
const titleAr = { fontFamily: 'var(--font-arabic-display)', fontSize: 20, color: 'var(--ink-soft)', marginBottom: 10 };
const subMeta = { fontSize: 13, color: 'var(--ink-soft)', marginBottom: 18 };
const description = { fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink)', marginBottom: 10 };
const descriptionAr = { fontSize: 14.5, lineHeight: 1.9, color: 'var(--ink-soft)', marginBottom: 20 };

const openButton = {
  display: 'inline-block',
  padding: '13px 24px',
  borderRadius: 9,
  background: 'var(--gold)',
  color: 'var(--on-accent)',
  fontWeight: 700,
  fontSize: 14,
  textDecoration: 'none',
};
