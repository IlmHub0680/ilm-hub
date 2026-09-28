-- ICT ticket extensions: priority, category, internal notes,
-- attachments, escalation, SLA/first-response tracking, and a bounded
-- reopening path.
--
-- REOPENED is added to TicketStatus (rather than just sending a
-- reopened ticket back to OPEN) so a ticket's history can tell "never
-- touched yet" apart from "came back after being marked done" --
-- reopenedCount/lastReopenedAt on the ticket itself bound how many
-- times and how that transition is allowed (enforced in
-- app/api/ict/tickets/[id]/route.js, not at the DB level, consistent
-- with how every other counter/state-machine field in this schema is
-- enforced).
--
-- Internal notes are their own table (ICTTicketNote) since they need
-- to accumulate as a real log, not overwrite a single text field.
-- Its attachmentUrl reuses the existing R2 key pattern
-- (lib/r2.ts uploadToR2/getR2PresignedUrl) already used by the
-- transcript-request attachment flow -- no new upload mechanism.

-- AlterEnum
ALTER TYPE "TicketStatus" ADD VALUE 'REOPENED';

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "ICTTicket" ADD COLUMN "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM';
ALTER TABLE "ICTTicket" ADD COLUMN "category" TEXT;
ALTER TABLE "ICTTicket" ADD COLUMN "firstRespondedAt" TIMESTAMP(3);
ALTER TABLE "ICTTicket" ADD COLUMN "escalated" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ICTTicket" ADD COLUMN "escalatedAt" TIMESTAMP(3);
ALTER TABLE "ICTTicket" ADD COLUMN "reopenedCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ICTTicket" ADD COLUMN "lastReopenedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "ICTTicket_priority_idx" ON "ICTTicket"("priority");

-- CreateTable
CREATE TABLE "ICTTicketNote" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "authorStaffId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ICTTicketNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ICTTicketNote_ticketId_idx" ON "ICTTicketNote"("ticketId");

-- CreateIndex
CREATE INDEX "ICTTicketNote_authorStaffId_idx" ON "ICTTicketNote"("authorStaffId");

-- AddForeignKey
ALTER TABLE "ICTTicketNote" ADD CONSTRAINT "ICTTicketNote_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "ICTTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ICTTicketNote" ADD CONSTRAINT "ICTTicketNote_authorStaffId_fkey" FOREIGN KEY ("authorStaffId") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
