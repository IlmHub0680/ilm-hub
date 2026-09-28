'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type StudentDetail = {
    id: string;
    studentNo: string;
    name: string;
    email: string;
    status: string;
    level: number | null;
    admissionYear: number | null;
    studySession: string | null;
    faculty: string | null;
    department: string | null;
    programme: { name: string; level: string; code: string } | null;
};

type EnrollmentRow = {
    id: string;
    status: string;
    createdAt: string;
    course: { title: string; code: string; creditHours: number };
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

type TermRecordRow = {
    id: string;
    term: string | null;
    gpa: number;
    creditsAttempted: number;
    creditsEarned: number;
    standing: string;
};

type DetailResponse = {
    student: StudentDetail;
    credits: { earned: number; attempted: number };
    enrollments: EnrollmentRow[];
    grades: GradeRow[];
    termRecords: TermRecordRow[];
};

const STANDING_BADGE: Record<string, string> = {
    GOOD_STANDING: 'ih-b-success',
    DEANS_LIST: 'ih-b-success',
    PROBATION: 'ih-b-warning',
    SUSPENDED: 'ih-b-danger',
};

export default function RecordsStudentDetailPage() {
    const params = useParams<{ id: string }>();
    const [data, setData] = useState<DetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!params?.id) return;
        setLoading(true);
        setError('');
        fetch(`/api/records/students/${params.id}`, { credentials: 'include' })
            .then(async (res) => {
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || 'Failed to load student record.');
                setData(result);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [params?.id]);

    if (loading) return <div className="ih-card">Loading…</div>;
    if (error) {
        return (
            <div className="ih-card" style={{ background: 'var(--danger-tint)', color: 'var(--danger)' }}>
                {error}
            </div>
        );
    }
    if (!data) return null;

    const { student, credits, enrollments, grades, termRecords } = data;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="ih-card">
                <Link href="/academic-records-dashboard/students" style={{ fontSize: 13 }}>
                    ← Back to Student Records
                </Link>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
                    <div>
                        <h2 style={{ margin: '0 0 4px 0', fontSize: 20 }}>{student.name}</h2>
                        <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 14 }}>
                            {student.studentNo} · {student.email}
                        </p>
                    </div>
                    <span className="ih-badge ih-b-neutral">{student.status.replace(/_/g, ' ')}</span>
                </div>

                <div className="ih-stat-grid" style={{ marginTop: 20 }}>
                    <div className="ih-stat-tile">
                        <div className="n" style={{ fontSize: 16 }}>{student.programme?.name || 'Not assigned'}</div>
                        <div className="l">Programme{student.programme ? ` (${student.programme.level})` : ''}</div>
                    </div>
                    <div className="ih-stat-tile">
                        <div className="n">{student.level ?? '—'}</div>
                        <div className="l">Level</div>
                    </div>
                    <div className="ih-stat-tile">
                        <div className="n">{credits.earned} / {credits.attempted}</div>
                        <div className="l">Credits Earned / Attempted</div>
                    </div>
                </div>

                <p style={{ marginTop: 16, marginBottom: 0, fontSize: 13, color: 'var(--ink-soft)' }}>
                    {student.faculty || 'No faculty on record'} · {student.department || 'No department on record'}
                    {student.admissionYear ? ` · Admitted ${student.admissionYear}` : ''}
                </p>
            </div>

            <div className="ih-card">
                <h3 style={{ margin: '0 0 14px', fontSize: 17 }}>Academic Standing by Term</h3>
                {termRecords.length === 0 && <p style={{ color: 'var(--ink-soft)' }}>No term records yet.</p>}
                {termRecords.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {termRecords.map((t) => (
                            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: 12 }}>
                                <div>
                                    <strong>{t.term || 'Term not recorded'}</strong>
                                    <span style={{ marginLeft: 10, color: 'var(--ink-soft)', fontSize: 13 }}>
                                        GPA {t.gpa.toFixed(2)} · {t.creditsEarned}/{t.creditsAttempted} credits
                                    </span>
                                </div>
                                <span className={`ih-badge ${STANDING_BADGE[t.standing] || 'ih-b-neutral'}`}>
                                    {t.standing.replace(/_/g, ' ')}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="ih-card">
                <h3 style={{ margin: '0 0 14px', fontSize: 17 }}>Grades</h3>
                {grades.length === 0 && <p style={{ color: 'var(--ink-soft)' }}>No grades on record yet.</p>}
                {grades.length > 0 && (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '8px 6px' }}>Course</th>
                                    <th style={{ padding: '8px 6px' }}>Term</th>
                                    <th style={{ padding: '8px 6px' }}>Final</th>
                                    <th style={{ padding: '8px 6px' }}>Letter</th>
                                    <th style={{ padding: '8px 6px' }}>Status</th>
                                    <th style={{ padding: '8px 6px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {grades.map((g) => (
                                    <tr key={g.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '8px 6px' }}>
                                            {g.course.code} — {g.course.title}
                                        </td>
                                        <td style={{ padding: '8px 6px' }}>{g.term || '—'}</td>
                                        <td style={{ padding: '8px 6px', fontFamily: 'var(--font-mono)' }}>{g.final ?? '—'}</td>
                                        <td style={{ padding: '8px 6px' }}>{g.letter || '—'}</td>
                                        <td style={{ padding: '8px 6px' }}>
                                            <span className={`ih-badge ${g.status === 'FINALIZED' ? 'ih-b-success' : 'ih-b-neutral'}`}>
                                                {g.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '8px 6px' }}>
                                            <Link
                                                href={`/academic-records-dashboard/grade-corrections?gradeId=${g.id}`}
                                                style={{ fontSize: 12.5 }}
                                            >
                                                Correct
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="ih-card">
                <h3 style={{ margin: '0 0 14px', fontSize: 17 }}>Enrolment History</h3>
                {enrollments.length === 0 && <p style={{ color: 'var(--ink-soft)' }}>No enrolments on record yet.</p>}
                {enrollments.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {enrollments.map((e) => (
                            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: 12 }}>
                                <div>
                                    <strong>{e.course.code}</strong> — {e.course.title}
                                    <span style={{ marginLeft: 10, color: 'var(--ink-soft)', fontSize: 13 }}>
                                        {new Date(e.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <span className="ih-badge ih-b-neutral">{e.status.replace(/_/g, ' ')}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
