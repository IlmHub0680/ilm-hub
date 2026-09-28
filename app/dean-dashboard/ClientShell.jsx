'use client';

import DashboardShell from '@/components/DashboardShell';
import { DeanProvider, useDean } from './context';

const NAV_ITEMS = [
  { href: '/dean-dashboard/overview', label: 'Overview', icon: '▦' },
  { href: '/dean-dashboard/departments', label: 'Departments', icon: '🏢' },
  { href: '/dean-dashboard/staff', label: 'Staff', icon: '🧑‍💼' },
  { href: '/dean-dashboard/students', label: 'Students', icon: '🎓' },
  { href: '/dean-dashboard/standards', label: 'Programmes & Standards', icon: '📐' },
  { href: '/dean-dashboard/examinations', label: 'Examinations Monitoring', icon: '📝' },
  { href: '/dean-dashboard/approvals', label: 'Approvals', icon: '✔️' },
  { href: '/dean-dashboard/announcements', label: 'Announcements', icon: '📣' },
];

function DeanShellContent({ children }) {
  const { data } = useDean();
  return (
    <DashboardShell
      brandSub="Office of the Dean"
        brandIcon="🏛"
      navItems={NAV_ITEMS}
      title="Office of the Dean"
      subtitle={data?.faculty ? data.faculty.nameEn : 'Faculty oversight and announcements.'}
    >
      {children}
    </DashboardShell>
  );
}

export default function DeanDashboardLayout({ children }) {
  return (
    <DeanProvider>
      <DeanShellContent>{children}</DeanShellContent>
    </DeanProvider>
  );
}
