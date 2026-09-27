'use client';
import { useState } from 'react';
import { useExams } from '../context';

const fieldStyle = { border: '1px solid var(--border)', borderRadius: 6, padding: '9px 11px', fontSize: 13.5, background: 'var(--surface)', color: 'var(--ink)' };

export default function ExamSchedulePage() {
    const { data, exams, loadingExams, refetchExams, refetchOverview, message, setMessage } = useExams();
    const [scheduling, setScheduling] = useState(false);
    const [form, setForm] = useState({
        courseId: '',
        termId: '',
        examType: 'MIDTERM',
        scheduledAt: '',
        durationMin: '120',
        venue: '',
        maxScore: '100',
    });

    const handleSchedule = async () => {
        if (!form.courseId || !form.termId || !form.scheduledAt) {
            setMessage('Course, term, and a scheduled date are required.');
            return;
        }
        setScheduling(true);
        setMessage('');
        try {
            const res = await fetch('/api/examinations/exams', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    durationMin: Number(form.durationMin),
                    maxScore: Number(form.maxScore),
                }),
            });
            const result = await res.json();
            if (res.ok) {
                setMessage('Exam scheduled.');
                setForm({ ...form, scheduledAt: '', venue: '' });
                refetchExams();
                refetchOverview();
            } else {
                setMessage(result.error || 'Failed to schedule exam.');
            }
        } catch {
            setMessage('An error occurred.');
        } finally {
            setScheduling(false);
        }
    };

    return (
        <>
            {message && (
                <div className="ih-card" style={{ borderColor: 'var(--success)', color: 'var(--success)', marginBottom: 20, padding: '10px 14px' }}>
                    {message}
                </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: 20, alignItems: 'start' }}>
                <div className="ih-card">
                    <h3 style={{ margin: '0 0 16px', fontSize: 17 }}>Schedule an Exam</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} style={fieldStyle}>
                            <option value="">Select course</option>
                            {data?.subjects.courses.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.titleEn}</option>
                            ))}
                        </select>
                        <select value={form.termId} onChange={(e) => setForm({ ...form, termId: e.target.value })} style={fieldStyle}>
                            <option value="">Select term</option>
                            {data?.subjects.terms.map((t: any) => (
                                <option key={t.id} value={t.id}>{t.name}{t.isCurrent ? ' (current)' : ''}</option>
                            ))}
                        </select>
                        <select value={form.examType} onChange={(e) => setForm({ ...form, examType: e.target.value })} style={fieldStyle}>
                            <option value="QUIZ">Quiz</option>
                            <option value="MIDTERM">Midterm</option>
                            <option value="FINAL">Final</option>
                            <option value="MAKEUP">Makeup</option>
                        </select>
                        <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} style={fieldStyle} />
                        <input type="number" placeholder="Duration (minutes)" value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: e.target.value })} style={fieldStyle} />
                        <input type="text" placeholder="Venue (optional)" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} style={fieldStyle} />
                        <input type="number" placeholder="Max score" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: e.target.value })} style={fieldStyle} />
                        <button onClick={handleSchedule} disabled={scheduling} className="ih-btn ih-btn-primary">
                            {scheduling ? 'Scheduling…' : 'Schedule Exam'}
                        </button>
                    </div>
                </div>

                <div className="ih-card">
                    <h3 style={{ margin: '0 0 16px', fontSize: 17 }}>Upcoming & Recent Exams</h3>
                    {loadingExams && <p>Loading exams…</p>}
                    {!loadingExams && exams.length === 0 && <p style={{ color: 'var(--ink-soft)' }}>No exams scheduled yet.</p>}
                    {!loadingExams && exams.length > 0 && (
                        <div className="ih-tbl-wrap">
                            <table className="ih-tbl">
                                <thead>
                                    <tr>
                                        <th>Course</th>
                                        <th>Term</th>
                                        <th>Type</th>
                                        <th>When</th>
                                        <th>Venue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {exams.map((e: any) => (
                                        <tr key={e.id}>
                                            <td>{e.courseTitle}</td>
                                            <td>{e.termName}</td>
                                            <td>{e.examType}</td>
                                            <td className="mono">{new Date(e.scheduledAt).toLocaleString()}</td>
                                            <td>{e.venue || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
