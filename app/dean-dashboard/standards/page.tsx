'use client';
import { useDean } from '../context';

export default function DeanStandardsPage() {
    const { data, loading, error } = useDean();

    if (loading) return <div className="ih-card">Loading…</div>;
    if (error) return <div className="ih-card" style={{ color: 'var(--danger)' }}>{error}</div>;
    if (!data?.faculty) {
        return <div className="ih-card" style={{ background: 'var(--warning-tint)', color: 'var(--warning)', border: '1px solid var(--warning)' }}>{data?.message || 'You are not currently assigned as Dean of a faculty.'}</div>;
    }

    const programs = data.programs || [];
    const progression = data.progression || {};
    const graduationCandidates = data.graduationCandidates || [];
    const qi = data.qualityIndicators || {};

    return (
        <div style={{ display: 'grid', gap: 18 }}>
            <section className="ih-card">
                <h2 style={{ margin: '0 0 12px', fontSize: 16 }}>Academic Standards &amp; Progression</h2>
                <div className="ih-stat-grid">
                    <div className="ih-stat-tile"><div className="n">{progression.studentCount ?? 0}</div><div className="l">Students</div></div>
                    <div className="ih-stat-tile" style={{ borderColor: 'var(--danger)' }}><div className="n">{progression.atRiskCount ?? 0}</div><div className="l">At-Risk (Probation/Suspended)</div></div>
                    <div className="ih-stat-tile accent"><div className="n">{progression.avgGpa != null ? progression.avgGpa.toFixed(2) : '—'}</div><div className="l">Average Recorded GPA</div></div>
                </div>
            </section>

            <section className="ih-card">
                <h2 style={{ margin: '0 0 12px', fontSize: 16 }}>Quality Indicators</h2>
                <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 0 }}>Aggregated from Quality Assurance reviews across this faculty's programmes, departments, and courses.</p>
                <div className="ih-stat-grid">
                    <div className="ih-stat-tile"><div className="n">{qi.totalReviews ?? 0}</div><div className="l">QA Reviews</div></div>
                    <div className="ih-stat-tile"><div className="n">{qi.compliant ?? 0}</div><div className="l">Compliant</div></div>
                    <div className="ih-stat-tile" style={{ borderColor: 'var(--warning)' }}><div className="n">{qi.minorNonCompliance ?? 0}</div><div className="l">Minor Non-Compliance</div></div>
                    <div className="ih-stat-tile" style={{ borderColor: 'var(--danger)' }}><div className="n">{qi.majorNonCompliance ?? 0}</div><div className="l">Major Non-Compliance</div></div>
                    <div className="ih-stat-tile accent"><div className="n">{qi.openImprovementPlans ?? 0}</div><div className="l">Open Improvement Plans</div></div>
                </div>
            </section>

            <section className="ih-card">
                <h2 style={{ margin: '0 0 14px', fontSize: 16 }}>Programmes</h2>
                <div className="ih-tbl-wrap">
                    <table className="ih-tbl">
                        <thead><tr><th>Programme</th><th>Department</th><th>Level</th><th>Coordinator</th><th>Courses</th><th>Students</th><th>Status</th></tr></thead>
                        <tbody>
                            {programs.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>No programmes in this faculty yet.</td></tr>
                            ) : programs.map((p: any) => (
                                <tr key={p.id}>
                                    <td style={{ fontWeight: 600 }}>{p.nameEn}</td>
                                    <td>{p.department?.nameEn}</td>
                                    <td>{p.level}</td>
                                    <td>{p.coordinator?.user?.name || '—'}</td>
                                    <td>{p._count.courses}</td>
                                    <td>{p._count.students}</td>
                                    <td><span className={`ih-badge ${p.isActive ? 'ih-b-success' : 'ih-b-neutral'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="ih-card">
                <h2 style={{ margin: '0 0 14px', fontSize: 16 }}>Graduation in Progress</h2>
                <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 0 }}>
                    Eligibility, clearance and approval follow Assessment, Grading &amp; Progression §7.9 and §8 exactly — this is a faculty-wide read view, not a separate approval step.
                </p>
                <div className="ih-tbl-wrap">
                    <table className="ih-tbl">
                        <thead><tr><th>Student</th><th>Status</th></tr></thead>
                        <tbody>
                            {graduationCandidates.length === 0 ? (
                                <tr><td colSpan={2} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>No candidates in progress.</td></tr>
                            ) : graduationCandidates.map((g: any) => (
                                <tr key={g.id}>
                                    <td><div style={{ fontWeight: 600 }}>{g.student?.user?.name}</div><div className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{g.student?.studentNo}</div></td>
                                    <td><span className="ih-badge ih-b-success">{g.status.replace(/_/g, ' ')}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
