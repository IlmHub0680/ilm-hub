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

# =======================================================================
# lib/assistantKnowledge.js
# =======================================================================
path = "lib/assistantKnowledge.js"
c = load(path)

# 1. Update the header comment's zone list to mention 'employee'.
c = r1(
    c,
    "// relevant to: 'student' | 'bookstore' | 'media' | 'library' | 'general'.",
    "// relevant to: 'student' | 'employee' | 'bookstore' | 'media' | 'library' | 'general'.\n"
    "// 'employee' covers staff/instructor-facing topics (their own teaching\n"
    "// dashboard, roster, attendance-taking, assessments, tasks) as distinct\n"
    "// from the 'student' topics above, which are about a learner's own\n"
    "// record. An optional `href` on an entry is a real, existing route the\n"
    "// widget can offer as a direct \"Go to\" link -- never a fabricated page.",
    "assistantKnowledge.js: header comment mentions employee zone",
)

# 2. Insert the new employee-facing entries right before the closing `];`
#    of the KNOWLEDGE array (immediately before the Matching section).
OLD_TAIL = """  {
    id: 'contact',
    zones: ['general'],
    keywords: ['contact', 'phone number', 'email address', 'reach the institute', 'talk to someone', 'human'],
    department: 'Front Office',
    answer:
      "You can reach the institute through the Contact option in the site footer. For a specific matter, tell me what it's about and I'll point you to the right department directly.",
  },
];"""

NEW_TAIL = """  {
    id: 'contact',
    zones: ['general'],
    keywords: ['contact', 'phone number', 'email address', 'reach the institute', 'talk to someone', 'human'],
    department: 'Front Office',
    answer:
      "You can reach the institute through the Contact option in the site footer. For a specific matter, tell me what it's about and I'll point you to the right department directly.",
  },

  // -------------------------------------------------------------------
  // Employee / staff topics. These point into the real staff dashboards
  // (components/DashboardShell.jsx routes) that already exist and are
  // already gated server-side by lib/permissions.ts -- the assistant
  // only navigates people there, it never re-implements what those
  // pages already do, and selecting these never grants any access the
  // signed-in user's own PositionPermission rows don't already give them.
  // -------------------------------------------------------------------
  {
    id: 'employee-assigned-courses',
    zones: ['employee'],
    keywords: ['assigned courses', 'courses i teach', 'my teaching courses', 'which courses am i teaching', 'my course sections'],
    department: 'Instructor Dashboard',
    href: '/instructor-dashboard/courses',
    answer:
      'Your assigned courses and sections are listed under Courses in your Instructor Dashboard, each with its own roster, materials and assessments.',
  },
  {
    id: 'employee-students',
    zones: ['employee'],
    keywords: ['my students', 'student roster', 'class roster', 'list of my students', 'roster for my course'],
    department: 'Instructor Dashboard',
    href: '/instructor-dashboard/students',
    answer:
      'Your students, across every section you teach, are listed under Students in your Instructor Dashboard.',
  },
  {
    id: 'employee-attendance',
    zones: ['employee'],
    keywords: ['mark attendance', 'take attendance', 'record attendance', 'attendance sheet', 'attendance for my class'],
    department: 'Instructor Dashboard',
    href: '/instructor-dashboard/attendance',
    answer:
      'Attendance for your sections is recorded under Attendance in your Instructor Dashboard, per lecture, per course.',
  },
  {
    id: 'employee-assessments',
    zones: ['employee'],
    keywords: ['set an exam', 'schedule an assessment', 'upload exam questions', 'my exams to grade', 'assessment schedule for my course', 'quizzes for my course'],
    department: 'Instructor Dashboard',
    href: '/instructor-dashboard/exams',
    answer:
      'Exams and quizzes for your courses -- scheduling, questions and results -- are managed under Exams and Quizzes in your Instructor Dashboard.',
  },
  {
    id: 'employee-academic-tasks',
    zones: ['employee'],
    keywords: ['academic tasks', 'assignments to grade', 'pending grading', 'grade assignments', 'my grading queue'],
    department: 'Instructor Dashboard',
    href: '/instructor-dashboard/assignments',
    answer:
      'Assignments you\\'ve posted and what\\'s still waiting on your grading are under Assignments in your Instructor Dashboard.',
  },
  {
    id: 'employee-messages',
    zones: ['employee'],
    keywords: ['staff messages', 'internal messages', 'message my students', 'staff communication', 'department announcements'],
    department: null,
    href: '/instructor-dashboard/discussions',
    answer:
      'Course-level discussion with your students is under Discussions in your Instructor Dashboard. If your position also has Announcements (Dean, Head of Department, and similar roles), you\\'ll find that in your own dashboard\\'s sidebar too.',
  },
  {
    id: 'employee-reports',
    zones: ['employee'],
    keywords: ['staff reports', 'academic reports', 'department reports', 'programme reports'],
    department: null,
    answer:
      'Institute-wide reports and analytics are available to staff with Administration access, under the Staff & Admin Portal. If you don\\'t see Reports there, it isn\\'t enabled for your position -- your supervisor can confirm what your role has access to.',
  },
  {
    id: 'employee-academic-resources',
    zones: ['employee'],
    keywords: ['teaching resources', 'curriculum documents for staff', 'course specifications', 'academic resources for staff'],
    department: 'Academy',
    href: '/academy',
    answer:
      'Curriculum, course specifications, and every academic governance document are in the Academy hub -- the same official documents used across every programme.',
  },
];"""

c = r1(c, OLD_TAIL, NEW_TAIL, "assistantKnowledge.js: add employee KNOWLEDGE entries")
save(path, c)
print("lib/assistantKnowledge.js: employee KNOWLEDGE entries added.")

# 3. Rebuild the student MENUS entries to match the brief's literal
#    option list (My Courses, My Schedule, Assignments, Assessments,
#    Grades, Attendance, Academic Progress, Program & Study Plan,
#    Academic Advisor, Student Services, Library, Help), each wired to
#    an existing KNOWLEDGE entry by a phrase from its real keywords --
#    and add the new 'employee' menu.
c = load(path)
OLD_MENUS = """export const MENUS = {
  student: [
    { label: 'Check my admission status', value: 'has my admission been approved' },
    { label: 'Academic System overview', value: 'what is in academic system' },
    { label: 'Course registration & add/drop', value: 'how does course registration work' },
    { label: 'My grades, GPA & CGPA', value: 'how is my gpa calculated' },
    { label: 'Graduation & documents', value: 'how do I apply for graduation' },
    { label: 'My submitted requests', value: 'what are my requests' },
    { label: 'Fees & payments', value: 'what are the fees' },
  ],"""

NEW_MENUS = """export const MENUS = {
  // This list intentionally matches the identity-card "Student" quick
  // options: My Courses, My Schedule, Assignments, Assessments, Grades,
  // Attendance, Academic Progress, Program & Study Plan, Academic
  // Advisor, Student Services, Library, Help -- each pointed at the
  // real existing KNOWLEDGE entry/page for it, not a new one.
  student: [
    { label: 'My Courses', value: 'what courses do i have left' },
    { label: 'My Schedule', value: 'my class schedule' },
    { label: 'Assignments', value: 'submit an exercise' },
    { label: 'Assessments', value: 'exam schedule' },
    { label: 'Grades', value: 'my grades' },
    { label: 'Attendance', value: 'attendance record' },
    { label: 'Academic Progress', value: 'academic progress' },
    { label: 'Program & Study Plan', value: 'study plan' },
    { label: 'Academic Advisor', value: 'my academic advisor' },
    { label: 'Student Services', value: 'student services' },
    { label: 'Library', value: 'library' },
    { label: 'Help', value: 'how do I contact the institute' },
  ],
  // Matches the identity-card "Employee" quick options: My Dashboard,
  // Assigned Courses, Students, Attendance, Assessments, Academic
  // Tasks, Messages, Reports, Academic Resources, Help. "My Dashboard"
  // is handled as its own server-side intent (see app/api/assistant/
  // route.js) because the real destination depends on the signed-in
  // staff member's actual position/permissions, not a fixed page.
  employee: [
    { label: 'My Dashboard', value: 'my staff dashboard' },
    { label: 'Assigned Courses', value: 'assigned courses' },
    { label: 'Students', value: 'my students' },
    { label: 'Attendance', value: 'mark attendance' },
    { label: 'Assessments', value: 'schedule an assessment' },
    { label: 'Academic Tasks', value: 'academic tasks' },
    { label: 'Messages', value: 'staff messages' },
    { label: 'Reports', value: 'staff reports' },
    { label: 'Academic Resources', value: 'teaching resources' },
    { label: 'Help', value: 'how do I contact the institute' },
  ],"""

c = r1(c, OLD_MENUS, NEW_MENUS, "assistantKnowledge.js: rebuild student MENUS + add employee MENUS")
save(path, c)
print("lib/assistantKnowledge.js: student MENUS rebuilt + employee MENUS added.")
