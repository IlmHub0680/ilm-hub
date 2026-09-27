# -*- coding: utf-8 -*-
import io

PATH = "app/hod-dashboard/ClientShell.jsx"

with io.open(PATH, "r", encoding="utf-8") as f:
    c = f.read()


def r1(c, old, new, label):
    n = c.count(old)
    assert n == 1, "%s: expected 1, found %d" % (label, n)
    return c.replace(old, new)


c = r1(
    c,
    "  { href: '/hod-dashboard/programs', label: 'Programmes', icon: '📚' },\n  { href: '/hod-dashboard/announcements', label: 'Announcements', icon: '📣' },",
    "  { href: '/hod-dashboard/programs', label: 'Programmes', icon: '📚' },\n  { href: '/hod-dashboard/instructors', label: 'Instructors & Courses', icon: '🧑‍🏫' },\n  { href: '/hod-dashboard/announcements', label: 'Announcements', icon: '📣' },",
    "hod nav add instructors",
)

with io.open(PATH, "w", encoding="utf-8") as f:
    f.write(c)

print("hod-dashboard ClientShell updated.")
