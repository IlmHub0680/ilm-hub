export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { requireModulePermission } from '@/lib/permissions';
import ClientShell from './ClientShell';

// Server-side route guard: only a user actually holding the
// QUALITY_ASSURANCE/view permission (or SUPER_ADMIN) ever reaches the client
// shell below. Anyone else — logged out, or a staff member in an
// unrelated role — is redirected before any dashboard chrome renders,
// so this portal cannot be browsed by simply knowing its URL.
export default async function QADashboardLayout({ children }) {
  try {
    await requireModulePermission('QUALITY_ASSURANCE', 'view');
  } catch (err) {
    redirect('/staff-login');
  }

  return <ClientShell>{children}</ClientShell>;
}
