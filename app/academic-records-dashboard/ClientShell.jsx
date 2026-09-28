'use client';

import DashboardShell from '@/components/DashboardShell';
import { RecordsProvider } from './context';

const NAV_ITEMS = [
  { href: '/academic-records-dashboard/overview', label: 'Overview', icon: '▦' },
  { href: '/academic-records-dashboard/requests', label: 'Transcript Requests', icon: '📄' },
  { href: '/academic-records-dashboard/students', label: 'Student Records', icon: '🎓' },
  { href: '/academic-records-dashboard/grade-corrections', label: 'Grade Corrections', icon: '✏' },
  { href: '/academic-records-dashboard/course-requests', label: 'Course Add/Drop Requests', icon: '🔁' },
  { href: '/academic-records-dashboard/auto-assign', label: 'Auto-Assign Courses', icon: '⚙' },
  { href: '/academic-records-dashboard/calendar', label: 'Academic Calendar', icon: '📅' },
  { href: '/academic-records-dashboard/holidays', label: 'Holidays', icon: '🌙' },
  { href: '/academic-records-dashboard/graduation', label: 'Graduation', icon: '🎓' },
];

export default function AcademicRecordsDashboardLayout({ children }) {
  return (
    <RecordsProvider>
      <DashboardShell brandSub="Academic Records"
        brandIcon="📄" navItems={NAV_ITEMS} title="Academic Records" subtitle="Transcript requests and academic record integrity.">
        {children}
      </DashboardShell>
    </RecordsProvider>
  );
}
