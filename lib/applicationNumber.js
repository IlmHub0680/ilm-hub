import crypto from "crypto";
import { prisma } from "@/lib/prisma";

// Generates the applicant-facing identifier shown throughout the
// admission flow: exactly 9 numeric digits, no letters, no separators.
// The first digit is never 0 so the value always reads as a full
// 9-digit number. Collisions are astronomically unlikely (900 million
// possible values) but we still verify uniqueness against the
// database and retry, rather than trust probability alone.
export async function generateApplicationNumber() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = String(crypto.randomInt(100000000, 1000000000));

    const existing = await prisma.admissionApplication.findUnique({
      where: { applicationNumber: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }
  }

  throw new Error("Unable to generate a unique application number. Please try again.");
}
