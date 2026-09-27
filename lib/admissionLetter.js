// Shared generation logic for the Letter of Admission (Model 17 --
// Registry, Admission Decisions & Admission Documents).
//
// Unlike graduation documents (lib/graduationDocuments.js), which are
// generated once and are final the instant they exist, an admission
// letter goes through a real workflow: staff create/update a DRAFT
// (fully editable), preview its rendered PDF, then Finalize it, which
// locks the content and stores the official PDF. A later correction
// reopens the letter rather than silently overwriting the issued
// document -- the prior version is kept in AdmissionLetter.previousVersions
// for traceability (see prisma/schema.prisma).
//
// Built on the same hand-written PDF writer and R2 storage already used
// for transcripts and graduation documents (lib/pdf.js, lib/r2.ts) --
// this is not a second document-generation system.

import { buildDocumentPdf } from '@/lib/pdf';
import { uploadToR2 } from '@/lib/r2';

function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Pure function: builds the PDF buffer from an application plus the
// letter's current fields. Used for both the staff preview (while the
// letter is a DRAFT) and the officially issued document (on Finalize),
// so what staff review is exactly what gets issued to the applicant.
export function buildAdmissionLetterPdf({ application, letter }) {
  const signatoryLine = letter.signatoryName
    ? `${letter.signatoryName}${letter.signatoryTitle ? `, ${letter.signatoryTitle}` : ''}`
    : '-';

  return buildDocumentPdf({
    title: 'Letter of Admission',
    subtitle: 'Ulul Azm Institute',
    meta: [
      { label: 'Applicant Name', value: application.fullName },
      { label: 'Application Number', value: application.applicationNumber },
      { label: 'Programme', value: letter.programmeText || application.programName || '-' },
      { label: 'Department', value: letter.departmentText || '-' },
      { label: 'Qualification', value: letter.qualificationText || application.programLevel || '-' },
      { label: 'Intake / Session', value: letter.intakeSession || application.studySession || '-' },
      { label: 'Admission Date', value: formatDate(letter.admissionDate) },
      { label: 'Authorized Signatory', value: signatoryLine },
    ],
    footerNote:
      (letter.conditions ? `Conditions of Admission: ${letter.conditions}  ` : '') +
      'This letter is issued by Ulul Azm Institute and confirms the admission decision recorded against the application above. For enquiries, contact the Office of the Registrar.',
  });
}

export function draftStorageKey(applicationId) {
  return `admission-letters/${applicationId}/draft.pdf`;
}

export function versionStorageKey(applicationId, version) {
  return `admission-letters/${applicationId}/v${version}.pdf`;
}

// Uploads the rendered PDF to R2 and returns its storage key. Callers
// decide what happens on failure -- a PDF/R2 problem must never corrupt
// the underlying AdmissionLetter row.
export async function storeAdmissionLetterPdf(key, pdfBuffer) {
  await uploadToR2(key, pdfBuffer, 'application/pdf');
  return key;
}
