-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "royaltyRatePct" DECIMAL(5,2);

-- CreateEnum
CREATE TYPE "RoyaltyEntryStatus" AS ENUM ('PENDING', 'PAID', 'VOID');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'REJECTED');

-- CreateTable
CREATE TABLE "RoyaltySettings" (
    "id" TEXT NOT NULL,
    "defaultRatePct" DECIMAL(5,2) NOT NULL DEFAULT 70.00,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoyaltySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthorRoyaltyOverride" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "ratePct" DECIMAL(5,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthorRoyaltyOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthorPayout" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "amountUSD" DECIMAL(10,2) NOT NULL,
    "method" TEXT,
    "reference" TEXT,
    "note" TEXT,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "processedByStaffId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthorPayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoyaltyLedgerEntry" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "saleAmountUSD" DECIMAL(10,2) NOT NULL,
    "royaltyRatePct" DECIMAL(5,2) NOT NULL,
    "royaltyAmountUSD" DECIMAL(10,2) NOT NULL,
    "status" "RoyaltyEntryStatus" NOT NULL DEFAULT 'PENDING',
    "payoutId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoyaltyLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthorRoyaltyOverride_authorId_key" ON "AuthorRoyaltyOverride"("authorId");

-- CreateIndex
CREATE INDEX "AuthorPayout_authorId_idx" ON "AuthorPayout"("authorId");

-- CreateIndex
CREATE INDEX "AuthorPayout_status_idx" ON "AuthorPayout"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RoyaltyLedgerEntry_orderItemId_key" ON "RoyaltyLedgerEntry"("orderItemId");

-- CreateIndex
CREATE INDEX "RoyaltyLedgerEntry_authorId_idx" ON "RoyaltyLedgerEntry"("authorId");

-- CreateIndex
CREATE INDEX "RoyaltyLedgerEntry_bookId_idx" ON "RoyaltyLedgerEntry"("bookId");

-- CreateIndex
CREATE INDEX "RoyaltyLedgerEntry_orderId_idx" ON "RoyaltyLedgerEntry"("orderId");

-- CreateIndex
CREATE INDEX "RoyaltyLedgerEntry_status_idx" ON "RoyaltyLedgerEntry"("status");

-- CreateIndex
CREATE INDEX "RoyaltyLedgerEntry_payoutId_idx" ON "RoyaltyLedgerEntry"("payoutId");

-- AddForeignKey
ALTER TABLE "AuthorRoyaltyOverride" ADD CONSTRAINT "AuthorRoyaltyOverride_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthorPayout" ADD CONSTRAINT "AuthorPayout_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoyaltyLedgerEntry" ADD CONSTRAINT "RoyaltyLedgerEntry_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoyaltyLedgerEntry" ADD CONSTRAINT "RoyaltyLedgerEntry_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoyaltyLedgerEntry" ADD CONSTRAINT "RoyaltyLedgerEntry_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoyaltyLedgerEntry" ADD CONSTRAINT "RoyaltyLedgerEntry_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoyaltyLedgerEntry" ADD CONSTRAINT "RoyaltyLedgerEntry_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "AuthorPayout"("id") ON DELETE SET NULL ON UPDATE CASCADE;
