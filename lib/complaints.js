// Shared constants for the student Communication & Complaints system.
// Used by both the student-facing submission/tracking UI and the admin
// handling UI, so the two stay in sync.

export const COMPLAINT_TOPICS = [
  { value: "ACADEMIC", label: "Academic" },
  { value: "REGISTRATION", label: "Registration" },
  { value: "COURSE", label: "Course" },
  { value: "GRADE", label: "Grade" },
  { value: "ADMISSION", label: "Admission" },
  { value: "FINANCIAL_PAYMENT", label: "Financial / Payment" },
  { value: "STUDENT_AFFAIRS", label: "Student Affairs" },
  { value: "GRADUATION", label: "Graduation" },
  { value: "TECHNICAL", label: "Technical" },
  { value: "OTHER", label: "Other" },
];

export function getTopicLabel(value) {
  return COMPLAINT_TOPICS.find((t) => t.value === value)?.label || value || "Other";
}

// Human-readable group headers for Units in the recipient picker. Real
// selectable options still come from each Unit's own nameEn/nameAr —
// this only labels the group they're shown under.
export const UNIT_TYPE_GROUP_LABELS = {
  RECTORATE: "Rectorate",
  REGISTRAR: "Registrar",
  ACADEMIC_ADMINISTRATION: "Academic Administration",
  REGISTRY_ADMISSIONS: "Deanship of Admission",
  EXAMINATIONS_RECORDS: "Examinations & Records",
  STUDENT_AFFAIRS: "Deanship of Student Affairs",
  FINANCE: "Finance",
  LIBRARY: "Library",
  QUALITY_ASSURANCE: "Quality Assurance",
  ICT: "ICT",
  OTHER: "Other Offices",
};

// The visible progression a complaint moves through. The underlying
// RequestStatus enum only tracks the coarse state (SUBMITTED /
// UNDER_REVIEW / APPROVED / REJECTED / COMPLETED); this richer
// narrative is carried by the RequestActivity timeline's `action`
// field, one entry per step actually taken.
export const COMPLAINT_PROGRESSION_STEPS = [
  "Submitted",
  "Assigned",
  "Transferred",
  "Under Review",
  "Responded",
  "Closed",
];

// Terminal complaint states read as "Closed" (with the underlying
// reason still visible via the status pill's tone and the activity
// timeline), matching the Submitted -> Assigned -> Transferred ->
// Under Review -> Responded -> Closed progression the student sees.
export function getComplaintStatusLabel(status) {
  if (status === "COMPLETED") return "Closed — Resolved";
  if (status === "REJECTED") return "Closed — Rejected";
  if (status === "UNDER_REVIEW") return "Under Review";
  if (status === "SUBMITTED") return "Submitted";
  return status || "Unknown";
}
