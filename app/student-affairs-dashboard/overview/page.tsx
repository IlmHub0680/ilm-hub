'use client';
import { useEffect, useState } from 'react';

type StudentAffairsData = {
    studentCount: number;
    activeStudents: number;
    programmeCount: number;
    activeStaffCount: number;
    openCaseCount: number;
    unassignedCaseCount: number;
    tutoringPendingCount: number;
    absenceExcusePendingCount: number;
};

export default function StudentAffairsOverviewPage() {
    const [data, setData] = useState<StudentAffairsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        fetch('/api/student-affairs/portal', { credentials: 'include' })
            .then(async (res) => {
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || 'Failed to load Student Affairs data.');
                setData(result);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            {loading && <div className="ih-card">Loading Student Affairs data…</div>}
            {error && (
                <div className="ih-card" style={{ background: 'var(--danger-tint)', color: 'var(--danger)', border: '1px solid var(--danger)', marginBottom: 20 }}>
                    {error}
                </div>
            )}

            {data && (
                <>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: 16 }}>Work Queue</h3>
                    <div className="ih-stat-grid" style={{ marginBottom: 28 }}>
                        <div className="ih-stat-tile accent"><div className="n">{data.openCaseCount}</div><div className="l">Open Student Requests</div></div>
                        <div className="ih-stat-tile"><div className="n">{data.unassignedCaseCount}</div><div className="l">Unassigned Requests</div></div>
                        <div className="ih-stat-tile"><div className="n">{data.tutoringPendingCount}</div><div className="l">Pending Tutoring Requests</div></div>
                        <div className="ih-stat-tile"><div className="n">{data.absenceExcusePendingCount}</div><div className="l">Pending Absence Excuses</div></div>
                    </div>

                    <h3 style={{ margin: '0 0 12px 0', fontSize: 16 }}>Institution Snapshot</h3>
                    <div className="ih-stat-grid">
                        <div className="ih-stat-tile"><div className="n">{data.studentCount}</div><div className="l">Total Students</div></div>
                        <div className="ih-stat-tile"><div className="n">{data.activeStudents}</div><div className="l">Active Students</div></div>
                        <div className="ih-stat-tile"><div className="n">{data.programmeCount}</div><div className="l">Programmes</div></div>
                        <div className="ih-stat-tile"><div className="n">{data.activeStaffCount}</div><div className="l">Active Staff</div></div>
                    </div>
                </>
            )}
        </>
    );
}
