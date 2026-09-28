'use client';
import { useEffect, useState } from 'react';

type ExamRow = {
    examId: string;
    courseTitle: string;
    courseCode: string;
    department: string | null;
    programme: string | null;
    termName: string;
    examType: string;
    scheduledAt: string;
    resultStatus: string;
    enrolledCount: number;
    gradedCount: number;
};

const fieldStyle = { border: '1px solid var(--border)', borderRadius: 6, padding: '9px 11px', fontSize: 13.5, background: 'var(--surface)', color: 'var(--ink)', width: '100%' };

export default function DeanExaminationsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [escSubject, setEscSubject] = useState('');
    const [escDetails, setEscDetails] = useState('');
    const [escSending, setEscSending] = useState(false);
    const [escMessage, setEscMessage] = useState('');

    useEffect(() => {
        setLoading(true);
        fetch('/api/dean/exam-monitoring', { credentials: 'include' })
            .then(async (res) => {
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || 'Failed to load examinations monitoring data.');
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
            const res = await fetch('/api/dean/escalate', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject: escSubject, details: escDetails, relatedTo: 'Examinations monitoring' }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Failed to submit escalation.');
            setEscMessage('Escalation sent to Admin.');
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
    if (!data?.faculty && data?.message) {
        return <div className="ih-card" style={{ background: 'var(--warning-tint)', color: 'var(--warning)', border: '1px solid var(--warning)' }}>{data.message}</div>;
    }

    const schedule = data?.scheduleCounts || {};
    const resultStatusCounts = data?.resultStatusCounts || {};
    const completion = data?.resultCompletion || {};
    const exams: ExamRow[] = data?.exams || [];

    return (
        <div style={{ display: 'grid', gap: 18 }}>
            <section className="ih-card">
                <h2 style={{ margin: '0 0 4px', fontSize: 16 }}>Examinations &amp; Results Monitoring</h2>
                <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 0, marginBottom: 14 }}>
                    Read-only faculty-wide view. Examinations remains its own delegated owner — this page has no edit action; discrepancies are escalated below, not corrected here.
                </p>
                <div className="ih-stat-grid">
                    <div className="ih-stat-tile"><div className="n">{schedule.total ?? 0}</div><div className="l">Total Exams</div></div>
                    <div className="ih-stat-tile"><div className="n">{schedule.upcoming ?? 0}</div><div className="l">Upcoming</div></div>
                    <div className="ih-stat-tile"><div className="n">{schedule.past ?? 0}</div><div className="l">Past</div></div>
                    <div className="ih-stat-tile accent"><div className="n">{completion.totalGraded ?? 0}/{completion.totalEnrolled ?? 0}</div><div className="l">Results Recorded</div></div>
                </div>
            </section>

            <section className="ih-card">
                <h2 style={{ margin: '0 0 12px', fontSize: 16 }}>Result Verification Status</h2>
                <div className="ih-stat-grid">
                    {['PENDING', 'SUBMITTED', 'VERIFIED', 'RECONCILED'].map((s) => (
                        <div key={s} className="ih-stat-tile"><div className="n">{resultStatusCounts[s] ?? 0}</div><div className="l">{s.charAt(0) + s.slice(1).toLowerCase()}</div></div>
                    ))}
                </div>
            </section>

            <section className="ih-card">
                <h2 style={{ margin: '0 0 14px', fontSize: 16 }}>Exams by Course</h2>
                <div className="ih-tbl-wrap">
                    <table className="ih-tbl">
                        <thead><tr><th>Course</th><th>Department</th><th>Term</th><th>Type</th><th>Scheduled</th><th>Result Status</th><th>Graded / Enrolled</th></tr></thead>
                        <tbody>
                            {exams.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>No exams in this faculty yet.</td></tr>
                            ) : exams.map((e) => (
                                <tr key={e.examId}>
                                    <td><div style={{ fontWeight: 600 }}>{e.courseTitle}</div><div className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{e.courseCode}</div></td>
                                    <td>{e.department || '—'}</td>
                                    <td>{e.termName}</td>
                                    <td>{e.examType}</td>
                                    <td>{new Date(e.scheduledAt).toLocaleDateString()}</td>
                                    <td><span className="ih-badge ih-b-neutral">{e.resultStatus}</span></td>
                                    <td>{e.gradedCount}/{e.enrolledCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="ih-card">
                <h2 style={{ margin: '0 0 4px', fontSize: 16 }}>Escalate to Admin</h2>
                <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 0, marginBottom: 14 }}>
                    Raise an issue (e.g. a persistent results backlog, a discrepancy Examinations hasn't resolved) to the appropriate institutional authority. This creates a permanent, visible record — not just a message to yourself.
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
