# -*- coding: utf-8 -*-
import io

PATH = "app/instructor-dashboard/ClientShell.jsx"

with io.open(PATH, "r", encoding="utf-8") as f:
    c = f.read()


def r1(c, old, new, label):
    n = c.count(old)
    assert n == 1, "%s: expected 1, found %d" % (label, n)
    return c.replace(old, new)


c = r1(
    c,
    "  { href: '/instructor-dashboard/live-classes', label: 'Live Classes', icon: '🎥' },\n];",
    "  { href: '/instructor-dashboard/live-classes', label: 'Live Classes', icon: '🎥' },\n  { href: '/instructor-dashboard/profile', label: 'My Profile', icon: '🪪' },\n];",
    "instructor nav add My Profile",
)

with io.open(PATH, "w", encoding="utf-8") as f:
    f.write(c)

print("instructor-dashboard ClientShell updated with My Profile tab.")
