'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type StudentRow = {
    id: string;
    studentNo: string;
    name: string;
    email: string;
    programme: string | null;
};

type GradeRow = {
    id: string;
    course: { title: string; code: string; creditHours: number };
    term: string | null;
    quiz1: number | null;
    quiz2: number | null;
    assignment: number | null;
    midterm: number | null;
    final: number | null;
    practical: number | null;
    letter: string | null;
    status: string;
    finalizedAt: string | null;
};

type Correction = {
    id: string;
    fieldChanged: string;
    originalValue: number | null;
    correctedValue: number | null;
    reason: string;
    correctedByName: string;
    correctedAt: string;
};

const CORRECTABLE_FIELDS = ['quiz1', 'quiz2', 'assignment', 'midterm', 'final', 'practical'] as const;

const FIELD_LABEL: Record<string, string> = {
    quiz1: 'Quiz 1',
    quiz2: 'Quiz 2',
    assignment: 'Assignment',
    midterm: 'Midterm',
    final: 'Final',
    practical: 'Practical',
};

function GradeCorrectionsInner() {
    const searchParams = useSearchParams();
    const initialGradeId = searchParams.get('gradeId') || '';

    const [query, setQuery] = useState('');
    const [students, setStudents] = useState<StudentRow[]>([]);
    const [searching, setSearching] = useState(false);

    const [selectedStudent, setSelectedStudent] = useState<StudentRow | null>(null);
    const [studentGrades, setStudentGrades] = useState<GradeRow[]>([]);
    const [loadingGrades, setLoadingGrades] = useState(false);

    const [selectedGrade, setSelectedGrade] = useState<GradeRow | null>(null);
    const [directGradeId, setDirectGradeId] = useState(initialGradeId);
    const [corrections, setCorrections] = useState<Correction[]>([]);
    const [loadingCorrections, setLoadingCorrections] = useState(false);

    const [fieldChanged, setFieldChanged] = useState<string>('final');
    const [correctedValue, setCorrectedValue] = useState('');
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [messageIsError, setMessageIsError] = useState(false);

    // Institution-wide student search, same endpoint the Student
    // Records browsing page uses.
    useEffect(() => {
        if (!query.trim()) {
            setStudents([]);
            return;
        }
        const controller = new AbortController();
        setSearching(true);
        const handle = setTimeout(() => {
            fetch(`/api/records/students?q=${encodeURIComponent(query.trim())}`, {
                credentials: 'include',
                signal: controller.signal,
            })
                .then((r) => r.json())
                .then((result) => setStudents(result.students || []))
                .catch(() => {})
                .finally(() => setSearching(false));
        }, 250);
        return () => {
            clearTimeout(handle);
            controller.abort();
        };
    }, [query]);

    const loadCorrections = (gradeId: string) => {
        setLoadingCorrections(true);
        fetch(`/api/records/grade-corrections?gradeId=${gradeId}`, { credentials: 'include' })
            .then(async (res) => {
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || 'Failed to load correction history.');
                setCorrections(result.corrections || []);
            })
            .catch((err) => setMessage(err.message))
            .finally(() => setLoadingCorrections(false));
    };

    // Direct grade-id deep link (e.g. from the student detail page's
    // "Correct" link) resolves straight to that grade without needing
    // the student search step.
    useEffect(() => {
        if (!initialGradeId) return;
        loadCorrections(initialGradeId);
    }, [initialGradeId]);

    const pickStudent = (s: StudentRow) => {
        setSelectedStudent(s);
        setSelectedGrade(null);
        setCorrections([]);
        setStudents([]);
        setQuery('');
        setLoadingGrades(true);
        fetch(`/api/records/students/${s.id}`, { credentials: 'include' })
            .then(async (res) => {
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || 'Failed to load student grades.');
                setStudentGrades(result.grades || []);
            })
            .catch((err) => setMessage(err.message))
            .finally(() => setLoadingGrades(false));
    };

    const pickGrade = (g: GradeRow) => {
        setSelectedGrade(g);
        setFieldChanged('final');
        setCorrectedValue('');
        setReason('');
        setMessage('');
        loadCorrections(g.id);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const gradeId = selectedGrade?.id || directGradeId.trim();
        if (!gradeId) {
            setMessage('Find a grade to correct first.');
            setMessageIsError(true);
            return;
        }
        if (!reason.trim()) {
            setMessage('A reason is required for every grade correction.');
            setMessageIsError(true);
            return;
        }

        setSubmitting(true);
        setMessage('');
        try {
            const res = await fetch('/api/records/grade-corrections', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gradeId, fieldChanged, correctedValue, reason: reason.trim() }),
            });
            const result = await res.json();
            if (res.ok) {
                setMessage('Correction applied.');
                setMessageIsError(false);
                setCorrectedValue('');
                setReason('');
                loadCorrections(gradeId);
                if (selectedStudent) pickStudent(selectedStudent);
            } else {
                setMessage(result.error || 'Failed to apply correction.');
                setMessageIsError(true);
            }
        } catch {
            setMessage('An error occurred.');
            setMessageIsError(true);
        } finally {
            setSubmitting(false);
        }
    };

    const activeGradeId = selectedGrade?.id || (!selectedStudent ? directGradeId.trim() : '');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="ih-card">
                <h2 style={{ margin: '0 0 4px 0', fontSize: 20 }}>Grade Corrections</h2>
                <p style={{ color: 'var(--ink-soft)', margin: 0, fontSize: 14 }}>
                    A controlled, logged way to change an already-recorded grade. Every correction
                    keeps the original value, the corrected value, who made the change, and why —
                    this is the only way to change a grade an instructor has already finalized.
                </p>
            </div>

            {message && (
                <div
                    className="ih-card"
                    style={{
                        padding: '12px 14px',
                        background: messageIsError ? 'var(--danger-tint)' : 'var(--success-tint)',
                        color: messageIsError ? 'var(--danger)' : 'var(--success)',
                    }}
                >
                    {message}
                </div>
            )}

            <div className="ih-card">
                <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>1. Find a grade</h3>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
                    <input
                        type="text"
                        value={directGradeId}
                        onChange={(e) => setDirectGradeId(e.target.value)}
                        placeholder="Or paste a grade ID directly…"
                        style={{ flex: '1 1 260px', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13.5 }}
                    />
                    {directGradeId.trim() && !selectedStudent && (
                        <button type="button" className="ih-btn ih-btn-ghost" onClick={() => loadCorrections(directGradeId.trim())}>
                            Load History
                        </button>
                    )}
                </div>

                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="…or search a student by name, student no., or programme"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, boxSizing: 'border-box' }}
                />

                {searching && <p style={{ color: 'var(--ink-soft)', marginTop: 10 }}>Searching…</p>}

                {students.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                        {students.map((s) => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => pickStudent(s)}
                                className="ih-btn ih-btn-ghost"
                                style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                            >
                                {s.name} ({s.studentNo}) {s.programme ? `— ${s.programme}` : ''}
                            </button>
                        ))}
                    </div>
                )}

                {selectedStudent && (
                    <div style={{ marginTop: 14 }}>
                        <p style={{ fontSize: 13.5, marginBottom: 8 }}>
                            <strong>{selectedStudent.name}</strong> ({selectedStudent.studentNo}) —{' '}
                            <Link href={`/academic-records-dashboard/students/${selectedStudent.id}`}>View full record</Link>
                        </p>
                        {loadingGrades && <p style={{ color: 'var(--ink-soft)' }}>Loading grades…</p>}
                        {!loadingGrades && studentGrades.length === 0 && (
                            <p style={{ color: 'var(--ink-soft)' }}>No grades on record for this student.</p>
                        )}
                        {!loadingGrades && studentGrades.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {studentGrades.map((g) => (
                                    <button
                                        key={g.id}
                                        type="button"
                                        onClick={() => pickGrade(g)}
                                        className="ih-btn ih-btn-ghost"
                                        style={{
                                            textAlign: 'left',
                                            justifyContent: 'space-between',
                                            display: 'flex',
                                            border: selectedGrade?.id === g.id ? '1px solid var(--brand)' : undefined,
                                        }}
                                    >
                                        <span>{g.course.code} — {g.course.title} {g.term ? `(${g.term})` : ''}</span>
                                        <span className={`ih-badge ${g.status === 'FINALIZED' ? 'ih-b-success' : 'ih-b-neutral'}`}>
                                            {g.status}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {activeGradeId && (
                <div className="ih-card">
                    <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>2. Correction history</h3>
                    {loadingCorrections && <p style={{ color: 'var(--ink-soft)' }}>Loading…</p>}
                    {!loadingCorrections && corrections.length === 0 && (
                        <p style={{ color: 'var(--ink-soft)' }}>No corrections recorded for this grade yet.</p>
                    )}
                    {!loadingCorrections && corrections.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {corrections.map((c) => (
                                <div key={c.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: 12, fontSize: 13.5 }}>
                                    <div>
                                        <strong>{FIELD_LABEL[c.fieldChanged] || c.fieldChanged}</strong>:{' '}
                                        {c.originalValue ?? '—'} → {c.correctedValue ?? '—'}
                                    </div>
                                    <div style={{ color: 'var(--ink-soft)', marginTop: 4 }}>
                                        {c.reason} — {c.correctedByName}, {new Date(c.correctedAt).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeGradeId && (
                <div className="ih-card">
                    <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>3. Apply a correction</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
                        <label style={{ fontSize: 13.5 }}>
                            Field
                            <select
                                value={fieldChanged}
                                onChange={(e) => setFieldChanged(e.target.value)}
                                style={{ display: 'block', width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)' }}
                            >
                                {CORRECTABLE_FIELDS.map((f) => (
                                    <option key={f} value={f}>{FIELD_LABEL[f]}</option>
                                ))}
                            </select>
                        </label>

                        <label style={{ fontSize: 13.5 }}>
                            Corrected value (0–100)
                            <input
                                type="number"
                                min={0}
                                max={100}
                                value={correctedValue}
                                onChange={(e) => setCorrectedValue(e.target.value)}
                                style={{ display: 'block', width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', boxSizing: 'border-box' }}
                            />
                        </label>

                        <label style={{ fontSize: 13.5 }}>
                            Reason (required)
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={3}
                                style={{ display: 'block', width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', boxSizing: 'border-box', fontFamily: 'inherit' }}
                            />
                        </label>

                        <button type="submit" disabled={submitting} className="ih-btn ih-btn-gold" style={{ alignSelf: 'flex-start' }}>
                            {submitting ? 'Submitting…' : 'Apply Correction'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default function GradeCorrectionsPage() {
    return (
        <Suspense fallback={<div className="ih-card">Loading…</div>}>
            <GradeCorrectionsInner />
        </Suspense>
    );
}
