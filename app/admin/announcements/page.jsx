import { redirect } from 'next/navigation';

// Moved to /admin/homepage/announcements as part of the Homepage CMS
// (see /admin/homepage), which also manages the hero section, social
// links and footer navigation columns. Kept as a redirect so any
// existing bookmarks or links to this path still work.
export default function LegacyAnnouncementsRedirect() {
  redirect('/admin/homepage/announcements');
}
