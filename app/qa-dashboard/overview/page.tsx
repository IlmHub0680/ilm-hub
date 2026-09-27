'use client';
import { useQA } from '../context';

export default function QAOverviewPage() {
    const { data, loading, error } = useQA();

    return (
        <>
            {loading && <div className="ih-card">Loading QA data…</div>}
            {error && (
                <div className="ih-card" style={{ background: 'var(--danger-tint)', color: 'var(--danger)', border: '1px solid var(--danger)', marginBottom: 20 }}>
                    {error}
                </div>
            )}

            {data && (
                <div className="ih-stat-grid">
                    <div className="ih-stat-tile"><div className="n">{data.studentCount}</div><div className="l">Students</div></div>
                    <div className="ih-stat-tile"><div className="n">{data.staffCount}</div><div className="l">Active Staff</div></div>
                    <div className="ih-stat-tile"><div className="n">{data.programmeCount}</div><div className="l">Programmes</div></div>
                    <div className="ih-stat-tile"><div className="n">{data.courseCount}</div><div className="l">Courses</div></div>
                    <div className="ih-stat-tile accent"><div className="n">{data.pendingReviewCount}</div><div className="l">Open Reviews</div></div>
                </div>
            )}
        </>
    );
}
