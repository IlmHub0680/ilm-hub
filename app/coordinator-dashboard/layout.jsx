export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { requireModulePermission } from '@/lib/permissions';

// Server-side route guard: only a user holding the PROGRAM_MATTERS/view
// permission (or SUPER_ADMIN) ever reaches this dashboard. Anyone else
// is redirected before any dashboard chrome renders, so this portal
// cannot be browsed by simply knowing its URL.
export default async function CoordinatorDashboardLayout({ children }) {
  try {
    await requireModulePermission('PROGRAM_MATTERS', 'view');
  } catch (err) {
    redirect('/staff-login');
  }

  return children;
}
