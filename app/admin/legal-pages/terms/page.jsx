'use client';

import LegalPageEditorClient from '@/components/LegalPageEditorClient';

export default function TermsPageEditor() {
  return (
    <LegalPageEditorClient
      slug="terms"
      heading="Terms of Use"
      hint="Shown publicly at /terms and linked from the homepage footer."
    />
  );
}
