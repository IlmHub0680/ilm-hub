-- Library: renewals, reservations/holds, and overdue fines.
--
-- Renewals: LibraryLoan.renewalCount tracks how many times a loan has
-- been extended (capped at MAX_RENEWALS server-side, see
-- app/api/library/loans/[id]/renew/route.js). No schema-level cap --
-- the application enforces it, same as other counters in this schema
-- (e.g. RefundRequest, GraduationClearance have no DB-level state
-- machine enforcement either).
--
-- Fines: kept on LibraryLoan itself (fineAmountUSD/fineStatus/
-- fineWaivedNote/fineClearedAt) rather than a new model or Finance's
-- StudentFee -- a loan has at most one fine, computed from its own
-- overdue duration, and library staff (LIBRARY_OPS) never need
-- Finance's FINANCE_FEES access to record it as paid/waived.
--
-- Reservations: a new lightweight LibraryReservation model queues a
-- student for an item that has zero available copies right now, and
-- is fulfilled (fulfilledLoanId set) once staff issues them the item
-- as a real loan.

-- CreateEnum
CREATE TYPE "LibraryFineStatus" AS ENUM ('NONE', 'UNPAID', 'PAID', 'WAIVED');

-- CreateEnum
CREATE TYPE "LibraryReservationStatus" AS ENUM ('PENDING', 'FULFILLED', 'CANCELLED', 'EXPIRED');

-- AlterTable
ALTER TABLE "LibraryLoan" ADD COLUMN "renewalCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "LibraryLoan" ADD COLUMN "fineAmountUSD" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "LibraryLoan" ADD COLUMN "fineStatus" "LibraryFineStatus" NOT NULL DEFAULT 'NONE';
ALTER TABLE "LibraryLoan" ADD COLUMN "fineWaivedNote" TEXT;
ALTER TABLE "LibraryLoan" ADD COLUMN "fineClearedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "LibraryLoan_fineStatus_idx" ON "LibraryLoan"("fineStatus");

-- CreateTable
CREATE TABLE "LibraryReservation" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "LibraryReservationStatus" NOT NULL DEFAULT 'PENDING',
    "fulfilledLoanId" TEXT,
    "fulfilledAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryReservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LibraryReservation_fulfilledLoanId_key" ON "LibraryReservation"("fulfilledLoanId");

-- CreateIndex
CREATE INDEX "LibraryReservation_itemId_idx" ON "LibraryReservation"("itemId");

-- CreateIndex
CREATE INDEX "LibraryReservation_studentId_idx" ON "LibraryReservation"("studentId");

-- CreateIndex
CREATE INDEX "LibraryReservation_status_idx" ON "LibraryReservation"("status");

-- AddForeignKey
ALTER TABLE "LibraryReservation" ADD CONSTRAINT "LibraryReservation_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "LibraryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryReservation" ADD CONSTRAINT "LibraryReservation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryReservation" ADD CONSTRAINT "LibraryReservation_fulfilledLoanId_fkey" FOREIGN KEY ("fulfilledLoanId") REFERENCES "LibraryLoan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
