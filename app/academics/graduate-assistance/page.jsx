'use client';

import { useState } from 'react';
import { useAcademics } from '../context';
import { getCurrentStudent, getRequestStatusMeta, STATUS_TONE_STYLE } from '../deriveAcademics';
import {
  GRADUATE_SUPPORT_TOPICS,
  getGraduateSupportTopicLabel,
  getGraduateSupportStatusLabel,
} from '@/lib/graduateAssistance';
import * as s from '../styles';

export default function GraduateAssistancePage() {
  const { data, loading, error, reload } = useAcademics();

  // Wizard state: null (idle) -> 'topic' -> 'form'
  const [step, setStep] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  if (loading) {
    return <div style={s.loadingState}>Loading Graduate Assistant...</div>;
  }

  if (error) {
    return <div style={s.errorBanner}>{error}</div>;
  }

  const currentStudent = getCurrentStudent(data);
  const isGraduated = currentStudent.academicStatus === 'GRADUATED';
  const myRequests = (data?.requests || []).filter((r) => r.type === 'GRADUATE_SUPPORT');

  function startNewRequest() {
    setStep('topic');
    setSelectedTopic('');
    setSubject('');
    setMessage('');
    setFormError('');
    setFormSuccess('');
  }

  function cancelWizard() {
    setStep(null);
  }

  function pickTopic(value) {
    setSelectedTopic(value);
    setStep('form');
  }

  async function submitRequest(e) {
    e.preventDefault();
    if (!selectedTopic) return;

    if (!subject.trim()) {
      setFormError('Please provide a subject.');
      return;
    }
    if (!message.trim()) {
      setFormError('Please describe your request.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      let attachmentUrl = null;
      const fileInput = document.getElementById('graduate-support-attachment-file');
      const file = fileInput?.files?.[0];

      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch('/api/student/requests/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Unable to upload attachment.');
        }

        attachmentUrl = uploadResult.key;
      }

      const details = `${subject.trim()}\n\n${message.trim()}`;

      const response = await fetch('/api/student/requests', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'GRADUATE_SUPPORT',
          topic: selectedTopic,
          details,
          attachmentUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Unable to submit your request.');
      }

      setFormSuccess('Your request has been submitted to the Registrar.');
      setStep(null);
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to submit your request.');
    } finally {
      setSubmitting(false);
    }
  }

  async function viewAttachment(requestId) {
    try {
      const response = await fetch(`/api/student/requests/${requestId}/download`, {
        credentials: 'include',
      });
      const result = await response.json();

      if (!result.success) {
        alert(result.error || 'Unable to open attachment.');
        return;
      }

      window.open(result.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      alert('Unable to open attachment. Please try again.');
    }
  }

  return (
    <div>
      <h1 style={s.pageHeading}>Graduate Assistant</h1>
      <p style={s.pageDescription}>
        Post-graduation support for your official documents — certificate issues, transcript
        and statement of completion requests, corrections, and reissues. Submitted requests go
        straight to the Registrar and you can track them here through to a response.
      </p>

      {!isGraduated && (
        <div style={s.card}>
          <div style={s.emptyState}>
            Graduate Assistant becomes available once your graduation is completed. In the
            meantime, use Requests &amp; Documents in your student portal for other requests.
          </div>
        </div>
      )}

      {isGraduated && (
        <>
          {formSuccess && (
            <div style={{ ...s.errorBanner, background: 'var(--success-tint)', color: 'var(--success)' }}>
              {formSuccess}
            </div>
          )}

          <div style={s.card}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <h2 style={{ ...s.cardTitle, margin: 0 }}>
                {step === null ? 'Submit a New Request' : 'New Graduate Assistant Request'}
              </h2>

              {step === null ? (
                <button type="button" onClick={startNewRequest} style={primaryButtonStyle}>
                  + New Request
                </button>
              ) : (
                <button type="button" onClick={cancelWizard} style={ghostButtonStyle}>
                  Cancel
                </button>
              )}
            </div>

            {step && <WizardSteps step={step} />}

            {step === 'topic' && (
              <div style={{ marginTop: 16 }}>
                <p style={stepPrompt}>Step 1 — What is this about?</p>
                <div style={pickerGrid}>
                  {GRADUATE_SUPPORT_TOPICS.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => pickTopic(t.value)}
                      style={pickerButtonStyle}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 'form' && (
              <form onSubmit={submitRequest} style={{ marginTop: 16 }}>
                <p style={stepPrompt}>
                  Step 2 — Details{' '}
                  <span style={topicChip}>{getGraduateSupportTopicLabel(selectedTopic)}</span>
                </p>

                <FormField label="Subject">
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    style={inputStyle}
                    placeholder="A short summary of your request"
                    maxLength={150}
                  />
                </FormField>

                <FormField label="Detailed Message">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    style={{ ...inputStyle, fontFamily: 'inherit' }}
                    placeholder="Describe your request in detail..."
                  />
                </FormField>

                <FormField label="Attachment (optional — PDF, DOCX, JPG or PNG, max 15MB)">
                  <input
                    id="graduate-support-attachment-file"
                    type="file"
                    accept=".pdf,.docx,.jpg,.jpeg,.png"
                    style={{ fontSize: 13 }}
                  />
                </FormField>

                {formError && (
                  <div style={{ color: 'var(--danger)', fontSize: 12.5, marginTop: 4, marginBottom: 8 }}>
                    {formError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                  <button type="submit" disabled={submitting} style={primaryButtonStyle}>
                    {submitting ? 'Sending…' : 'Send'}
                  </button>
                  <button type="button" onClick={() => setStep('topic')} style={ghostButtonStyle}>
                    ← Back
                  </button>
                  <button type="button" onClick={cancelWizard} style={ghostButtonStyle}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          <div style={s.card}>
            <h2 style={s.cardTitle}>My Graduate Assistant Requests</h2>

            {myRequests.length === 0 ? (
              <div style={s.emptyState}>You haven't submitted any requests yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {myRequests.map((r) => {
                  const meta = getRequestStatusMeta(r.status);
                  const tone = STATUS_TONE_STYLE[meta.tone] || {};
                  const subjectLine = r.details.split('\n')[0];
                  const expanded = expandedId === r.id;

                  return (
                    <div key={r.id} style={requestCardStyle}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 12,
                          flexWrap: 'wrap',
                          cursor: 'pointer',
                        }}
                        onClick={() => setExpandedId(expanded ? null : r.id)}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', fontFamily: 'monospace' }}>
                            REQ-{r.id.slice(-8).toUpperCase()}
                          </div>
                          <strong style={{ fontSize: 14.5, color: 'var(--ink)' }}>{subjectLine}</strong>
                          <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>
                            {getGraduateSupportTopicLabel(r.topic)} · To: {r.recipientLabel || 'Registrar'}{' '}
                            · Submitted {new Date(r.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <span
                          style={{
                            padding: '5px 12px',
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 800,
                            whiteSpace: 'nowrap',
                            height: 'fit-content',
                            background: tone.background,
                            color: tone.color,
                          }}
                        >
                          {getGraduateSupportStatusLabel(r.status)}
                        </span>
                      </div>

                      {expanded && (
                        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                          <div style={{ whiteSpace: 'pre-wrap', fontSize: 13.5, color: 'var(--ink)', marginBottom: 10 }}>
                            {r.details}
                          </div>

                          {r.attachmentUrl && (
                            <button
                              type="button"
                              onClick={() => viewAttachment(r.id)}
                              style={{ ...ghostButtonStyle, marginBottom: 12 }}
                            >
                              📎 View Attachment
                            </button>
                          )}

                          {r.responseNote && (
                            <div
                              style={{
                                fontSize: 13,
                                background: 'var(--brand-tint)',
                                borderRadius: 8,
                                padding: 10,
                                marginBottom: 12,
                              }}
                            >
                              <strong>Latest response:</strong> {r.responseNote}
                            </div>
                          )}

                          <div
                            style={{
                              fontSize: 12.5,
                              fontWeight: 700,
                              color: 'var(--ink-soft)',
                              marginBottom: 8,
                              textTransform: 'uppercase',
                              letterSpacing: 0.4,
                            }}
                          >
                            Progress
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {(r.activities || []).map((a, i) => (
                              <div key={a.id || i} style={{ display: 'flex', gap: 10 }}>
                                <div style={timelineDotStyle} />
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
                                    {a.action}
                                    {a.action === 'Transferred' && a.fromLabel && a.toLabel
                                      ? ` — ${a.fromLabel} → ${a.toLabel}`
                                      : ''}
                                  </div>
                                  <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>
                                    {new Date(a.createdAt).toLocaleString()} · {a.actorLabel}
                                  </div>
                                  {a.note && (
                                    <div style={{ fontSize: 12.5, color: 'var(--ink)', marginTop: 3 }}>{a.note}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function WizardSteps({ step }) {
  const steps = ['topic', 'form'];
  const labels = { topic: '1. Topic', form: '2. Details' };

  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
      {steps.map((st) => (
        <span
          key={st}
          style={{
            padding: '4px 10px',
            borderRadius: 999,
            fontSize: 11.5,
            fontWeight: 700,
            background: st === step ? 'var(--brand)' : 'var(--surface)',
            color: st === step ? 'var(--on-accent)' : 'var(--ink-soft)',
            border: '1px solid var(--border)',
          }}
        >
          {labels[st]}
        </span>
      ))}
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const primaryButtonStyle = {
  padding: '9px 18px',
  borderRadius: 8,
  border: 'none',
  background: 'var(--brand)',
  color: 'var(--on-accent)',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const ghostButtonStyle = {
  padding: '9px 16px',
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--ink)',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const stepPrompt = {
  fontSize: 13.5,
  fontWeight: 700,
  color: 'var(--ink)',
  margin: '0 0 12px',
};

const topicChip = {
  display: 'inline-block',
  marginLeft: 8,
  padding: '3px 9px',
  borderRadius: 999,
  background: 'var(--brand-tint)',
  color: 'var(--brand-dark)',
  fontSize: 11.5,
  fontWeight: 700,
  verticalAlign: 'middle',
};

const pickerGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: 8,
  marginBottom: 10,
};

const pickerButtonStyle = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  textAlign: 'left',
  padding: '10px 12px',
  borderRadius: 9,
  border: '1px solid var(--border)',
  background: 'var(--paper)',
  color: 'var(--ink)',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  marginBottom: 6,
};

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '9px 11px',
  borderRadius: 8,
  border: '1px solid var(--border)',
  fontSize: 13.5,
};

const requestCardStyle = {
  padding: '14px 16px',
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'var(--paper)',
};

const timelineDotStyle = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: 'var(--brand)',
  marginTop: 5,
  flexShrink: 0,
};
