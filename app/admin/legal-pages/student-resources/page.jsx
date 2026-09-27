'use client';

import LegalPageEditorClient from '@/components/LegalPageEditorClient';

export default function StudentResourcesEditor() {
  return (
    <LegalPageEditorClient
      slug="student-resources"
      heading="Student Resources"
      hint="Shown publicly at /student-resources and linked from the homepage footer."
    />
  );
}
