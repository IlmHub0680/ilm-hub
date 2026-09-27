export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { requireAdmissionsView } from '@/lib/permissions';

// Server-side route guard: mirrors the admissions API's own check
// (ADMIN/SUPER_ADMIN, or ADMISSIONS/view module permission). Anyone
// else is redirected before any dashboard chrome renders, so this
// portal cannot be browsed by simply knowing its URL.
export default async function RegistryDashboardLayout({ children }) {
  try {
    await requireAdmissionsView();
  } catch (err) {
    redirect('/staff-login');
  }

  return children;
}
