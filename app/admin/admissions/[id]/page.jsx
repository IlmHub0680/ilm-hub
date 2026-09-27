'use client';

import Link from 'next/link';
import { useEffect, useState, use as usePromise } from 'react';

const SELF_LEVEL_LABELS = {
  NONE: 'None yet',
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  PROFICIENT: 'Proficient',
};

const STATUS_LABELS = {
  PENDING_PAYMENT: 'Pending Payment',
  PAID: 'Paid',
  UNDER_REVIEW: 'Under Review',
  INITIAL_ACCEPTANCE: 'Initial Acceptance',
  PENDING_FINAL_APPROVAL: 'Pending Final Approval',
  APPROVED: 'Approved',
  REJECTED: 'Declined',
};

const DOCUMENT_FIELDS = [
  { field: 'identityDocumentUrl', label: 'Identity Document' },
  { field: 'passportPictureUrl', label: 'Passport Picture' },
  { field: 'transcriptsUrl', label: 'Transcripts' },
  { field: 'certificateUrl', label: 'Certificate' },
  { field: 'testimonialUrl', label: 'Testimonial' },
  { field: 'recommendationUrl', label: 'Recommendation Letter' },
];

function Field({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--ink-soft)', fontWeight: 700, marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: 'var(--ink)' }}>{value || '—'}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="ih-card" style={{ padding: 20, marginBottom: 18 }}>
      <h2 style={{ margin: '0 0 14px', fontSize: 16, color: 'var(--brand)' }}>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        {children}
      </div>
    </section>
  );
}

export default function AdmissionApplicationDetailPage({ params }) {
  const { id } = usePromise(params);

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionPending, setActionPending] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteVisibility, setNoteVisibility] = useState('INTERNAL');
  const [notePending, setNotePending] = useState(false);

  const [letter, setLetter] = useState(null);
  const [letterLoading, setLetterLoading] = useState(false);
  const [letterPending, setLetterPending] = useState(false);
  const [letterForm, setLetterForm] = useState({
    programmeText: '',
    departmentText: '',
    qualificationText: '',
    intakeSession: '',
    admissionDate: '',
    conditions: '',
    signatoryName: '',
    signatoryTitle: '',
  });
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/admissions/${id}`, { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok || !result.success) throw new Error(result.error || 'Failed to load application.');
        setApplication(result.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const loadNotes = () => {
    setNotesLoading(true);
    fetch(`/api/admin/admissions/${id}/notes`, { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (res.ok && result.success) setNotes(result.data);
      })
      .finally(() => setNotesLoading(false));
  };

  const loadLetter = () => {
    setLetterLoading(true);
    fetch(`/api/admin/admissions/${id}/letter`, { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (res.ok && result.success) {
          setLetter(result.data);
          const d = result.data;
          const defaults = result.defaults || {};
          setLetterForm({
            programmeText: d?.programmeText ?? defaults.programmeText ?? '',
            departmentText: d?.departmentText ?? defaults.departmentText ?? '',
            qualificationText: d?.qualificationText ?? defaults.qualificationText ?? '',
            intakeSession: d?.intakeSession ?? defaults.intakeSession ?? '',
            admissionDate: d?.admissionDate ? String(d.admissionDate).slice(0, 10) : '',
            conditions: d?.conditions ?? '',
            signatoryName: d?.signatoryName ?? '',
            signatoryTitle: d?.signatoryTitle ?? '',
          });
        }
      })
      .finally(() => setLetterLoading(false));
  };

  const loadHistory = () => {
    setHistoryLoading(true);
    fetch(`/api/admin/admissions/${id}/audit`, { credentials: 'include' })
      .then(async (res) => {
        const result = await res.json();
        if (res.ok && result.success) setHistory(result.data);
      })
      .finally(() => setHistoryLoading(false));
  };

  useEffect(() => {
    load();
    loadNotes();
    loadLetter();
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const addNote = async () => {
    if (!noteText.trim()) return;
    setNotePending(true);
    try {
      const res = await fetch(`/api/admin/admissions/${id}/notes`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: noteText.trim(), visibility: noteVisibility }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Unable to add note.');
      setNoteText('');
      loadNotes();
    } catch (err) {
      setActionMessage(err.message);
    } finally {
      setNotePending(false);
    }
  };

  const runAction = async (path, body) => {
    setActionPending(true);
    setActionMessage('');
    try {
      const res = await fetch(`/api/admin/admissions/${id}/${path}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body || {}),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Action failed.');
      const emailNote =
        typeof result.emailSent === 'boolean'
          ? result.emailSent
            ? ' The applicant has been emailed.'
            : ' (The applicant was not emailed -- admissions email is not configured yet.)'
          : '';
      setActionMessage((result.message || 'Done.') + emailNote);
      setDeclineReason('');
      load();
    } catch (err) {
      setActionMessage(err.message);
    } finally {
      setActionPending(false);
    }
  };

  const viewDocument = async (field) => {
    try {
      const res = await fetch(`/api/admin/admissions/${id}/document?field=${field}`, { credentials: 'include' });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Unable to open document.');
      window.open(result.data.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setActionMessage(err.message);
    }
  };

  const saveLetterDraft = async (reopen) => {
    setLetterPending(true);
    setActionMessage('');
    try {
      const res = await fetch(`/api/admin/admissions/${id}/letter`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...letterForm, reopen: !!reopen }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Unable to save the letter.');
      setActionMessage(reopen ? 'Letter reopened for correction.' : 'Letter draft saved.');
      loadLetter();
      loadHistory();
    } catch (err) {
      setActionMessage(err.message);
    } finally {
      setLetterPending(false);
    }
  };

  const finalizeLetter = async () => {
    setLetterPending(true);
    setActionMessage('');
    try {
      const res = await fetch(`/api/admin/admissions/${id}/letter/finalize`, {
        method: 'POST',
        credentials: 'include',
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Unable to finalize the letter.');
      const emailNote =
        typeof result.emailSent === 'boolean'
          ? result.emailSent
            ? ' The applicant has been emailed.'
            : ' (The applicant was not emailed -- admissions email is not configured yet.)'
          : '';
      setActionMessage((result.message || 'Letter finalized.') + emailNote);
      loadLetter();
      loadHistory();
    } catch (err) {
      setActionMessage(err.message);
    } finally {
      setLetterPending(false);
    }
  };

  const previewLetter = async () => {
    try {
      const res = await fetch(`/api/admin/admissions/${id}/letter/download`, { credentials: 'include' });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Unable to open the letter.');
      window.open(result.data.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setActionMessage(err.message);
    }
  };

  if (loading) return <main style={page}><div style={container}>Loading…</div></main>;
  if (error) return <main style={page}><div style={container}><p style={{ color: 'var(--danger)' }}>{error}</p></div></main>;
  if (!application) return null;

  const a = application;

  return (
    <main style={page}>
      <div style={container}>
        <Link href="/admin/admissions" style={backLink}>← Back to Admissions</Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, margin: '18px 0 20px' }}>
          <div>
            <h1 style={heading}>{a.fullName}</h1>
            <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 13 }}>
              {a.applicationNumber} · {a.email}
            </p>
          </div>
          <span className={`ih-badge ${
            a.status === 'APPROVED' ? 'ih-b-success'
            : a.status === 'REJECTED' ? 'ih-b-danger'
            : 'ih-b-warning'
          }`} style={{ fontSize: 13 }}>
            {STATUS_LABELS[a.status] || a.status.replace(/_/g, ' ')}
          </span>
        </div>

        {actionMessage && (
          <div className="ih-card" style={{ padding: '10px 14px', marginBottom: 16, fontSize: 13.5 }}>{actionMessage}</div>
        )}

        {!application.canEdit && ['PAID', 'UNDER_REVIEW', 'INITIAL_ACCEPTANCE', 'PENDING_FINAL_APPROVAL'].includes(a.status) && (
          <div className="ih-card" style={{ padding: '10px 14px', marginBottom: 16, fontSize: 13.5, color: 'var(--ink-soft)' }}>
            Read-only. You can view this application, but moving it through review or issuing a decision happens at
            Admissions/Registry&apos;s own dashboard — you do not currently hold Admissions edit authority.
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {application.canEdit && a.status === 'PAID' && (
            <button className="ih-btn ih-btn-primary" disabled={actionPending} onClick={() => runAction('review')}>
              Move to Under Review
            </button>
          )}
          {application.canEdit && ['UNDER_REVIEW', 'INITIAL_ACCEPTANCE', 'PENDING_FINAL_APPROVAL'].includes(a.status) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
              {(a.status === 'INITIAL_ACCEPTANCE' || a.status === 'PENDING_FINAL_APPROVAL') && (
                <div style={notFinalNotice}>
                  This application is in progress but has not received a final admission decision yet.
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {a.status === 'UNDER_REVIEW' && (
                  <button className="ih-btn ih-btn-primary" disabled={actionPending} onClick={() => runAction('initial-acceptance')}>
                    Move to Initial Acceptance
                  </button>
                )}
                {a.status === 'INITIAL_ACCEPTANCE' && (
                  <button className="ih-btn ih-btn-primary" disabled={actionPending} onClick={() => runAction('pending-final-approval')}>
                    Move to Pending Final Approval
                  </button>
                )}
                {a.status === 'PENDING_FINAL_APPROVAL' && (
                  <button className="ih-btn ih-btn-primary" disabled={actionPending} onClick={() => runAction('decision', { decision: 'APPROVED' })}>
                    Approve &amp; Create Student Record
                  </button>
                )}
                <button className="ih-btn ih-btn-danger" disabled={actionPending} onClick={() => runAction('decision', { decision: 'REJECTED', reason: declineReason })}>
                  Decline
                </button>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--ink-soft)', fontWeight: 700, marginBottom: 4 }}>
                  Reason for declining (optional -- shown to the applicant)
                </label>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="e.g. Programme intake for this session is full, or eligibility requirements not met."
                  rows={2}
                  maxLength={2000}
                  style={{ width: '100%', maxWidth: 520, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border, #d8d8d8)', fontFamily: 'inherit', fontSize: 13.5, resize: 'vertical' }}
                />
              </div>
            </div>
          )}
        </div>

        {a.status === 'APPROVED' && (
          <section className="ih-card" style={{ padding: 20, marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: 16, color: 'var(--brand)' }}>Letter of Admission</h2>
              <span
                className={`ih-badge ${letter?.status === 'FINALIZED' ? 'ih-b-success' : letter ? 'ih-b-warning' : 'ih-b-neutral'}`}
                style={{ fontSize: 11 }}
              >
                {letter?.status === 'FINALIZED' ? `Finalized · v${letter.version}` : letter ? `Draft · v${letter.version}` : 'Not started'}
              </span>
            </div>

            {letterLoading ? (
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: 0 }}>Loading…</p>
            ) : (
              <>
                {letter?.status === 'FINALIZED' && (
                  <div style={notFinalNotice}>
                    This letter has been finalized and issued to the applicant. To correct it, reopen it first — the currently issued version is preserved.
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, margin: '14px 0' }}>
                  <label style={letterFieldLabel}>
                    Programme
                    <input style={letterInput} disabled={letter?.status === 'FINALIZED'} value={letterForm.programmeText} onChange={(e) => setLetterForm((f) => ({ ...f, programmeText: e.target.value }))} />
                  </label>
                  <label style={letterFieldLabel}>
                    Department
                    <input style={letterInput} disabled={letter?.status === 'FINALIZED'} value={letterForm.departmentText} onChange={(e) => setLetterForm((f) => ({ ...f, departmentText: e.target.value }))} />
                  </label>
                  <label style={letterFieldLabel}>
                    Qualification
                    <input style={letterInput} disabled={letter?.status === 'FINALIZED'} value={letterForm.qualificationText} onChange={(e) => setLetterForm((f) => ({ ...f, qualificationText: e.target.value }))} />
                  </label>
                  <label style={letterFieldLabel}>
                    Intake / Session
                    <input style={letterInput} disabled={letter?.status === 'FINALIZED'} value={letterForm.intakeSession} onChange={(e) => setLetterForm((f) => ({ ...f, intakeSession: e.target.value }))} />
                  </label>
                  <label style={letterFieldLabel}>
                    Admission Date
                    <input type="date" style={letterInput} disabled={letter?.status === 'FINALIZED'} value={letterForm.admissionDate} onChange={(e) => setLetterForm((f) => ({ ...f, admissionDate: e.target.value }))} />
                  </label>
                  <label style={letterFieldLabel}>
                    Authorized Signatory
                    <input style={letterInput} disabled={letter?.status === 'FINALIZED'} value={letterForm.signatoryName} onChange={(e) => setLetterForm((f) => ({ ...f, signatoryName: e.target.value }))} />
                  </label>
                  <label style={letterFieldLabel}>
                    Signatory Title
                    <input style={letterInput} disabled={letter?.status === 'FINALIZED'} value={letterForm.signatoryTitle} onChange={(e) => setLetterForm((f) => ({ ...f, signatoryTitle: e.target.value }))} />
                  </label>
                </div>

                <label style={{ ...letterFieldLabel, display: 'block', marginBottom: 14 }}>
                  Conditions of Admission (optional)
                  <textarea
                    style={{ ...letterInput, width: '100%', resize: 'vertical', display: 'block', marginTop: 4 }}
                    rows={2}
                    disabled={letter?.status === 'FINALIZED'}
                    value={letterForm.conditions}
                    onChange={(e) => setLetterForm((f) => ({ ...f, conditions: e.target.value }))}
                  />
                </label>

                {!application.canEdit && (
                  <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginBottom: 8 }}>
                    Read-only. Drafting or finalizing this letter happens at Admissions/Registry&apos;s own dashboard.
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {application.canEdit && letter?.status !== 'FINALIZED' && (
                    <button className="ih-btn ih-btn-secondary" disabled={letterPending} onClick={() => saveLetterDraft(false)}>
                      Save Draft
                    </button>
                  )}
                  {letter?.pdfUrl && (
                    <button className="ih-btn ih-btn-secondary" disabled={letterPending} onClick={previewLetter}>
                      {letter.status === 'FINALIZED' ? 'Download Letter' : 'Preview Letter'}
                    </button>
                  )}
                  {application.canEdit && letter && letter.status !== 'FINALIZED' && (
                    <button className="ih-btn ih-btn-primary" disabled={letterPending} onClick={finalizeLetter}>
                      Finalize Letter
                    </button>
                  )}
                  {application.canEdit && letter?.status === 'FINALIZED' && (
                    <button className="ih-btn ih-btn-danger" disabled={letterPending} onClick={() => saveLetterDraft(true)}>
                      Reopen for Correction
                    </button>
                  )}
                </div>
              </>
            )}
          </section>
        )}

        <section className="ih-card" style={{ padding: 20, marginBottom: 18 }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 16, color: 'var(--brand)' }}>Notes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {notesLoading && <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: 0 }}>Loading notes…</p>}
            {!notesLoading && notes.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: 0 }}>No notes yet.</p>
            )}
            {notes.map((n) => (
              <div key={n.id} style={noteRow}>
                <span
                  className={`ih-badge ${n.visibility === 'APPLICANT_VISIBLE' ? 'ih-b-success' : 'ih-b-warning'}`}
                  style={{ fontSize: 11, alignSelf: 'flex-start' }}
                >
                  {n.visibility === 'APPLICANT_VISIBLE' ? 'Applicant-Visible' : 'Internal'}
                </span>
                <p style={{ margin: '6px 0 4px', fontSize: 13.5 }}>{n.note}</p>
                <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>
                  {n.authorName} · {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note about this application…"
              rows={2}
              maxLength={4000}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border, #d8d8d8)', fontFamily: 'inherit', fontSize: 13.5, resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={noteVisibility} onChange={(e) => setNoteVisibility(e.target.value)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border, #d8d8d8)', fontSize: 13 }}>
                <option value="INTERNAL">Internal (staff only)</option>
                <option value="APPLICANT_VISIBLE">Applicant-Visible (shown on tracking page)</option>
              </select>
              <button className="ih-btn ih-btn-secondary" disabled={notePending || !noteText.trim()} onClick={addNote}>
                Add Note
              </button>
            </div>
          </div>
        </section>

        <Section title="Applicant">
          <Field label="Full Name" value={a.fullName} />
          <Field label="Preferred Name" value={a.preferredName} />
          <Field label="Date of Birth" value={a.dateOfBirth ? new Date(a.dateOfBirth).toLocaleDateString() : null} />
          <Field label="Gender" value={a.gender} />
          <Field label="Nationality" value={a.nationality} />
          <Field label="Country of Residence" value={a.countryOfResidence} />
          <Field label="Phone" value={a.phoneNumber} />
          <Field label="ID Number" value={a.idNumber} />
          <Field label="Address" value={a.residentialAddress} />
          <Field label="Applicant Category" value={a.applicantCategory} />
        </Section>

        <Section title="Contacts">
          <Field label="Guardian" value={a.guardianName ? `${a.guardianName} (${a.guardianRelationship}) — ${a.guardianPhone}` : null} />
          <Field label="Emergency Contact" value={a.emergencyName ? `${a.emergencyName} (${a.emergencyRelationship}) — ${a.emergencyPhone}` : null} />
        </Section>

        <Section title="Programme & Preferences">
          <Field label="Programme" value={a.programName} />
          <Field label="Pathway Preference" value={a.pathwayPreference} />
          <Field label="Specialization" value={a.specialization} />
          <Field label="Study Mode" value={a.studyMode === 'FULL_TIME' ? 'Full-time' : a.studyMode === 'PART_TIME' ? 'Part-time' : null} />
          <Field label="Study Session" value={a.studySession} />
          <Field label="Highest Education" value={a.highestEducation} />
          <Field label="Institution" value={a.institutionName} />
        </Section>

        <Section title="Academic Background & Placement Self-Assessment">
          <Field label="Islamic Studies Background" value={a.islamicStudiesBackground} />
          <Field label="Learning Goals" value={a.learningGoals} />
          <Field label="Accessibility / Support Needs" value={a.supportNeeds} />
        </Section>

        <section className="ih-card" style={{ padding: 20, marginBottom: 18 }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 16, color: 'var(--brand)' }}>Self-Reported Qur'an &amp; Arabic Levels</h2>
          <p style={{ margin: '0 0 14px', fontSize: 12.5, color: 'var(--ink-soft)' }}>
            The applicant's own account — a starting point for Placement, not the placement result itself.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            <Field label="Qur'an Reading" value={SELF_LEVEL_LABELS[a.quranReadingSelf]} />
            <Field label="Tajweed" value={SELF_LEVEL_LABELS[a.quranTajweedSelf]} />
            <Field label="Hifz" value={SELF_LEVEL_LABELS[a.quranHifzSelf]} />
            <Field label="Recitation" value={SELF_LEVEL_LABELS[a.quranRecitationSelf]} />
            <Field label="Arabic Reading" value={SELF_LEVEL_LABELS[a.arabicReadingSelf]} />
            <Field label="Arabic Writing" value={SELF_LEVEL_LABELS[a.arabicWritingSelf]} />
            <Field label="Arabic Grammar" value={SELF_LEVEL_LABELS[a.arabicGrammarSelf]} />
            <Field label="Arabic Vocabulary" value={SELF_LEVEL_LABELS[a.arabicVocabularySelf]} />
            <Field label="Arabic Conversation" value={SELF_LEVEL_LABELS[a.arabicConversationSelf]} />
            <Field label="Qur'anic Arabic" value={SELF_LEVEL_LABELS[a.quranicArabicSelf]} />
          </div>
        </section>

        {a.status === 'REJECTED' && a.declineReason && (
          <Section title="Decision">
            <Field label="Reason Given to Applicant" value={a.declineReason} />
          </Section>
        )}

        <Section title="Declaration">
          <Field label="Accepted" value={a.declarationAccepted ? 'Yes' : 'No'} />
          <Field label="Accepted At" value={a.declarationAcceptedAt ? new Date(a.declarationAcceptedAt).toLocaleString() : null} />
        </Section>

        <section className="ih-card" style={{ padding: 20, marginBottom: 18 }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 16, color: 'var(--brand)' }}>Documents</h2>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {DOCUMENT_FIELDS.map((doc) => (
              <button key={doc.field} className="ih-btn ih-btn-secondary" onClick={() => viewDocument(doc.field)}>
                {doc.label}
              </button>
            ))}
          </div>
        </section>

        <Section title="Payment">
          <Field label="Status" value={a.payment?.status} />
          <Field label="Amount" value={a.payment ? `${a.payment.currencyCode} ${a.payment.amount}` : null} />
          <Field label="Gateway" value={a.payment?.gateway} />
          <Field label="Reference" value={a.payment?.gatewayReference} />
        </Section>

        <section className="ih-card" style={{ padding: 20, marginBottom: 18 }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 16, color: 'var(--brand)' }}>History</h2>
          {historyLoading && <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: 0 }}>Loading…</p>}
          {!historyLoading && history.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: 0 }}>No recorded activity yet.</p>
          )}
          {!historyLoading && history.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {history.map((h) => (
                <div key={h.id} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border, #e2e2e2)', fontSize: 12.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                    <strong>{h.action.replace(/_/g, ' ')}</strong>
                    <span style={{ color: 'var(--ink-soft)' }}>{h.createdAt ? new Date(h.createdAt).toLocaleString() : ''}</span>
                  </div>
                  {(h.fromStatus || h.toStatus) && (
                    <div style={{ color: 'var(--ink-soft)', marginTop: 2 }}>
                      {h.fromStatus ? STATUS_LABELS[h.fromStatus] || h.fromStatus : '—'} → {h.toStatus ? STATUS_LABELS[h.toStatus] || h.toStatus : '—'}
                    </div>
                  )}
                  {h.note && <div style={{ marginTop: 2 }}>{h.note}</div>}
                  <div style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{h.actorName || 'System'}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

const page = { minHeight: '100vh', background: 'var(--paper)', padding: '40px 20px', fontFamily: 'var(--font-body)', color: 'var(--ink)' };
const container = { maxWidth: 1000, margin: '0 auto' };
const backLink = { color: 'var(--brand)', textDecoration: 'none', fontWeight: 700, fontSize: 14 };
const heading = { color: 'var(--ink)', fontFamily: 'var(--font-display)', fontSize: 24, margin: 0 };
const notFinalNotice = { padding: '8px 12px', borderRadius: 8, background: 'var(--warning-tint, rgba(200,150,20,0.12))', fontSize: 12.5, color: 'var(--ink)' };
const noteRow = { padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border, #e2e2e2)' };
const letterFieldLabel = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--ink-soft)', fontWeight: 700 };
const letterInput = { padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border, #d8d8d8)', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--ink)' };
