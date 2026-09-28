'use client';

import { useState } from 'react';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function VerifyPage() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | found | notfound | error
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;

    setStatus('loading');
    setResult(null);
    setErrorMessage('');

    try {
      const res = await fetch(`/api/verify?code=${encodeURIComponent(trimmed)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus('error');
        setErrorMessage(data.error || 'Unable to verify this code right now.');
        return;
      }

      if (data.found) {
        setResult(data.result);
        setStatus('found');
      } else {
        setStatus('notfound');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMessage('Unable to verify this code right now. Please try again shortly.');
    }
  }

  return (
    <>
      <SiteHeader />
      <main style={page}>
        <section style={hero}>
          <div style={heroInner}>
            <div style={eyebrow}>DOCUMENT VERIFICATION</div>
            <h1 style={heroTitle}>Verify a Certificate or Transcript</h1>
            <p style={heroSub}>
              Enter the verification code printed on an official Ulul Azm Institute transcript, graduation
              certificate, or statement of completion to confirm it is genuine.
            </p>
          </div>
        </section>

        <div style={container}>
          <form onSubmit={handleSubmit} style={formCard}>
            <label style={{ display: 'block', marginBottom: 10 }}>
              <span style={labelStyle}>Verification Code</span>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="ULU-XXXXX-XXXXX"
                style={inputStyle}
                autoCapitalize="characters"
                required
              />
            </label>
            <button type="submit" disabled={status === 'loading'} style={submitButton}>
              {status === 'loading' ? 'Checking...' : 'Verify Document'}
            </button>
          </form>

          {status === 'found' && result && (
            <div style={{ ...resultCard, borderColor: 'var(--brand)', background: 'var(--success-tint, var(--brand-tint))' }}>
              <div style={resultBadgeGood}>✓ Genuine Document</div>
              <dl style={resultList}>
                <div style={resultRow}>
                  <dt style={resultLabel}>Document Type</dt>
                  <dd style={resultValue}>{result.documentType}</dd>
                </div>
                <div style={resultRow}>
                  <dt style={resultLabel}>Holder Name</dt>
                  <dd style={resultValue}>{result.holderName}</dd>
                </div>
                {result.programme && (
                  <div style={resultRow}>
                    <dt style={resultLabel}>Programme</dt>
                    <dd style={resultValue}>{result.programme}{result.level ? ` (${result.level})` : ''}</dd>
                  </div>
                )}
                <div style={resultRow}>
                  <dt style={resultLabel}>Issued On</dt>
                  <dd style={resultValue}>{result.issuedOn}</dd>
                </div>
              </dl>
              <p style={resultFootnote}>
                This document was issued by Ulul Azm Institute and is on record with the Office of the Registrar.
              </p>
            </div>
          )}

          {status === 'notfound' && (
            <div style={{ ...resultCard, borderColor: 'var(--danger)', background: 'var(--danger-tint)' }}>
              <div style={resultBadgeBad}>✕ Not Found</div>
              <p style={{ margin: 0, color: 'var(--ink)', fontSize: 14 }}>
                No document matches this verification code. Double-check the code for typos, or contact the
                Office of the Registrar if you believe this is an error.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div style={{ ...resultCard, borderColor: 'var(--danger)', background: 'var(--danger-tint)' }}>
              <p style={{ margin: 0, color: 'var(--danger)', fontSize: 14 }}>{errorMessage}</p>
            </div>
          )}

          <section style={ctaSection}>
            <h2 style={ctaTitle}>Can&apos;t find your verification code?</h2>
            <p style={ctaSub}>
              Verification codes are printed on transcripts and graduation documents issued after this feature
              launched. For an older document, or any other question, please contact the Office of the Registrar.
            </p>
            <a href="/contact" style={ctaButton}>Contact the Registrar →</a>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
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

const container = { maxWidth: 640, margin: '0 auto', padding: '40px 24px 60px', display: 'flex', flexDirection: 'column', gap: 24 };

const formCard = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  padding: 24,
};

const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 13.5, color: 'var(--ink)' };

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '13px 14px',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 15,
  letterSpacing: 1,
  color: 'var(--ink)',
  backgroundColor: 'var(--paper)',
  textTransform: 'uppercase',
};

const submitButton = {
  width: '100%',
  marginTop: 14,
  padding: '13px 24px',
  borderRadius: 9,
  border: 'none',
  background: 'var(--gold)',
  color: 'var(--on-accent)',
  fontWeight: 700,
  fontSize: 14.5,
  cursor: 'pointer',
};

const resultCard = {
  border: '1px solid var(--border)',
  borderRadius: 14,
  padding: 22,
};

const resultBadgeGood = { fontWeight: 800, fontSize: 15, color: 'var(--brand)', marginBottom: 14 };
const resultBadgeBad = { fontWeight: 800, fontSize: 15, color: 'var(--danger)', marginBottom: 10 };

const resultList = { margin: 0, display: 'flex', flexDirection: 'column', gap: 10 };
const resultRow = { display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: 8 };
const resultLabel = { margin: 0, fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 };
const resultValue = { margin: 0, fontSize: 14, color: 'var(--ink)', fontWeight: 700, textAlign: 'right' };
const resultFootnote = { marginTop: 16, marginBottom: 0, fontSize: 12.5, color: 'var(--ink-soft)' };

const ctaSection = {
  background: 'var(--brand-tint)',
  borderRadius: 14,
  padding: '28px 22px',
  textAlign: 'center',
};

const ctaTitle = { fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)', margin: '0 0 8px' };
const ctaSub = { color: 'var(--ink-soft)', fontSize: 13.5, maxWidth: 460, margin: '0 auto 16px' };

const ctaButton = {
  display: 'inline-block',
  padding: '11px 22px',
  borderRadius: 9,
  background: 'var(--gold)',
  color: 'var(--on-accent)',
  fontWeight: 700,
  fontSize: 13.5,
  textDecoration: 'none',
};
