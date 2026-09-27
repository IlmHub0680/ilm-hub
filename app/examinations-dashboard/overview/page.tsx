'use client';
import { useExams } from '../context';

export default function ExamsOverviewPage() {
    const { data, loading, error } = useExams();

    return (
        <>
            {loading && <div className="ih-card">Loading…</div>}
            {error && (
                <div className="ih-card" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', marginBottom: 20 }}>
                    {error}
                </div>
            )}

            {data && (
                <div className="ih-stat-grid">
                    <div className="ih-stat-tile">
                        <div className="n">{data.upcomingExams}</div>
                        <div className="l">Upcoming Exams</div>
                    </div>
                    <div className="ih-stat-tile accent">
                        <div className="n">{data.pendingAppeals}</div>
                        <div className="l">Pending Grade Appeals</div>
                    </div>
                </div>
            )}
        </>
    );
}
