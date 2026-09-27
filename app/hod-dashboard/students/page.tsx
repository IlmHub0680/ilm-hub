'use client';
import { Fragment, useEffect, useState } from 'react';

type StudentRow = {
    id: string;
    studentNo: string;
    name: string;
    email: string;
    level: number | null;
    admissionYear: number | null;
    status: string;
    program: string | null;
    latestGpa: number | null;
    standing: string | null;
    progression: Array<{ gpa: number; standing: string; creditsEarned: number; creditsAttempted: number; term: string | null }>;
};

const STANDING_BADGE: Record<string, string> = {
    GOOD_STANDING: 'ih-b-success',
    PROBATION: 'ih-b-warning',
    SUSPENDED: 'ih-b-danger',
};

export default function HODStudentsPage() {
    const [students, setStudents] = useState<StudentRow[]>([]);
    const [department, setDepartment] = useState<{ id: string; nameEn: string } | null>(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [q, setQ] = useState('');
    const [atRiskOnly, setAtRiskOnly] = useState(false);
    const [expanded, setExpanded] = useState<string>('');

    function load(query: string, atRisk: boolean) {
        setLoading(true);
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (atRisk) params.set('atRiskOnly', '1');
        const qs = params.toString();
        fetch(`/api/hod/students${qs ? `?${qs}` : ''}`, { credentials: 'include' })
            .then(async (res) => {
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || 'Failed to load department students.');
                setDepartment(result.department || null);
                setMessage(result.message || '');
                setStudents(result.students || []);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }

    useEffect(() => { load('', false); }, []);

    useEffect(() => {
        const handle = setTimeout(() => load(q, atRiskOnly), 350);
        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, atRiskOnly]);

    if (error) return <div className="ih-card" style={{ color: 'var(--danger)' }}>{error}</div>;
    if (!department && message && !loading) {
        return <div className="ih-card" style={{ background: 'var(--warning-tint)', color: 'var(--warning)', border: '1px solid var(--warning)' }}>{message}</div>;
    }

    return (
        <div style={{ display: 'grid', gap: 18 }}>
            <section className="ih-card">
                <h2 style={{ margin: '0 0 4px', fontSize: 16 }}>Department Student Roster &amp; Progression</h2>
                <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 0, marginBottom: 14 }}>
                    Every student in this department, with recent term-by-term GPA and standing.
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
                    <input
                        placeholder="Search by name, student number or email…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        style={{ flex: '1 1 320px', boxSizing: 'border-box', padding: '9px 11px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13.5, background: 'var(--surface)', color: 'var(--ink)' }}
                    />
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                        <input type="checkbox" checked={atRiskOnly} onChange={(e) => setAtRiskOnly(e.target.checked)} />
                        At-risk only
                    </label>
                </div>
                <div className="ih-tbl-wrap">
                    <table className="ih-tbl">
                        <thead><tr><th>Student</th><th>Programme</th><th>Level</th><th>GPA</th><th>Standing</th><th>Status</th><th></th></tr></thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>Loading…</td></tr>
                            ) : students.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>No students match.</td></tr>
                            ) : students.map((s) => (
                                <Fragment key={s.id}>
                                    <tr>
                                        <td><div style={{ fontWeight: 600 }}>{s.name}</div><div className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{s.studentNo}</div></td>
                                        <td>{s.program || '—'}</td>
                                        <td>{s.level ?? '—'}</td>
                                        <td>{s.latestGpa != null ? s.latestGpa.toFixed(2) : '—'}</td>
                                        <td>{s.standing ? <span className={`ih-badge ${STANDING_BADGE[s.standing] || 'ih-b-neutral'}`}>{s.standing.replace(/_/g, ' ')}</span> : '—'}</td>
                                        <td>{s.status}</td>
                                        <td>
                                            {s.progression.length > 0 && (
                                                <button onClick={() => setExpanded(expanded === s.id ? '' : s.id)} style={{ border: 'none', background: 'none', color: 'var(--brand)', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                                                    {expanded === s.id ? 'Hide' : 'History'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                    {expanded === s.id && (
                                        <tr>
                                            <td colSpan={7} style={{ background: 'var(--surface-2, var(--bg))', padding: '10px 14px' }}>
                                                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12.5 }}>
                                                    {s.progression.map((p, i) => (
                                                        <div key={i}>
                                                            <strong>{p.term || 'Term not recorded'}</strong>: GPA {p.gpa.toFixed(2)}, {p.creditsEarned}/{p.creditsAttempted} credits, {p.standing.replace(/_/g, ' ')}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
