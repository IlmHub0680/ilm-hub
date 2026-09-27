'use client';
import { useState } from 'react';
import { useRecords } from '../context';

export default function AutoAssignPage() {
    const { programs, loadingPrograms, message, setMessage } = useRecords();
    const [selectedProgramId, setSelectedProgramId] = useState('');
    const [runningAutoAssign, setRunningAutoAssign] = useState(false);
    const [autoAssignResult, setAutoAssignResult] = useState<{ studentsAffected: number; coursesAssigned: number } | null>(null);

    const handleRunAutoAssign = async () => {
        setRunningAutoAssign(true);
        setAutoAssignResult(null);
        setMessage('');
        try {
            const res = await fetch('/api/records/auto-assign', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedProgramId ? { programId: selectedProgramId } : {}),
            });
            const result = await res.json();

            if (res.ok) {
                setAutoAssignResult({ studentsAffected: result.studentsAffected, coursesAssigned: result.coursesAssigned });
            } else {
                setMessage(result.error || 'Failed to run automatic course assignment.');
            }
        } catch {
            setMessage('An error occurred.');
        } finally {
            setRunningAutoAssign(false);
        }
    };

    return (
        <div className="ih-card">
            {message && (
                <div style={{ background: 'var(--success-tint)', color: 'var(--success)', padding: '10px 14px', marginBottom: 20, borderRadius: 8 }}>
                    {message}
                </div>
            )}
            <h3 style={{ margin: '0 0 6px', fontSize: 17 }}>Auto-Assign Courses</h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--ink-soft)' }}>
                Registers every active student in a programme into the next level of their
                curriculum — only courses whose prerequisites they've already passed, and only
                courses that have been sequenced below (see "Sequenced Courses" per programme).
                Run this at the start of each term.
            </p>

            {loadingPrograms && <p>Loading programmes…</p>}

            {!loadingPrograms && programs.length > 0 && (
                <>
                    <div className="ih-tbl-wrap" style={{ marginBottom: 16 }}>
                        <table className="ih-tbl">
                            <thead>
                                <tr>
                                    <th>Programme</th>
                                    <th>Students</th>
                                    <th>Courses</th>
                                    <th>Sequenced Courses</th>
                                </tr>
                            </thead>
                            <tbody>
                                {programs.map((p: any) => (
                                    <tr key={p.id}>
                                        <td>{p.nameEn}</td>
                                        <td>{p.studentCount}</td>
                                        <td>{p.courseCount}</td>
                                        <td>
                                            {p.sequencedCourseCount} / {p.courseCount}
                                            {p.sequencedCourseCount === 0 && (
                                                <span style={{ color: 'var(--warning)', marginLeft: 6, fontSize: 12 }}>
                                                    (not sequenced yet — set each course's semester level first)
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <select
                            value={selectedProgramId}
                            onChange={(e) => setSelectedProgramId(e.target.value)}
                            style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 8, background: 'var(--surface)', color: 'var(--ink)', fontSize: 13.5, maxWidth: 320 }}
                        >
                            <option value="">All active programmes</option>
                            {programs.map((p: any) => (
                                <option key={p.id} value={p.id}>{p.nameEn}</option>
                            ))}
                        </select>

                        <button disabled={runningAutoAssign} onClick={handleRunAutoAssign} className="ih-btn ih-btn-gold">
                            {runningAutoAssign ? 'Running…' : 'Run Auto-Assignment'}
                        </button>
                    </div>

                    {autoAssignResult && (
                        <p style={{ marginTop: 14, fontSize: 13.5, color: 'var(--brand-dark)' }}>
                            Done — {autoAssignResult.studentsAffected} student(s) received {autoAssignResult.coursesAssigned} new course registration(s).
                        </p>
                    )}
                </>
            )}
        </div>
    );
}
