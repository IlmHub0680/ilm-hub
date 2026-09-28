# -*- coding: utf-8 -*-
import io


def r1(c, old, new, label):
    n = c.count(old)
    assert n == 1, "%s: expected 1, found %d" % (label, n)
    return c.replace(old, new)


def load(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()


def save(p, c):
    with io.open(p, "w", encoding="utf-8") as f:
        f.write(c)


# ---------------------------------------------------------------------
# 1. ClientShell nav — add the new Course Evaluations tab.
# ---------------------------------------------------------------------
path = "app/qa-dashboard/ClientShell.jsx"
c = load(path)
c = r1(
    c,
    "  { href: '/qa-dashboard/reviews', label: 'Reviews', icon: '📝' },\n];",
    "  { href: '/qa-dashboard/reviews', label: 'Reviews', icon: '📝' },\n  { href: '/qa-dashboard/evaluations', label: 'Course Evaluations', icon: '⭐' },\n];",
    "qa nav add evaluations",
)
save(path, c)
print("updated", path)

# ---------------------------------------------------------------------
# 2. Schedule page — add a Staff (instructor evaluation) subject type,
#    sourced from the staff list already added to /api/qa/portal.
# ---------------------------------------------------------------------
path = "app/qa-dashboard/schedule/page.tsx"
c = load(path)
c = r1(
    c,
    """        if (subjectType === 'DEPARTMENT')
            return data.subjects.departments.map((d: any) => ({ id: d.id, label: d.nameEn }));
        return data.subjects.faculties.map((f: any) => ({ id: f.id, label: f.nameEn }));""",
    """        if (subjectType === 'DEPARTMENT')
            return data.subjects.departments.map((d: any) => ({ id: d.id, label: d.nameEn }));
        if (subjectType === 'FACULTY')
            return data.subjects.faculties.map((f: any) => ({ id: f.id, label: f.nameEn }));
        return (data.subjects.staff || []).map((s: any) => ({ id: s.id, label: s.nameEn }));""",
    "schedule subjectOptions staff branch",
)
c = r1(
    c,
    """                        <option value="DEPARTMENT">Department</option>
                        <option value="FACULTY">Faculty</option>
                    </select>""",
    """                        <option value="DEPARTMENT">Department</option>
                        <option value="FACULTY">Faculty</option>
                        <option value="STAFF">Staff (Instructor Evaluation)</option>
                    </select>""",
    "schedule subjectType select add STAFF option",
)
save(path, c)
print("updated", path)

print("\nQA nav + schedule page updated with Course Evaluations tab and Staff subject type.")
