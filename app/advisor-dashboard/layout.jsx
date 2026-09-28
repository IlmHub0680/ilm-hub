export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { requireAdvisor } from '@/lib/permissions';

// Server-side route guard: real ownership boundary (STUDENT_MATTERS
// view + the Academic Advisor position itself, via requireAdvisor()),
// not merely "any staff profile exists" -- so a staff member in any
// other position (ICT, Finance, Library, ...) cannot reach this
// dashboard just by having a StaffProfile row.
export default async function AdvisorDashboardLayout({ children }) {
  try {
    await requireAdvisor();
  } catch (err) {
    redirect('/staff-login');
  }

  return children;
}
