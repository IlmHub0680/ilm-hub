# -*- coding: utf-8 -*-
import io

def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d" % (label, c)
    return content.replace(old, new)

def load(path):
    with io.open(path, "r", encoding="utf-8") as f:
        return f.read()

def save(path, content):
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(content)

# 1. Add the Community nav item to the Student Portal's academics sidebar.
path = "app/academics/layout.jsx"
c = load(path)
c = r1(
    c,
    "  { href: '/academics/attendance', label: 'Attendance Record', icon: '◷' },\n];",
    "  { href: '/academics/attendance', label: 'Attendance Record', icon: '◷' },\n"
    "  { href: '/academics/community', label: 'Ulul Azm Community', icon: '🗣️' },\n];",
    "academics/layout.jsx: add Community nav item",
)
save(path, c)
print("app/academics/layout.jsx: Ulul Azm Community nav item added.")

# 2. Add a discoverable KNOWLEDGE entry for the assistant, alongside the
#    other employee-facing entries (it's reachable to students too via
#    the 'general'/'student' zones, same as every other entry).
path = "lib/assistantKnowledge.js"
c = load(path)
c = r1(
    c,
    """  {
    id: 'employee-assigned-courses',""",
    """  {
    id: 'community',
    zones: ['student', 'general'],
    keywords: ['community', 'student community', 'discussion board', 'connect with other students', 'ulul azm community'],
    department: null,
    href: '/academics/community',
    answer:
      'Ulul Azm Community (under Academic System, in your Student Portal) is a shared space for the whole student body -- not tied to any single course -- to discuss academic life, share events, and see announcements. It sits alongside Section Discussion, which stays the place for course-specific exercises and questions.',
  },
  {
    id: 'employee-assigned-courses',""",
    "assistantKnowledge.js: add community KNOWLEDGE entry",
)
save(path, c)
print("lib/assistantKnowledge.js: community KNOWLEDGE entry added.")
