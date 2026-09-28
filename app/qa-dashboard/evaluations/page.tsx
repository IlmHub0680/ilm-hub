'use client';
import { useEffect, useState } from 'react';

const cardStyle = { display: 'flex', flexDirection: 'column' as const, gap: 4 };

export default function QAEvaluationsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/qa/course-evaluations', { credentials: 'include' })
            .then(async (res) => {
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || 'Failed to load course evaluations.');
                setData(result);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="ih-card">Loading course evaluations…</div>;
    if (error) return <div className="ih-card" style={{ color: 'var(--danger)' }}>{error}</div>;

    const courses = data?.courses || [];

    return (
        <div style={{ display: 'grid', gap: 18 }}>
            <section className="ih-card">
                <h2 style={{ margin: '0 0 4px', fontSize: 16 }}>Course Evaluations</h2>
                <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 0, marginBottom: 12 }}>
                    Aggregated student evaluations, submitted anonymously through each student's course view. Individual respondents are never identified here — only per-course averages and submitted comments.
                </p>
                <div className="ih-stat-grid">
                    <div className="ih-stat-tile"><div className="n">{data?.totalResponses ?? 0}</div><div className="l">Total Responses</div></div>
                    <div className="ih-stat-tile accent"><div className="n">{data?.overallAvg != null ? data.overallAvg.toFixed(2) : '—'}</div><div className="l">Overall Average (of 5)</div></div>
                    <div className="ih-stat-tile"><div className="n">{courses.length}</div><div className="l">Courses With Responses</div></div>
                </div>
            </section>

            <section className="ih-card">
                <h3 style={{ margin: '0 0 14px', fontSize: 15 }}>By Course</h3>
                {courses.length === 0 ? (
                    <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No course evaluations have been submitted yet.</p>
                ) : (
                    <div style={{ display: 'grid', gap: 14 }}>
                        {courses.map((c: any) => (
                            <div key={c.courseId} className="ih-card" style={{ background: 'var(--surface-2, var(--bg))', ...cardStyle }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{c.courseTitle}</div>
                                        <div className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{c.courseCode}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                                        <div><strong>{c.avgOverall != null ? c.avgOverall.toFixed(2) : '—'}</strong> overall</div>
                                        <div><strong>{c.avgContent != null ? c.avgContent.toFixed(2) : '—'}</strong> content</div>
                                        <div><strong>{c.avgInstructor != null ? c.avgInstructor.toFixed(2) : '—'}</strong> instructor</div>
                                        <div style={{ color: 'var(--ink-soft)' }}>{c.responseCount} response{c.responseCount === 1 ? '' : 's'}</div>
                                    </div>
                                </div>
                                {c.recentComments && c.recentComments.length > 0 && (
                                    <div style={{ marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {c.recentComments.map((cm: any, i: number) => (
                                            <p key={i} style={{ margin: 0, fontSize: 12.5, color: 'var(--ink-soft)' }}>&ldquo;{cm.text}&rdquo;</p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
