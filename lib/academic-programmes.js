const ACADEMIC_PROGRAMMES = [
  {
    id: 'prog-01',
    name: 'Junior Learners Programme',
    level: 'Junior',
    duration: '1 Year',
    status: 'Active',
    coordinator: 'Unassigned',
  },
  {
    id: 'prog-02',
    name: 'Foundation Programme',
    level: 'Foundation',
    duration: '1 Year',
    status: 'Active',
    coordinator: 'Unassigned',
  },
  {
    id: 'prog-03',
    name: 'Intermediate Programme',
    level: 'Intermediate',
    duration: '1 Year',
    status: 'Active',
    coordinator: 'Unassigned',
  },
  {
    id: 'prog-04',
    name: 'Certificate Programme (Specialised Studies)',
    level: 'Certificate',
    duration: 'Flexible (Max 6 courses)',
    status: 'Active',
    coordinator: 'Unassigned',
  },
  {
    id: 'prog-05',
    name: 'Diploma in Islamic Sciences',
    level: 'Diploma',
    duration: '2 Years',
    status: 'Active',
    coordinator: 'Unassigned',
  },
  {
    id: 'prog-06',
    name: 'Private Courses',
    level: 'Private',
    duration: '6 Months',
    status: 'Active',
    coordinator: 'Unassigned',
  },
];

export function getAcademicProgrammes() {
  return ACADEMIC_PROGRAMMES;
}

export function getAcademicProgrammeById(programId) {
  return ACADEMIC_PROGRAMMES.find(
    (programme) => programme.id === programId
  ) || null;
}
