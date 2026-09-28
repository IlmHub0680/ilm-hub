import re

def r1(content, old, new, label):
    count = content.count(old)
    assert count == 1, f"{label}: expected 1 match, found {count}"
    return content.replace(old, new, 1)

# --- HOD ClientShell: add "Approvals & Integrity" after Instructors & Courses ---
path = 'app/hod-dashboard/ClientShell.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
content = r1(
    content,
    "  { href: '/hod-dashboard/instructors', label: 'Instructors & Courses', icon: '🧑‍🏫' },\n",
    "  { href: '/hod-dashboard/instructors', label: 'Instructors & Courses', icon: '🧑‍🏫' },\n"
    "  { href: '/hod-dashboard/approvals', label: 'Approvals & Integrity', icon: '✔️' },\n",
    'hod nav'
)
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Patched', path)

# --- Dean ClientShell: add "Approvals" after Programmes & Standards ---
path = 'app/dean-dashboard/ClientShell.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
content = r1(
    content,
    "  { href: '/dean-dashboard/standards', label: 'Programmes & Standards', icon: '📐' },\n",
    "  { href: '/dean-dashboard/standards', label: 'Programmes & Standards', icon: '📐' },\n"
    "  { href: '/dean-dashboard/approvals', label: 'Approvals', icon: '✔️' },\n",
    'dean nav'
)
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Patched', path)

# --- Instructor ClientShell: add "Integrity" after My Profile ---
path = 'app/instructor-dashboard/ClientShell.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
content = r1(
    content,
    "  { href: '/instructor-dashboard/profile', label: 'My Profile', icon: '🪪' },\n",
    "  { href: '/instructor-dashboard/profile', label: 'My Profile', icon: '🪪' },\n"
    "  { href: '/instructor-dashboard/integrity', label: 'Integrity', icon: '⚖️' },\n",
    'instructor nav'
)
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Patched', path)

# --- QA ClientShell: add "KPIs" after Course Evaluations ---
path = 'app/qa-dashboard/ClientShell.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
content = r1(
    content,
    "  { href: '/qa-dashboard/evaluations', label: 'Course Evaluations', icon: '⭐' },\n",
    "  { href: '/qa-dashboard/evaluations', label: 'Course Evaluations', icon: '⭐' },\n"
    "  { href: '/qa-dashboard/kpis', label: 'KPIs', icon: '📊' },\n",
    'qa nav'
)
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Patched', path)

print('All nav patches applied.')
