'use client';

import DashboardShell from '@/components/DashboardShell';
import { QAProvider } from './context';

const NAV_ITEMS = [
  { href: '/qa-dashboard/overview', label: 'Overview', icon: '▦' },
  { href: '/qa-dashboard/schedule', label: 'Schedule a Review', icon: '🗓' },
  { href: '/qa-dashboard/reviews', label: 'Reviews', icon: '📝' },
  { href: '/qa-dashboard/evaluations', label: 'Course Evaluations', icon: '⭐' },
  { href: '/qa-dashboard/curriculum', label: 'Curriculum Outcomes', icon: '🧭' },
  { href: '/qa-dashboard/duplicates', label: 'Duplication Flags', icon: '⚠️' },
  { href: '/qa-dashboard/kpis', label: 'KPIs', icon: '📊' },
];

export default function QADashboardLayout({ children }) {
  return (
    <QAProvider>
      <DashboardShell
        brandSub="Quality Assurance"
        brandIcon="✅"
        navItems={NAV_ITEMS}
        title="Quality Assurance"
        subtitle="Monitor institutional activity and run programme, course, department and faculty reviews."
      >
        {children}
      </DashboardShell>
    </QAProvider>
  );
}
