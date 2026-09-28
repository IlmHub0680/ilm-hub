import { redirect } from 'next/navigation';

// The application form used to live here. It has been consolidated into
// the single, actively-maintained admission application at /admission
// (bilingual, live-database-driven, and the only form linked from the
// site's navigation, footer and /login). This route is kept only as a
// permanent redirect so old links/bookmarks still land somewhere useful,
// instead of leaving a second, unmaintained copy of the form reachable.
export default function RegisterRedirectPage() {
  redirect('/admission');
}
