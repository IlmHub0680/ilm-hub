'use client';

import DashboardShell from '@/components/DashboardShell';
import { LibraryDashProvider } from './context';

const NAV_ITEMS = [
  { href: '/library-dashboard/add-issue', label: 'Add & Issue', icon: '➕' },
  { href: '/library-dashboard/loans', label: 'Active Loans', icon: '📖' },
  { href: '/library-dashboard/reservations', label: 'Reservations', icon: '⏳' },
  { href: '/library-dashboard/catalogue', label: 'Catalogue', icon: '📚' },
  { href: '/library-dashboard/digital-resources', label: 'Digital Library', icon: '💻' },
  { href: '/library-dashboard/graduation', label: 'Graduation Clearance', icon: '🎓' },
];

export default function LibraryDashboardLayout({ children }) {
  return (
    <LibraryDashProvider>
      <DashboardShell brandSub="Librarian"
        brandIcon="📖" navItems={NAV_ITEMS} title="Library" subtitle="Manage the catalogue and issue or return loans.">
        {children}
      </DashboardShell>
    </LibraryDashProvider>
  );
}
