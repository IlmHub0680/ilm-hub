import crypto from "crypto";
import { prisma } from "@/lib/prisma";

// Generates the student-facing identifier assigned once an
// AdmissionApplication is approved and a real StudentProfile is
// created for the first time: "ULA-<admission year>-" followed by 6
// random digits. Verified unique against the database and retried on
// collision, mirroring generateApplicationNumber's approach.
export async function generateStudentNumber(admissionYear) {
  const year = admissionYear || new Date().getFullYear();

  for (let attempt = 0; attempt < 10; attempt++) {
    const suffix = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
    const candidate = `ULA-${year}-${suffix}`;

    const existing = await prisma.studentProfile.findUnique({
      where: { studentNo: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }
  }

  throw new Error("Unable to generate a unique student number. Please try again.");
}
