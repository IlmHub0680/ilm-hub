'use client';
import { useState } from 'react';
import { useHOD } from '../context';

export default function HODInstructorsPage() {
    const { data, loading, error, refetch } = useHOD();
    const [assigning, setAssigning] = useState<string>('');
    const [selectedInstructor, setSelectedInstructor] = useState<Record<string, string>>({});
    const [selectedTerm, setSelectedTerm] = useState<Record<string, string>>({});
    const [selectedRole, setSelectedRole] = useState<Record<string, string>>({});
    const [message, setMessage] = useState('');

    const assign = async (courseId: string) => {
        const instructorUserId = selectedInstructor[courseId];
        if (!instructorUserId) return;
        setAssigning(courseId);
        setMessage('');
        try {
            const res = await fetch('/api/hod/instructor-assignments', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId,
                    instructorUserId,
                    termId: selectedTerm[courseId] || undefined,
                    role: selectedRole[courseId] || undefined,
                }),
            });
            const result = await res.json();
            if (!res.ok || !result.success) throw new Error(result.error || 'Failed to assign.');
            refetch();
        } catch (err: any) {
            setMessage(err.message);
        } finally {
            setAssigning('');
        }
    };

    const unassign = async (courseId: string, instructorUserId: string) => {
        setAssigning(courseId);
        try {
            await fetch(`/api/hod/instructor-assignments?courseId=${courseId}&instructorUserId=${instructorUserId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            refetch();
        } finally {
            setAssigning('');
        }
    };

    // Model 21 -- end an assignment without deleting the historical
    // teaching record, or bring a previously withdrawn one back.
    const setAssignmentStatus = async (courseId: string, instructorUserId: string, status: 'WITHDRAWN' | 'ACTIVE') => {
        setAssigning(courseId);
        setMessage('');
        try {
            const res = await fetch('/api/hod/instructor-assignments', {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId, instructorUserId, status }),
            });
            const result = await res.json();
            if (!res.ok || !result.success) throw new Error(result.error || 'Failed to update assignment.');
            refetch();
        } catch (err: any) {
            setMessage(err.message);
        } finally {
            setAssigning('');
        }
    };

    if (loading) return <div className="ih-card">Loading…</div>;
    if (error) return <div className="ih-card" style={{ color: 'var(--danger)' }}>{error}</div>;
    // data.message only appears when the API explicitly refused (a
    // non-admin with no HOD assignment) -- an admin with no department
    // of their own still gets real institution-wide course/instructor
    // data back (see app/api/hod/portal/route.ts), so only the
    // genuinely-unassigned case is blocked here. Assigning an
    // instructor still requires a real department headship
    // (app/api/hod/instructor-assignments has no admin bypass, by
    // design -- it's a HOD action, not a read), so that action simply
    // fails with its own error message for an admin, same as any other
    // restricted action.
    if (!data?.department && data?.message) {
        return <div className="ih-card" style={{ background: 'var(--warning-tint)', color: 'var(--warning)', border: '1px solid var(--warning)' }}>{data.message}</div>;
    }

    const courses = data.courses || [];
    const instructors = data.instructors || [];
    const performance = data.performance || {};
    const terms = data.terms || [];

    const ROLE_LABELS: Record<string, string> = { LEAD: 'Lead', CO_INSTRUCTOR: 'Co-Instructor', TEACHING_ASSISTANT: 'Teaching Assistant' };

    return (
        <div style={{ display: 'grid', gap: 18 }}>
            {message && <div className="ih-card" style={{ padding: '10px 14px', fontSize: 13.5 }}>{message}</div>}

            <section className="ih-card">
                <h2 style={{ margin: '0 0 12px', fontSize: 16 }}>Department Performance</h2>
                <div className="ih-stat-grid">
                    <div className="ih-stat-tile"><div className="n">{performance.studentCount ?? 0}</div><div className="l">Students</div></div>
                    <div className="ih-stat-tile" style={{ borderColor: 'var(--danger)' }}><div className="n">{performance.atRiskCount ?? 0}</div><div className="l">At-Risk (Probation/Suspended)</div></div>
                    <div className="ih-stat-tile accent"><div className="n">{performance.avgGpa != null ? performance.avgGpa.toFixed(2) : '—'}</div><div className="l">Average Recorded GPA</div></div>
                </div>
            </section>

            <section className="ih-card">
                <h2 style={{ margin: '0 0 12px', fontSize: 16 }}>Instructor Roster</h2>
                {instructors.length === 0 ? (
                    <p style={{ color: 'var(--ink-soft)', fontSize: 13.5, margin: 0 }}>No academic staff in this department yet.</p>
                ) : (
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 6 }}>
                        {instructors.map((i: any) => (
                            <li key={i.id} style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 8 }}>
                                <strong>{i.user.name}</strong> — {i.position.nameEn}{i.specialization ? ` · ${i.specialization}` : ''}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="ih-card">
                <h2 style={{ margin: '0 0 14px', fontSize: 16 }}>Department Courses &amp; Instructor Assignment</h2>
                <div className="ih-tbl-wrap">
                    <table className="ih-tbl">
                        <thead><tr><th>Course</th><th>Programme</th><th>Status</th><th>Assigned Instructor(s)</th><th>Assign</th></tr></thead>
                        <tbody>
                            {courses.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>No courses in this department yet.</td></tr>
                            ) : courses.map((c: any) => (
                                <tr key={c.id}>
                                    <td><div style={{ fontWeight: 600 }}>{c.titleEn}</div><div className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{c.courseCode}</div></td>
                                    <td>{c.programName}</td>
                                    <td><span className={`ih-badge ${c.isPublished ? 'ih-b-success' : 'ih-b-neutral'}`}>{c.isPublished ? 'Published' : 'Draft'}</span></td>
                                    <td>
                                        {c.instructors.length === 0 ? <span style={{ color: 'var(--ink-soft)' }}>Unassigned</span> : (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                {c.instructors.map((ins: any) => (
                                                    <span key={ins.id} className="ih-badge ih-b-neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, opacity: ins.status === 'WITHDRAWN' ? 0.55 : 1 }}>
                                                        {ins.name}
                                                        {ins.role && ins.role !== 'LEAD' ? ` (${ROLE_LABELS[ins.role] || ins.role})` : ''}
                                                        {ins.term ? ` · ${ins.term.code || ins.term.name}` : ''}
                                                        {ins.status === 'WITHDRAWN' ? ' · Withdrawn' : ''}
                                                        {ins.status === 'WITHDRAWN' ? (
                                                            <button onClick={() => setAssignmentStatus(c.id, ins.id, 'ACTIVE')} disabled={assigning === c.id} style={{ border: 'none', background: 'none', color: 'var(--success, #1a7f37)', cursor: 'pointer', fontSize: 12 }}>↺</button>
                                                        ) : (
                                                            <button onClick={() => setAssignmentStatus(c.id, ins.id, 'WITHDRAWN')} disabled={assigning === c.id} style={{ border: 'none', background: 'none', color: 'var(--warning, #9a6700)', cursor: 'pointer', fontSize: 12 }} title="Withdraw (keeps historical record)">⏸</button>
                                                        )}
                                                        <button onClick={() => unassign(c.id, ins.id)} disabled={assigning === c.id} style={{ border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 12 }} title="Remove (corrects an error)">✕</button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                            <select
                                                value={selectedInstructor[c.id] || ''}
                                                onChange={(e) => setSelectedInstructor({ ...selectedInstructor, [c.id]: e.target.value })}
                                                style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '5px 8px', fontSize: 12.5 }}
                                            >
                                                <option value="">Select instructor…</option>
                                                {instructors.map((i: any) => (
                                                    <option key={i.userId} value={i.userId}>{i.user.name}</option>
                                                ))}
                                            </select>
                                            <select
                                                value={selectedRole[c.id] || ''}
                                                onChange={(e) => setSelectedRole({ ...selectedRole, [c.id]: e.target.value })}
                                                style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '5px 8px', fontSize: 12.5 }}
                                            >
                                                <option value="">Role: Lead</option>
                                                <option value="CO_INSTRUCTOR">Co-Instructor</option>
                                                <option value="TEACHING_ASSISTANT">Teaching Assistant</option>
                                            </select>
                                            <select
                                                value={selectedTerm[c.id] || ''}
                                                onChange={(e) => setSelectedTerm({ ...selectedTerm, [c.id]: e.target.value })}
                                                style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '5px 8px', fontSize: 12.5 }}
                                            >
                                                <option value="">No term set</option>
                                                {terms.map((t: any) => (
                                                    <option key={t.id} value={t.id}>{t.code || t.name}</option>
                                                ))}
                                            </select>
                                            <button className="ih-btn ih-btn-secondary" style={{ padding: '5px 10px', fontSize: 12 }} disabled={assigning === c.id} onClick={() => assign(c.id)}>Assign</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
