'use client';

import LegalPageEditorClient from '@/components/LegalPageEditorClient';

export default function RefundPageEditor() {
  return (
    <LegalPageEditorClient
      slug="refund"
      heading="Refund Policy"
      hint="Shown publicly at /refund and linked from the homepage footer."
    />
  );
}
