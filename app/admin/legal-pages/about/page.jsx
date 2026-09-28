'use client';

import LegalPageEditorClient from '@/components/LegalPageEditorClient';

export default function AboutPageEditor() {
  return (
    <LegalPageEditorClient
      slug="about"
      heading="About Page"
      hint="Shown publicly at /about and linked from the homepage footer."
    />
  );
}
