'use client';

import LegalPageEditorClient from '@/components/LegalPageEditorClient';

export default function AdmissionRequirementsEditor() {
  return (
    <LegalPageEditorClient
      slug="admission-requirements"
      heading="Admission Requirements"
      hint="Entry/placement criteria only, split out from Academic Pathways & Qualifications so applicants see just what they need. Shown publicly at /admission-requirements and linked from the Admission & Registration menu."
    />
  );
}
