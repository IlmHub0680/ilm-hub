'use client';

import LegalPageEditorClient from '@/components/LegalPageEditorClient';

export default function AcademyCurriculumEditor() {
  return (
    <LegalPageEditorClient
      slug="academy-curriculum"
      heading="Academy Curriculum"
      hint="The Academy's program architecture and curriculum framework — study plans, prerequisite chains, and program learning outcomes using temporary course-code placeholders. Internal reference only -- not published on the public site (no /academy-curriculum page exists; this content is visible here to admins only). Builds on Academy Foundation, Academy Governance and Academy Pathways."
    />
  );
}
