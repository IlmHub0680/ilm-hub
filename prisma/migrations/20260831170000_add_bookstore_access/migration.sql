-- CreateEnum
CREATE TYPE "BookStatus" AS ENUM (
  'PENDING_REVIEW',
  'APPROVED',
  'REJECTED',
  'PUBLISHED',
  'DRAFT'
);

-- AlterTable
ALTER TABLE "Book"
ADD COLUMN "sellerId" TEXT,
ADD COLUMN "status" "BookStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "BookAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Book_sellerId_idx" ON "Book"("sellerId");

-- CreateIndex
CREATE INDEX "Book_status_idx" ON "Book"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BookAccess_userId_bookId_orderId_key"
ON "BookAccess"("userId", "bookId", "orderId");

-- CreateIndex
CREATE INDEX "BookAccess_userId_idx" ON "BookAccess"("userId");

-- CreateIndex
CREATE INDEX "BookAccess_bookId_idx" ON "BookAccess"("bookId");

-- CreateIndex
CREATE INDEX "BookAccess_orderId_idx" ON "BookAccess"("orderId");

-- AddForeignKey
ALTER TABLE "Book"
ADD CONSTRAINT "Book_sellerId_fkey"
FOREIGN KEY ("sellerId") REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookAccess"
ADD CONSTRAINT "BookAccess_bookId_fkey"
FOREIGN KEY ("bookId") REFERENCES "Book"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookAccess"
ADD CONSTRAINT "BookAccess_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookAccess"
ADD CONSTRAINT "BookAccess_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
