'use client';
import { useEffect, useState } from 'react';

type AttendanceRow = {
    courseId: string;
    courseTitle: string;
    courseCode: string;
    programme: string | null;
    studentsTracked: number;
    totalClasses: number;
    attended: number;
    late: number;
    absent: number;
    attendanceRate: number | null;
};

export default function HODAttendancePage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        fetch('/api/hod/attendance', { credentials: 'include' })
            .then(async (res) => {
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || 'Failed to load attendance data.');
                setData(result);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="ih-card">Loading…</div>;
    if (error) return <div className="ih-card" style={{ color: 'var(--danger)' }}>{error}</div>;
    if (!data?.department && data?.message) {
        return <div className="ih-card" style={{ background: 'var(--warning-tint)', color: 'var(--warning)', border: '1px solid var(--warning)' }}>{data.message}</div>;
    }

    const courses: AttendanceRow[] = data?.courses || [];
    const untracked = data?.untrackedCourseCount ?? 0;

    return (
        <div style={{ display: 'grid', gap: 18 }}>
            <section className="ih-card">
                <h2 style={{ margin: '0 0 4px', fontSize: 16 }}>Attendance Review</h2>
                <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 0, marginBottom: 14 }}>
                    Course-level attendance rollup from the running per-student tallies instructors record. Read-only.
                </p>
                {untracked > 0 && (
                    <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 0 }}>
                        {untracked} course{untracked === 1 ? '' : 's'} in this department have no attendance records yet.
                    </p>
                )}
                <div className="ih-tbl-wrap">
                    <table className="ih-tbl">
                        <thead><tr><th>Course</th><th>Programme</th><th>Students Tracked</th><th>Attended</th><th>Late</th><th>Absent</th><th>Attendance Rate</th></tr></thead>
                        <tbody>
                            {courses.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>No attendance data recorded in this department yet.</td></tr>
                            ) : courses.map((c) => (
                                <tr key={c.courseId}>
                                    <td><div style={{ fontWeight: 600 }}>{c.courseTitle}</div><div className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{c.courseCode}</div></td>
                                    <td>{c.programme || '—'}</td>
                                    <td>{c.studentsTracked}</td>
                                    <td>{c.attended}</td>
                                    <td>{c.late}</td>
                                    <td>{c.absent}</td>
                                    <td>{c.attendanceRate != null ? `${(c.attendanceRate * 100).toFixed(1)}%` : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
