'use client';

import LegalPageEditorClient from '@/components/LegalPageEditorClient';

export default function CommunityGuidelinesPageEditor() {
  return (
    <LegalPageEditorClient
      slug="community-guidelines"
      heading="Community Guidelines"
      hint="Shown publicly at /community/guidelines and linked from the Student Portal Community."
    />
  );
}
