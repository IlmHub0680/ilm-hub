'use client';

import { useEffect, useState } from 'react';
import { useAcademics } from '../context';
import { getRequestStatusMeta, STATUS_TONE_STYLE } from '../deriveAcademics';
import {
  COMPLAINT_TOPICS,
  getTopicLabel,
  UNIT_TYPE_GROUP_LABELS,
  getComplaintStatusLabel,
} from '@/lib/complaints';
import * as s from '../styles';

export default function CommunicationPage() {
  const { data, loading, error, reload } = useAcademics();

  const [recipients, setRecipients] = useState(null); // { units, departments }
  const [recipientsError, setRecipientsError] = useState('');

  // Wizard state: null (idle) -> 'recipient' -> 'topic' -> 'form'
  const [step, setStep] = useState(null);
  const [selectedRecipient, setSelectedRecipient] = useState(null); // { type, id, label }
  const [selectedTopic, setSelectedTopic] = useState('');
  const [otherTopicText, setOtherTopicText] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [supportingInfo, setSupportingInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetch('/api/student/recipients', { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.error || 'Unable to load recipients.');
        }
        setRecipients({ units: result.units || [], departments: result.departments || [] });
      })
      .catch((err) => setRecipientsError(err.message || 'Unable to load recipients.'));
  }, []);

  function startNewComplaint() {
    setStep('recipient');
    setSelectedRecipient(null);
    setSelectedTopic('');
    setOtherTopicText('');
    setSubject('');
    setMessage('');
    setSupportingInfo('');
    setFormError('');
    setFormSuccess('');
  }

  function cancelWizard() {
    setStep(null);
  }

  function pickRecipient(type, id, label) {
    setSelectedRecipient({ type, id, label });
    setStep('topic');
  }

  function pickTopic(value) {
    setSelectedTopic(value);
    setStep('form');
  }

  async function submitComplaint(e) {
    e.preventDefault();
    if (!selectedRecipient || !selectedTopic) return;

    if (!subject.trim()) {
      setFormError('Please provide a subject.');
      return;
    }
    if (!message.trim()) {
      setFormError('Please describe your issue.');
      return;
    }
    if (selectedTopic === 'OTHER' && !otherTopicText.trim()) {
      setFormError('Please specify the nature of your issue.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      let attachmentUrl = null;
      const fileInput = document.getElementById('complaint-attachment-file');
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

      const details =
        `${subject.trim()}\n\n` +
        (selectedTopic === 'OTHER' && otherTopicText.trim()
          ? `Specific issue: ${otherTopicText.trim()}\n\n`
          : '') +
        message.trim() +
        (supportingInfo.trim() ? `\n\nAdditional Information:\n${supportingInfo.trim()}` : '');

      const response = await fetch('/api/student/requests', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'COMPLAINT',
          topic: selectedTopic,
          recipientType: selectedRecipient.type,
          recipientId: selectedRecipient.id,
          details,
          attachmentUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Unable to submit your complaint.');
      }

      setFormSuccess(`Your complaint has been submitted and routed to ${selectedRecipient.label}.`);
      setStep(null);
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to submit your complaint.');
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

  if (loading) {
    return <div style={s.loadingState}>Loading your complaints...</div>;
  }

  if (error) {
    return <div style={s.errorBanner}>{error}</div>;
  }

  const complaints = (data?.requests || []).filter((r) => r.type === 'COMPLAINT');

  const unitGroups = {};
  (recipients?.units || []).forEach((u) => {
    if (!unitGroups[u.type]) unitGroups[u.type] = [];
    unitGroups[u.type].push(u);
  });

  return (
    <div>
      <h1 style={s.pageHeading}>Communication & Complaints</h1>
      <p style={s.pageDescription}>
        Send a complaint or enquiry to any office or academic department, and track its progress
        from submission through to a final response.
      </p>

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
            {step === null ? 'Submit a New Complaint or Enquiry' : 'New Complaint or Enquiry'}
          </h2>

          {step === null ? (
            <button type="button" onClick={startNewComplaint} style={primaryButtonStyle}>
              + New Complaint
            </button>
          ) : (
            <button type="button" onClick={cancelWizard} style={ghostButtonStyle}>
              Cancel
            </button>
          )}
        </div>

        {step && <WizardSteps step={step} />}

        {step === 'recipient' && (
          <div style={{ marginTop: 16 }}>
            <p style={stepPrompt}>Step 1 — Who should this go to?</p>

            {recipientsError && <div style={s.errorBanner}>{recipientsError}</div>}

            {!recipients && !recipientsError && (
              <p style={{ color: 'var(--ink-soft)' }}>Loading offices and departments…</p>
            )}

            {recipients && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {Object.keys(unitGroups).length > 0 && (
                  <div>
                    <div style={groupLabelStyle}>Institutional Offices</div>
                    <div style={pickerGrid}>
                      {Object.entries(unitGroups).map(([type, units]) => (
                        <div key={type}>
                          <div style={subGroupLabelStyle}>
                            {UNIT_TYPE_GROUP_LABELS[type] || type}
                          </div>
                          {units.map((u) => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => pickRecipient('unit', u.id, u.nameEn)}
                              style={pickerButtonStyle}
                            >
                              {u.nameEn}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {recipients.departments?.length > 0 && (
                  <div>
                    <div style={groupLabelStyle}>Academic Departments</div>
                    <div style={pickerGrid}>
                      {recipients.departments.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => pickRecipient('department', d.id, d.nameEn)}
                          style={pickerButtonStyle}
                        >
                          {d.nameEn}
                          {d.faculty?.nameEn ? (
                            <span
                              style={{
                                display: 'block',
                                fontSize: 11,
                                color: 'var(--ink-soft)',
                                fontWeight: 400,
                              }}
                            >
                              {d.faculty.nameEn}
                            </span>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {Object.keys(unitGroups).length === 0 && !recipients.departments?.length && (
                  <div style={s.emptyState}>No recipients are configured yet.</div>
                )}
              </div>
            )}
          </div>
        )}

        {step === 'topic' && (
          <div style={{ marginTop: 16 }}>
            <p style={stepPrompt}>
              Step 2 — What is this about?{' '}
              <span style={recipientChip}>To: {selectedRecipient?.label}</span>
            </p>
            <div style={pickerGrid}>
              {COMPLAINT_TOPICS.map((t) => (
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
            <button type="button" onClick={() => setStep('recipient')} style={{ ...ghostButtonStyle, marginTop: 14 }}>
              ← Back
            </button>
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={submitComplaint} style={{ marginTop: 16 }}>
            <p style={stepPrompt}>
              Step 3 — Details <span style={recipientChip}>To: {selectedRecipient?.label}</span>{' '}
              <span style={recipientChip}>{getTopicLabel(selectedTopic)}</span>
            </p>

            {selectedTopic === 'OTHER' && (
              <FormField label="Please specify the nature of your issue">
                <input
                  type="text"
                  value={otherTopicText}
                  onChange={(e) => setOtherTopicText(e.target.value)}
                  style={inputStyle}
                  placeholder="e.g. Lost campus ID card"
                />
              </FormField>
            )}

            <FormField label="Subject">
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={inputStyle}
                placeholder="A short summary of your complaint"
                maxLength={150}
              />
            </FormField>

            <FormField label="Detailed Message">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                style={{ ...inputStyle, fontFamily: 'inherit' }}
                placeholder="Describe your issue in detail..."
              />
            </FormField>

            <FormField label="Additional Information / Supporting Details (optional)">
              <textarea
                value={supportingInfo}
                onChange={(e) => setSupportingInfo(e.target.value)}
                rows={3}
                style={{ ...inputStyle, fontFamily: 'inherit' }}
                placeholder="Any other context that would help..."
              />
            </FormField>

            <FormField label="Attachment (optional — PDF, DOCX, JPG or PNG, max 15MB)">
              <input
                id="complaint-attachment-file"
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
        <h2 style={s.cardTitle}>My Complaints & Enquiries</h2>

        {complaints.length === 0 ? (
          <div style={s.emptyState}>You haven't submitted any complaints or enquiries yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {complaints.map((c) => {
              const meta = getRequestStatusMeta(c.status);
              const tone = STATUS_TONE_STYLE[meta.tone] || {};
              const subjectLine = c.details.split('\n')[0];
              const expanded = expandedId === c.id;

              return (
                <div key={c.id} style={complaintCardStyle}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      flexWrap: 'wrap',
                      cursor: 'pointer',
                    }}
                    onClick={() => setExpandedId(expanded ? null : c.id)}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', fontFamily: 'monospace' }}>
                        REQ-{c.id.slice(-8).toUpperCase()}
                      </div>
                      <strong style={{ fontSize: 14.5, color: 'var(--ink)' }}>{subjectLine}</strong>
                      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>
                        {getTopicLabel(c.topic)} · To: {c.recipientLabel || '—'} · Submitted{' '}
                        {new Date(c.createdAt).toLocaleDateString()}
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
                      {getComplaintStatusLabel(c.status)}
                    </span>
                  </div>

                  {expanded && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                      <div style={{ whiteSpace: 'pre-wrap', fontSize: 13.5, color: 'var(--ink)', marginBottom: 10 }}>
                        {c.details}
                      </div>

                      {c.attachmentUrl && (
                        <button
                          type="button"
                          onClick={() => viewAttachment(c.id)}
                          style={{ ...ghostButtonStyle, marginBottom: 12 }}
                        >
                          📎 View Attachment
                        </button>
                      )}

                      {c.responseNote && (
                        <div
                          style={{
                            fontSize: 13,
                            background: 'var(--brand-tint)',
                            borderRadius: 8,
                            padding: 10,
                            marginBottom: 12,
                          }}
                        >
                          <strong>Latest response:</strong> {c.responseNote}
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
                        {(c.activities || []).map((a, i) => (
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
    </div>
  );
}

function WizardSteps({ step }) {
  const steps = ['recipient', 'topic', 'form'];
  const labels = { recipient: '1. Recipient', topic: '2. Topic', form: '3. Details' };

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

const recipientChip = {
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

const groupLabelStyle = {
  fontSize: 12,
  fontWeight: 800,
  color: 'var(--ink-soft)',
  textTransform: 'uppercase',
  letterSpacing: 0.4,
  marginBottom: 8,
};

const subGroupLabelStyle = {
  fontSize: 11.5,
  fontWeight: 700,
  color: 'var(--brand-dark)',
  marginBottom: 6,
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

const complaintCardStyle = {
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
