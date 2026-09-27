'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAcademics } from '../context';
import {
  getGraduationStatusMeta,
  getClearanceStatusMeta,
  GRADUATION_STEPS,
  getGraduationStepIndex,
} from '@/lib/graduation';
import * as s from '../styles';

const REQUIRED_DOCUMENTS = [
  'Completed graduation application (submitted below)',
  'No outstanding required courses in your programme curriculum',
  'Library clearance — no unreturned books or unpaid fines',
  'Finance clearance — no outstanding tuition or fee balance',
  'Academic Administration clearance — academic record in order',
  'Student Affairs clearance — no outstanding disciplinary or welfare holds',
];

export default function GraduationPage() {
  const { data, loading, error } = useAcademics();

  const [application, setApplication] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [appLoading, setAppLoading] = useState(true);
  const [appError, setAppError] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');

  // Eligibility is computed once, server-side, by the same function
  // that actually gates application creation (lib/graduationEligibility.js)
  // — never recomputed here, so this page can never show "eligible"
  // while the backend would still reject the application.
  function loadApplication() {
    setAppLoading(true);
    fetch('/api/student/graduation', { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.error || 'Unable to load your graduation status.');
        }
        setApplication(result.data);
        setEligibility(result.eligibility || null);
      })
      .catch((err) => setAppError(err.message || 'Unable to load your graduation status.'))
      .finally(() => setAppLoading(false));
  }

  useEffect(() => {
    loadApplication();
  }, []);

  async function submitApplication() {
    setApplying(true);
    setApplyError('');
    setApplySuccess('');

    try {
      const response = await fetch('/api/student/graduation', {
        method: 'POST',
        credentials: 'include',
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Unable to submit your graduation application.');
      }

      setApplication(result.data);
      setApplySuccess('Your graduation application has been submitted.');
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : 'Unable to submit your graduation application.');
      // The server re-checks eligibility on every submit; refresh our
      // copy so the reasons shown here always match what it just
      // enforced (e.g. a grade posted moments ago changed the picture).
      loadApplication();
    } finally {
      setApplying(false);
    }
  }

  if (loading || appLoading) {
    return <div style={s.loadingState}>Loading your graduation status...</div>;
  }

  if (error) {
    return <div style={s.errorBanner}>{error}</div>;
  }

  const eligible = !!eligibility?.eligible;
  const eligibilityReasons = eligibility?.reasons || [];
  const remainingCourses = eligibility?.details?.remainingCourses || [];
  const curriculumKnown = !!eligibility?.details?.totalCourses;

  const displayStatus = application ? application.status : eligible ? 'ELIGIBLE' : 'NOT_STARTED';
  const statusMeta = getGraduationStatusMeta(displayStatus);
  const stepIndex = getGraduationStepIndex(displayStatus);

  return (
    <div>
      <h1 style={s.pageHeading}>Graduation Procedures</h1>
      <p style={s.pageDescription}>
        Track your eligibility, apply for graduation, follow your clearance across every office,
        and see your final approval status — all in one place.
      </p>

      {applySuccess && (
        <div style={{ ...s.errorBanner, background: 'var(--success-tint)', color: 'var(--success)' }}>
          {applySuccess}
        </div>
      )}

      {appError && <div style={s.errorBanner}>{appError}</div>}

      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ ...s.cardTitle, margin: 0 }}>Your Status</h2>
            {application?.program?.nameEn && (
              <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: '4px 0 0' }}>
                {application.program.nameEn}
              </p>
            )}
          </div>

          <span
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              fontSize: 12.5,
              fontWeight: 800,
              whiteSpace: 'nowrap',
              ...(STATUS_TONE[statusMeta.tone] || STATUS_TONE.neutral),
            }}
          >
            {statusMeta.label}
          </span>
        </div>

        {displayStatus !== 'REJECTED' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 18 }}>
            {GRADUATION_STEPS.map((step, i) => (
              <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    padding: '5px 12px',
                    borderRadius: 999,
                    fontSize: 11.5,
                    fontWeight: 700,
                    background: i <= stepIndex ? 'var(--brand)' : 'var(--surface)',
                    color: i <= stepIndex ? 'var(--on-accent)' : 'var(--ink-soft)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {step.label}
                </span>
                {i < GRADUATION_STEPS.length - 1 && (
                  <span style={{ color: 'var(--border)' }}>→</span>
                )}
              </div>
            ))}
          </div>
        )}

        {displayStatus === 'REJECTED' && application?.decisionNote && (
          <div style={{ marginTop: 14, fontSize: 13.5, background: 'var(--danger-tint)', color: 'var(--danger)', borderRadius: 8, padding: 10 }}>
            <strong>Application not approved:</strong> {application.decisionNote}
          </div>
        )}

        {displayStatus === 'COMPLETED' && (
          <div style={{ marginTop: 14, fontSize: 13.5, background: 'var(--success-tint)', color: 'var(--success)', borderRadius: 8, padding: 10 }}>
            Congratulations — your graduation has been completed and confirmed.
            {application?.decisionNote ? ` ${application.decisionNote}` : ''}
          </div>
        )}

        {!application && (
          <div style={{ marginTop: 18 }}>
            {eligible ? (
              <>
                <p style={{ fontSize: 13.5, color: 'var(--ink)', marginBottom: 12 }}>
                  You have completed every course in your programme curriculum and your account is
                  in good standing. You may now apply for graduation.
                </p>
                {applyError && <div style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 10 }}>{applyError}</div>}
                <button type="button" onClick={submitApplication} disabled={applying} style={primaryButtonStyle}>
                  {applying ? 'Submitting…' : 'Apply for Graduation'}
                </button>
              </>
            ) : (
              <>
                <p style={{ fontSize: 13.5, color: 'var(--ink)', marginBottom: 10 }}>
                  You're not yet eligible to apply for graduation. Here's why:
                </p>

                {eligibilityReasons.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: remainingCourses.length > 0 ? 14 : 0 }}>
                    {eligibilityReasons.map((reason, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '9px 12px',
                          borderRadius: 8,
                          border: '1px solid var(--danger-tint)',
                          background: 'var(--paper)',
                          fontSize: 13,
                          color: 'var(--ink)',
                        }}
                      >
                        {reason}
                      </div>
                    ))}
                  </div>
                )}

                {curriculumKnown && remainingCourses.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {remainingCourses.map((course) => (
                      <div
                        key={course.id || course.code}
                        style={{
                          padding: '9px 12px',
                          borderRadius: 8,
                          border: '1px solid var(--border)',
                          background: 'var(--paper)',
                          fontSize: 13,
                        }}
                      >
                        <strong>{course.title}</strong>{' '}
                        <span style={{ color: 'var(--ink-soft)' }}>({course.code})</span>
                        {course.status === 'failed' && (
                          <span style={{ color: 'var(--danger)', fontWeight: 700 }}> — not yet passed</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {application && (
        <div style={s.card}>
          <h2 style={s.cardTitle}>Clearance Checklist</h2>

          {application.clearances.length === 0 ? (
            <div style={s.emptyState}>No clearance offices are configured yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {application.clearances.map((clearance) => {
                const meta = getClearanceStatusMeta(clearance.status);
                return (
                  <div
                    key={clearance.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 12,
                      flexWrap: 'wrap',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1px solid var(--border)',
                      background: 'var(--paper)',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: 14, color: 'var(--ink)' }}>{clearance.unit.nameEn}</strong>
                      {clearance.clearedByStaff && (
                        <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>
                          Reviewed by {clearance.clearedByStaff.user.name}
                          {clearance.clearedAt ? ` · ${new Date(clearance.clearedAt).toLocaleDateString()}` : ''}
                        </div>
                      )}
                      {clearance.note && (
                        <div style={{ fontSize: 12.5, color: 'var(--ink)', marginTop: 4 }}>{clearance.note}</div>
                      )}
                    </div>

                    <span
                      style={{
                        padding: '5px 12px',
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 800,
                        whiteSpace: 'nowrap',
                        ...(STATUS_TONE[meta.tone] || STATUS_TONE.neutral),
                      }}
                    >
                      {meta.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {displayStatus === 'COMPLETED' && (
        <div style={{ ...s.card, background: 'var(--brand-tint)', border: '1px solid var(--success-tint)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h2 style={{ ...s.cardTitle, color: 'var(--brand-dark)', margin: 0 }}>Graduation Documents</h2>
            <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', margin: '6px 0 0' }}>
              Congratulations — your official certificate, statement of completion, and transcript
              are ready to download.
            </p>
          </div>
          <Link
            href="/academics/graduation-documents"
            style={{ ...primaryButtonStyle, textDecoration: 'none', display: 'inline-block', whiteSpace: 'nowrap' }}
          >
            View Graduation Documents
          </Link>
        </div>
      )}

      <div style={s.card}>
        <h2 style={s.cardTitle}>Requirements & Documents</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {REQUIRED_DOCUMENTS.map((item, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 13.5 }}>
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'var(--brand-tint)',
                  color: 'var(--brand-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11.5,
                  fontWeight: 800,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                {index + 1}
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const STATUS_TONE = {
  good: { background: 'var(--success-tint)', color: 'var(--success)' },
  warning: { background: 'var(--warning-tint)', color: 'var(--warning)' },
  danger: { background: 'var(--danger-tint)', color: 'var(--danger)' },
  neutral: { background: 'var(--brand-tint)', color: 'var(--brand)' },
};

const primaryButtonStyle = {
  padding: '10px 20px',
  borderRadius: 8,
  border: 'none',
  background: 'var(--brand)',
  color: 'var(--on-accent)',
  fontSize: 13.5,
  fontWeight: 700,
  cursor: 'pointer',
};
