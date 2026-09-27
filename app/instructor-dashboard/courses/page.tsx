'use client';
import { useEffect, useState } from 'react';

type AssignedCourse = {
    assignmentId: string;
    courseId: string;
    titleEn: string;
    courseCode: string;
    creditHours: number;
    descriptionEn: string;
    isPublished: boolean;
    approvalStatus: string;
    role: string;
    status: string;
    term: { id: string; name: string; code: string; isCurrent: boolean } | null;
    enrolledCount: number;
};

const APPROVAL_TONE: Record<string, string> = {
    APPROVED: 'ih-b-success',
    DRAFT: 'ih-b-neutral',
    PENDING: 'ih-b-warning',
    REJECTED: 'ih-b-danger',
};

export default function AssignedCoursesPage() {
    const [courses, setCourses] = useState<AssignedCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/instructor/courses', { credentials: 'include', cache: 'no-store' })
            .then((r) => r.json())
            .then((data) => {
                if (data.success) {
                    setCourses(data.courses || []);
                } else {
                    setError(data.error || 'Unable to load your assigned courses.');
                }
            })
            .catch(() => setError('Unable to load your assigned courses.'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="ih-card">
            <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ margin: '0 0 4px 0', fontSize: 20 }}>Assigned Courses</h2>
                <p style={{ color: 'var(--ink-soft)', margin: 0, fontSize: 14 }}>
                    The modules you are currently instructing, with your real enrolment counts and academic term.
                </p>
            </div>

            {error && (
                <div className="ih-card" style={{ padding: '12px 14px', marginBottom: 20, background: 'var(--danger-tint)', color: 'var(--danger)' }}>
                    {error}
                </div>
            )}

            {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>Loading your courses…</div>
            ) : courses.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>
                    You are not currently assigned to any courses.
                </div>
            ) : (
                <div style={{ display: 'grid', gap: 14 }}>
                    {courses.map((c) => {
                        const tone = APPROVAL_TONE[c.approvalStatus] || 'ih-b-neutral';
                        return (
                            <div
                                key={c.assignmentId}
                                className="ih-card"
                                style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 16 }}>
                                            {c.courseCode} — {c.titleEn}
                                        </div>
                                        <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 2 }}>
                                            {c.creditHours} credit hour{c.creditHours === 1 ? '' : 's'}
                                            {c.term ? ` · ${c.term.name}${c.term.isCurrent ? ' (current term)' : ''}` : ' · No term assigned'}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        <span className={`ih-badge ${tone}`}>{c.approvalStatus}</span>
                                        {!c.isPublished && <span className="ih-badge ih-b-neutral">Unpublished</span>}
                                        <span className="ih-badge ih-b-neutral">{c.role}</span>
                                    </div>
                                </div>

                                {c.descriptionEn && (
                                    <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-soft)' }}>
                                        {c.descriptionEn}
                                    </p>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
                                    <span style={{ fontSize: 14 }}>
                                        <strong>{c.enrolledCount}</strong> student{c.enrolledCount === 1 ? '' : 's'} enrolled
                                    </span>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <a href={`/instructor-dashboard/students?courseId=${c.courseId}`} style={{ fontSize: 13, color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>
                                            View roster →
                                        </a>
                                        <a href={`/instructor-dashboard/grades?courseId=${c.courseId}`} style={{ fontSize: 13, color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>
                                            Grading →
                                        </a>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
