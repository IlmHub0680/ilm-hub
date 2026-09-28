'use client';

import DashboardShell from '@/components/DashboardShell';

const NAV_ITEMS = [
  { href: '/instructor-dashboard/courses', label: 'My Assigned Courses', icon: '📚' },
  { href: '/instructor-dashboard/students', label: 'Student Enrollees', icon: '🎓' },
  { href: '/instructor-dashboard/grades', label: 'Grading & Submissions', icon: '📝' },
  { href: '/instructor-dashboard/assignments', label: 'Assignments', icon: '📋' },
  { href: '/instructor-dashboard/quizzes', label: 'Quizzes', icon: '✅' },
  { href: '/instructor-dashboard/discussions', label: 'Section Discussion', icon: '💬' },
  { href: '/instructor-dashboard/announcements', label: 'Course Announcements', icon: '📣' },
  { href: '/instructor-dashboard/attendance', label: 'Attendance', icon: '◷' },
  { href: '/instructor-dashboard/timetable', label: 'My Timetable', icon: '📅' },
  { href: '/instructor-dashboard/exams', label: 'Exams', icon: '🗓' },
  { href: '/instructor-dashboard/live-classes', label: 'Live Classes', icon: '🎥' },
  { href: '/instructor-dashboard/profile', label: 'My Profile', icon: '🪪' },
  { href: '/instructor-dashboard/integrity', label: 'Integrity', icon: '⚖️' },
];

export default function InstructorDashboardLayout({ children }) {
  return (
    <DashboardShell
      brandSub="Instructor Portal"
        brandIcon="🎓"
      navItems={NAV_ITEMS}
      title="Instructor Dashboard"
      subtitle="Manage your courses, lectures, and student evaluations."
    >
      {children}
    </DashboardShell>
  );
}
