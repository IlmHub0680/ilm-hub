'use client';

import LegalPageEditorClient from '@/components/LegalPageEditorClient';

export default function AcademicPoliciesEditor() {
  return (
    <LegalPageEditorClient
      slug="academic-policies"
      heading="Academic Policies"
      hint="Shown publicly at /academic-policies and linked from the homepage footer."
    />
  );
}
