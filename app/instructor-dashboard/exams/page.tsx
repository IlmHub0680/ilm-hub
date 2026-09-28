'use client';
import { useState, useEffect } from 'react';
import { FeedbackBanner, fieldStyle } from '../_shared';

type Term = { id: string; name: string };

type Exam = {
    id: string;
    examType: string;
    scheduledAt: string;
    durationMin: number;
    venue: string | null;
    maxScore: number;
    term: { id: string; name: string };
};

export default function ExamsPage() {
    const [examCourses, setExamCourses] = useState<{ id: string; title: string; code: string }[]>([]);
    const [examCourseId, setExamCourseId] = useState<string>("");
    const [terms, setTerms] = useState<Term[]>([]);
    const [exams, setExams] = useState<Exam[]>([]);
    const [loadingExams, setLoadingExams] = useState<boolean>(false);
    const [examMessage, setExamMessage] = useState<string>("");
    const [newExam, setNewExam] = useState({
        termId: '',
        examType: 'FINAL',
        scheduledAt: '',
        durationMin: 120,
        venue: '',
        maxScore: 100,
    });
    const [creatingExam, setCreatingExam] = useState<boolean>(false);
    const [editingExamId, setEditingExamId] = useState<string>("");
    const [editExam, setEditExam] = useState({
        termId: '',
        examType: 'FINAL',
        scheduledAt: '',
        durationMin: 120,
        venue: '',
        maxScore: 100,
    });
    const [savingExamId, setSavingExamId] = useState<string>("");
    const [deletingExamId, setDeletingExamId] = useState<string>("");

    useEffect(() => {
        fetchExamsData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchExamsData = async (courseId?: string) => {
        setLoadingExams(true);
        try {
            const url = courseId
                ? `/api/instructor/exams?courseId=${courseId}`
                : `/api/instructor/exams`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.courses) {
                setExamCourses(data.courses);
                setExamCourseId(data.activeCourseId || '');
                setTerms(data.terms || []);
                setExams(data.exams || []);
                if (data.terms && data.terms.length > 0 && !newExam.termId) {
                    setNewExam((prev) => ({ ...prev, termId: data.terms[0].id }));
                }
            }
        } catch (err) {
            console.error("Error loading exams", err);
        } finally {
            setLoadingExams(false);
        }
    };

    const handleExamCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCourseId = e.target.value;
        setExamCourseId(newCourseId);
        fetchExamsData(newCourseId);
    };

    const handleCreateExam = async () => {
        if (!newExam.termId || !newExam.scheduledAt) {
            setExamMessage('Term and scheduled date/time are required.');
            return;
        }

        setCreatingExam(true);
        setExamMessage("");

        try {
            const res = await fetch('/api/instructor/exams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: examCourseId,
                    termId: newExam.termId,
                    examType: newExam.examType,
                    scheduledAt: newExam.scheduledAt,
                    durationMin: Number(newExam.durationMin),
                    venue: newExam.venue,
                    maxScore: Number(newExam.maxScore),
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setExamMessage('Exam scheduled successfully!');
                setNewExam((prev) => ({ ...prev, scheduledAt: '', venue: '' }));
                fetchExamsData(examCourseId);
            } else {
                setExamMessage(data.error || 'Failed to schedule exam.');
            }
        } catch (err) {
            setExamMessage('An error occurred while scheduling the exam.');
        } finally {
            setCreatingExam(false);
        }
    };

    function toLocalInputValue(iso: string) {
        const d = new Date(iso);
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    function startEditExam(exam: Exam) {
        setEditingExamId(exam.id);
        setEditExam({
            termId: exam.term.id,
            examType: exam.examType,
            scheduledAt: toLocalInputValue(exam.scheduledAt),
            durationMin: exam.durationMin,
            venue: exam.venue || '',
            maxScore: exam.maxScore,
        });
        setExamMessage('');
    }

    async function handleSaveExam(examId: string) {
        setSavingExamId(examId);
        setExamMessage('');

        try {
            const res = await fetch(`/api/instructor/exams/${examId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    termId: editExam.termId,
                    examType: editExam.examType,
                    scheduledAt: editExam.scheduledAt,
                    durationMin: Number(editExam.durationMin),
                    venue: editExam.venue,
                    maxScore: Number(editExam.maxScore),
                }),
            });
            const data = await res.json();

            if (res.ok) {
                setExamMessage('Exam updated successfully.');
                setEditingExamId('');
                fetchExamsData(examCourseId);
            } else {
                setExamMessage(data.error || 'Failed to update exam.');
            }
        } catch {
            setExamMessage('An error occurred while updating the exam.');
        } finally {
            setSavingExamId('');
        }
    }

    async function handleDeleteExam(examId: string) {
        setDeletingExamId(examId);
        setExamMessage('');

        try {
            const res = await fetch(`/api/instructor/exams/${examId}`, { method: 'DELETE' });
            const data = await res.json();

            if (res.ok) {
                setExamMessage('Exam removed.');
                fetchExamsData(examCourseId);
            } else {
                setExamMessage(data.error || 'Failed to remove exam.');
            }
        } catch {
            setExamMessage('An error occurred while removing the exam.');
        } finally {
            setDeletingExamId('');
        }
    }

    return (
        <div className="ih-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
                <div>
                    <h2 style={{ margin: '0 0 4px 0', fontSize: 20 }}>Exams</h2>
                    <p style={{ color: 'var(--ink-soft)', margin: 0, fontSize: 14 }}>Schedule exams for your course.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 350 }}>
                    <label style={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap' }}>Course:</label>
                    <select value={examCourseId} onChange={handleExamCourseChange} style={{ ...fieldStyle, width: '100%' }}>
                        {examCourses.map((course) => (
                            <option key={course.id} value={course.id}>{course.code} - {course.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {examMessage && <FeedbackBanner text={examMessage} />}

            <div style={{ background: 'var(--brand-tint)', borderRadius: 8, padding: 20, marginBottom: 24 }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: 16 }}>Schedule New Exam</h3>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Term</label>
                        <select value={newExam.termId} onChange={(e) => setNewExam({ ...newExam, termId: e.target.value })} style={fieldStyle}>
                            {terms.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Type</label>
                        <select value={newExam.examType} onChange={(e) => setNewExam({ ...newExam, examType: e.target.value })} style={fieldStyle}>
                            <option value="QUIZ">Quiz</option>
                            <option value="MIDTERM">Midterm</option>
                            <option value="FINAL">Final</option>
                            <option value="MAKEUP">Makeup</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Date & time</label>
                        <input type="datetime-local" value={newExam.scheduledAt} onChange={(e) => setNewExam({ ...newExam, scheduledAt: e.target.value })} style={fieldStyle} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Duration (min)</label>
                        <input type="number" value={newExam.durationMin} onChange={(e) => setNewExam({ ...newExam, durationMin: Number(e.target.value) })} style={{ ...fieldStyle, width: 90 }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Venue</label>
                        <input type="text" value={newExam.venue} onChange={(e) => setNewExam({ ...newExam, venue: e.target.value })} style={fieldStyle} />
                    </div>
                    <button onClick={handleCreateExam} disabled={creatingExam} className="ih-btn ih-btn-primary">
                        {creatingExam ? 'Scheduling…' : 'Schedule Exam'}
                    </button>
                </div>
            </div>

            {loadingExams ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>Loading exams…</div>
            ) : (
                <div className="ih-tbl-wrap">
                    <table className="ih-tbl">
                        <thead>
                            <tr><th>Term</th><th>Type</th><th>Date & Time</th><th>Duration</th><th>Venue</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {exams.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>No exams scheduled yet.</td></tr>
                            ) : (
                                exams.map((e) => (
                                    editingExamId === e.id ? (
                                        <tr key={e.id}>
                                            <td colSpan={6}>
                                                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', padding: '10px 0' }}>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Term</label>
                                                        <select value={editExam.termId} onChange={(ev) => setEditExam({ ...editExam, termId: ev.target.value })} style={fieldStyle}>
                                                            {terms.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Type</label>
                                                        <select value={editExam.examType} onChange={(ev) => setEditExam({ ...editExam, examType: ev.target.value })} style={fieldStyle}>
                                                            <option value="QUIZ">Quiz</option>
                                                            <option value="MIDTERM">Midterm</option>
                                                            <option value="FINAL">Final</option>
                                                            <option value="MAKEUP">Makeup</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Date & time</label>
                                                        <input type="datetime-local" value={editExam.scheduledAt} onChange={(ev) => setEditExam({ ...editExam, scheduledAt: ev.target.value })} style={fieldStyle} />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Duration (min)</label>
                                                        <input type="number" value={editExam.durationMin} onChange={(ev) => setEditExam({ ...editExam, durationMin: Number(ev.target.value) })} style={{ ...fieldStyle, width: 90 }} />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Venue</label>
                                                        <input type="text" value={editExam.venue} onChange={(ev) => setEditExam({ ...editExam, venue: ev.target.value })} style={fieldStyle} />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Max score</label>
                                                        <input type="number" value={editExam.maxScore} onChange={(ev) => setEditExam({ ...editExam, maxScore: Number(ev.target.value) })} style={{ ...fieldStyle, width: 90 }} />
                                                    </div>
                                                    <button onClick={() => handleSaveExam(e.id)} disabled={savingExamId === e.id} className="ih-btn ih-btn-primary">
                                                        {savingExamId === e.id ? 'Saving…' : 'Save'}
                                                    </button>
                                                    <button onClick={() => setEditingExamId('')} className="ih-btn ih-btn-secondary">
                                                        Cancel
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr key={e.id}>
                                            <td>{e.term.name}</td>
                                            <td>{e.examType}</td>
                                            <td className="mono">{new Date(e.scheduledAt).toLocaleString()}</td>
                                            <td>{e.durationMin} min</td>
                                            <td>{e.venue || '—'}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                    <button onClick={() => startEditExam(e)} className="ih-btn ih-btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteExam(e.id)}
                                                        disabled={deletingExamId === e.id}
                                                        className="ih-btn ih-btn-danger"
                                                        style={{ padding: '6px 12px', fontSize: 12 }}
                                                    >
                                                        {deletingExamId === e.id ? 'Removing…' : 'Delete'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
