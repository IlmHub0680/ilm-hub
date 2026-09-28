# -*- coding: utf-8 -*-
import io

PATH = "app/coordinator-dashboard/page.tsx"

with io.open(PATH, "r", encoding="utf-8") as f:
    c = f.read()


def r1(c, old, new, label):
    n = c.count(old)
    assert n == 1, "%s: expected 1, found %d" % (label, n)
    return c.replace(old, new)


# 1. NAV_ITEMS — five real tabs instead of one.
c = r1(
    c,
    "const NAV_ITEMS = [{ id: 'overview', label: 'Overview', icon: '📘' }];",
    """const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: '▦' },
    { id: 'applicants', label: 'Applicants & Placement', icon: '📝' },
    { id: 'students', label: 'Students', icon: '🎓' },
    { id: 'graduation', label: 'Graduation Candidates', icon: '🎓' },
    { id: 'curriculum', label: 'Curriculum', icon: '📘' },
];""",
    "NAV_ITEMS expansion",
)

# 2. New state: activeTab + overview data.
c = r1(
    c,
    "    const [categories, setCategories] = useState<Category[]>([]);",
    "    const [categories, setCategories] = useState<Category[]>([]);\n    const [activeTab, setActiveTab] = useState('dashboard');\n    const [overview, setOverview] = useState<any>(null);",
    "activeTab + overview state",
)

# 3. Fetch the new /api/coordinator/overview endpoint alongside the rest.
c = r1(
    c,
    """            const [portalRes, coursesRes, categoriesRes] = await Promise.all([
                fetch('/api/coordinator/portal'),
                fetch('/api/coordinator/courses'),
                fetch('/api/coordinator/categories'),
            ]);
            const portalData = await portalRes.json();
            const coursesData = await coursesRes.json();
            const categoriesData = await categoriesRes.json();""",
    """            const [portalRes, coursesRes, categoriesRes, overviewRes] = await Promise.all([
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
            }""",
    "fetch coordinator overview",
)

# 4. DashboardShell: real tab switching.
c = r1(
    c,
    '            navItems={NAV_ITEMS}\n            activeId="overview"\n            title="Coordinator Dashboard"\n            subtitle="Manage the curriculum for the programmes you coordinate."',
    '            navItems={NAV_ITEMS}\n            activeId={activeTab}\n            onSelect={setActiveTab}\n            title="Coordinator Dashboard"\n            subtitle="Applicants, students, graduation candidates and curriculum for the programmes you coordinate."',
    "DashboardShell tab switching",
)

# 5. Open a fragment before the curriculum section, adding the four new
#    tab panels ahead of it.
NEW_TABS_JSX = """                <>
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
                <section id="overview">"""

c = r1(
    c,
    "            ) : (\n                <section id=\"overview\">",
    "            ) : (\n" + NEW_TABS_JSX,
    "open new tab panels before curriculum section",
)

# 6. Close the fragment and the new `curriculum` conditional right after
#    the curriculum section's closing tag.
c = r1(
    c,
    "                    })}\n                </section>\n            )}\n        </DashboardShell>",
    "                    })}\n                </section>\n                )}\n                </>\n            )}\n        </DashboardShell>",
    "close curriculum tab + fragment",
)

with io.open(PATH, "w", encoding="utf-8") as f:
    f.write(c)

print("coordinator-dashboard/page.tsx converted to a five-tab portal.")
