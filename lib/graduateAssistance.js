// Shared constants for the post-graduation Graduate Assistant support
// system. Modeled directly on the Communication & Complaints system
// (lib/complaints.js) — same Request/RequestActivity infrastructure,
// same submit -> track -> respond lifecycle — but scoped to the
// document-related issues a graduate actually runs into, and always
// routed to the Registrar rather than asking the graduate to pick a
// recipient.

export const GRADUATE_SUPPORT_TOPICS = [
  { value: "CERTIFICATE_ISSUE", label: "Certificate Issue" },
  { value: "STATEMENT_OF_COMPLETION_ISSUE", label: "Statement of Completion Issue" },
  { value: "TRANSCRIPT_ISSUE", label: "Transcript Issue" },
  { value: "DOCUMENT_CORRECTION", label: "Document Correction" },
  { value: "REPLACEMENT_REISSUE", label: "Replacement / Reissue" },
  { value: "VERIFICATION_QUESTION", label: "Verification Question" },
  { value: "OTHER", label: "Other" },
];

export function getGraduateSupportTopicLabel(value) {
  return GRADUATE_SUPPORT_TOPICS.find((t) => t.value === value)?.label || value || "Other";
}

// Same terminal-state framing as the Complaints system, for a
// consistent status vocabulary across every request type a student
// sees in their portal.
export function getGraduateSupportStatusLabel(status) {
  if (status === "COMPLETED") return "Closed — Resolved";
  if (status === "REJECTED") return "Closed — Rejected";
  if (status === "UNDER_REVIEW") return "Under Review";
  if (status === "SUBMITTED") return "Submitted";
  return status || "Unknown";
}
