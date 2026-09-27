'use client';
import { useEffect, useState } from 'react';

function pct(v: number | null) {
    return v == null ? '—' : `${(v * 100).toFixed(1)}%`;
}

export default function QAKpisPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/qa/kpis', { credentials: 'include' })
            .then(async (res) => {
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || 'Failed to load KPIs.');
                setData(result);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="ih-card">Computing institutional KPIs…</div>;
    if (error) return <div className="ih-card" style={{ color: 'var(--danger)' }}>{error}</div>;

    return (
        <div style={{ display: 'grid', gap: 18 }}>
            <section className="ih-card">
                <h2 style={{ margin: '0 0 4px', fontSize: 16 }}>Academic KPIs</h2>
                <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 0 }}>
                    Computed directly from real student, grade, attendance, evaluation and review data — {data?.currentTerm ? `progression is scoped to the current term (${data.currentTerm.name})` : 'no current term is set, so progression could not be scoped to one'}. PLO achievement is not shown: no PLO/CLO data exists yet to compute it from (Faculty, Staff &amp; Academic Portals §9.5).
                </p>
                <div className="ih-stat-grid">
                    <div className="ih-stat-tile accent"><div className="n">{pct(data.retention.rate)}</div><div className="l">Retention</div></div>
                    <div className="ih-stat-tile accent"><div className="n">{pct(data.completion.rate)}</div><div className="l">Completion</div></div>
                    <div className="ih-stat-tile"><div className="n">{pct(data.progression.rate)}</div><div className="l">In Good Standing</div></div>
                    <div className="ih-stat-tile"><div className="n">{pct(data.assessment.overallPassRate)}</div><div className="l">Course Pass Rate</div></div>
                    <div className="ih-stat-tile"><div className="n">{pct(data.attendance.avgRate)}</div><div className="l">Avg. Attendance</div></div>
                    <div className="ih-stat-tile"><div className="n">{data.studentSatisfaction.avgOverall != null ? data.studentSatisfaction.avgOverall.toFixed(2) : '—'}/5</div><div className="l">Student Satisfaction</div></div>
                    <div className="ih-stat-tile"><div className="n">{data.instructorPerformance.avgStudentRating != null ? data.instructorPerformance.avgStudentRating.toFixed(2) : '—'}/5</div><div className="l">Instructor Rating (student-rated)</div></div>
                    <div className="ih-stat-tile"><div className="n">{data.instructorPerformance.avgReviewRating != null ? data.instructorPerformance.avgReviewRating.toFixed(2) : '—'}/4</div><div className="l">Instructor Rating (formal review)</div></div>
                </div>
            </section>

            <section className="ih-card">
                <h3 style={{ margin: '0 0 10px', fontSize: 15 }}>How these are computed</h3>
                <div style={{ display: 'grid', gap: 10, fontSize: 12.5, color: 'var(--ink-soft)' }}>
                    <p style={{ margin: 0 }}><strong>Retention</strong> — of every student ever admitted ({data.retention.everAdmitted}), the share who did not leave without completing (excludes {data.retention.leftWithoutCompleting} Withdrawn/Dismissed).</p>
                    <p style={{ margin: 0 }}><strong>Completion</strong> — of students who reached a terminal outcome ({data.completion.terminalOutcomes} Graduated/Withdrawn/Dismissed), the share who Graduated ({data.completion.graduated}). Students still actively studying are not yet counted either way.</p>
                    <p style={{ margin: 0 }}><strong>Progression</strong> — {data.progression.total} current-term standing records: {data.progression.goodStanding} Good Standing/Dean's List, {data.progression.atRisk} Probation/Suspended.</p>
                    <p style={{ margin: 0 }}><strong>Course pass rate</strong> — {data.assessment.gradedCount} graded records, using the same Final-score convention graduation eligibility and every transcript view already use.</p>
                    <p style={{ margin: 0 }}><strong>Attendance</strong> — averaged across {data.attendance.sampledCourses} student-course attendance records (cumulative, not a single term).</p>
                    <p style={{ margin: 0 }}><strong>Student satisfaction / instructor rating</strong> — {data.studentSatisfaction.responseCount} course evaluation submissions.</p>
                    <p style={{ margin: 0 }}><strong>Instructor rating (formal review)</strong> — {data.instructorPerformance.reviewCount} submitted/acknowledged performance reviews, on a 1 (Needs Improvement) – 4 (Outstanding) scale.</p>
                </div>
            </section>

            {data.assessment.lowestPassingCourses.length > 0 && (
                <section className="ih-card">
                    <h3 style={{ margin: '0 0 14px', fontSize: 15 }}>Lowest Pass-Rate Courses</h3>
                    <p style={{ color: 'var(--ink-soft)', fontSize: 12.5, marginTop: -6, marginBottom: 12 }}>Courses with at least 5 graded records, lowest pass rate first — a starting point for course review (§6), not a judgment on their own.</p>
                    <div className="ih-tbl-wrap">
                        <table className="ih-tbl">
                            <thead><tr><th>Course</th><th>Pass Rate</th><th>Graded</th></tr></thead>
                            <tbody>
                                {data.assessment.lowestPassingCourses.map((c: any) => (
                                    <tr key={c.courseId}>
                                        <td>{c.courseTitle} <span className="mono" style={{ color: 'var(--ink-soft)' }}>({c.courseCode})</span></td>
                                        <td>{pct(c.passRate)}</td>
                                        <td>{c.gradedCount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
}
