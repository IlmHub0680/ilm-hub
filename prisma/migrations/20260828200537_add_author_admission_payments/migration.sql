-- CreateEnum
CREATE TYPE "AdmissionStatus" AS ENUM ('PENDING', 'PAID', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('STRIPE', 'PAYSTACK');

-- CreateTable
CREATE TABLE "AuthorAdmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "AdmissionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthorAdmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthorPayment" (
    "id" TEXT NOT NULL,
    "admissionId" TEXT NOT NULL,
    "gateway" "PaymentGateway" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(10,2) NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "exchangeRate" DECIMAL(12,6) NOT NULL,
    "gatewayReference" TEXT,
    "checkoutReference" TEXT,
    "checkoutUrl" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthorPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthorAdmission_userId_key" ON "AuthorAdmission"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AuthorPayment_admissionId_key" ON "AuthorPayment"("admissionId");

-- CreateIndex
CREATE INDEX "AuthorPayment_gateway_idx" ON "AuthorPayment"("gateway");

-- CreateIndex
CREATE INDEX "AuthorPayment_status_idx" ON "AuthorPayment"("status");

-- CreateIndex
CREATE INDEX "AuthorPayment_gatewayReference_idx" ON "AuthorPayment"("gatewayReference");

-- CreateIndex
CREATE INDEX "Book_authorId_idx" ON "Book"("authorId");

-- CreateIndex
CREATE INDEX "Book_categoryId_idx" ON "Book"("categoryId");

-- CreateIndex
CREATE INDEX "CartItem_cartId_idx" ON "CartItem"("cartId");

-- CreateIndex
CREATE INDEX "CartItem_bookId_idx" ON "CartItem"("bookId");

-- CreateIndex
CREATE INDEX "DownloadLog_userId_idx" ON "DownloadLog"("userId");

-- CreateIndex
CREATE INDEX "DownloadLog_orderId_idx" ON "DownloadLog"("orderId");

-- CreateIndex
CREATE INDEX "DownloadLog_bookId_idx" ON "DownloadLog"("bookId");

-- CreateIndex
CREATE INDEX "ManuscriptSubmission_authorId_idx" ON "ManuscriptSubmission"("authorId");

-- CreateIndex
CREATE INDEX "ManuscriptSubmission_status_idx" ON "ManuscriptSubmission"("status");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- AddForeignKey
ALTER TABLE "AuthorAdmission" ADD CONSTRAINT "AuthorAdmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthorPayment" ADD CONSTRAINT "AuthorPayment_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "AuthorAdmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
