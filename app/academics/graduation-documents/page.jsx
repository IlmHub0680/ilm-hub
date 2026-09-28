'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAcademics } from '../context';
import { getGraduationStatusMeta } from '@/lib/graduation';
import * as s from '../styles';

// The official documents the Registrar issues once graduation is
// COMPLETED. Generation is real (lib/graduationDocuments.js — hand-written
// PDFs backed by the student's actual final grades), this page is just
// the presentation layer, shared with nothing else so there is exactly
// one place a student goes to get these.
const QUALIFICATION_TITLE_BY_LEVEL = {
  DIPLOMA: 'Diploma',
  CERTIFICATE: 'Certificate of Completion',
  UNDERGRADUATE: 'Certificate of Graduation',
  POSTGRADUATE: 'Certificate of Graduation',
  MASTERS: 'Certificate of Graduation',
  DOCTORATE: 'Certificate of Graduation',
  SHORT_COURSE: 'Certificate of Completion',
};

function graduationDocumentTypes(programLevel) {
  const qualificationTitle = QUALIFICATION_TITLE_BY_LEVEL[programLevel] || 'Certificate of Graduation';

  return [
    {
      key: 'CERTIFICATE',
      label: qualificationTitle,
      description: `The institution's official ${qualificationTitle.toLowerCase()} confirming your graduation.`,
    },
    {
      key: 'STATEMENT_OF_COMPLETION',
      label: 'Statement of Completion',
      description: "A formal letter confirming you've completed all requirements of your programme.",
    },
  ];
}

const TONE_BADGE_CLASS = {
  good: 'ih-b-success',
  warning: 'ih-b-warning',
  danger: 'ih-b-danger',
  neutral: 'ih-b-neutral',
};

function DocumentRow({ label, description, available, unavailableNote, busy, onDownload, actionHref, actionLabel }) {
  return (
    <div
      className="ih-card"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
        padding: '14px 16px',
        marginBottom: 0,
      }}
    >
      <div style={{ maxWidth: 440 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <strong style={{ fontSize: 14, color: 'var(--ink)' }}>{label}</strong>
          <span className={`ih-badge ${available ? TONE_BADGE_CLASS.good : TONE_BADGE_CLASS.neutral}`}>
            {available ? 'Available' : 'Not Yet Available'}
          </span>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4 }}>
          {available ? description : unavailableNote || description}
        </div>
      </div>

      {available && onDownload && (
        <button type="button" onClick={onDownload} disabled={busy} className="ih-btn ih-btn-primary">
          {busy ? 'Preparing…' : 'Download PDF'}
        </button>
      )}

      {!available && actionHref && (
        <Link href={actionHref} className="ih-btn ih-btn-secondary">
          {actionLabel || 'Request'}
        </Link>
      )}
    </div>
  );
}

export default function GraduationDocumentsPage() {
  const { data, loading: academicsLoading, error: academicsError } = useAcademics();

  const [application, setApplication] = useState(null);
  const [appLoading, setAppLoading] = useState(true);
  const [appError, setAppError] = useState('');
  const [downloadingDoc, setDownloadingDoc] = useState('');

  useEffect(() => {
    fetch('/api/student/graduation', { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.error || 'Unable to load your graduation status.');
        }
        setApplication(result.data);
      })
      .catch((err) => setAppError(err.message || 'Unable to load your graduation status.'))
      .finally(() => setAppLoading(false));
  }, []);

  async function downloadDocument(kind, url) {
    setDownloadingDoc(kind);
    try {
      const response = await fetch(url, { credentials: 'include' });
      const result = await response.json();

      if (!result.success) {
        alert(result.error || 'Unable to open this document.');
        return;
      }

      window.open(result.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      alert('Unable to open this document. Please try again.');
    } finally {
      setDownloadingDoc('');
    }
  }

  if (academicsLoading || appLoading) {
    return <div style={s.loadingState}>Loading your graduation documents...</div>;
  }

  if (academicsError) {
    return <div style={s.errorBanner}>{academicsError}</div>;
  }

  const status = application ? application.status : 'NOT_STARTED';
  const isCompleted = status === 'COMPLETED';
  const statusMeta = getGraduationStatusMeta(status);

  const latestTranscript = (data?.transcripts || [])
    .slice()
    .sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt))[0] || null;

  return (
    <div>
      <h1 style={s.pageHeading}>Graduation Documents</h1>
      <p style={s.pageDescription}>
        Your graduation certificate, statement of completion, academic transcript, and other
        official documents the Registrar issues — with clear status on what's available now
        and what still depends on your graduation clearance.
      </p>

      {appError && <div style={s.errorBanner}>{appError}</div>}

      <div className="ih-card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ ...s.cardTitle, margin: 0 }}>Your Graduation Status</h2>
            <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: '4px 0 0' }}>
              {isCompleted
                ? 'You have graduated — your official documents are ready below.'
                : 'Official graduation documents become available once your graduation application is completed and approved.'}
            </p>
          </div>
          <span className={`ih-badge ${TONE_BADGE_CLASS[statusMeta.tone] || TONE_BADGE_CLASS.neutral}`}>
            {statusMeta.label}
          </span>
        </div>

        {!isCompleted && (
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 14, marginBottom: 0 }}>
            Track your eligibility, application, and clearance progress step by step in{' '}
            <Link href="/academics/graduation" style={{ color: 'var(--brand-dark)', fontWeight: 700 }}>
              Graduation Procedures
            </Link>
            .
          </p>
        )}
      </div>

      <div className="ih-card" style={{ marginBottom: 20 }}>
        <h2 style={s.cardTitle}>Official Graduation Documents</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {graduationDocumentTypes(application?.program?.level).map((doc) => (
            <DocumentRow
              key={doc.key}
              label={doc.label}
              description={doc.description}
              available={isCompleted}
              unavailableNote={`Available once your graduation is completed. Current status: ${statusMeta.label}.`}
              busy={downloadingDoc === doc.key}
              onDownload={() =>
                downloadDocument(doc.key, `/api/student/graduation/documents/${doc.key}/download`)
              }
            />
          ))}

          <DocumentRow
            label="Academic Transcript"
            description="Your official, signed record of grades and academic standing."
            available={!!latestTranscript}
            unavailableNote="No approved transcript on file yet. Request one from Requests & Documents on your Dashboard."
            busy={downloadingDoc === 'TRANSCRIPT'}
            onDownload={
              latestTranscript
                ? () =>
                    downloadDocument(
                      'TRANSCRIPT',
                      `/api/student/requests/transcripts/${latestTranscript.id}/download`
                    )
                : undefined
            }
            actionHref={!latestTranscript ? '/login' : undefined}
            actionLabel="Request Transcript"
          />
        </div>
      </div>

      <div className="ih-card" style={{ marginBottom: 0 }}>
        <h2 style={s.cardTitle}>Other Official Documents</h2>
        <p style={{ fontSize: 13.5, color: 'var(--ink)', margin: '0 0 14px' }}>
          Need another official document — a letter of confirmation, or anything else the
          Registry can issue on request? Submit it from Requests &amp; Documents on your
          Dashboard and track its status there.
        </p>
        <Link href="/login" className="ih-btn ih-btn-primary">
          Go to Requests &amp; Documents
        </Link>
      </div>
    </div>
  );
}
