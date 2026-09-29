import { redirect } from 'next/navigation';

// Staff sign-in is now handled by the unified /login page's own
// Student/Staff portal chooser (same /api/auth/login call, same
// getStaffDestination-based routing on success) -- kept here only as
// a redirect so the ~30 staff-only pages that still send an
// unauthenticated visitor to /staff-login (their own auth guards),
// plus any existing bookmarks or links, keep working. ?portal=staff
// opens the unified form with Staff Portal pre-selected instead of
// defaulting to Student.
export default function LegacyStaffLoginRedirect() {
  redirect('/login?portal=staff');
}
