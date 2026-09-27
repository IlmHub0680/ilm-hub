'use client';

import DashboardShell from '@/components/DashboardShell';
import { FinanceProvider } from './context';

const NAV_ITEMS = [
  { href: '/finance-dashboard/queue', label: 'Work Queue', icon: '📋' },
  { href: '/finance-dashboard/create-fee', label: 'Create Fee', icon: '➕' },
  { href: '/finance-dashboard/students', label: 'Students & Fees', icon: '🎓' },
  { href: '/finance-dashboard/payroll', label: 'Staff Payroll', icon: '💰' },
  { href: '/finance-dashboard/graduation', label: 'Graduation Clearance', icon: '🎓' },
];

export default function FinanceDashboardLayout({ children }) {
  return (
    <FinanceProvider>
      <DashboardShell brandSub="Finance Officer"
        brandIcon="💰" navItems={NAV_ITEMS}>
        {children}
      </DashboardShell>
    </FinanceProvider>
  );
}
