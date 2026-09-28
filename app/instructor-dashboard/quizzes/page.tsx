'use client';
import { useEffect, useState, type CSSProperties } from 'react';
import { FeedbackBanner, fieldStyle } from '../_shared';

type Course = { id: string; title: string; code: string };

type Quiz = {
    id: string;
    title: string;
    description: string | null;
    timeLimitMinutes: number;
    startAt: string | null;
    endAt: string | null;
    maxAttempts: number;
    passingScore: number | null;
    showResultsImmediately: boolean;
    resultsReleased: boolean;
    isPublished: boolean;
    questionCount: number;
    attemptCount: number;
    pendingReviewCount: number;
};

type QuizOption = { id?: string; text: string; isCorrect: boolean };

type QuizQuestion = {
    id: string;
    type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'WRITTEN' | 'VIDEO';
    promptText: string;
    videoUrl: string | null;
    points: number;
    options: QuizOption[];
};

type AttemptSummary = {
    id: string;
    attemptNumber: number;
    status: string;
    score: number | null;
    maxScore: number;
    submittedAt: string | null;
    studentName: string;
    studentEmail: string;
    studentNo: string | null;
};

type AttemptQuestion = {
    id: string;
    type: string;
    promptText: string;
    videoUrl: string | null;
    points: number;
    options: { id: string; text: string; isCorrect: boolean }[];
    answer: { id: string; selectedOptionIds: string[]; answerText: string | null; score: number | null; feedback: string | null } | null;
};

const QUESTION_TYPE_LABELS: Record<string, string> = {
    SINGLE_CHOICE: 'Multiple Choice (one answer)',
    MULTIPLE_CHOICE: 'Multiple Choice (multiple answers)',
    WRITTEN: 'Written Answer',
    VIDEO: 'Video-Based Question',
};

export default function InstructorQuizzesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [courseId, setCourseId] = useState('');
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [newQuiz, setNewQuiz] = useState({
        title: '', description: '', timeLimitMinutes: 20, maxAttempts: 1,
        passingScore: '', showResultsImmediately: true, startAt: '', endAt: '',
    });
    const [creating, setCreating] = useState(false);

    const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [newQuestion, setNewQuestion] = useState<{ type: string; promptText: string; videoUrl: string; points: number; options: QuizOption[] }>({
        type: 'SINGLE_CHOICE', promptText: '', videoUrl: '', points: 1,
        options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
    });
    const [addingQuestion, setAddingQuestion] = useState(false);

    const [reviewingQuizId, setReviewingQuizId] = useState<string | null>(null);
    const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
    const [loadingAttempts, setLoadingAttempts] = useState(false);
    const [gradingAttempt, setGradingAttempt] = useState<{ id: string; questions: AttemptQuestion[]; studentName: string } | null>(null);
    const [gradeDrafts, setGradeDrafts] = useState<Record<string, { score: string; feedback: string }>>({});
    const [savingGrades, setSavingGrades] = useState(false);

    useEffect(() => { fetchQuizzes(); /* eslint-disable-next-line */ }, []);

    async function fetchQuizzes(cid?: string) {
        setLoading(true);
        try {
            const url = cid ? `/api/instructor/quizzes?courseId=${cid}` : '/api/instructor/quizzes';
            const res = await fetch(url);
            const data = await res.json();
            setCourses(data.courses || []);
            setCourseId(data.activeCourseId || '');
            setQuizzes(data.quizzes || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateQuiz() {
        if (!newQuiz.title || !newQuiz.timeLimitMinutes) {
            setMessage('Title and time limit are required.');
            return;
        }
        setCreating(true);
        setMessage('');
        try {
            const res = await fetch('/api/instructor/quizzes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newQuiz, courseId }),
            });
            const data = await res.json();
            if (!res.ok) { setMessage(data.error || 'Failed to create quiz.'); return; }
            setMessage('Quiz created — now add questions below.');
            setNewQuiz({ title: '', description: '', timeLimitMinutes: 20, maxAttempts: 1, passingScore: '', showResultsImmediately: true, startAt: '', endAt: '' });
            fetchQuizzes(courseId);
            openQuestionEditor(data.data.id);
        } catch (err) {
            setMessage('An error occurred while creating the quiz.');
        } finally {
            setCreating(false);
        }
    }

    async function handleTogglePublish(quiz: Quiz) {
        if (!quiz.isPublished && quiz.questionCount === 0) {
            setMessage('Add at least one question before publishing.');
            return;
        }
        const res = await fetch(`/api/instructor/quizzes/${quiz.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isPublished: !quiz.isPublished }),
        });
        const data = await res.json();
        if (!res.ok) { setMessage(data.error || 'Failed to update quiz.'); return; }
        fetchQuizzes(courseId);
    }

    async function handleReleaseResults(quiz: Quiz) {
        await fetch(`/api/instructor/quizzes/${quiz.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resultsReleased: true }),
        });
        fetchQuizzes(courseId);
    }

    async function openQuestionEditor(quizId: string) {
        setEditingQuizId(quizId);
        setReviewingQuizId(null);
        setLoadingQuestions(true);
        try {
            const res = await fetch(`/api/instructor/quizzes/${quizId}`);
            const data = await res.json();
            setQuestions(data.data?.questions || []);
        } finally {
            setLoadingQuestions(false);
        }
    }

    async function handleAddQuestion() {
        if (!editingQuizId || !newQuestion.promptText.trim()) {
            setMessage('Question text is required.');
            return;
        }
        setAddingQuestion(true);
        setMessage('');
        try {
            const res = await fetch(`/api/instructor/quizzes/${editingQuizId}/questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newQuestion),
            });
            const data = await res.json();
            if (!res.ok) { setMessage(data.error || 'Failed to add question.'); return; }
            setQuestions((prev) => [...prev, data.data]);
            setNewQuestion({ type: 'SINGLE_CHOICE', promptText: '', videoUrl: '', points: 1, options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }] });
            fetchQuizzes(courseId);
        } catch (err) {
            setMessage('An error occurred while adding the question.');
        } finally {
            setAddingQuestion(false);
        }
    }

    async function handleDeleteQuestion(qid: string) {
        if (!editingQuizId) return;
        const res = await fetch(`/api/instructor/quizzes/${editingQuizId}/questions/${qid}`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok) { setMessage(data.error || 'Failed to delete question.'); return; }
        setQuestions((prev) => prev.filter((q) => q.id !== qid));
        fetchQuizzes(courseId);
    }

    async function openReview(quizId: string) {
        setReviewingQuizId(quizId);
        setEditingQuizId(null);
        setLoadingAttempts(true);
        try {
            const res = await fetch(`/api/instructor/quizzes/${quizId}/attempts`);
            const data = await res.json();
            setAttempts(data.data || []);
        } finally {
            setLoadingAttempts(false);
        }
    }

    async function openGrading(attemptId: string, studentName: string) {
        const res = await fetch(`/api/instructor/quiz-attempts/${attemptId}`);
        const data = await res.json();
        if (!res.ok) { setMessage(data.error || 'Failed to load attempt.'); return; }
        setGradingAttempt({ id: attemptId, questions: data.data.questions, studentName });
        const drafts: Record<string, { score: string; feedback: string }> = {};
        for (const q of data.data.questions) {
            if (q.answer) drafts[q.answer.id] = { score: q.answer.score != null ? String(q.answer.score) : '', feedback: q.answer.feedback || '' };
        }
        setGradeDrafts(drafts);
    }

    async function handleSaveGrades() {
        if (!gradingAttempt) return;
        setSavingGrades(true);
        try {
            const grades = Object.entries(gradeDrafts).map(([answerId, d]) => ({ answerId, score: Number(d.score), feedback: d.feedback }));
            const res = await fetch(`/api/instructor/quiz-attempts/${gradingAttempt.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ grades }),
            });
            const data = await res.json();
            if (!res.ok) { setMessage(data.error || 'Failed to save grades.'); return; }
            setMessage(data.data.fullyGraded ? 'Grading complete for this attempt.' : 'Grades saved.');
            setGradingAttempt(null);
            if (reviewingQuizId) openReview(reviewingQuizId);
            fetchQuizzes(courseId);
        } finally {
            setSavingGrades(false);
        }
    }

    function updateOption(index: number, field: 'text' | 'isCorrect', value: string | boolean) {
        setNewQuestion((prev) => {
            const options = [...prev.options];
            if (field === 'isCorrect' && prev.type === 'SINGLE_CHOICE') {
                options.forEach((o, i) => { o.isCorrect = i === index ? (value as boolean) : false; });
            } else {
                options[index] = { ...options[index], [field]: value } as QuizOption;
            }
            return { ...prev, options };
        });
    }

    return (
        <div className="ih-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
                <div>
                    <h2 style={{ margin: '0 0 4px 0', fontSize: 20 }}>Quizzes</h2>
                    <p style={{ color: 'var(--ink-soft)', margin: 0, fontSize: 14 }}>Build timed quizzes, add questions, and grade written answers.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 350 }}>
                    <label style={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap' }}>Course:</label>
                    <select value={courseId} onChange={(e) => { setCourseId(e.target.value); fetchQuizzes(e.target.value); setEditingQuizId(null); setReviewingQuizId(null); }} style={{ ...fieldStyle, width: '100%' }}>
                        {courses.map((c) => <option key={c.id} value={c.id}>{c.code} - {c.title}</option>)}
                    </select>
                </div>
            </div>

            {message && <FeedbackBanner text={message} />}

            <div style={{ background: 'var(--brand-tint)', borderRadius: 8, padding: 20, marginBottom: 24 }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: 16 }}>Create New Quiz</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input type="text" placeholder="Quiz title" value={newQuiz.title} onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })} style={{ ...fieldStyle, padding: 10 }} />
                    <textarea placeholder="Description (optional)" value={newQuiz.description} onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })} style={{ ...fieldStyle, padding: 10, minHeight: 60 }} />
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <div>
                            <label style={labelStyle}>Time limit (minutes)</label>
                            <input type="number" min={1} value={newQuiz.timeLimitMinutes} onChange={(e) => setNewQuiz({ ...newQuiz, timeLimitMinutes: Number(e.target.value) })} style={{ ...fieldStyle, width: 110 }} />
                        </div>
                        <div>
                            <label style={labelStyle}>Max attempts</label>
                            <input type="number" min={1} value={newQuiz.maxAttempts} onChange={(e) => setNewQuiz({ ...newQuiz, maxAttempts: Number(e.target.value) })} style={{ ...fieldStyle, width: 110 }} />
                        </div>
                        <div>
                            <label style={labelStyle}>Passing score (optional)</label>
                            <input type="number" min={0} value={newQuiz.passingScore} onChange={(e) => setNewQuiz({ ...newQuiz, passingScore: e.target.value })} style={{ ...fieldStyle, width: 130 }} />
                        </div>
                        <div>
                            <label style={labelStyle}>Opens (optional)</label>
                            <input type="datetime-local" value={newQuiz.startAt} onChange={(e) => setNewQuiz({ ...newQuiz, startAt: e.target.value })} style={fieldStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Closes (optional)</label>
                            <input type="datetime-local" value={newQuiz.endAt} onChange={(e) => setNewQuiz({ ...newQuiz, endAt: e.target.value })} style={fieldStyle} />
                        </div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                        <input type="checkbox" checked={newQuiz.showResultsImmediately} onChange={(e) => setNewQuiz({ ...newQuiz, showResultsImmediately: e.target.checked })} />
                        Show results to students immediately after submission
                    </label>
                    <button onClick={handleCreateQuiz} disabled={creating} className="ih-btn ih-btn-primary" style={{ alignSelf: 'flex-start' }}>
                        {creating ? 'Creating…' : 'Create Quiz'}
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>Loading quizzes…</div>
            ) : (
                <div className="ih-tbl-wrap">
                    <table className="ih-tbl">
                        <thead>
                            <tr><th>Title</th><th>Questions</th><th>Attempts</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {quizzes.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>No quizzes created yet.</td></tr>
                            ) : (
                                quizzes.map((q) => (
                                    <tr key={q.id}>
                                        <td style={{ fontWeight: 500 }}>{q.title}</td>
                                        <td>{q.questionCount}</td>
                                        <td>{q.attemptCount}{q.pendingReviewCount > 0 && <span className="ih-badge ih-b-warning" style={{ marginLeft: 6 }}>{q.pendingReviewCount} to grade</span>}</td>
                                        <td><span className={q.isPublished ? 'ih-badge ih-b-success' : 'ih-badge ih-b-neutral'}>{q.isPublished ? 'Published' : 'Draft'}</span></td>
                                        <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            <button className="ih-btn ih-btn-ghost" onClick={() => openQuestionEditor(q.id)}>Questions</button>
                                            <button className="ih-btn ih-btn-ghost" onClick={() => openReview(q.id)}>Submissions</button>
                                            <button className="ih-btn ih-btn-ghost" onClick={() => handleTogglePublish(q)}>{q.isPublished ? 'Unpublish' : 'Publish'}</button>
                                            {!q.showResultsImmediately && !q.resultsReleased && q.attemptCount > 0 && (
                                                <button className="ih-btn ih-btn-ghost" onClick={() => handleReleaseResults(q)}>Release Results</button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {editingQuizId && (
                <div style={{ marginTop: 28, border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <h3 style={{ margin: 0, fontSize: 17 }}>Questions</h3>
                        <button className="ih-btn ih-btn-ghost" onClick={() => setEditingQuizId(null)}>Close</button>
                    </div>

                    {loadingQuestions ? <div style={{ color: 'var(--ink-soft)' }}>Loading…</div> : (
                        <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
                            {questions.length === 0 && <div style={{ color: 'var(--ink-soft)', fontSize: 13.5 }}>No questions yet — add one below.</div>}
                            {questions.map((q, i) => (
                                <div key={q.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                    <div>
                                        <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 700 }}>Q{i + 1} · {QUESTION_TYPE_LABELS[q.type]} · {q.points} pt(s)</div>
                                        <div style={{ fontSize: 14 }}>{q.promptText}</div>
                                        {(q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE') && (
                                            <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 13, color: 'var(--ink-soft)' }}>
                                                {q.options.map((o) => <li key={o.id} style={{ fontWeight: o.isCorrect ? 700 : 400 }}>{o.text}{o.isCorrect ? ' ✓' : ''}</li>)}
                                            </ul>
                                        )}
                                    </div>
                                    <button className="ih-btn ih-btn-ghost" onClick={() => handleDeleteQuestion(q.id)}>Remove</button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{ background: 'var(--paper)', border: '1px dashed var(--border)', borderRadius: 8, padding: 16 }}>
                        <h4 style={{ margin: '0 0 10px', fontSize: 14 }}>Add Question</h4>
                        <select value={newQuestion.type} onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value })} style={{ ...fieldStyle, marginBottom: 10 }}>
                            <option value="SINGLE_CHOICE">Multiple Choice (one answer)</option>
                            <option value="MULTIPLE_CHOICE">Multiple Choice (multiple answers)</option>
                            <option value="WRITTEN">Written Answer</option>
                            <option value="VIDEO">Video-Based Question</option>
                        </select>
                        <textarea placeholder="Question text" value={newQuestion.promptText} onChange={(e) => setNewQuestion({ ...newQuestion, promptText: e.target.value })} style={{ ...fieldStyle, minHeight: 60, marginBottom: 10 }} />
                        {newQuestion.type === 'VIDEO' && (
                            <input type="text" placeholder="Video URL" value={newQuestion.videoUrl} onChange={(e) => setNewQuestion({ ...newQuestion, videoUrl: e.target.value })} style={{ ...fieldStyle, marginBottom: 10 }} />
                        )}
                        <div style={{ marginBottom: 10 }}>
                            <label style={labelStyle}>Points</label>
                            <input type="number" min={0.5} step={0.5} value={newQuestion.points} onChange={(e) => setNewQuestion({ ...newQuestion, points: Number(e.target.value) })} style={{ ...fieldStyle, width: 100 }} />
                        </div>

                        {(newQuestion.type === 'SINGLE_CHOICE' || newQuestion.type === 'MULTIPLE_CHOICE') && (
                            <div style={{ display: 'grid', gap: 8, marginBottom: 10 }}>
                                <span style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>
                                    {newQuestion.type === 'SINGLE_CHOICE' ? 'Mark the one correct option:' : 'Mark every correct option:'}
                                </span>
                                {newQuestion.options.map((o, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <input
                                            type={newQuestion.type === 'SINGLE_CHOICE' ? 'radio' : 'checkbox'}
                                            checked={o.isCorrect}
                                            onChange={(e) => updateOption(i, 'isCorrect', e.target.checked)}
                                        />
                                        <input type="text" placeholder={`Option ${i + 1}`} value={o.text} onChange={(e) => updateOption(i, 'text', e.target.value)} style={{ ...fieldStyle, flex: 1 }} />
                                    </div>
                                ))}
                                <button type="button" className="ih-btn ih-btn-ghost" style={{ alignSelf: 'flex-start' }} onClick={() => setNewQuestion((prev) => ({ ...prev, options: [...prev.options, { text: '', isCorrect: false }] }))}>
                                    + Add option
                                </button>
                            </div>
                        )}

                        <button className="ih-btn ih-btn-primary" disabled={addingQuestion} onClick={handleAddQuestion}>
                            {addingQuestion ? 'Adding…' : 'Add Question'}
                        </button>
                    </div>
                </div>
            )}

            {reviewingQuizId && (
                <div style={{ marginTop: 28, border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <h3 style={{ margin: 0, fontSize: 17 }}>Submissions</h3>
                        <button className="ih-btn ih-btn-ghost" onClick={() => setReviewingQuizId(null)}>Close</button>
                    </div>

                    {loadingAttempts ? <div style={{ color: 'var(--ink-soft)' }}>Loading…</div> : attempts.length === 0 ? (
                        <div style={{ color: 'var(--ink-soft)', fontSize: 13.5 }}>No submitted attempts yet.</div>
                    ) : (
                        <div className="ih-tbl-wrap">
                            <table className="ih-tbl">
                                <thead><tr><th>Student</th><th>Attempt</th><th>Status</th><th>Score</th><th>Submitted</th><th></th></tr></thead>
                                <tbody>
                                    {attempts.map((a) => (
                                        <tr key={a.id}>
                                            <td>{a.studentName}<div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{a.studentNo || a.studentEmail}</div></td>
                                            <td>#{a.attemptNumber}</td>
                                            <td><span className={a.status === 'SUBMITTED' ? 'ih-badge ih-b-warning' : 'ih-badge ih-b-success'}>{a.status}</span></td>
                                            <td>{a.score != null ? `${a.score} / ${a.maxScore}` : '—'}</td>
                                            <td className="mono">{a.submittedAt ? new Date(a.submittedAt).toLocaleString() : '—'}</td>
                                            <td><button className="ih-btn ih-btn-ghost" onClick={() => openGrading(a.id, a.studentName)}>{a.status === 'SUBMITTED' ? 'Grade' : 'View'}</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {gradingAttempt && (
                <div style={{ marginTop: 28, border: '1px solid var(--border)', borderRadius: 10, padding: 20, background: 'var(--surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <h3 style={{ margin: 0, fontSize: 17 }}>Grading — {gradingAttempt.studentName}</h3>
                        <button className="ih-btn ih-btn-ghost" onClick={() => setGradingAttempt(null)}>Close</button>
                    </div>

                    <div style={{ display: 'grid', gap: 14 }}>
                        {gradingAttempt.questions.map((q, i) => (
                            <div key={q.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 14 }}>
                                <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 700 }}>Q{i + 1} · {q.points} pt(s)</div>
                                <div style={{ fontWeight: 600, marginBottom: 8 }}>{q.promptText}</div>

                                {(q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE') ? (
                                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5 }}>
                                        {q.options.map((o) => {
                                            const selected = q.answer?.selectedOptionIds.includes(o.id);
                                            return (
                                                <li key={o.id} style={{ color: o.isCorrect ? 'var(--brand)' : selected ? 'var(--danger)' : 'inherit', fontWeight: selected || o.isCorrect ? 700 : 400 }}>
                                                    {o.text} {o.isCorrect ? '(correct)' : ''} {selected ? '— selected' : ''}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                    <div>
                                        {q.videoUrl && <div style={{ marginBottom: 8, fontSize: 13 }}><a href={q.videoUrl} target="_blank" rel="noreferrer">Watch reference video ↗</a></div>}
                                        <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 6, padding: 10, fontSize: 14, whiteSpace: 'pre-wrap' }}>
                                            {q.answer?.answerText || <em style={{ color: 'var(--ink-soft)' }}>No answer submitted.</em>}
                                        </div>
                                        {q.answer && (
                                            <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                                                <div>
                                                    <label style={labelStyle}>Score (of {q.points})</label>
                                                    <input
                                                        type="number" min={0} max={q.points}
                                                        value={gradeDrafts[q.answer.id]?.score || ''}
                                                        onChange={(e) => setGradeDrafts((prev) => ({ ...prev, [q.answer!.id]: { ...(prev[q.answer!.id] || { score: '', feedback: '' }), score: e.target.value } }))}
                                                        style={{ ...fieldStyle, width: 90 }}
                                                    />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 200 }}>
                                                    <label style={labelStyle}>Feedback</label>
                                                    <input
                                                        type="text"
                                                        value={gradeDrafts[q.answer.id]?.feedback || ''}
                                                        onChange={(e) => setGradeDrafts((prev) => ({ ...prev, [q.answer!.id]: { ...(prev[q.answer!.id] || { score: '', feedback: '' }), feedback: e.target.value } }))}
                                                        style={fieldStyle}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <button className="ih-btn ih-btn-primary" style={{ marginTop: 16 }} disabled={savingGrades} onClick={handleSaveGrades}>
                        {savingGrades ? 'Saving…' : 'Save Grades'}
                    </button>
                </div>
            )}
        </div>
    );
}

const labelStyle: CSSProperties = { display: 'block', fontSize: 12.5, color: 'var(--ink-soft)', marginBottom: 4 };
