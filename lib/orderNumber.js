import crypto from "crypto";
import { prisma } from "@/lib/prisma";

// Generates the customer-facing Bookstore order number: exactly 9
// numeric digits, no letters, hyphens, or other separators — matching
// the same format already used for student/application numbers (see
// lib/applicationNumber.js). The first digit is never 0 so the value
// always reads as a full 9-digit number. Collisions are astronomically
// unlikely (900 million possible values) but we still verify
// uniqueness against the database and retry, rather than trust
// probability alone.
//
// Existing orders created before this change keep their old long-form
// order numbers (e.g. "ORD-...-..." or "ILM-...-...") untouched —
// orderNumber has no format constraint in the database, so old and new
// values coexist safely side by side.
export async function generateOrderNumber() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = String(crypto.randomInt(100000000, 1000000000));

    const existing = await prisma.order.findUnique({
      where: { orderNumber: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }
  }

  throw new Error("Unable to generate a unique order number. Please try again.");
}
