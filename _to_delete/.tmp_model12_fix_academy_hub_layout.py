# -*- coding: utf-8 -*-
import io

def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d" % (label, c)
    return content.replace(old, new)

path = "app/admin/academy-hub/layout.jsx"
with io.open(path, "r", encoding="utf-8") as f:
    c = f.read()

OLD_SECTIONS_ROW = "  { href: '/admin/academy-academic-regulations', label: 'Academic Regulations & QA', icon: '⚖️' },\n"
NEW_SECTIONS_ROW = (
    OLD_SECTIONS_ROW
    + "  { href: '/admin/academy-master-integration', label: 'Website & Master Integration', icon: '\U0001F9E9' },\n"
)
c = r1(c, OLD_SECTIONS_ROW, NEW_SECTIONS_ROW, "academy-hub layout: sections row")

c = r1(
    c,
    "  '/admin/academy-faculty-portals',\n  '/admin/academy-academic-regulations',\n];",
    "  '/admin/academy-faculty-portals',\n  '/admin/academy-academic-regulations',\n  '/admin/academy-master-integration',\n];",
    "academy-hub layout: ACADEMY_SECTION_HREFS array",
)

with io.open(path, "w", encoding="utf-8") as f:
    f.write(c)
print("app/admin/academy-hub/layout.jsx fixed.")
