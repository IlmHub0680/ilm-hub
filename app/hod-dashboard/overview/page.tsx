'use client';
import { useHOD } from '../context';

export default function HODOverviewPage() {
    const { data, loading, error } = useHOD();

    return (
        <>
            {loading && <div className="ih-card">Loading…</div>}
            {error && (
                <div className="ih-card" style={{ background: 'var(--danger-tint)', color: 'var(--danger)', border: '1px solid var(--danger)', marginBottom: 20 }}>
                    {error}
                </div>
            )}

            {/* data.message only appears when the API explicitly refused
                (a non-admin with no HOD assignment) -- an admin with no
                department of their own still gets real institution-wide
                stats back (data.department is null but data.message is
                absent). See the matching comment in
                app/dean-dashboard/overview/page.tsx. */}
            {data && !data.department && data.message && (
                <div className="ih-card" style={{ background: 'var(--warning-tint)', color: 'var(--warning)', border: '1px solid var(--warning)' }}>
                    {data.message}
                </div>
            )}

            {data && !data.message && (
                <>
                    {!data.department && (
                        <div className="ih-card" style={{ marginBottom: 20, color: 'var(--ink-soft)', fontSize: 13.5 }}>
                            Institution-wide view — you are not assigned as Head of a specific department, so these figures cover every department.
                        </div>
                    )}
                    <div className="ih-stat-grid">
                        <div className="ih-stat-tile"><div className="n">{data.programCount}</div><div className="l">Programmes</div></div>
                        <div className="ih-stat-tile"><div className="n">{data.staffCount}</div><div className="l">Active Staff</div></div>
                        <div className="ih-stat-tile accent"><div className="n">{data.studentCount}</div><div className="l">Students</div></div>
                    </div>
                </>
            )}
        </>
    );
}
