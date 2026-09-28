'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RichTextEditor from '@/components/RichTextEditor';

// Full-page, single-purpose exam interface — deliberately outside the
// student dashboard shell (no sidebar, no other tabs) so a quiz in
// progress feels like a real examination rather than another
// dashboard card. Practical exam controls only: this cannot make
// cheating impossible (screenshots, a second device, etc. are outside
// what any browser page can prevent), but it does disable the
// context menu, blocks pasting into written answers, flags tab
// switches, warns before leaving, autosaves continuously, and — the
// control that actually matters — enforces the time limit on the
// server, not just in this countdown.

function formatTime(ms) {
  if (ms <= 0) return '00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function StudentQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params?.quizId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({}); // questionId -> { selectedOptionIds, answerText }
  const [remainingMs, setRemainingMs] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [warning, setWarning] = useState('');
  const [confirmingSubmit, setConfirmingSubmit] = useState(false);

  const activeTokenRef = useRef(null);
  const answersRef = useRef({});
  const submittedRef = useRef(false);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const startOrResume = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/student/quizzes/${quizId}/start`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Unable to start this quiz.');
        return;
      }

      activeTokenRef.current = data.data.activeToken;
      setAttempt(data.data);

      const seeded = {};
      for (const q of data.data.questions) {
        seeded[q.id] = {
          selectedOptionIds: q.answer?.selectedOptionIds || [],
          answerText: q.answer?.answerText || '',
        };
      }
      setAnswers(seeded);
      setRemainingMs(new Date(data.data.expiresAt).getTime() - Date.now());
    } catch (err) {
      setError('Unable to start this quiz.');
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    if (quizId) startOrResume();
  }, [quizId, startOrResume]);

  // --- Countdown ---
  useEffect(() => {
    if (!attempt || result) return;

    const interval = setInterval(() => {
      const remaining = new Date(attempt.expiresAt).getTime() - Date.now();
      setRemainingMs(remaining);

      if (remaining <= 0 && !submittedRef.current) {
        submittedRef.current = true;
        clearInterval(interval);
        handleSubmit('time_expired');
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, result]);

  // --- Autosave every 15s ---
  useEffect(() => {
    if (!attempt || result) return;

    const interval = setInterval(() => {
      saveAnswers();
    }, 15000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, result]);

  // --- Strict environment measures ---
  useEffect(() => {
    if (!attempt || result) return;

    const handleContextMenu = (e) => e.preventDefault();
    const handleCopy = (e) => e.preventDefault();
    const handlePaste = (e) => {
      e.preventDefault();
      flagActivity('copy_paste');
      setWarning('Pasting content into this quiz is not allowed. Please type your own answer.');
    };
    const handleVisibility = () => {
      if (document.hidden) {
        flagActivity('tab_switch');
        setWarning('Leaving this tab was recorded. Please stay on the quiz page until you submit.');
      }
    };
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, result]);

  async function flagActivity(type) {
    if (!attempt) return;
    try {
      await fetch(`/api/student/quiz-attempts/${attempt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
    } catch (err) {
      // Best-effort only.
    }
  }

  async function saveAnswers() {
    if (!attempt) return;
    const payload = Object.entries(answersRef.current).map(([questionId, a]) => ({
      questionId,
      selectedOptionIds: a.selectedOptionIds,
      answerText: a.answerText,
    }));

    try {
      const res = await fetch(`/api/student/quiz-attempts/${attempt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeToken: activeTokenRef.current, answers: payload }),
      });

      if (res.status === 409) {
        setWarning('This quiz is now open in another tab or window — answers here can no longer be saved.');
      } else if (res.status === 410) {
        if (!submittedRef.current) {
          submittedRef.current = true;
          handleSubmit('time_expired');
        }
      }
    } catch (err) {
      // Autosave failures are silent — the next tick tries again.
    }
  }

  async function handleSubmit(reason) {
    if (!attempt || submitting) return;
    setSubmitting(true);

    await saveAnswers();

    try {
      const res = await fetch(`/api/student/quiz-attempts/${attempt.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeToken: activeTokenRef.current, reason }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Unable to submit the quiz.');
        setSubmitting(false);
        return;
      }

      submittedRef.current = true;
      setResult(data.data);
    } catch (err) {
      setError('Unable to submit the quiz.');
    } finally {
      setSubmitting(false);
    }
  }

  function updateChoice(questionId, optionId, type, checked) {
    setAnswers((prev) => {
      const current = prev[questionId] || { selectedOptionIds: [], answerText: '' };
      let selectedOptionIds;

      if (type === 'SINGLE_CHOICE') {
        selectedOptionIds = checked ? [optionId] : [];
      } else {
        selectedOptionIds = checked
          ? [...current.selectedOptionIds, optionId]
          : current.selectedOptionIds.filter((id) => id !== optionId);
      }

      return { ...prev, [questionId]: { ...current, selectedOptionIds } };
    });
  }

  function updateText(questionId, answerText) {
    setAnswers((prev) => ({ ...prev, [questionId]: { ...(prev[questionId] || { selectedOptionIds: [] }), answerText } }));
  }

  if (loading) {
    return <div style={styles.centeredPage}>Loading your quiz…</div>;
  }

  if (error) {
    return (
      <div style={styles.centeredPage}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <p style={{ color: 'var(--danger)', fontWeight: 700, marginBottom: 12 }}>{error}</p>
          <button onClick={() => router.push('/login')} style={styles.secondaryButton}>
            Back to Portal
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div style={styles.centeredPage}>
        <div style={{ maxWidth: 520, width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
          <h1 style={{ margin: '0 0 8px', fontSize: 24 }}>Quiz Submitted</h1>
          {result.status === 'SUBMITTED' ? (
            <p style={{ color: 'var(--ink-soft)' }}>
              Your quiz has been submitted. Some answers require instructor review — your final score will
              appear once grading is complete.
            </p>
          ) : (
            <>
              <p style={{ color: 'var(--ink-soft)', marginBottom: 4 }}>Your score:</p>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--brand)' }}>
                {result.score != null ? `${result.score} / ${attempt?.maxScore ?? ''}` : 'Pending'}
              </div>
            </>
          )}
          <button onClick={() => router.push('/login')} style={{ ...styles.primaryButton, marginTop: 20 }}>
            Back to Portal
          </button>
        </div>
      </div>
    );
  }

  if (!attempt) return null;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Quiz in progress
          </div>
          <h1 style={{ margin: '2px 0 0', fontSize: 20 }}>Attempt #{attempt.attemptNumber}</h1>
        </div>
        <div style={styles.timer}>
          <span style={{ fontSize: 11, color: 'var(--ink-soft)', display: 'block' }}>Time Remaining</span>
          <span style={{ fontSize: 26, fontWeight: 800, color: remainingMs < 60000 ? 'var(--danger)' : 'var(--brand)' }}>
            {formatTime(remainingMs)}
          </span>
        </div>
      </div>

      {warning && (
        <div style={styles.warningBanner} onClick={() => setWarning('')}>
          ⚠ {warning}
        </div>
      )}

      <div style={styles.questionsList}>
        {attempt.questions.map((q, i) => (
          <div key={q.id} style={styles.questionCard}>
            <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 700, marginBottom: 6 }}>
              Question {i + 1} of {attempt.questions.length} · {q.points} point{q.points === 1 ? '' : 's'}
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>{q.promptText}</div>

            {q.type === 'VIDEO' && q.videoUrl && (
              <div style={{ marginBottom: 16 }}>
                <video src={q.videoUrl} controls style={{ width: '100%', borderRadius: 10, maxHeight: 360 }} />
              </div>
            )}

            {(q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE') && (
              <div style={{ display: 'grid', gap: 10 }}>
                {q.type === 'MULTIPLE_CHOICE' && (
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Select all that apply.</div>
                )}
                {q.options.map((o) => {
                  const selected = (answers[q.id]?.selectedOptionIds || []).includes(o.id);
                  return (
                    <label key={o.id} style={{ ...styles.optionRow, ...(selected ? styles.optionRowSelected : {}) }}>
                      <input
                        type={q.type === 'SINGLE_CHOICE' ? 'radio' : 'checkbox'}
                        name={`question-${q.id}`}
                        checked={selected}
                        onChange={(e) => updateChoice(q.id, o.id, q.type, e.target.checked)}
                      />
                      <span>{o.text}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {(q.type === 'WRITTEN' || q.type === 'VIDEO') && (
              <RichTextEditor
                value={answers[q.id]?.answerText || ''}
                onChange={(html) => updateText(q.id, html)}
                placeholder="Write your answer here…"
                minHeight={180}
              />
            )}
          </div>
        ))}
      </div>

      <div style={styles.footer}>
        {!confirmingSubmit ? (
          <button style={styles.primaryButton} onClick={() => setConfirmingSubmit(true)}>
            Submit Quiz
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 14 }}>Submit your answers now? This cannot be undone.</span>
            <button style={styles.primaryButton} disabled={submitting} onClick={() => handleSubmit('manual')}>
              {submitting ? 'Submitting…' : 'Confirm Submit'}
            </button>
            <button style={styles.secondaryButton} onClick={() => setConfirmingSubmit(false)}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--paper)',
    padding: '24px 20px 100px',
    userSelect: 'text',
  },
  centeredPage: {
    minHeight: '100vh',
    background: 'var(--paper)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--ink)',
    padding: 20,
  },
  header: {
    maxWidth: 760,
    margin: '0 auto 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: '16px 22px',
    position: 'sticky',
    top: 12,
    zIndex: 5,
  },
  timer: {
    textAlign: 'right',
  },
  warningBanner: {
    maxWidth: 760,
    margin: '0 auto 16px',
    background: 'var(--danger-tint)',
    color: 'var(--danger)',
    border: '1px solid var(--danger)',
    borderRadius: 10,
    padding: '10px 16px',
    fontSize: 13.5,
    cursor: 'pointer',
  },
  questionsList: {
    maxWidth: 760,
    margin: '0 auto',
    display: 'grid',
    gap: 18,
  },
  questionCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: 22,
  },
  optionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    border: '1px solid var(--border)',
    borderRadius: 9,
    cursor: 'pointer',
    fontSize: 14.5,
  },
  optionRowSelected: {
    borderColor: 'var(--brand)',
    background: 'var(--brand-tint)',
  },
  footer: {
    maxWidth: 760,
    margin: '28px auto 0',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  primaryButton: {
    border: 'none',
    borderRadius: 9,
    background: 'var(--brand)',
    color: 'var(--on-accent)',
    padding: '13px 26px',
    fontSize: 15,
    fontWeight: 800,
    cursor: 'pointer',
  },
  secondaryButton: {
    border: '1px solid var(--border)',
    borderRadius: 9,
    background: 'var(--surface)',
    color: 'var(--ink)',
    padding: '13px 20px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  },
};
