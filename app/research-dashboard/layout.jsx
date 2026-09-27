export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { requireModulePermission } from '@/lib/permissions';
import ClientShell from './ClientShell';

// Server-side route guard: only a user actually holding the
// RESEARCH_OPS/view permission (or SUPER_ADMIN) ever reaches the
// client shell below -- mirrors app/qa-dashboard/layout.jsx exactly.
export default async function ResearchDashboardLayout({ children }) {
  try {
    await requireModulePermission('RESEARCH_OPS', 'view');
  } catch (err) {
    redirect('/staff-login');
  }

  return <ClientShell>{children}</ClientShell>;
}
