'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '../LanguageContext';

const STATUS_LABELS = {
  PENDING_PAYMENT: 'Pending Payment',
  PAID: 'Paid — Awaiting Submission',
  UNDER_REVIEW: 'Under Review',
  INITIAL_ACCEPTANCE: 'Initial Acceptance',
  PENDING_FINAL_APPROVAL: 'Pending Final Approval',
  APPROVED: 'Approved',
  REJECTED: 'Declined',
};

const STATUS_COLORS = {
  PENDING_PAYMENT: 'var(--warning)',
  PAID: 'var(--info)',
  UNDER_REVIEW: 'var(--gold-dark)',
  INITIAL_ACCEPTANCE: 'var(--gold-dark)',
  PENDING_FINAL_APPROVAL: 'var(--gold-dark)',
  APPROVED: 'var(--success)',
  REJECTED: 'var(--danger)',
};

// Model 16: Initial Acceptance and Pending Final Approval are real
// progress, but neither is final admission -- this must never look
// or read like an offer of admission.
const NOT_FINAL_STATUSES = ['INITIAL_ACCEPTANCE', 'PENDING_FINAL_APPROVAL'];

const DOCUMENT_LABELS = {
  identityDocument: 'Identity Document',
  passportPicture: 'Passport Picture',
  transcripts: 'Academic Transcripts',
  certificate: 'Certificate',
  testimonial: 'Testimonial',
  recommendation: 'Recommendation Letter',
};

function TrackAdmissionContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();

  const [applicationNumber, setApplicationNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [letterDownloading, setLetterDownloading] = useState(false);

  const runLookup = async (refNumber) => {
    const trimmed = (refNumber || '').trim();

    if (!trimmed) {
      setError(t('Please enter your application number.'));
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/admissions/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationNumber: trimmed }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || t('Unable to find that application.'));
        return;
      }

      setResult(data.data);
    } catch (err) {
      console.error('Admission tracking lookup error:', err);
      setError(t('Something went wrong. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setApplicationNumber(ref);
      runLookup(ref);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    runLookup(applicationNumber);
  };

  const downloadLetter = async () => {
    setLetterDownloading(true);
    try {
      const response = await fetch('/api/admissions/track/letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationNumber: result?.applicationNumber || applicationNumber }),
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.error || t('Unable to retrieve your Letter of Admission right now.'));
        return;
      }
      window.open(data.data.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Admission letter download error:', err);
      setError(t('Something went wrong. Please try again.'));
    } finally {
      setLetterDownloading(false);
    }
  };

  return (
    <div style={page}>
      <div style={container}>
        <Link href="/admission" style={backLink}>
          ← {t('Back to Admission')}
        </Link>

        <h1 style={title}>{t('Track Admission Progress')}</h1>
        <p style={subtitle}>
          {t('Enter the application number you received when you submitted your application to check its current status, payment confirmation and document checklist.')}
        </p>

        <form onSubmit={handleSubmit} style={formRow}>
          <input
            type="text"
            value={applicationNumber}
            onChange={(e) => setApplicationNumber(e.target.value)}
            placeholder={t("e.g. 384927160")}
            style={input}
          />
          <button type="submit" style={submitBtn} disabled={loading}>
            {loading ? t('Checking…') : t('Track')}
          </button>
        </form>

        {error && <div style={errorBox}>{error}</div>}

        {result && (
          <div style={resultCard}>
            <div style={resultHeader}>
              <div>
                <span style={eyebrow}>{t('Application')}</span>
                <h2 style={applicantName}>{result.applicantName}</h2>
                <span style={mono}>{result.applicationNumber}</span>
              </div>

              <div
                style={{
                  ...statusPill,
                  color: STATUS_COLORS[result.status] || 'var(--ink)',
                  borderColor: STATUS_COLORS[result.status] || 'var(--border)',
                }}
              >
                {t(STATUS_LABELS[result.status]) || result.status}
              </div>
            </div>

            {NOT_FINAL_STATUSES.includes(result.status) && (
              <div style={notFinalBanner}>
                {t('This is progress, but it is not yet a final admission decision. We will let you know as soon as a final decision is made.')}
              </div>
            )}

            {result.status === 'APPROVED' && result.congratulationsMessage && (
              <div style={approvedBanner}>
                <p style={{ margin: 0 }}>{result.congratulationsMessage}</p>
                {result.admissionLetterAvailable && (
                  <button type="button" style={letterDownloadBtn} disabled={letterDownloading} onClick={downloadLetter}>
                    {letterDownloading ? t('Preparing…') : t('Download Your Letter of Admission')}
                  </button>
                )}
              </div>
            )}

            {result.status === 'REJECTED' && (
              <div style={declinedBanner}>
                <p style={{ margin: 0 }}>
                  {t('We are unable to offer you admission at this time. We appreciate your interest and wish you every success.')}
                </p>
                {result.declineReason && (
                  <p style={{ margin: '8px 0 0', fontWeight: 700 }}>{result.declineReason}</p>
                )}
              </div>
            )}

            {Array.isArray(result.notes) && result.notes.length > 0 && (
              <>
                <div style={sectionDivider} />
                <h3 style={sectionTitle}>{t('Updates from Admissions & Registration')}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {result.notes.map((n, i) => (
                    <div key={i} style={noteCard}>
                      <p style={{ margin: 0 }}>{n.note}</p>
                      <span style={noteDate}>
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div style={grid}>
              <div style={field}>
                <span style={fieldLabel}>{t('Programme')}</span>
                <strong>{result.programme || '—'}</strong>
              </div>
              <div style={field}>
                <span style={fieldLabel}>{t('Level')}</span>
                <strong>{result.programmeLevel || '—'}</strong>
              </div>
              <div style={field}>
                <span style={fieldLabel}>{t('Study Session')}</span>
                <strong>{result.studySession || '—'}</strong>
              </div>
              <div style={field}>
                <span style={fieldLabel}>{t('Submitted')}</span>
                <strong>
                  {result.createdAt
                    ? new Date(result.createdAt).toLocaleDateString()
                    : '—'}
                </strong>
              </div>
            </div>

            <div style={sectionDivider} />

            <h3 style={sectionTitle}>{t('Payment')}</h3>
            <div style={grid}>
              <div style={field}>
                <span style={fieldLabel}>{t('Payment Status')}</span>
                <strong
                  style={{
                    color:
                      result.paymentStatus === 'PAID' ||
                      result.paymentStatus === 'SUCCESS'
                        ? 'var(--brand-light)'
                        : 'var(--warning)',
                  }}
                >
                  {result.paymentStatus}
                </strong>
              </div>
              <div style={field}>
                <span style={fieldLabel}>{t('Gateway')}</span>
                <strong>{result.paymentGateway || '—'}</strong>
              </div>
              <div style={field}>
                <span style={fieldLabel}>{t('Method')}</span>
                <strong>{result.paymentMethod || '—'}</strong>
              </div>
              <div style={field}>
                <span style={fieldLabel}>{t('Paid On')}</span>
                <strong>
                  {result.paidAt
                    ? new Date(result.paidAt).toLocaleDateString()
                    : t('Not yet paid')}
                </strong>
              </div>
            </div>

            <div style={sectionDivider} />

            <h3 style={sectionTitle}>{t('Documents Received')}</h3>
            <div style={docGrid}>
              {Object.entries(DOCUMENT_LABELS).map(([key, label]) => (
                <div key={key} style={docItem}>
                  <span
                    style={{
                      ...docCheck,
                      color: result.documents?.[key]
                        ? 'var(--brand-light)'
                        : 'var(--ink-soft)',
                    }}
                  >
                    {result.documents?.[key] ? '✓' : '○'}
                  </span>
                  {t(label)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackAdmissionPage() {
  return (
    <Suspense fallback={<div style={page} />}>
      <TrackAdmissionContent />
    </Suspense>
  );
}

const page = {
  minHeight: '100vh',
  background: 'var(--paper)',
  fontFamily: 'var(--font-body)',
};

const container = { maxWidth: 720, margin: '0 auto', padding: '32px 24px 60px' };

const backLink = {
  display: 'inline-block',
  marginBottom: 20,
  color: 'var(--brand)',
  fontSize: 13.5,
  textDecoration: 'none',
};

const title = {
  fontFamily: 'var(--font-display)',
  fontSize: 30,
  margin: '0 0 8px',
  color: 'var(--ink)',
};

const subtitle = {
  fontSize: 14.5,
  color: 'var(--ink-soft)',
  lineHeight: 1.6,
  marginBottom: 26,
  maxWidth: 560,
};

const formRow = { display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' };

const input = {
  flex: '1 1 260px',
  padding: '12px 14px',
  borderRadius: 9,
  border: '1px solid var(--border)',
  fontSize: 14.5,
  background: 'var(--surface)',
  color: 'var(--ink)',
};

const submitBtn = {
  padding: '12px 26px',
  borderRadius: 9,
  border: 'none',
  background: 'var(--brand)',
  color: 'var(--on-accent)',
  fontWeight: 700,
  fontSize: 14.5,
  cursor: 'pointer',
};

const errorBox = {
  padding: '12px 16px',
  borderRadius: 9,
  background: 'var(--danger-tint)',
  color: 'var(--danger)',
  fontSize: 13.5,
  marginBottom: 20,
};

const resultCard = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  padding: 26,
  marginTop: 6,
};

const resultHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 16,
  flexWrap: 'wrap',
  marginBottom: 18,
};

const eyebrow = {
  fontSize: 11.5,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: 0.4,
  color: 'var(--gold-dark)',
};

const applicantName = {
  fontFamily: 'var(--font-display)',
  fontSize: 22,
  margin: '4px 0 4px',
  color: 'var(--ink)',
};

const mono = { fontSize: 12.5, color: 'var(--ink-soft)', fontFamily: 'var(--font-mono)' };

const statusPill = {
  padding: '8px 16px',
  borderRadius: 999,
  border: '1.5px solid',
  fontWeight: 700,
  fontSize: 13,
  whiteSpace: 'nowrap',
};

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: 16,
};

const field = { display: 'flex', flexDirection: 'column', gap: 3 };

const fieldLabel = {
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: 0.3,
  color: 'var(--ink-soft)',
  fontWeight: 700,
};

const sectionDivider = {
  height: 1,
  background: 'var(--border)',
  margin: '22px 0',
};

const sectionTitle = {
  fontSize: 14,
  fontWeight: 700,
  color: 'var(--ink)',
  margin: '0 0 14px',
};

const docGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 10,
};

const docItem = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 13.5,
  color: 'var(--ink)',
};

const docCheck = { fontSize: 16, fontWeight: 700 };

const notFinalBanner = {
  padding: '10px 14px',
  borderRadius: 9,
  background: 'var(--warning-tint, rgba(200,150,20,0.12))',
  color: 'var(--ink)',
  fontSize: 13,
  marginBottom: 18,
};

const letterDownloadBtn = {
  marginTop: 12,
  padding: '10px 20px',
  borderRadius: 9,
  border: 'none',
  background: 'var(--brand)',
  color: 'var(--on-accent)',
  fontWeight: 700,
  fontSize: 13.5,
  cursor: 'pointer',
};

const approvedBanner = {
  padding: '14px 16px',
  borderRadius: 9,
  background: 'var(--success-tint, rgba(30,140,80,0.1))',
  color: 'var(--ink)',
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 18,
};

const declinedBanner = {
  padding: '14px 16px',
  borderRadius: 9,
  background: 'var(--danger-tint)',
  color: 'var(--ink)',
  fontSize: 13.5,
  marginBottom: 18,
};

const noteCard = {
  padding: '10px 14px',
  borderRadius: 9,
  border: '1px solid var(--border)',
  background: 'var(--paper)',
  fontSize: 13.5,
};

const noteDate = {
  display: 'block',
  marginTop: 4,
  fontSize: 11,
  color: 'var(--ink-soft)',
};
