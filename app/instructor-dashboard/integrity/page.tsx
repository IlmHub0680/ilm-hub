'use client';
import { useEffect, useState } from 'react';

const fieldStyle = { border: '1px solid var(--border)', borderRadius: 6, padding: '9px 11px', fontSize: 13.5, background: 'var(--surface)', color: 'var(--ink)', width: '100%' };

const VIOLATION_TYPES = [
    'PLAGIARISM',
    'CHEATING',
    'UNAUTHORIZED_COLLABORATION',
    'FALSIFICATION',
    'IMPERSONATION',
    'ASSESSMENT_MISCONDUCT',
    'AI_MISUSE',
    'OTHER',
];

const STATUS_BADGE: Record<string, string> = {
    REPORTED: 'ih-b-warning',
    UNDER_REVIEW: 'ih-b-warning',
    RESOLVED: 'ih-b-success',
    DISMISSED: 'ih-b-neutral',
};

export default function InstructorIntegrityPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [cases, setCases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [resolveDraftId, setResolveDraftId] = useState<string | null>(null);
    const [sanction, setSanction] = useState('');

    const [form, setForm] = useState({ courseId: '', studentId: '', violationType: 'PLAGIARISM', severity: 'MINOR', description: '' });

    function loadCases() {
        fetch('/api/integrity-cases', { credentials: 'include' })
            .then((r) => r.json())
            .then((result) => setCases(result.cases || []))
            .catch(() => {});
    }

    useEffect(() => {
        Promise.all([
            fetch('/api/instructor/roster', { credentials: 'include' }).then((r) => r.json()),
        ])
            .then(([rosterResult]) => {
                setCourses(rosterResult.courses || []);
            })
            .finally(() => setLoading(false));
        loadCases();
    }, []);

    useEffect(() => {
        if (!form.courseId) {
            setStudents([]);
            return;
        }
        fetch(`/api/instructor/roster?courseId=${form.courseId}`, { credentials: 'include' })
            .then((r) => r.json())
            .then((result) => setStudents(result.students || []))
            .catch(() => setStudents([]));
    }, [form.courseId]);

    async function submitCase() {
        if (!form.studentId || !form.description.trim()) {
            setMessage('Select a student and describe what happened.');
            return;
        }
        setSubmitting(true);
        setMessage('');
        try {
            const res = await fetch('/api/integrity-cases', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const result = await res.json();
            if (res.ok) {
                setMessage('Case reported.');
                setForm({ courseId: '', studentId: '', violationType: 'PLAGIARISM', severity: 'MINOR', description: '' });
                loadCases();
            } else {
                setMessage(result.error || 'Failed to report this case.');
            }
        } catch {
            setMessage('An error occurred.');
        } finally {
            setSubmitting(false);
        }
    }

    async function resolveCase(id: string) {
        if (!sanction.trim()) {
            setMessage('State the sanction applied.');
            return;
        }
        setBusyId(id);
        try {
            const res = await fetch(`/api/integrity-cases/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'resolve', sanction }),
            });
            const result = await res.json();
            if (res.ok) {
                setResolveDraftId(null);
                setSanction('');
                loadCases();
            } else {
                setMessage(result.error || 'Failed to resolve this case.');
            }
        } catch {
            setMessage('An error occurred.');
        } finally {
            setBusyId(null);
        }
    }

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            <div className="ih-card">
                <h2 style={{ margin: '0 0 4px', fontSize: 17 }}>Report an Academic Integrity Case</h2>
                <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 0, marginBottom: 14 }}>
                    A first or minor case is typically yours to resolve directly (resubmission or a grade penalty); mark it Major if it should go to your Head of Department instead.
                </p>
                {message && <div className="ih-card" style={{ background: 'var(--brand-tint)', padding: '8px 12px', marginBottom: 12, fontSize: 13 }}>{message}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
                    <select style={fieldStyle} value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value, studentId: '' })}>
                        <option value="">Select course</option>
                        {courses.map((c) => (
                            <option key={c.id} value={c.id}>{c.courseCode} — {c.titleEn}</option>
                        ))}
                    </select>
                    <select style={fieldStyle} value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} disabled={!form.courseId}>
                        <option value="">Select student</option>
                        {students.map((s) => (
                            <option key={s.id} value={s.id}>{s.name} ({s.studentNo})</option>
                        ))}
                    </select>
                    <select style={fieldStyle} value={form.violationType} onChange={(e) => setForm({ ...form, violationType: e.target.value })}>
                        {VIOLATION_TYPES.map((v) => (
                            <option key={v} value={v}>{v.replace(/_/g, ' ')}</option>
                        ))}
                    </select>
                    <select style={fieldStyle} value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                        <option value="MINOR">Minor (first violation)</option>
                        <option value="MAJOR">Major (repeat or severe)</option>
                    </select>
                </div>
                <textarea style={{ ...fieldStyle, minHeight: 70, marginTop: 10 }} placeholder="What happened?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <button disabled={submitting} className="ih-btn ih-btn-primary" style={{ marginTop: 10 }} onClick={submitCase}>
                    {submitting ? 'Reporting…' : 'Report Case'}
                </button>
            </div>

            <div className="ih-card">
                <h2 style={{ margin: '0 0 14px', fontSize: 16 }}>Cases You've Reported</h2>
                {loading ? (
                    <p>Loading…</p>
                ) : cases.length === 0 ? (
                    <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No cases reported yet.</p>
                ) : (
                    <div style={{ display: 'grid', gap: 10 }}>
                        {cases.map((k) => (
                            <div key={k.id} className="ih-card" style={{ background: 'var(--surface-2, var(--bg))' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{k.student?.user?.name} <span className="mono" style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>({k.student?.studentNo})</span></div>
                                        <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{k.violationType.replace(/_/g, ' ')} · {k.severity}{k.course ? ` — ${k.course.titleEn}` : ''}</div>
                                    </div>
                                    <span className={`ih-badge ${STATUS_BADGE[k.status]}`}>{k.status.replace(/_/g, ' ')}</span>
                                </div>
                                {k.status === 'RESOLVED' && k.sanction && (
                                    <p style={{ fontSize: 12.5, margin: '8px 0 0', color: 'var(--ink-soft)' }}><strong>Sanction:</strong> {k.sanction}</p>
                                )}
                                {k.severity === 'MINOR' && (k.status === 'REPORTED' || k.status === 'UNDER_REVIEW') && (
                                    <div style={{ marginTop: 8 }}>
                                        {resolveDraftId === k.id ? (
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <input style={fieldStyle} placeholder="Sanction applied" value={sanction} onChange={(e) => setSanction(e.target.value)} />
                                                <button disabled={busyId === k.id} className="ih-btn ih-btn-primary" onClick={() => resolveCase(k.id)}>Save</button>
                                            </div>
                                        ) : (
                                            <button className="ih-btn ih-btn-secondary" onClick={() => setResolveDraftId(k.id)}>Resolve</button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
