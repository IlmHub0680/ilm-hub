export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import LegalPageEditorClient from '@/components/LegalPageEditorClient';

// Academic Governance is the Academy's most sensitive admin-only
// content -- organizational structure, committee authority, and
// institutional decision-making, not merely another editable page.
// Restricted to ADMIN/SUPER_ADMIN (there is no separate "Founder"
// role in the schema; SUPER_ADMIN is the highest role and is treated
// as the Founder-level account here, matching how requireAdmin()
// already treats it everywhere else in the app). No department-head,
// instructor, or staff-position permission currently grants access to
// this content -- there is no ACADEMIC_GOVERNANCE (or equivalent)
// entry in the Module enum for a StaffProfile permission to reference,
// so broader delegated access is a gap, not a decision already made.
// If academic-governance-specific delegation (e.g. a Governance
// Committee role or module permission) is wanted later, that is a new
// institutional decision requiring its own schema/permission work --
// not something to add here by assumption.
//
// This page previously rendered its editor client-side with no
// server-side check at all (the underlying API route was already
// gated by requireAdmin(), so no data could leak, but the editor
// shell itself would render before an unauthorized visit failed).
// This brings it in line with the server-side gate pattern already
// used elsewhere in /admin (e.g. app/admin/departments/page.jsx).
export default async function AcademyGovernanceEditor() {
  const user = await getCurrentUser();
  if (!user) redirect('/staff-login');
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') redirect('/staff-login');

  return (
    <LegalPageEditorClient
      slug="academy-governance"
      heading="Academy Governance"
      hint="The Academy's organizational structure, academic governance, departments, cross-cutting units, committees and instructor governance. Internal reference only -- not published on the public site (no /academy-governance page exists; this content is visible here to admins only). Builds on the Academy Foundation document."
    />
  );
}
