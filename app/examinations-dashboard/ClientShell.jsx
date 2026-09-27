'use client';

import DashboardShell from '@/components/DashboardShell';
import { ExamsProvider } from './context';

const NAV_ITEMS = [
  { href: '/examinations-dashboard/overview', label: 'Overview', icon: '▦' },
  { href: '/examinations-dashboard/schedule', label: 'Exam Schedule', icon: '🗓' },
  { href: '/examinations-dashboard/results', label: 'Result Verification', icon: '✔' },
  { href: '/examinations-dashboard/appeals', label: 'Grade Appeals', icon: '⚖' },
];

export default function ExaminationsDashboardLayout({ children }) {
  return (
    <ExamsProvider>
      <DashboardShell brandSub="Examinations"
        brandIcon="📝" navItems={NAV_ITEMS} title="Examinations" subtitle="Exam scheduling and grade appeals.">
        {children}
      </DashboardShell>
    </ExamsProvider>
  );
}
