'use client';
import { useEffect, useState } from 'react';

type CourseRow = {
    courseId: string;
    courseTitle: string;
    courseCode: string;
    programme: string | null;
    enrolledCount: number;
    gradedStudentCount: number;
    anyComponentRecorded: number;
    finalizedCount: number;
    draftCount: number;
    componentAverages: Record<string, number | null>;
};

const fieldStyle = { border: '1px solid var(--border)', borderRadius: 6, padding: '9px 11px', fontSize: 13.5, background: 'var(--surface)', color: 'var(--ink)', width: '100%' };

export default function HODCourseResultsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [escSubject, setEscSubject] = useState('');
    const [escDetails, setEscDetails] = useState('');
    const [escSending, setEscSending] = useState(false);
    const [escMessage, setEscMessage] = useState('');

    useEffect(() => {
        setLoading(true);
        fetch('/api/hod/course-results', { credentials: 'include' })
            .then(async (res) => {
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || 'Failed to load course results.');
                setData(result);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    async function sendEscalation() {
        if (!escSubject.trim() || !escDetails.trim()) {
            setEscMessage('Subject and details are required.');
            return;
        }
        setEscSending(true);
        setEscMessage('');
        try {
            const res = await fetch('/api/hod/escalate', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject: escSubject, details: escDetails, relatedTo: 'Course results / grading activity' }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Failed to submit escalation.');
            setEscMessage('Escalation sent.');
            setEscSubject('');
            setEscDetails('');
        } catch (err: any) {
            setEscMessage(err.message || 'Failed to submit escalation.');
        } finally {
            setEscSending(false);
        }
    }

    if (loading) return <div className="ih-card">Loading…</div>;
    if (error) return <div className="ih-card" style={{ color: 'var(--danger)' }}>{error}</div>;
    if (!data?.department && data?.message) {
        return <div className="ih-card" style={{ background: 'var(--warning-tint)', color: 'var(--warning)', border: '1px solid var(--warning)' }}>{data.message}</div>;
    }

    const courses: CourseRow[] = data?.courses || [];

    return (
        <div style={{ display: 'grid', gap: 18 }}>
            <section className="ih-card">
                <h2 style={{ margin: '0 0 4px', fontSize: 16 }}>Course Results &amp; Grading Activity</h2>
                <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 0, marginBottom: 14 }}>
                    Read-only — grades stay the Instructor's own workflow. This is visibility into how much grading is done and finalized per course.
                </p>
                <div className="ih-tbl-wrap">
                    <table className="ih-tbl">
                        <thead><tr><th>Course</th><th>Programme</th><th>Enrolled</th><th>Any Grade Recorded</th><th>Finalized</th><th>Draft</th><th>Avg. Final</th></tr></thead>
                        <tbody>
                            {courses.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>No courses in this department yet.</td></tr>
                            ) : courses.map((c) => (
                                <tr key={c.courseId}>
                                    <td><div style={{ fontWeight: 600 }}>{c.courseTitle}</div><div className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{c.courseCode}</div></td>
                                    <td>{c.programme || '—'}</td>
                                    <td>{c.enrolledCount}</td>
                                    <td>{c.anyComponentRecorded}/{c.enrolledCount}</td>
                                    <td>{c.finalizedCount}</td>
                                    <td>{c.draftCount}</td>
                                    <td>{c.componentAverages?.final != null ? c.componentAverages.final.toFixed(1) : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="ih-card">
                <h2 style={{ margin: '0 0 4px', fontSize: 16 }}>Escalate to Dean</h2>
                <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 0, marginBottom: 14 }}>
                    Raise an issue (e.g. an instructor not finalizing grades, a grading discrepancy) to your Dean or Admin. This creates a permanent, visible record.
                </p>
                {escMessage && <div className="ih-card" style={{ background: 'var(--brand-tint)', padding: '8px 12px', marginBottom: 12, fontSize: 13 }}>{escMessage}</div>}
                <div style={{ display: 'grid', gap: 10, maxWidth: 520 }}>
                    <input style={fieldStyle} placeholder="Subject" value={escSubject} onChange={(e) => setEscSubject(e.target.value)} />
                    <textarea style={{ ...fieldStyle, minHeight: 80 }} placeholder="Details" value={escDetails} onChange={(e) => setEscDetails(e.target.value)} />
                    <button disabled={escSending} className="ih-btn ih-btn-primary" onClick={sendEscalation}>{escSending ? 'Sending…' : 'Send Escalation'}</button>
                </div>
            </section>
        </div>
    );
}
