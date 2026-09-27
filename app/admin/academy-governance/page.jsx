'use client';

import LegalPageEditorClient from '@/components/LegalPageEditorClient';

export default function AcademyGovernanceEditor() {
  return (
    <LegalPageEditorClient
      slug="academy-governance"
      heading="Academy Governance"
      hint="The Academy's organizational structure, academic governance, departments, cross-cutting units, committees and instructor governance. Internal reference only -- not published on the public site (no /academy-governance page exists; this content is visible here to admins only). Builds on the Academy Foundation document."
    />
  );
}
