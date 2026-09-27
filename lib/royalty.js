// Author Royalty engine — the single place that resolves what
// percentage an author earns on a sale, and the single place that
// turns a paid order into real, permanent royalty ledger rows. Every
// caller (order approval, admin config, author-portal display) goes
// through these functions so the number an author sees never
// disagrees with what was actually recorded.
//
// Rate resolution order, most specific first:
//   1. Book.royaltyRatePct        — a specific book's own negotiated rate
//   2. AuthorRoyaltyOverride      — that author's standing rate (if active)
//   3. RoyaltySettings.defaultRatePct — the institution-wide default
//   4. PLATFORM_DEFAULT_RATE_PCT  — a hardcoded 70% safety net, used
//      only if no RoyaltySettings row exists yet or it's inactive —
//      this exactly matches the rate the Author Portal UI had
//      hardcoded before a real settings system existed, so nothing
//      an author was already being shown changes until an admin
//      deliberately reconfigures it.

import { prisma } from "@/lib/prisma";

export const PLATFORM_DEFAULT_RATE_PCT = 70.0;

const SETTINGS_ID = "default-royalty-settings";

// Auto-provisions the singleton settings row on first read (same
// pattern as AuthorFeeSettings) — the admin UI and the ledger
// generator below both call this, so there is exactly one place a
// missing row gets a sensible default instead of the caller having to
// guess or 404.
export async function getOrCreateRoyaltySettings() {
  return prisma.royaltySettings.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: {
      id: SETTINGS_ID,
      defaultRatePct: PLATFORM_DEFAULT_RATE_PCT,
      isActive: true,
    },
  });
}

function isEffective(settings) {
  if (!settings || !settings.isActive) return false;
  if (settings.effectiveDate && new Date(settings.effectiveDate) > new Date()) return false;
  return true;
}

// Resolves the rate (as a plain number, percent 0-100) for one book +
// its author, given the already-loaded settings/override rows so a
// batch of sales in the same order never re-queries per item.
export function resolveRoyaltyRate({ book, authorOverride, settings }) {
  if (book?.royaltyRatePct != null) {
    return Number(book.royaltyRatePct);
  }

  if (authorOverride && authorOverride.isActive) {
    return Number(authorOverride.ratePct);
  }

  if (isEffective(settings)) {
    return Number(settings.defaultRatePct);
  }

  return PLATFORM_DEFAULT_RATE_PCT;
}

// Idempotently creates a RoyaltyLedgerEntry for every item in an order
// whose book has an author — called from inside the same transaction
// that activates the order (app/api/orders/[id]/approve/route.js), so
// a sale is never "activated" for the buyer without also being
// recorded for the author, and never double-recorded if the same
// order is (somehow) processed twice, since orderItemId is unique.
//
// `tx` is a Prisma transaction client; `order` must include
// `items.book`.
export async function createRoyaltyLedgerEntriesForOrder(tx, order) {
  const authoredItems = (order.items || []).filter((item) => item.book?.authorId);

  if (authoredItems.length === 0) return [];

  const authorIds = [...new Set(authoredItems.map((item) => item.book.authorId))];

  const [settings, overrides] = await Promise.all([
    getOrCreateRoyaltySettings(),
    tx.authorRoyaltyOverride.findMany({ where: { authorId: { in: authorIds } } }),
  ]);

  const overrideByAuthor = new Map(overrides.map((o) => [o.authorId, o]));

  const created = [];

  for (const item of authoredItems) {
    const authorId = item.book.authorId;
    const saleAmountUSD = Number(item.priceUSD) * item.quantity;
    const ratePct = resolveRoyaltyRate({
      book: item.book,
      authorOverride: overrideByAuthor.get(authorId) || null,
      settings,
    });
    const royaltyAmountUSD = Math.round(saleAmountUSD * (ratePct / 100) * 100) / 100;

    const entry = await tx.royaltyLedgerEntry.upsert({
      where: { orderItemId: item.id },
      update: {},
      create: {
        authorId,
        bookId: item.bookId,
        orderId: order.id,
        orderItemId: item.id,
        saleAmountUSD,
        royaltyRatePct: ratePct,
        royaltyAmountUSD,
        status: "PENDING",
      },
    });

    created.push(entry);
  }

  return created;
}

// Real, live balance for one author: everything earned, everything
// already paid out, everything currently queued into a not-yet-paid
// payout, and what's actually free to queue into a new one — the
// same numbers the admin payout screen and the author's own Earnings
// & Payouts view both read, so they can never disagree.
//
// "Available" deliberately excludes any PENDING entry already
// attached to a payout (payoutId set) — once an admin queues a batch
// of sales into a payout, that amount is reserved for it and can't
// also be queued into a second one, even before the payout is marked
// PAID.
export async function getAuthorRoyaltyBalance(authorId) {
  const [availableAgg, queuedAgg, paidAgg, voidAgg] = await Promise.all([
    prisma.royaltyLedgerEntry.aggregate({
      where: { authorId, status: "PENDING", payoutId: null },
      _sum: { royaltyAmountUSD: true },
      _count: true,
    }),
    prisma.royaltyLedgerEntry.aggregate({
      where: { authorId, status: "PENDING", payoutId: { not: null } },
      _sum: { royaltyAmountUSD: true },
      _count: true,
    }),
    prisma.royaltyLedgerEntry.aggregate({
      where: { authorId, status: "PAID" },
      _sum: { royaltyAmountUSD: true },
      _count: true,
    }),
    prisma.royaltyLedgerEntry.aggregate({
      where: { authorId, status: "VOID" },
      _sum: { royaltyAmountUSD: true },
      _count: true,
    }),
  ]);

  return {
    availableBalanceUSD: Number(availableAgg._sum.royaltyAmountUSD || 0),
    availableEntryCount: availableAgg._count,
    queuedInPayoutUSD: Number(queuedAgg._sum.royaltyAmountUSD || 0),
    queuedEntryCount: queuedAgg._count,
    totalPaidOutUSD: Number(paidAgg._sum.royaltyAmountUSD || 0),
    paidEntryCount: paidAgg._count,
    voidedUSD: Number(voidAgg._sum.royaltyAmountUSD || 0),
    voidEntryCount: voidAgg._count,
  };
}

// Queues an author's currently-available (PENDING, unqueued) ledger
// entries into a brand new payout, oldest first, up to the requested
// amount — never more than what's actually available. Returns the
// created AuthorPayout. The entries stay status PENDING (not PAID)
// until the payout is actually marked paid (see markPayoutPaid below);
// queuing only reserves them so they can't be double-counted into a
// second payout.
export async function createPayoutForAuthor(authorId, { amountUSD, method, note } = {}) {
  const available = await prisma.royaltyLedgerEntry.findMany({
    where: { authorId, status: "PENDING", payoutId: null },
    orderBy: { createdAt: "asc" },
  });

  const availableTotal = available.reduce((sum, e) => sum + Number(e.royaltyAmountUSD), 0);

  if (availableTotal <= 0) {
    throw new Error("This author has no available royalty balance to pay out.");
  }

  const requested =
    amountUSD == null || amountUSD === "" ? availableTotal : Number(amountUSD);

  if (!Number.isFinite(requested) || requested <= 0) {
    throw new Error("Payout amount must be a positive number.");
  }

  if (requested > availableTotal + 0.005) {
    throw new Error(
      `Payout amount cannot exceed the author's available balance of $${availableTotal.toFixed(2)}.`
    );
  }

  const selected = [];
  let running = 0;

  for (const entry of available) {
    if (running >= requested - 0.005) break;
    selected.push(entry);
    running += Number(entry.royaltyAmountUSD);
  }

  return prisma.$transaction(async (tx) => {
    const payout = await tx.authorPayout.create({
      data: {
        authorId,
        amountUSD: Math.round(running * 100) / 100,
        method: method ? String(method).slice(0, 100) : null,
        note: note ? String(note).slice(0, 500) : null,
        status: "PENDING",
      },
    });

    await tx.royaltyLedgerEntry.updateMany({
      where: { id: { in: selected.map((e) => e.id) } },
      data: { payoutId: payout.id },
    });

    return payout;
  });
}

// Marks a queued payout as actually paid — flips every ledger entry
// it reserved to PAID and stamps the payout with a real reference and
// timestamp. This is the one place a ledger entry ever becomes PAID.
export async function markPayoutPaid(payoutId, { reference, processedByStaffId } = {}) {
  return prisma.$transaction(async (tx) => {
    const payout = await tx.authorPayout.findUnique({ where: { id: payoutId } });

    if (!payout) throw new Error("Payout not found.");
    if (payout.status === "PAID") throw new Error("This payout has already been marked paid.");
    if (payout.status === "REJECTED") throw new Error("This payout was rejected and cannot be marked paid.");

    await tx.royaltyLedgerEntry.updateMany({
      where: { payoutId },
      data: { status: "PAID" },
    });

    return tx.authorPayout.update({
      where: { id: payoutId },
      data: {
        status: "PAID",
        reference: reference ? String(reference).slice(0, 200) : payout.reference,
        processedAt: new Date(),
        processedByStaffId: processedByStaffId || payout.processedByStaffId,
      },
    });
  });
}

// Approves a queued payout (a sign-off step before actual payment) —
// pure status transition, no ledger changes.
export async function approvePayout(payoutId) {
  const payout = await prisma.authorPayout.findUnique({ where: { id: payoutId } });

  if (!payout) throw new Error("Payout not found.");
  if (payout.status !== "PENDING") {
    throw new Error("Only a pending payout can be approved.");
  }

  return prisma.authorPayout.update({
    where: { id: payoutId },
    data: { status: "APPROVED" },
  });
}

// Rejects a queued (not yet paid) payout and releases every ledger
// entry it had reserved back to the author's available balance.
export async function rejectPayout(payoutId, { note } = {}) {
  return prisma.$transaction(async (tx) => {
    const payout = await tx.authorPayout.findUnique({ where: { id: payoutId } });

    if (!payout) throw new Error("Payout not found.");
    if (payout.status === "PAID") {
      throw new Error("A payout that has already been marked paid cannot be rejected.");
    }

    await tx.royaltyLedgerEntry.updateMany({
      where: { payoutId },
      data: { payoutId: null },
    });

    return tx.authorPayout.update({
      where: { id: payoutId },
      data: {
        status: "REJECTED",
        processedAt: new Date(),
        note: note ? String(note).slice(0, 500) : payout.note,
      },
    });
  });
}
