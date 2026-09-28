'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAcademics } from '../context';
import { getCoursePlanOverview, getCurrentStudent, STUDENT_PLAN, getRequestStatusMeta } from '../deriveAcademics';
import * as s from '../styles';

const STATUS_LABELS = {
  current: 'Currently Taking',
  completed: 'Completed',
  remaining: 'Not Yet Taken',
};

const STATUS_BADGE_CLASS = {
  current: 'ih-b-info',
  completed: 'ih-b-success',
  remaining: 'ih-b-neutral',
};

const STATUS_DOT_COLOR = {
  current: 'var(--info)',
  completed: 'var(--success)',
  remaining: 'var(--ink-soft)',
};

const TONE_BADGE_CLASS = {
  good: 'ih-b-success',
  warning: 'ih-b-warning',
  danger: 'ih-b-danger',
  neutral: 'ih-b-neutral',
};

export default function StudyPlanPage() {
  const { data, loading, error, reload } = useAcademics();

  // Which course row currently has its inline add/drop request form open.
  const [pendingAction, setPendingAction] = useState(null); // { id, code, title, action: 'ADD' | 'DROP' }
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  if (loading) {
    return <div style={s.loadingState}>Loading your study plan...</div>;
  }

  if (error) {
    return <div style={s.errorBanner}>{error}</div>;
  }

  const coursePlanOverview = getCoursePlanOverview(data);
  const courseRequests = (data?.requests || []).filter(
    (r) => r.type === 'COURSE_ADD_DROP'
  );
  const isGraduated = getCurrentStudent(data).academicStatus === 'GRADUATED';

  function openRequestForm(course, action) {
    setPendingAction({ id: course.id, code: course.code, title: course.title, action });
    setReason('');
    setFormError('');
    setFormSuccess('');
  }

  function closeRequestForm() {
    setPendingAction(null);
    setReason('');
    setFormError('');
  }

  async function submitCourseRequest(e) {
    e.preventDefault();
    if (!pendingAction) return;

    setSubmitting(true);
    setFormError('');

    const verb = pendingAction.action === 'ADD' ? 'Add' : 'Drop';
    const details =
      `Course ${verb} request — ${pendingAction.title} (${pendingAction.code}).` +
      (reason.trim() ? ` Reason: ${reason.trim()}` : '');

    try {
      const response = await fetch('/api/student/requests', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'COURSE_ADD_DROP',
          details,
          courseId: pendingAction.id,
          courseAction: pendingAction.action,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Unable to submit your request.');
      }

      setFormSuccess(`Your ${verb.toLowerCase()} request for ${pendingAction.title} was submitted.`);
      setPendingAction(null);
      setReason('');
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to submit your request.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 style={s.pageHeading}>Study Plan & Curriculum</h1>
      <p style={s.pageDescription}>
        Your recommended study habits, a full view of your programme's
        curriculum, and the ability to request a course be added to or
        dropped from your registration.
      </p>

      {formSuccess && (
        <div
          style={{
            ...s.errorBanner,
            background: 'var(--success-tint)',
            color: 'var(--success)',
          }}
        >
          {formSuccess}
        </div>
      )}

      {isGraduated && (
        <div
          style={{
            ...s.errorBanner,
            background: 'var(--info-tint)',
            color: 'var(--info)',
          }}
        >
          You've graduated, so course registration and study plan changes are closed on
          your account. Need help with your academic record? Visit{' '}
          <Link href="/academics/graduate-assistance" style={{ color: 'inherit', fontWeight: 700 }}>
            Graduate Assistant
          </Link>
          .
        </div>
      )}

      <div className="ih-card" style={{ marginBottom: 20 }}>
        <h2 style={s.cardTitle}>Recommended Study Plan</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {STUDENT_PLAN.map((item, index) => (
            <div
              key={index}
              style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}
            >
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'var(--brand-tint)',
                  color: 'var(--brand-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {index + 1}
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="ih-card" style={{ marginBottom: 20 }}>
        <h2 style={s.cardTitle}>Programme Course Overview</h2>

        {coursePlanOverview.length === 0 ? (
          <div style={s.emptyState}>
            No curriculum has been assigned to your programme yet.
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {coursePlanOverview.map((course) => (
                <div key={course.code}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                      flexWrap: 'wrap',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1px solid var(--border)',
                      background: 'var(--paper)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginBottom: 2 }}>
                        {course.level}
                      </div>
                      <strong style={{ fontSize: 14.5, color: 'var(--ink)' }}>
                        {course.title}
                      </strong>
                      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>
                        {course.code}
                        {course.credits != null ? ` · ${course.credits} Credits` : ''}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className={`ih-badge ${STATUS_BADGE_CLASS[course.status] || 'ih-b-neutral'}`}>
                        {STATUS_LABELS[course.status]}
                      </span>

                      {!isGraduated && course.status === 'remaining' && (
                        <button
                          type="button"
                          onClick={() => openRequestForm(course, 'ADD')}
                          className="ih-btn ih-btn-secondary"
                        >
                          Request to Add
                        </button>
                      )}

                      {!isGraduated && course.status === 'current' && (
                        <button
                          type="button"
                          onClick={() => openRequestForm(course, 'DROP')}
                          className="ih-btn ih-btn-secondary"
                        >
                          Request to Drop
                        </button>
                      )}
                    </div>
                  </div>

                  {pendingAction && pendingAction.code === course.code && (
                    <form
                      onSubmit={submitCourseRequest}
                      style={{
                        marginTop: 8,
                        padding: 14,
                        borderRadius: 10,
                        border: '1px dashed var(--border)',
                        background: 'var(--brand-tint)',
                      }}
                    >
                      <div className="ih-field">
                        <label>
                          {pendingAction.action === 'ADD' ? 'Why do you want to add this course?' : 'Why do you want to drop this course?'}{' '}
                          <span style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>(optional)</span>
                        </label>

                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          rows={3}
                          placeholder="Add any context the Registry should know..."
                        />
                      </div>

                      {formError && (
                        <div style={{ color: 'var(--danger)', fontSize: 12.5, marginTop: 6 }}>
                          {formError}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="ih-btn ih-btn-primary"
                        >
                          {submitting ? 'Submitting…' : 'Submit Request'}
                        </button>
                        <button
                          type="button"
                          onClick={closeRequestForm}
                          className="ih-btn ih-btn-ghost"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                gap: 18,
                flexWrap: 'wrap',
                marginTop: 18,
                fontSize: 12.5,
                color: 'var(--ink-soft)',
              }}
            >
              <span>
                <span style={{ color: STATUS_DOT_COLOR.current, fontWeight: 800 }}>●</span>{' '}
                Currently taking
              </span>
              <span>
                <span style={{ color: STATUS_DOT_COLOR.completed, fontWeight: 800 }}>●</span>{' '}
                Completed
              </span>
              <span>
                <span style={{ color: STATUS_DOT_COLOR.remaining, fontWeight: 800 }}>●</span>{' '}
                Not yet taken
              </span>
            </div>
          </>
        )}
      </div>

      <div className="ih-card">
        <h2 style={s.cardTitle}>My Course Add / Drop Requests</h2>

        {courseRequests.length === 0 ? (
          <div style={s.emptyState}>
            No course add/drop requests submitted yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {courseRequests.map((request) => {
              const meta = getRequestStatusMeta(request.status);

              return (
                <div
                  key={request.id}
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
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, color: 'var(--ink)' }}>{request.details}</div>
                    <small style={{ color: 'var(--ink-soft)' }}>
                      Submitted {new Date(request.createdAt).toLocaleDateString()}
                    </small>
                    {request.responseNote && (
                      <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4 }}>
                        Response: {request.responseNote}
                      </div>
                    )}
                  </div>

                  <span className={`ih-badge ${TONE_BADGE_CLASS[meta.tone] || 'ih-b-neutral'}`}>
                    {meta.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
