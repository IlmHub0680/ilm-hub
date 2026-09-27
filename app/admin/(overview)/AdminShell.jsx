'use client';

import { createContext, useContext } from 'react';
import DashboardShell from '@/components/DashboardShell';

const AdminDataContext = createContext(null);

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error('useAdminData must be used within AdminShell');
  return ctx;
}

// Three explicitly separate scopes -- do not merge these. See the
// data-splitting comment in ../layout.jsx for what belongs in each.
const NAV_ITEMS = [
  { href: '/admin', label: 'Overview', icon: '▦', exact: true },
  { href: '/admin/personal', label: 'Personal Management', icon: '👤' },
  { href: '/admin/institute', label: 'Institute Management', icon: '🏛' },
  { href: '/admin/delegated', label: 'Delegated Operations', icon: '🧭' },
];

export default function AdminShell({
  user,
  stats,
  personalManagementSections,
  instituteFrameworkSections,
  institutePublicWebsiteSections,
  instituteAdministrationSections,
  instituteConfigSections,
  delegatedDuties,
  children,
}) {
  return (
    <AdminDataContext.Provider
      value={{
        stats,
        personalManagementSections,
        instituteFrameworkSections,
        institutePublicWebsiteSections,
        instituteAdministrationSections,
        instituteConfigSections,
        delegatedDuties,
      }}
    >
      <DashboardShell
        brandSub="Institution Oversight"
        brandIcon="🧭"
        navItems={NAV_ITEMS}
        title="Institution Oversight"
        subtitle={`Signed in as ${user.name} (${user.role})`}
      >
        {children}
      </DashboardShell>
    </AdminDataContext.Provider>
  );
}
