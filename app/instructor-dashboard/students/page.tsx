'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { fieldStyle } from '../_shared';

type Course = {
    id: string;
    titleEn: string;
    courseCode: string;
};

type RosterStudent = {
    id: string;
    studentNo: string;
    name: string;
    email: string;
    level: number | null;
    status: string;
    program: string | null;
};

type EnrolleeRow = RosterStudent & {
    courseCodes: string[];
};

const STATUS_TONE: Record<string, string> = {
    ACTIVE: 'ih-b-success',
    GRADUATED: 'ih-b-success',
    ADMITTED: 'ih-b-neutral',
    APPLICANT: 'ih-b-neutral',
    DEFERRED: 'ih-b-warning',
    SUSPENDED: 'ih-b-danger',
    WITHDRAWN: 'ih-b-danger',
    DISMISSED: 'ih-b-danger',
};

const ALL_COURSES = 'ALL';

function StudentEnrolleesPageInner() {
    const searchParams = useSearchParams();
    const initialCourseId = searchParams.get('courseId') || ALL_COURSES;
    const [courses, setCourses] = useState<Course[]>([]);
    const [courseFilter, setCourseFilter] = useState<string>(initialCourseId);
    const [rows, setRows] = useState<EnrolleeRow[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('/api/instructor/roster', { credentials: 'include' })
            .then((r) => r.json())
            .then((data) => {
                if (data.success) {
                    setCourses(data.courses || []);
                } else {
                    setError(data.error || 'Unable to load your courses.');
                }
            })
            .catch(() => setError('Unable to load your courses.'))
            .finally(() => setLoadingCourses(false));
    }, []);

    useEffect(() => {
        if (courses.length === 0) {
            setRows([]);
            return;
        }

        const targets = courseFilter === ALL_COURSES ? courses : courses.filter((c) => c.id === courseFilter);
        if (targets.length === 0) {
            setRows([]);
            return;
        }

        setLoadingStudents(true);
        setError('');

        Promise.all(
            targets.map((course) =>
                fetch(`/api/instructor/roster?courseId=${course.id}`, { credentials: 'include' })
                    .then((r) => r.json())
                    .then((data) => ({ course, students: (data.success ? data.students : []) as RosterStudent[] }))
                    .catch(() => ({ course, students: [] as RosterStudent[] }))
            )
        )
            .then((results) => {
                const byStudent = new Map<string, EnrolleeRow>();
                for (const { course, students } of results) {
                    for (const s of students) {
                        const existing = byStudent.get(s.id);
                        if (existing) {
                            if (!existing.courseCodes.includes(course.courseCode)) {
                                existing.courseCodes.push(course.courseCode);
                            }
                        } else {
                            byStudent.set(s.id, { ...s, courseCodes: [course.courseCode] });
                        }
                    }
                }
                const merged = Array.from(byStudent.values()).sort((a, b) => a.studentNo.localeCompare(b.studentNo));
                setRows(merged);
            })
            .finally(() => setLoadingStudents(false));
    }, [courseFilter, courses]);

    const visible = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter((r) => `${r.name} ${r.studentNo} ${r.email} ${r.program || ''}`.toLowerCase().includes(q));
    }, [rows, search]);

    const loading = loadingCourses || loadingStudents;

    return (
        <div className="ih-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
                <div>
                    <h2 style={{ margin: '0 0 4px 0', fontSize: 20 }}>Student Enrollees</h2>
                    <p style={{ color: 'var(--ink-soft)', margin: 0, fontSize: 14 }}>
                        Students registered across your active modules.
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <label htmlFor="students-course-dropdown" style={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap' }}>Course:</label>
                    <select
                        id="students-course-dropdown"
                        value={courseFilter}
                        onChange={(e) => setCourseFilter(e.target.value)}
                        style={{ ...fieldStyle, minWidth: 220 }}
                    >
                        <option value={ALL_COURSES}>All my courses</option>
                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>{course.courseCode} - {course.titleEn}</option>
                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <div className="ih-card" style={{ padding: '12px 14px', marginBottom: 20, background: 'var(--danger-tint)', color: 'var(--danger)' }}>
                    {error}
                </div>
            )}

            {!loadingCourses && courses.length > 0 && (
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, student number, or email…"
                    style={{ ...fieldStyle, width: '100%', marginBottom: 16 }}
                    aria-label="Search enrolled students"
                />
            )}

            {loadingCourses ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>Loading your courses…</div>
            ) : courses.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>You are not assigned to any courses.</div>
            ) : (
                <div className="ih-tbl-wrap">
                    <table className="ih-tbl">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Email</th>
                                <th>Programme</th>
                                <th>Level</th>
                                <th>Status</th>
                                {courseFilter === ALL_COURSES && <th>Courses</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {loadingStudents ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>Loading students…</td></tr>
                            ) : visible.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>
                                        {rows.length === 0 ? 'No students enrolled yet.' : 'No students match your search.'}
                                    </td>
                                </tr>
                            ) : (
                                visible.map((s) => {
                                    const tone = STATUS_TONE[s.status] || 'ih-b-neutral';
                                    return (
                                        <tr key={s.id}>
                                            <td>
                                                <div style={{ fontWeight: 500 }}>{s.name}</div>
                                                <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{s.studentNo}</div>
                                            </td>
                                            <td>{s.email}</td>
                                            <td>{s.program || '—'}</td>
                                            <td>{s.level ?? '—'}</td>
                                            <td><span className={`ih-badge ${tone}`}>{s.status}</span></td>
                                            {courseFilter === ALL_COURSES && (
                                                <td>
                                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                        {s.courseCodes.map((code) => (
                                                            <span key={code} className="ih-badge ih-b-neutral">{code}</span>
                                                        ))}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {!loadingCourses && !loadingStudents && rows.length > 0 && (
                <div style={{ marginTop: 16, fontSize: 14, color: 'var(--ink-soft)' }}>
                    {visible.length} of {rows.length} student{rows.length === 1 ? '' : 's'} shown
                </div>
            )}
        </div>
    );
}


export default function StudentEnrolleesPage() {
  return (
    <Suspense fallback={null}>
      <StudentEnrolleesPageInner />
    </Suspense>
  );
}
