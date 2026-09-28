'use client';

import LegalPageEditorClient from '@/components/LegalPageEditorClient';

export default function AcademyDepartmentCurriculumEditor() {
  return (
    <LegalPageEditorClient
      slug="academy-department-curriculum"
      heading="Department Curriculum"
      hint="Which department owns which topic, department-by-department curriculum frameworks, program-to-department mapping, the specialization framework, and the course duplication audit. Internal reference only -- not published on the public site (no /academy-department-curriculum page exists; this content is visible here to admins only). Builds on Academy Foundation, Academy Governance, Academy Pathways and Academy Curriculum."
    />
  );
}
