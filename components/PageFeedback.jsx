'use client';

import { useState } from 'react';

// Reusable "was this page helpful?" + social-share widget. Drop
// <PageFeedback pageSlug="it-department" pageTitle="IT Department" />
// near the bottom of any informational page. Feedback posts to
// /api/page-feedback (see that route for what's stored); sharing just
// opens each network's own public share-intent URL in a popup -- no
// tracking, no API keys, nothing page-specific to configure.

const SHARE_TARGETS = [
  {
    name: 'Facebook',
    build: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: 'X',
    build: (url, title) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    name: 'WhatsApp',
    build: (url, title) => `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
  {
    name: 'LinkedIn',
    build: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
];

export default function PageFeedback({ pageSlug, pageTitle }) {
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [choice, setChoice] = useState(null);

  async function submit(response) {
    if (status === 'sending' || status === 'sent') return;
    setChoice(response);
    setStatus('sending');
    try {
      const res = await fetch('/api/page-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageSlug, response }),
      });
      if (!res.ok) throw new Error('request failed');
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  function share(target) {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    const title = pageTitle || document.title || 'Ulul Azm Institute';
    window.open(target.build(url, title), '_blank', 'noopener,noreferrer,width=600,height=520');
  }

  return (
    <div style={wrap}>
      <div style={block}>
        <span style={label}>Help us improve this page -- did you find this content helpful?</span>
        <div style={circleRow}>
          <button
            type="button"
            onClick={() => submit('yes')}
            aria-pressed={choice === 'yes'}
            disabled={status === 'sending' || status === 'sent'}
            style={{
              ...circleBtn,
              ...(choice === 'yes' && status !== 'error' ? circleBtnActiveYes : null),
            }}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => submit('no')}
            aria-pressed={choice === 'no'}
            disabled={status === 'sending' || status === 'sent'}
            style={{
              ...circleBtn,
              ...(choice === 'no' && status !== 'error' ? circleBtnActiveNo : null),
            }}
          >
            No
          </button>
          {status === 'sent' && <span style={note}>Thanks for letting us know.</span>}
          {status === 'error' && <span style={noteErr}>Couldn&apos;t send that -- please try again.</span>}
        </div>
      </div>

      <div style={block}>
        <span style={label}>Share this page</span>
        <div style={shareRow}>
          {SHARE_TARGETS.map((target) => (
            <button key={target.name} type="button" onClick={() => share(target)} style={shareBtn}>
              {target.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const wrap = {
  marginTop: 40,
  paddingTop: 24,
  borderTop: '1px solid var(--border)',
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
};

const block = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
};

const label = {
  fontSize: 13.5,
  fontWeight: 700,
  color: 'var(--ink)',
};

const circleRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  flexWrap: 'wrap',
};

const circleBtn = {
  width: 44,
  height: 44,
  borderRadius: '50%',
  border: '1.5px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--ink-soft)',
  fontWeight: 700,
  fontSize: 12.5,
  cursor: 'pointer',
};

const circleBtnActiveYes = {
  background: 'var(--brand)',
  borderColor: 'var(--brand)',
  color: '#fff',
};

const circleBtnActiveNo = {
  background: 'var(--ink)',
  borderColor: 'var(--ink)',
  color: '#fff',
};

const note = {
  fontSize: 13,
  color: 'var(--ink-soft)',
};

const noteErr = {
  fontSize: 13,
  color: '#b42318',
};

const shareRow = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
};

const shareBtn = {
  padding: '8px 14px',
  borderRadius: 999,
  border: '1px solid var(--border)',
  background: 'var(--paper)',
  color: 'var(--ink)',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
};
