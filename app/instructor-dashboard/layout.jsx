export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { requireInstructor } from '@/lib/auth';
import ClientShell from './ClientShell';

// Server-side route guard: only a user holding the COURSES_GRADES/view
// permission (or SUPER_ADMIN) ever reaches the client shell below.
// Anyone else — logged out, or a staff member in an unrelated role —
// is redirected before any dashboard chrome renders, so this portal
// cannot be browsed by simply knowing its URL.
export default async function InstructorDashboardLayout({ children }) {
  try {
    await requireInstructor();
  } catch (err) {
    redirect('/staff-login');
  }

  return <ClientShell>{children}</ClientShell>;
}
