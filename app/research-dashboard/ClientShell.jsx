'use client';

import DashboardShell from '@/components/DashboardShell';
import { ResearchProvider } from './context';

const NAV_ITEMS = [
  { href: '/research-dashboard/overview', label: 'Overview', icon: '▦' },
  { href: '/research-dashboard/projects', label: 'Projects', icon: '🧪' },
  { href: '/research-dashboard/proposals', label: 'Proposals', icon: '📝' },
  { href: '/research-dashboard/publications', label: 'Publications', icon: '📚' },
  { href: '/research-dashboard/collaboration', label: 'Collaboration', icon: '🤝' },
  { href: '/research-dashboard/supervision', label: 'Supervision', icon: '🎓' },
  { href: '/research-dashboard/funding', label: 'Funding', icon: '💰' },
  { href: '/research-dashboard/integrity', label: 'Integrity', icon: '⚖️' },
];

export default function ResearchDashboardLayout({ children }) {
  return (
    <ResearchProvider>
      <DashboardShell
        brandSub="Research & Scholarly Affairs"
        brandIcon="🔬"
        navItems={NAV_ITEMS}
        title="Research & Scholarly Affairs"
        subtitle="Manage research projects, proposals, scholarly publications, collaboration, supervision, funding and research integrity."
      >
        {children}
      </DashboardShell>
    </ResearchProvider>
  );
}
