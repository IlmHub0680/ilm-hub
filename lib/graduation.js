// Shared display metadata for the Graduation Procedures workflow, used
// by both the student-facing status page and the admin clearance view.

export const GRADUATION_STATUS_META = {
  NOT_STARTED: { label: 'Not Started', tone: 'neutral' },
  ELIGIBLE: { label: 'Eligible to Apply', tone: 'good' },
  APPLIED: { label: 'Application Submitted', tone: 'neutral' },
  CLEARANCE_IN_PROGRESS: { label: 'Clearance In Progress', tone: 'warning' },
  CLEARED: { label: 'Cleared — Awaiting Decision', tone: 'warning' },
  APPROVED: { label: 'Approved', tone: 'good' },
  REJECTED: { label: 'Rejected', tone: 'danger' },
  COMPLETED: { label: 'Graduated', tone: 'good' },
};

export function getGraduationStatusMeta(status) {
  return GRADUATION_STATUS_META[status] || { label: status || 'Unknown', tone: 'neutral' };
}

export const CLEARANCE_STATUS_META = {
  PENDING: { label: 'Pending', tone: 'neutral' },
  CLEARED: { label: 'Cleared', tone: 'good' },
  FLAGGED: { label: 'Flagged', tone: 'danger' },
};

export function getClearanceStatusMeta(status) {
  return CLEARANCE_STATUS_META[status] || { label: status || 'Unknown', tone: 'neutral' };
}

// The standard steps a graduation application moves through, shown to
// the student so they always know where they stand.
export const GRADUATION_STEPS = [
  { key: 'ELIGIBLE', label: 'Eligibility' },
  { key: 'APPLIED', label: 'Application Submitted' },
  { key: 'CLEARANCE_IN_PROGRESS', label: 'Clearance' },
  { key: 'CLEARED', label: 'Final Review' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'COMPLETED', label: 'Graduated' },
];

export function getGraduationStepIndex(status) {
  if (!status) return -1;
  if (status === 'REJECTED') return -1;
  return GRADUATION_STEPS.findIndex((s) => s.key === status);
}
