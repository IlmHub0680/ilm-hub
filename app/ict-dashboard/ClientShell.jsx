'use client';

import DashboardShell from '@/components/DashboardShell';
import { ICTProvider } from './context';

const NAV_ITEMS = [
  { href: '/ict-dashboard/raise', label: 'Raise a Ticket', icon: '➕' },
  { href: '/ict-dashboard/tickets', label: 'Tickets', icon: '🎫' },
];

export default function ICTDashboardLayout({ children }) {
  return (
    <ICTProvider>
      <DashboardShell brandSub="ICT Officer"
        brandIcon="🖥" navItems={NAV_ITEMS} title="IT Support Tickets" subtitle="Track and resolve technical support requests.">
        {children}
      </DashboardShell>
    </ICTProvider>
  );
}
