# -*- coding: utf-8 -*-
import io

PATH = "app/dean-dashboard/ClientShell.jsx"

with io.open(PATH, "r", encoding="utf-8") as f:
    c = f.read()


def r1(c, old, new, label):
    n = c.count(old)
    assert n == 1, "%s: expected 1, found %d" % (label, n)
    return c.replace(old, new)


c = r1(
    c,
    "  { href: '/dean-dashboard/departments', label: 'Departments', icon: '🏢' },\n  { href: '/dean-dashboard/announcements', label: 'Announcements', icon: '📣' },",
    "  { href: '/dean-dashboard/departments', label: 'Departments', icon: '🏢' },\n  { href: '/dean-dashboard/standards', label: 'Programmes & Standards', icon: '📐' },\n  { href: '/dean-dashboard/announcements', label: 'Announcements', icon: '📣' },",
    "dean nav add standards",
)

with io.open(PATH, "w", encoding="utf-8") as f:
    f.write(c)

print("dean-dashboard ClientShell updated.")
