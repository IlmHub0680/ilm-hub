'use client';

import DashboardShell from '@/components/DashboardShell';

const NAV_ITEMS = [
  { href: '/student-affairs-dashboard/overview', label: 'Overview', icon: '▦' },
  { href: '/student-affairs-dashboard/requests', label: 'Student Requests', icon: '📋' },
  { href: '/student-affairs-dashboard/tutoring-requests', label: 'Private Tutoring', icon: '🧑‍🏫' },
  { href: '/student-affairs-dashboard/absence-excuses', label: 'Absence Excuses', icon: '📝' },
  { href: '/student-affairs-dashboard/graduation', label: 'Graduation Clearance', icon: '🎓' },
];

export default function StudentAffairsLayout({ children }) {
  return (
    <DashboardShell brandSub="Student Affairs"
        brandIcon="🧑‍🎓" navItems={NAV_ITEMS} title="Student Affairs" subtitle="Student welfare, support and student matters.">
      {children}
    </DashboardShell>
  );
}
