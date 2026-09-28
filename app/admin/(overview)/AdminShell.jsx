'use client';

import { createContext, useContext, useState } from 'react';
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
  // Admin-overview-only search: filters the Quick Links grid on the
  // overview page (app/admin/(overview)/page.jsx). Lives here, not in
  // DashboardShell, because AdminShell already sits between the shell
  // (which renders the input) and the page (which needs the text) via
  // AdminDataContext -- no changes to DashboardShell's other consumers.
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <AdminDataContext.Provider
      value={{
        user,
        stats,
        personalManagementSections,
        instituteFrameworkSections,
        institutePublicWebsiteSections,
        instituteAdministrationSections,
        instituteConfigSections,
        delegatedDuties,
        searchQuery,
      }}
    >
      <DashboardShell
        brandSub="Institution Oversight"
        brandIcon="🧭"
        navItems={NAV_ITEMS}
        title="Institution Oversight"
        subtitle={`Signed in as ${user.name} (${user.role})`}
        showProfile
        profileSubtitle={user.role}
        showSearch
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search admin sections…"
        // Top-right profile + sign-out dropdown, matching the student
        // portal's pattern (app/login/page.jsx). Admin is the only
        // DashboardShell consumer opting into this -- everyone else
        // keeps the sidebar-bottom Logout button unchanged.
        showTopProfile
      >
        {children}
      </DashboardShell>
    </AdminDataContext.Provider>
  );
}
