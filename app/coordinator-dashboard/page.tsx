'use client';
import { useState, useEffect, type CSSProperties } from 'react';
import DashboardShell from '@/components/DashboardShell';

type Prerequisite = {
    id: string;
    titleEn: string;
    courseCode: string;
};

type Course = {
    id: string;
    titleEn: string;
    titleAr: string;
    courseCode: string;
    descriptionEn: string;
    descriptionAr: string;
    creditHours: number;
    semesterLevel: number | null;
    outcomeEn?: string | null;
    assessmentType?: string | null;
    practicalRequired?: boolean;
    practicalPassRequirement?: string | null;
    isPublished: boolean;
    categoryId: string;
    programId: string;
    category?: { nameEn: string } | null;
    prerequisites: Prerequisite[];
    approvalStatus: 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'RETURNED_FOR_REVISION';
    approvalNote?: string | null;
};

const APPROVAL_BADGE: Record<string, string> = {
    DRAFT: 'ih-b-neutral',
    UNDER_REVIEW: 'ih-b-warning',
    APPROVED: 'ih-b-success',
    RETURNED_FOR_REVISION: 'ih-b-danger',
};

type Program = {
    id: string;
    name: string;
    level: string;
    faculty: string | null;
    department: string | null;
};

type Category = {
    id: string;
    nameEn: string;
    nameAr: string;
};

type ReadingCandidate = {
    id: string;
    title: string;
    slug?: string;
};

type CourseReading = {
    id: string;
    readingType: 'REQUIRED' | 'RECOMMENDED';
    note: string;
    order: number;
    libraryResource: { id: string; title: string; slug: string } | null;
    book: { id: string; title: string } | null;
};

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: '▦' },
    { id: 'applicants', label: 'Applicants & Placement', icon: '📝' },
    { id: 'students', label: 'Students', icon: '🎓' },
    { id: 'graduation', label: 'Graduation Candidates', icon: '🎓' },
    { id: 'curriculum', label: 'Curriculum', icon: '📘' },
];

const EMPTY_COURSE_FORM = {
    titleEn: '',
    titleAr: '',
    courseCode: '',
    descriptionEn: '',
    descriptionAr: '',
    categoryId: '',
    creditHours: '3',
    semesterLevel: '',
    outcomeEn: '',
    assessmentType: '',
    practicalRequired: false,
    practicalPassRequirement: '',
    prerequisiteIds: [] as string[],
};

const inputStyle: CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '9px 11px',
    border: '1px solid var(--border)',
    borderRadius: 8,
    fontSize: 13.5,
    color: 'var(--ink)',
    backgroundColor: 'var(--surface)',
};

const labelStyle: CSSProperties = {
    display: 'block',
    marginBottom: 6,
    fontWeight: 700,
    fontSize: 12.5,
    color: 'var(--ink-soft)',
};

function primaryButtonStyle(disabled?: boolean): CSSProperties {
    return {
        padding: '9px 16px',
        borderRadius: 8,
        border: 'none',
        background: 'var(--brand)',
        color: 'var(--on-accent)',
        fontSize: 13,
        fontWeight: 700,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.65 : 1,
        whiteSpace: 'nowrap',
    };
}

const secondaryButtonStyle: CSSProperties = {
    padding: '7px 14px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--ink)',
    fontSize: 12.5,
    fontWeight: 700,
    cursor: 'pointer',
};

const dangerButtonStyle: CSSProperties = {
    padding: '7px 14px',
    borderRadius: 8,
    border: '1px solid var(--danger-tint)',
    background: 'var(--surface)',
    color: 'var(--danger)',
    fontSize: 12.5,
    fontWeight: 700,
    cursor: 'pointer',
};

export default function CoordinatorDashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [programs, setPrograms] = useState<Program[]>([]);
    const [studentCount, setStudentCount] = useState(0);
    const [coursesByProgram, setCoursesByProgram] = useState<Record<string, Course[]>>({});
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [overview, setOverview] = useState<any>(null);

    const [actionError, setActionError] = useState('');
    const [message, setMessage] = useState('');

    const [creatingForProgramId, setCreatingForProgramId] = useState('');
    const [createForm, setCreateForm] = useState({ ...EMPTY_COURSE_FORM });
    const [creating, setCreating] = useState(false);

    const [editingCourseId, setEditingCourseId] = useState('');
    const [editForm, setEditForm] = useState({ ...EMPTY_COURSE_FORM });
    const [savingId, setSavingId] = useState('');
    const [deletingId, setDeletingId] = useState('');
    const [togglingId, setTogglingId] = useState('');
    const [submittingId, setSubmittingId] = useState('');

    const [readingsCourseId, setReadingsCourseId] = useState('');
    const [readings, setReadings] = useState<CourseReading[] | null>(null);
    const [readingsError, setReadingsError] = useState('');
    const [pickerType, setPickerType] = useState<'library' | 'book'>('library');
    const [pickerQuery, setPickerQuery] = useState('');
    const [pickerResults, setPickerResults] = useState<ReadingCandidate[]>([]);
    const [pickerSelection, setPickerSelection] = useState<ReadingCandidate | null>(null);
    const [readingType, setReadingType] = useState<'REQUIRED' | 'RECOMMENDED'>('REQUIRED');
    const [readingNote, setReadingNote] = useState('');
    const [savingReading, setSavingReading] = useState(false);
    const [removingReadingId, setRemovingReadingId] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const q = pickerQuery.trim();
        if (q.length < 2) {
            setPickerResults([]);
            return;
        }
        const handle = setTimeout(() => {
            fetch(`/api/coordinator/reading-candidates?type=${pickerType}&q=${encodeURIComponent(q)}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data?.success) setPickerResults(data.data);
                })
                .catch(() => {});
        }, 300);
        return () => clearTimeout(handle);
    }, [pickerQuery, pickerType]);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [portalRes, coursesRes, categoriesRes, overviewRes] = await Promise.all([
                fetch('/api/coordinator/portal'),
                fetch('/api/coordinator/courses'),
                fetch('/api/coordinator/categories'),
                fetch('/api/coordinator/overview'),
            ]);
            const portalData = await portalRes.json();
            const coursesData = await coursesRes.json();
            const categoriesData = await categoriesRes.json();
            const overviewData = await overviewRes.json();

            if (overviewRes.ok && overviewData.success) {
                setOverview(overviewData.data);
            }

            if (portalRes.ok) {
                setPrograms(portalData.programs || []);
                setStudentCount(portalData.studentCount || 0);
            } else {
                setError(portalData.error || 'Failed to load coordinator data.');
            }

            if (coursesRes.ok && coursesData.success) {
                const grouped: Record<string, Course[]> = {};
                for (const course of coursesData.data as Course[]) {
                    if (!grouped[course.programId]) grouped[course.programId] = [];
                    grouped[course.programId].push(course);
                }
                setCoursesByProgram(grouped);
            }

            if (categoriesRes.ok && categoriesData.success) {
                setCategories(categoriesData.data || []);
            }
        } catch (err) {
            setError('An error occurred while loading your programmes.');
        } finally {
            setLoading(false);
        }
    };

    function startCreate(programId: string) {
        setCreatingForProgramId(programId);
        setCreateForm({ ...EMPTY_COURSE_FORM });
        setActionError('');
        setMessage('');
    }

    async function submitCreate(programId: string) {
        setCreating(true);
        setActionError('');
        setMessage('');

        try {
            const response = await fetch('/api/coordinator/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...createForm, programId }),
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to create this course.');
            }

            setMessage(`"${result.data.titleEn}" was added to the curriculum.`);
            setCreatingForProgramId('');
            await fetchData();
        } catch (err: any) {
            setActionError(err.message || 'Failed to create this course.');
        } finally {
            setCreating(false);
        }
    }

    function startEdit(course: Course) {
        setEditingCourseId(course.id);
        setEditForm({
            titleEn: course.titleEn,
            titleAr: course.titleAr,
            courseCode: course.courseCode,
            descriptionEn: course.descriptionEn,
            descriptionAr: course.descriptionAr,
            categoryId: course.categoryId,
            creditHours: String(course.creditHours),
            semesterLevel: course.semesterLevel != null ? String(course.semesterLevel) : '',
            outcomeEn: course.outcomeEn || '',
            assessmentType: course.assessmentType || '',
            practicalRequired: Boolean(course.practicalRequired),
            practicalPassRequirement: course.practicalPassRequirement || '',
            prerequisiteIds: course.prerequisites.map((p) => p.id),
        });
        setActionError('');
        setMessage('');
    }

    async function submitEdit(courseId: string) {
        setSavingId(courseId);
        setActionError('');

        try {
            const response = await fetch(`/api/coordinator/courses/${courseId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to update this course.');
            }

            setMessage('Course updated.');
            setEditingCourseId('');
            await fetchData();
        } catch (err: any) {
            setActionError(err.message || 'Failed to update this course.');
        } finally {
            setSavingId('');
        }
    }

    async function togglePublish(course: Course) {
        setTogglingId(course.id);
        setActionError('');

        try {
            const response = await fetch(`/api/coordinator/courses/${course.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPublished: !course.isPublished }),
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to update this course.');
            }

            await fetchData();
        } catch (err: any) {
            setActionError(err.message || 'Failed to update this course.');
        } finally {
            setTogglingId('');
        }
    }

    // Model 11 — a coordinator explicitly submits a DRAFT (or returned)
    // course to their Head of Department for real approval, rather than
    // isPublished alone standing in for "approved."
    async function submitForReview(course: Course) {
        setSubmittingId(course.id);
        setActionError('');

        try {
            const response = await fetch(`/api/coordinator/courses/${course.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'submit_for_review' }),
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to submit this course for review.');
            }

            await fetchData();
        } catch (err: any) {
            setActionError(err.message || 'Failed to submit this course for review.');
        } finally {
            setSubmittingId('');
        }
    }

    async function deleteCourse(course: Course) {
        setDeletingId(course.id);
        setActionError('');
        setMessage('');

        try {
            const response = await fetch(`/api/coordinator/courses/${course.id}`, {
                method: 'DELETE',
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to remove this course.');
            }

            setMessage(result.message || 'Course removed.');
            await fetchData();
        } catch (err: any) {
            setActionError(err.message || 'Failed to remove this course.');
        } finally {
            setDeletingId('');
        }
    }

    function toggleReadings(course: Course) {
        if (readingsCourseId === course.id) {
            setReadingsCourseId('');
            setReadings(null);
            return;
        }
        setReadingsCourseId(course.id);
        setReadings(null);
        setReadingsError('');
        setPickerSelection(null);
        setPickerQuery('');
        setPickerResults([]);
        setReadingNote('');
        setReadingType('REQUIRED');
        loadReadings(course.id);
    }

    async function loadReadings(courseId: string) {
        try {
            const res = await fetch(`/api/coordinator/courses/${courseId}/readings`);
            const result = await res.json();
            if (!res.ok || !result.success) throw new Error(result.error || 'Failed to load readings.');
            setReadings(result.data);
        } catch (err: any) {
            setReadingsError(err.message || 'Failed to load readings.');
            setReadings([]);
        }
    }

    async function addReading(courseId: string) {
        if (!pickerSelection) return;
        setSavingReading(true);
        setReadingsError('');
        try {
            const body = {
                readingType,
                note: readingNote,
                libraryResourceId: pickerType === 'library' ? pickerSelection.id : null,
                bookId: pickerType === 'book' ? pickerSelection.id : null,
            };
            const res = await fetch(`/api/coordinator/courses/${courseId}/readings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const result = await res.json();
            if (!res.ok || !result.success) throw new Error(result.error || 'Failed to add reading.');
            setReadings((prev) => [...(prev || []), result.data]);
            setPickerSelection(null);
            setPickerQuery('');
            setPickerResults([]);
            setReadingNote('');
        } catch (err: any) {
            setReadingsError(err.message || 'Failed to add reading.');
        } finally {
            setSavingReading(false);
        }
    }

    async function removeReading(courseId: string, readingId: string) {
        setRemovingReadingId(readingId);
        setReadingsError('');
        try {
            const res = await fetch(`/api/coordinator/courses/${courseId}/readings/${readingId}`, {
                method: 'DELETE',
            });
            const result = await res.json();
            if (!res.ok || !result.success) throw new Error(result.error || 'Failed to remove reading.');
            setReadings((prev) => (prev || []).filter((r) => r.id !== readingId));
        } catch (err: any) {
            setReadingsError(err.message || 'Failed to remove reading.');
        } finally {
            setRemovingReadingId('');
        }
    }

    return (
        <DashboardShell
            brandSub="Coordinator Portal"
            brandIcon="📘"
            navItems={NAV_ITEMS}
            activeId={activeTab}
            onSelect={setActiveTab}
            title="Coordinator Dashboard"
            subtitle="Applicants, students, graduation candidates and curriculum for the programmes you coordinate."
        >
            {error && (
                <div className="ih-card" style={{ background: 'var(--danger-tint)', color: 'var(--danger)', border: '1px solid var(--danger)', marginBottom: 20 }}>
                    {error}
                </div>
            )}
            {message && (
                <div className="ih-card" style={{ background: 'var(--success-tint)', color: 'var(--success)', border: '1px solid var(--success)', marginBottom: 20 }}>
                    {message}
                </div>
            )}
            {actionError && (
                <div className="ih-card" style={{ background: 'var(--danger-tint)', color: 'var(--danger)', border: '1px solid var(--danger)', marginBottom: 20 }}>
                    {actionError}
                </div>
            )}

            {loading ? (
                <div className="ih-card" style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>Loading your programmes…</div>
            ) : programs.length === 0 ? (
                <div className="ih-card">
                    <p style={{ color: 'var(--ink-soft)', margin: 0 }}>
                        No programmes are currently assigned to you as coordinator.
                    </p>
                </div>
            ) : (
                <>
                {activeTab === 'dashboard' && (
                    <section>
                        <div className="ih-stat-grid" style={{ marginBottom: 20 }}>
                            <div className="ih-stat-tile"><div className="n">{overview?.stats?.pendingApplicants ?? 0}</div><div className="l">Pending Applicants</div></div>
                            <div className="ih-stat-tile"><div className="n">{overview?.stats?.activeStudents ?? 0}</div><div className="l">Active Students</div></div>
                            <div className="ih-stat-tile" style={{ borderColor: 'var(--danger)' }}><div className="n">{overview?.stats?.atRiskStudents ?? 0}</div><div className="l">At-Risk Students</div></div>
                            <div className="ih-stat-tile accent"><div className="n">{overview?.stats?.graduationCandidates ?? 0}</div><div className="l">Graduation Candidates</div></div>
                        </div>
                        <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>
                            Scoped to the programmes you coordinate: {overview?.programs?.map((p: any) => p.nameEn).join(', ') || '—'}.
                        </p>
                    </section>
                )}
                {activeTab === 'applicants' && (
                    <section className="ih-card">
                        <h2 style={{ margin: '0 0 14px', fontSize: 18 }}>Applicants in Progress</h2>
                        <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 0 }}>
                            Paid applications awaiting or under admission review for your programmes. Placement itself is administered by Academic Advising once a student is admitted (Student Lifecycle §4).
                        </p>
                        <div className="ih-tbl-wrap">
                            <table className="ih-tbl">
                                <thead><tr><th>Applicant</th><th>Status</th><th>Submitted</th></tr></thead>
                                <tbody>
                                    {(!overview?.applicants || overview.applicants.length === 0) ? (
                                        <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>No applicants awaiting review.</td></tr>
                                    ) : overview.applicants.map((a: any) => (
                                        <tr key={a.id}>
                                            <td><div style={{ fontWeight: 600 }}>{a.fullName}</div><div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{a.email}</div></td>
                                            <td><span className="ih-badge ih-b-warning">{a.status.replace(/_/g, ' ')}</span></td>
                                            <td className="mono">{new Date(a.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
                {activeTab === 'students' && (
                    <section className="ih-card">
                        <h2 style={{ margin: '0 0 14px', fontSize: 18 }}>Active & At-Risk Students</h2>
                        <div className="ih-tbl-wrap">
                            <table className="ih-tbl">
                                <thead><tr><th>Student</th><th>Status</th><th>Standing</th><th>GPA</th><th>Placement</th></tr></thead>
                                <tbody>
                                    {(!overview?.students || overview.students.length === 0) ? (
                                        <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>No students in your programmes yet.</td></tr>
                                    ) : overview.students.map((s: any) => (
                                        <tr key={s.id}>
                                            <td><div style={{ fontWeight: 600 }}>{s.name}</div><div className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{s.studentNo}</div></td>
                                            <td>{s.status}</td>
                                            <td>{s.atRisk ? <span className="ih-badge ih-b-danger">{s.standing}</span> : (s.standing ? <span className="ih-badge ih-b-success">{s.standing}</span> : '—')}</td>
                                            <td>{s.latestGpa != null ? s.latestGpa.toFixed(2) : '—'}</td>
                                            <td>{s.placementStatus || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
                {activeTab === 'graduation' && (
                    <section className="ih-card">
                        <h2 style={{ margin: '0 0 14px', fontSize: 18 }}>Graduation Candidates</h2>
                        <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 0 }}>
                            Eligibility, clearance and approval are computed and tracked exactly as Assessment, Grading &amp; Progression §7.9 and §8 define — this is a read view for awareness, not a second workflow.
                        </p>
                        <div className="ih-tbl-wrap">
                            <table className="ih-tbl">
                                <thead><tr><th>Student</th><th>Status</th><th>Applied</th></tr></thead>
                                <tbody>
                                    {(!overview?.graduationCandidates || overview.graduationCandidates.length === 0) ? (
                                        <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>No graduation activity yet.</td></tr>
                                    ) : overview.graduationCandidates.map((g: any) => (
                                        <tr key={g.id}>
                                            <td><div style={{ fontWeight: 600 }}>{g.student?.user?.name}</div><div className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{g.student?.studentNo}</div></td>
                                            <td><span className="ih-badge ih-b-success">{g.status.replace(/_/g, ' ')}</span></td>
                                            <td className="mono">{g.appliedAt ? new Date(g.appliedAt).toLocaleDateString() : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
                {activeTab === 'curriculum' && (
                <section id="overview">
                    <div className="ih-stat-grid" style={{ marginBottom: 28 }}>
                        <div className="ih-stat-tile"><div className="n">{programs.length}</div><div className="l">Programmes Coordinated</div></div>
                        <div className="ih-stat-tile accent"><div className="n">{studentCount}</div><div className="l">Students Across Programmes</div></div>
                    </div>

                    {programs.map((program) => {
                        const courses = coursesByProgram[program.id] || [];

                        return (
                            <div key={program.id} className="ih-card" style={{ marginBottom: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                                    <div>
                                        <h2 style={{ margin: '0 0 4px 0', fontSize: 20 }}>{program.name}</h2>
                                        <p style={{ color: 'var(--ink-soft)', margin: 0, fontSize: 14 }}>
                                            {program.faculty} {program.department ? `· ${program.department}` : ''} · {program.level}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        style={primaryButtonStyle()}
                                        onClick={() => startCreate(program.id === creatingForProgramId ? '' : program.id)}
                                    >
                                        {creatingForProgramId === program.id ? 'Cancel' : '+ Add Course'}
                                    </button>
                                </div>

                                {creatingForProgramId === program.id && (
                                    <div style={{ marginTop: 16, padding: 16, border: '1px dashed var(--border)', borderRadius: 12, background: 'var(--paper)' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
                                            <label>
                                                <span style={labelStyle}>Course code</span>
                                                <input style={inputStyle} value={createForm.courseCode} onChange={(e) => setCreateForm((p) => ({ ...p, courseCode: e.target.value }))} placeholder="ISL-104" />
                                            </label>
                                            <label>
                                                <span style={labelStyle}>Category</span>
                                                <select style={inputStyle} value={createForm.categoryId} onChange={(e) => setCreateForm((p) => ({ ...p, categoryId: e.target.value }))}>
                                                    <option value="">Select…</option>
                                                    {categories.map((c) => (
                                                        <option key={c.id} value={c.id}>{c.nameEn}</option>
                                                    ))}
                                                </select>
                                            </label>
                                            <label>
                                                <span style={labelStyle}>Credit hours</span>
                                                <input type="number" min={1} style={inputStyle} value={createForm.creditHours} onChange={(e) => setCreateForm((p) => ({ ...p, creditHours: e.target.value }))} />
                                            </label>
                                            <label>
                                                <span style={labelStyle}>Semester level</span>
                                                <input type="number" min={1} style={inputStyle} value={createForm.semesterLevel} onChange={(e) => setCreateForm((p) => ({ ...p, semesterLevel: e.target.value }))} placeholder="e.g. 1" />
                                            </label>
                                            <label>
                                                <span style={labelStyle}>Title (English)</span>
                                                <input style={inputStyle} value={createForm.titleEn} onChange={(e) => setCreateForm((p) => ({ ...p, titleEn: e.target.value }))} />
                                            </label>
                                            <label>
                                                <span style={labelStyle}>Title (Arabic)</span>
                                                <input dir="rtl" style={inputStyle} value={createForm.titleAr} onChange={(e) => setCreateForm((p) => ({ ...p, titleAr: e.target.value }))} />
                                            </label>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12, marginTop: 12 }}>
                                            <label>
                                                <span style={labelStyle}>Description (English)</span>
                                                <textarea style={{ ...inputStyle, minHeight: 64, resize: 'vertical' }} value={createForm.descriptionEn} onChange={(e) => setCreateForm((p) => ({ ...p, descriptionEn: e.target.value }))} />
                                            </label>
                                            <label>
                                                <span style={labelStyle}>Description (Arabic)</span>
                                                <textarea dir="rtl" style={{ ...inputStyle, minHeight: 64, resize: 'vertical' }} value={createForm.descriptionAr} onChange={(e) => setCreateForm((p) => ({ ...p, descriptionAr: e.target.value }))} />
                                            </label>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12, marginTop: 12 }}>
                                            <label>
                                                <span style={labelStyle}>Learning outcome (optional)</span>
                                                <input style={inputStyle} value={createForm.outcomeEn} onChange={(e) => setCreateForm((p) => ({ ...p, outcomeEn: e.target.value }))} placeholder="As stated in the approved course catalogue" />
                                            </label>
                                            <label>
                                                <span style={labelStyle}>Assessment type (optional)</span>
                                                <input style={inputStyle} value={createForm.assessmentType} onChange={(e) => setCreateForm((p) => ({ ...p, assessmentType: e.target.value }))} placeholder="e.g. Written + Practical" />
                                            </label>
                                        </div>
                                        <div style={{ marginTop: 12 }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <input type="checkbox" checked={createForm.practicalRequired} onChange={(e) => setCreateForm((p) => ({ ...p, practicalRequired: e.target.checked, practicalPassRequirement: e.target.checked ? p.practicalPassRequirement : '' }))} />
                                                <span style={labelStyle}>This course has an approved practical assessment component</span>
                                            </label>
                                            {createForm.practicalRequired && (
                                                <label style={{ display: 'block', marginTop: 8 }}>
                                                    <span style={labelStyle}>Practical pass requirement (as approved)</span>
                                                    <input style={inputStyle} value={createForm.practicalPassRequirement} onChange={(e) => setCreateForm((p) => ({ ...p, practicalPassRequirement: e.target.value }))} placeholder="e.g. Must pass the Tajweed recitation assessment" />
                                                </label>
                                            )}
                                        </div>
                                        {courses.length > 0 && (
                                            <label style={{ display: 'block', marginTop: 12 }}>
                                                <span style={labelStyle}>Prerequisites (optional)</span>
                                                <select
                                                    multiple
                                                    style={{ ...inputStyle, minHeight: 84 }}
                                                    value={createForm.prerequisiteIds}
                                                    onChange={(e) => {
                                                        const values = Array.from(e.target.selectedOptions).map((o) => o.value);
                                                        setCreateForm((p) => ({ ...p, prerequisiteIds: values }));
                                                    }}
                                                >
                                                    {courses.map((c) => (
                                                        <option key={c.id} value={c.id}>{c.courseCode} — {c.titleEn}</option>
                                                    ))}
                                                </select>
                                            </label>
                                        )}
                                        <div style={{ marginTop: 14 }}>
                                            <button type="button" disabled={creating} style={primaryButtonStyle(creating)} onClick={() => submitCreate(program.id)}>
                                                {creating ? 'Adding…' : 'Add Course'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="ih-tbl-wrap" style={{ marginTop: 16 }}>
                                    <table className="ih-tbl">
                                        <thead>
                                            <tr>
                                                <th>Course</th>
                                                <th>Code</th>
                                                <th>Level</th>
                                                <th>Credits</th>
                                                <th>Status</th>
                                                <th>Approval</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {courses.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>
                                                        No courses under this programme yet — add the first one above.
                                                    </td>
                                                </tr>
                                            ) : (
                                                courses.map((course) => (
                                                    editingCourseId === course.id ? (
                                                        <tr key={course.id}>
                                                            <td colSpan={6}>
                                                                <div style={{ padding: '12px 4px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
                                                                    <label>
                                                                        <span style={labelStyle}>Category</span>
                                                                        <select style={inputStyle} value={editForm.categoryId} onChange={(e) => setEditForm((p) => ({ ...p, categoryId: e.target.value }))}>
                                                                            {categories.map((c) => (
                                                                                <option key={c.id} value={c.id}>{c.nameEn}</option>
                                                                            ))}
                                                                        </select>
                                                                    </label>
                                                                    <label>
                                                                        <span style={labelStyle}>Credit hours</span>
                                                                        <input type="number" min={1} style={inputStyle} value={editForm.creditHours} onChange={(e) => setEditForm((p) => ({ ...p, creditHours: e.target.value }))} />
                                                                    </label>
                                                                    <label>
                                                                        <span style={labelStyle}>Semester level</span>
                                                                        <input type="number" min={1} style={inputStyle} value={editForm.semesterLevel} onChange={(e) => setEditForm((p) => ({ ...p, semesterLevel: e.target.value }))} />
                                                                    </label>
                                                                    <label>
                                                                        <span style={labelStyle}>Title (English)</span>
                                                                        <input style={inputStyle} value={editForm.titleEn} onChange={(e) => setEditForm((p) => ({ ...p, titleEn: e.target.value }))} />
                                                                    </label>
                                                                    <label>
                                                                        <span style={labelStyle}>Title (Arabic)</span>
                                                                        <input dir="rtl" style={inputStyle} value={editForm.titleAr} onChange={(e) => setEditForm((p) => ({ ...p, titleAr: e.target.value }))} />
                                                                    </label>
                                                                </div>
                                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12, marginTop: 4, padding: '0 4px' }}>
                                                                    <label>
                                                                        <span style={labelStyle}>Description (English)</span>
                                                                        <textarea style={{ ...inputStyle, minHeight: 64, resize: 'vertical' }} value={editForm.descriptionEn} onChange={(e) => setEditForm((p) => ({ ...p, descriptionEn: e.target.value }))} />
                                                                    </label>
                                                                    <label>
                                                                        <span style={labelStyle}>Description (Arabic)</span>
                                                                        <textarea dir="rtl" style={{ ...inputStyle, minHeight: 64, resize: 'vertical' }} value={editForm.descriptionAr} onChange={(e) => setEditForm((p) => ({ ...p, descriptionAr: e.target.value }))} />
                                                                    </label>
                                                                </div>
                                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12, marginTop: 4, padding: '0 4px' }}>
                                                                    <label>
                                                                        <span style={labelStyle}>Learning outcome (optional)</span>
                                                                        <input style={inputStyle} value={editForm.outcomeEn} onChange={(e) => setEditForm((p) => ({ ...p, outcomeEn: e.target.value }))} placeholder="As stated in the approved course catalogue" />
                                                                    </label>
                                                                    <label>
                                                                        <span style={labelStyle}>Assessment type (optional)</span>
                                                                        <input style={inputStyle} value={editForm.assessmentType} onChange={(e) => setEditForm((p) => ({ ...p, assessmentType: e.target.value }))} placeholder="e.g. Written + Practical" />
                                                                    </label>
                                                                </div>
                                                                <div style={{ margin: '4px 4px 0' }}>
                                                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                        <input type="checkbox" checked={editForm.practicalRequired} onChange={(e) => setEditForm((p) => ({ ...p, practicalRequired: e.target.checked, practicalPassRequirement: e.target.checked ? p.practicalPassRequirement : '' }))} />
                                                                        <span style={labelStyle}>This course has an approved practical assessment component</span>
                                                                    </label>
                                                                    {editForm.practicalRequired && (
                                                                        <label style={{ display: 'block', marginTop: 8 }}>
                                                                            <span style={labelStyle}>Practical pass requirement (as approved)</span>
                                                                            <input style={inputStyle} value={editForm.practicalPassRequirement} onChange={(e) => setEditForm((p) => ({ ...p, practicalPassRequirement: e.target.value }))} placeholder="e.g. Must pass the Tajweed recitation assessment" />
                                                                        </label>
                                                                    )}
                                                                </div>
                                                                <label style={{ display: 'block', margin: '12px 4px 0' }}>
                                                                    <span style={labelStyle}>Prerequisites</span>
                                                                    <select
                                                                        multiple
                                                                        style={{ ...inputStyle, minHeight: 84 }}
                                                                        value={editForm.prerequisiteIds}
                                                                        onChange={(e) => {
                                                                            const values = Array.from(e.target.selectedOptions).map((o) => o.value);
                                                                            setEditForm((p) => ({ ...p, prerequisiteIds: values }));
                                                                        }}
                                                                    >
                                                                        {courses.filter((c) => c.id !== course.id).map((c) => (
                                                                            <option key={c.id} value={c.id}>{c.courseCode} — {c.titleEn}</option>
                                                                        ))}
                                                                    </select>
                                                                </label>
                                                                <div style={{ display: 'flex', gap: 8, margin: '14px 4px 4px' }}>
                                                                    <button type="button" disabled={savingId === course.id} style={primaryButtonStyle(savingId === course.id)} onClick={() => submitEdit(course.id)}>
                                                                        {savingId === course.id ? 'Saving…' : 'Save'}
                                                                    </button>
                                                                    <button type="button" style={secondaryButtonStyle} onClick={() => setEditingCourseId('')}>
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        <tr key={course.id}>
                                                            <td style={{ fontWeight: 500 }}>{course.titleEn}</td>
                                                            <td className="mono">{course.courseCode}</td>
                                                            <td>{course.semesterLevel ?? '—'}</td>
                                                            <td>{course.creditHours}</td>
                                                            <td>
                                                                <span className={`ih-badge ${course.isPublished ? 'ih-b-success' : 'ih-b-neutral'}`}>
                                                                    {course.isPublished ? 'Published' : 'Draft'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className={`ih-badge ${APPROVAL_BADGE[course.approvalStatus] || 'ih-b-neutral'}`}>
                                                                    {course.approvalStatus.replace(/_/g, ' ')}
                                                                </span>
                                                                {course.approvalStatus === 'RETURNED_FOR_REVISION' && course.approvalNote && (
                                                                    <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 4, maxWidth: 180 }}>{course.approvalNote}</div>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                                    <button type="button" style={secondaryButtonStyle} onClick={() => startEdit(course)}>Edit</button>
                                                                    <button type="button" style={secondaryButtonStyle} onClick={() => toggleReadings(course)}>
                                                                        {readingsCourseId === course.id ? 'Close Readings' : 'Readings'}
                                                                    </button>
                                                                    <button type="button" disabled={togglingId === course.id} style={secondaryButtonStyle} onClick={() => togglePublish(course)}>
                                                                        {course.isPublished ? 'Unpublish' : 'Publish'}
                                                                    </button>
                                                                    {(course.approvalStatus === 'DRAFT' || course.approvalStatus === 'RETURNED_FOR_REVISION') && (
                                                                        <button type="button" disabled={submittingId === course.id} style={primaryButtonStyle(submittingId === course.id)} onClick={() => submitForReview(course)}>
                                                                            {submittingId === course.id ? 'Submitting…' : 'Submit for Review'}
                                                                        </button>
                                                                    )}
                                                                    <button type="button" disabled={deletingId === course.id} style={dangerButtonStyle} onClick={() => deleteCourse(course)}>
                                                                        {deletingId === course.id ? 'Removing…' : 'Delete'}
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                ))
                                            )}
                                            {readingsCourseId && courses.some((c) => c.id === readingsCourseId) && (
                                                <tr>
                                                    <td colSpan={7}>
                                                        <div style={{ padding: '14px 4px', borderTop: '1px dashed var(--border)' }}>
                                                            <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800 }}>
                                                                Required &amp; Recommended Readings
                                                            </h3>

                                                            {readingsError && (
                                                                <div className="ih-card" style={{ padding: '10px 14px', marginBottom: 12, background: 'var(--danger-tint)', color: 'var(--danger)' }}>
                                                                    {readingsError}
                                                                </div>
                                                            )}

                                                            <div style={{ padding: 14, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--paper)', marginBottom: 14 }}>
                                                                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                                                                    <button
                                                                        type="button"
                                                                        style={pickerType === 'library' ? primaryButtonStyle() : secondaryButtonStyle}
                                                                        onClick={() => { setPickerType('library'); setPickerSelection(null); setPickerResults([]); setPickerQuery(''); }}
                                                                    >
                                                                        Digital Library
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        style={pickerType === 'book' ? primaryButtonStyle() : secondaryButtonStyle}
                                                                        onClick={() => { setPickerType('book'); setPickerSelection(null); setPickerResults([]); setPickerQuery(''); }}
                                                                    >
                                                                        Bookstore
                                                                    </button>
                                                                </div>

                                                                <label style={{ display: 'block', marginBottom: 10 }}>
                                                                    <span style={labelStyle}>Search {pickerType === 'book' ? 'Bookstore' : 'Digital Library'} by title</span>
                                                                    <input
                                                                        style={inputStyle}
                                                                        value={pickerQuery}
                                                                        onChange={(e) => setPickerQuery(e.target.value)}
                                                                        placeholder="Type at least 2 characters…"
                                                                    />
                                                                </label>

                                                                {pickerResults.length > 0 && !pickerSelection && (
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                                                                        {pickerResults.map((item) => (
                                                                            <button
                                                                                key={item.id}
                                                                                type="button"
                                                                                style={{ ...secondaryButtonStyle, textAlign: 'left' }}
                                                                                onClick={() => setPickerSelection(item)}
                                                                            >
                                                                                {item.title}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                {pickerSelection && (
                                                                    <div style={{ padding: 12, background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                                                            <strong>{pickerSelection.title}</strong>
                                                                            <button type="button" style={secondaryButtonStyle} onClick={() => setPickerSelection(null)}>Change</button>
                                                                        </div>
                                                                        <div style={{ display: 'flex', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                                                                            <label style={{ flex: '1 1 160px' }}>
                                                                                <span style={labelStyle}>Type</span>
                                                                                <select style={inputStyle} value={readingType} onChange={(e) => setReadingType(e.target.value as 'REQUIRED' | 'RECOMMENDED')}>
                                                                                    <option value="REQUIRED">Required</option>
                                                                                    <option value="RECOMMENDED">Recommended</option>
                                                                                </select>
                                                                            </label>
                                                                            <label style={{ flex: '2 1 240px' }}>
                                                                                <span style={labelStyle}>Note (optional)</span>
                                                                                <input style={inputStyle} value={readingNote} onChange={(e) => setReadingNote(e.target.value)} placeholder="e.g. Chapters 1-4" />
                                                                            </label>
                                                                        </div>
                                                                        <button type="button" disabled={savingReading} style={primaryButtonStyle(savingReading)} onClick={() => addReading(readingsCourseId)}>
                                                                            {savingReading ? 'Adding…' : 'Add to Syllabus'}
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {readings === null ? (
                                                                <div style={{ color: 'var(--ink-soft)', fontSize: 13 }}>Loading…</div>
                                                            ) : readings.length === 0 ? (
                                                                <div style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No readings linked yet.</div>
                                                            ) : (
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                                    {readings.map((reading) => (
                                                                        <div
                                                                            key={reading.id}
                                                                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)' }}
                                                                        >
                                                                            <div>
                                                                                <div style={{ fontWeight: 700, fontSize: 13.5 }}>
                                                                                    {reading.libraryResource?.title || reading.book?.title}
                                                                                    <span style={{ fontSize: 11, fontWeight: 700, marginLeft: 8, padding: '2px 8px', borderRadius: 999, background: 'var(--brand-tint)', color: 'var(--brand)' }}>
                                                                                        {reading.readingType === 'REQUIRED' ? 'Required' : 'Recommended'}
                                                                                    </span>
                                                                                    <span style={{ fontSize: 11, color: 'var(--ink-soft)', marginLeft: 8 }}>
                                                                                        {reading.libraryResource ? 'Digital Library' : 'Bookstore'}
                                                                                    </span>
                                                                                </div>
                                                                                {reading.note && <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>{reading.note}</div>}
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                disabled={removingReadingId === reading.id}
                                                                                style={secondaryButtonStyle}
                                                                                onClick={() => removeReading(readingsCourseId, reading.id)}
                                                                            >
                                                                                {removingReadingId === reading.id ? 'Removing…' : 'Remove'}
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </section>
                )}
                </>
            )}
        </DashboardShell>
    );
}
