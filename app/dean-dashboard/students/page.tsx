'use client';
import { useEffect, useState } from 'react';

type StudentRow = {
    id: string;
    studentNo: string;
    name: string;
    email: string;
    level: number | null;
    admissionYear: number | null;
    status: string;
    department: string | null;
    program: string | null;
    latestGpa: number | null;
    standing: string | null;
};

const STANDING_BADGE: Record<string, string> = {
    GOOD_STANDING: 'ih-b-success',
    PROBATION: 'ih-b-warning',
    SUSPENDED: 'ih-b-danger',
};

export default function DeanStudentsPage() {
    const [students, setStudents] = useState<StudentRow[]>([]);
    const [faculty, setFaculty] = useState<{ id: string; nameEn: string } | null>(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [q, setQ] = useState('');

    function load(query: string) {
        setLoading(true);
        const url = query ? `/api/dean/students?q=${encodeURIComponent(query)}` : '/api/dean/students';
        fetch(url, { credentials: 'include' })
            .then(async (res) => {
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || 'Failed to load faculty students.');
                setFaculty(result.faculty || null);
                setMessage(result.message || '');
                setStudents(result.students || []);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }

    useEffect(() => { load(''); }, []);

    useEffect(() => {
        const handle = setTimeout(() => load(q), 350);
        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    if (error) return <div className="ih-card" style={{ color: 'var(--danger)' }}>{error}</div>;
    if (!faculty && message && !loading) {
        return <div className="ih-card" style={{ background: 'var(--warning-tint)', color: 'var(--warning)', border: '1px solid var(--warning)' }}>{message}</div>;
    }

    return (
        <div style={{ display: 'grid', gap: 18 }}>
            <section className="ih-card">
                <h2 style={{ margin: '0 0 4px', fontSize: 16 }}>Faculty Student Roster</h2>
                <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 0, marginBottom: 14 }}>
                    Every student in this faculty, with their most recently recorded GPA and standing.
                </p>
                <input
                    placeholder="Search by name, student number or email…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    style={{ width: '100%', maxWidth: 420, boxSizing: 'border-box', padding: '9px 11px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13.5, background: 'var(--surface)', color: 'var(--ink)', marginBottom: 14 }}
                />
                <div className="ih-tbl-wrap">
                    <table className="ih-tbl">
                        <thead><tr><th>Student</th><th>Programme</th><th>Level</th><th>GPA</th><th>Standing</th><th>Status</th></tr></thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>Loading…</td></tr>
                            ) : students.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>No students match.</td></tr>
                            ) : students.map((s) => (
                                <tr key={s.id}>
                                    <td><div style={{ fontWeight: 600 }}>{s.name}</div><div className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{s.studentNo}</div></td>
                                    <td>{s.program || '—'}</td>
                                    <td>{s.level ?? '—'}</td>
                                    <td>{s.latestGpa != null ? s.latestGpa.toFixed(2) : '—'}</td>
                                    <td>{s.standing ? <span className={`ih-badge ${STANDING_BADGE[s.standing] || 'ih-b-neutral'}`}>{s.standing.replace(/_/g, ' ')}</span> : '—'}</td>
                                    <td>{s.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
