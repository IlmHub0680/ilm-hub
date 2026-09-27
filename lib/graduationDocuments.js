// Shared generation logic for a graduated student's official
// post-graduation documents (Graduation Certificate, Statement of
// Completion). Built on the same hand-written PDF writer and R2
// storage already used for official transcripts
// (app/api/records/requests/[id]/route.ts), so these are real,
// downloadable PDF documents rather than placeholder UI.
//
// ensureGraduationDocument() is idempotent: it generates and stores a
// document the first time it's needed (either eagerly, right when an
// admin marks a graduation application COMPLETED, or lazily, the first
// time a student opens the Graduation Documents section) and simply
// returns the existing record on every call after that.

import { prisma } from "@/lib/prisma";
import { buildDocumentPdf } from "@/lib/pdf";
import { uploadToR2 } from "@/lib/r2";
import { gradeLetter, computeGpa, latestGradeByCourse } from "@/lib/grading";
import { generateVerificationCode } from "@/lib/verificationCode";

export const GRADUATION_DOCUMENT_META = {
  CERTIFICATE: {
    label: "Graduation Certificate",
    description:
      "The institution's official certificate confirming your graduation.",
  },
  STATEMENT_OF_COMPLETION: {
    label: "Statement of Completion",
    description:
      "A formal letter confirming you have completed all requirements of your programme.",
  },
};

// The qualification name printed on the CERTIFICATE-type document and
// shown as its label, driven by the graduate's actual Program.level --
// never a single generic wording for every programme. Only covers the
// levels the Academy actually issues graduation documents for today
// (Program.level values seeded in prisma/seed.js); anything else falls
// back to the same "Certificate of Graduation" wording this document
// always used, rather than inventing a qualification name for a level
// the Academy hasn't approved language for.
const QUALIFICATION_TITLE_BY_LEVEL = {
  DIPLOMA: "Diploma",
  CERTIFICATE: "Certificate of Completion",
  UNDERGRADUATE: "Certificate of Graduation",
  POSTGRADUATE: "Certificate of Graduation",
  MASTERS: "Certificate of Graduation",
  DOCTORATE: "Certificate of Graduation",
  SHORT_COURSE: "Certificate of Completion",
};

function qualificationTitleForLevel(level) {
  return QUALIFICATION_TITLE_BY_LEVEL[level] || "Certificate of Graduation";
}

// Same real, credit-weighted calculation the student portal uses
// (lib/grading.js) — computed from this student's actual final grades,
// never a manually-entered figure, so the certificate/statement always
// agrees with what the graduate sees in their own portal. Takes the
// User id (Grade.studentId references User, not StudentProfile).
async function computeCumulativeGpa(userId) {
  const grades = await prisma.grade.findMany({
    where: { studentId: userId },
    include: { course: true },
  });

  // One grade per course toward cumulative GPA -- the course's most
  // recently saved attempt -- now that a repeated course can have
  // more than one Grade row on record (see lib/grading.js).
  const latest = Array.from(latestGradeByCourse(grades).values());

  return computeGpa(
    latest.map((g) => ({
      letter: gradeLetter(g.final),
      creditHours: g.course.creditHours,
    }))
  );
}

function formatDate(date) {
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function buildCertificatePdf(ctx) {
  const qualificationTitle = qualificationTitleForLevel(ctx.level);

  return buildDocumentPdf({
    title: qualificationTitle,
    subtitle: "Ulul Azm Institute",
    meta: [
      { label: "Graduate Name", value: ctx.studentName || "" },
      { label: "Student No", value: ctx.studentNo || "" },
      { label: "Programme", value: ctx.programName || "" },
      { label: "Level", value: ctx.level || "" },
      {
        label: "Cumulative GPA",
        value: ctx.cumulativeGpa != null ? ctx.cumulativeGpa.toFixed(2) : "N/A",
      },
      { label: "Date of Graduation", value: formatDate(ctx.completedAt) },
    ],
    footerNote:
      `This certifies that the above-named student has satisfied all academic requirements of the ${ctx.programName || "programme"} and is hereby conferred this ${qualificationTitle.toLowerCase()} by Ulul Azm Institute.`,
  });
}

function buildStatementPdf(ctx) {
  return buildDocumentPdf({
    title: "Statement of Completion",
    subtitle: "Ulul Azm Institute - Office of the Registrar",
    meta: [
      { label: "Student Name", value: ctx.studentName || "" },
      { label: "Student No", value: ctx.studentNo || "" },
      { label: "Programme", value: ctx.programName || "" },
      { label: "Level", value: ctx.level || "" },
      { label: "Issued On", value: formatDate(ctx.completedAt) },
    ],
    footerNote:
      "This letter confirms that the above-named student has completed all requirements of their programme of study at Ulul Azm Institute and is in good standing with the Office of the Registrar.",
  });
}

export async function ensureGraduationDocument(applicationId, type) {
  if (!GRADUATION_DOCUMENT_META[type]) {
    throw new Error(`Unknown graduation document type: ${type}`);
  }

  const existing = await prisma.graduationDocument.findUnique({
    where: { applicationId_type: { applicationId, type } },
  });

  if (existing) return existing;

  const application = await prisma.graduationApplication.findUnique({
    where: { id: applicationId },
    include: {
      student: { include: { user: { select: { name: true } } } },
      program: { select: { nameEn: true, level: true } },
    },
  });

  if (!application || application.status !== "COMPLETED") {
    throw new Error("This document is only available once graduation is completed.");
  }

  const cumulativeGpa = await computeCumulativeGpa(application.student.userId);
  const completedAt = application.updatedAt || new Date();

  const context = {
    studentName: application.student?.user?.name,
    studentNo: application.student?.studentNo,
    programName: application.program?.nameEn,
    level: application.program?.level,
    completedAt,
    cumulativeGpa,
  };

  const pdfBuffer =
    type === "CERTIFICATE" ? buildCertificatePdf(context) : buildStatementPdf(context);

  const key = `graduation-documents/${application.studentId}/${applicationId}/${type.toLowerCase()}.pdf`;
  await uploadToR2(key, pdfBuffer, "application/pdf");

  return prisma.graduationDocument.upsert({
    where: { applicationId_type: { applicationId, type } },
    create: {
      applicationId,
      studentId: application.studentId,
      type,
      pdfUrl: key,
      verificationCode: generateVerificationCode(),
    },
    update: { pdfUrl: key },
  });
}

// Best-effort: generates both documents right away (called from the admin
// "complete" action) so they're ready the instant the student looks. Never
// throws — a PDF/R2 failure here must not block the core status
// transition; ensureGraduationDocument's lazy fallback covers it later.
export async function generateGraduationDocuments(applicationId) {
  const results = {};

  for (const type of Object.keys(GRADUATION_DOCUMENT_META)) {
    try {
      results[type] = await ensureGraduationDocument(applicationId, type);
    } catch (error) {
      console.error(`Graduation document generation error (${type}):`, error);
      results[type] = null;
    }
  }

  return results;
}
