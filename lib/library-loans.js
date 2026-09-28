// Shared helpers for the physical book-lending Library feature
// (LibraryItem / LibraryLoan / LibraryReservation) -- distinct from
// lib/library.js, which is display metadata for the unrelated
// publishing content library (LibraryResource). See the schema
// comment on LibraryResource for why the two are kept apart.

// No existing overdue-fee rate exists anywhere else in the codebase
// (Finance's StudentFee is a manually-entered amount, not a computed
// per-day rate) -- this is a flat, explicit per-day charge, capped so
// a very old unreturned loan doesn't accrue an unbounded fine.
export const FINE_RATE_USD_PER_DAY = 0.5;
export const FINE_CAP_USD = 25;

// Real days-overdue, computed from the loan's actual dueAt against
// either its actual returnedAt (if already returned) or now (if still
// out) -- never a placeholder number.
export function computeOverdueDays(dueAt, asOf) {
  const due = new Date(dueAt).getTime();
  const compareAt = (asOf ? new Date(asOf) : new Date()).getTime();

  if (compareAt <= due) {
    return 0;
  }

  return Math.ceil((compareAt - due) / (1000 * 60 * 60 * 24));
}

export function computeFineUSD(dueAt, asOf) {
  const days = computeOverdueDays(dueAt, asOf);
  return Math.min(days * FINE_RATE_USD_PER_DAY, FINE_CAP_USD);
}
