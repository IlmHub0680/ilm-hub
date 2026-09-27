'use client';

import DashboardShell from '@/components/DashboardShell';
import { HODProvider, useHOD } from './context';

const NAV_ITEMS = [
  { href: '/hod-dashboard/overview', label: 'Overview', icon: '▦' },
  { href: '/hod-dashboard/programs', label: 'Programmes', icon: '📚' },
  { href: '/hod-dashboard/instructors', label: 'Instructors & Courses', icon: '🧑‍🏫' },
  { href: '/hod-dashboard/students', label: 'Students & Progression', icon: '🎓' },
  { href: '/hod-dashboard/course-results', label: 'Course Results', icon: '📊' },
  { href: '/hod-dashboard/attendance', label: 'Attendance', icon: '🗓️' },
  { href: '/hod-dashboard/approvals', label: 'Approvals & Integrity', icon: '✔️' },
  { href: '/hod-dashboard/announcements', label: 'Announcements', icon: '📣' },
];

function HODShellContent({ children }) {
  const { data } = useHOD();
  return (
    <DashboardShell
      brandSub="Head of Department"
        brandIcon="🏢"
      navItems={NAV_ITEMS}
      title="Head of Department"
      subtitle={data?.department ? `${data.department.nameEn} — ${data.department.facultyName}` : 'Department oversight and announcements.'}
    >
      {children}
    </DashboardShell>
  );
}

export default function HODDashboardLayout({ children }) {
  return (
    <HODProvider>
      <HODShellContent>{children}</HODShellContent>
    </HODProvider>
  );
}
