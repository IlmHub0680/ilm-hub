-- AlterTable
ALTER TABLE "AuthorAdmission" ADD COLUMN     "countryOfResidence" TEXT,
ADD COLUMN     "applicationFee" DECIMAL(10,2),
ADD COLUMN     "currencyCode" TEXT,
ADD COLUMN     "feeBasis" TEXT,
ADD COLUMN     "feeExpiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "AuthorPayment" ADD COLUMN     "transactionId" TEXT;

-- CreateTable
CREATE TABLE "AuthorFeeSettings" (
    "id" TEXT NOT NULL,
    "ghana" DECIMAL(10,2) NOT NULL,
    "ghanaCurrency" TEXT NOT NULL DEFAULT 'GHS',
    "international" DECIMAL(10,2) NOT NULL,
    "internationalCurrency" TEXT NOT NULL DEFAULT 'USD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "paymentMethod" TEXT NOT NULL DEFAULT 'Paystack',
    "validityDays" INTEGER,
    "effectiveDate" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthorFeeSettings_pkey" PRIMARY KEY ("id")
);
