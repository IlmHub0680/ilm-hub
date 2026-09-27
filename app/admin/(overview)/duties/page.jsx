import { redirect } from 'next/navigation';

// Superseded by the Personal Management / Institute Management split
// (see ../personal and ../institute) -- kept as a redirect so any
// existing bookmark or link to the old flat "Admin-Managed Functions"
// page still lands somewhere useful rather than 404ing.
export default function AdminOwnedDutiesRedirect() {
  redirect('/admin/institute');
}
