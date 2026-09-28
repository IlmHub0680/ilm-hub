'use client';

import LegalPageEditorClient from '@/components/LegalPageEditorClient';

export default function PrivacyPageEditor() {
  return (
    <LegalPageEditorClient
      slug="privacy"
      heading="Privacy Policy"
      hint="Shown publicly at /privacy and linked from the homepage footer."
    />
  );
}
