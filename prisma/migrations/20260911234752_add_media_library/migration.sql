-- CreateEnum
CREATE TYPE "MediaCategory" AS ENUM ('KHUTBAH', 'MUTOON', 'POEMS', 'LECTURES', 'EDUCATIONAL_PROGRAMS', 'QURAN_RECITATION', 'NASHEED', 'OTHER');

-- CreateEnum
CREATE TYPE "MediaSubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "MediaItem" (
    "id" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "descriptionAr" TEXT NOT NULL,
    "category" "MediaCategory" NOT NULL,
    "mediaType" "MediaType" NOT NULL DEFAULT 'VIDEO',
    "mediaUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "speaker" TEXT,
    "durationSec" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "isFreePreview" BOOLEAN NOT NULL DEFAULT false,
    "requiresSubscription" BOOLEAN NOT NULL DEFAULT true,
    "priceUSD" DECIMAL(10,2),
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaSubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "priceUSD" DECIMAL(10,2) NOT NULL,
    "durationDays" INTEGER NOT NULL DEFAULT 30,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaSubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMediaSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "MediaSubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "paymentGateway" "PaymentGateway",
    "paymentRef" TEXT,
    "paidAmount" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMediaSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MediaItem_slug_key" ON "MediaItem"("slug");

-- CreateIndex
CREATE INDEX "MediaItem_category_idx" ON "MediaItem"("category");

-- CreateIndex
CREATE INDEX "MediaItem_isPublished_idx" ON "MediaItem"("isPublished");

-- CreateIndex
CREATE INDEX "MediaItem_uploadedById_idx" ON "MediaItem"("uploadedById");

-- CreateIndex
CREATE UNIQUE INDEX "UserMediaSubscription_paymentRef_key" ON "UserMediaSubscription"("paymentRef");

-- CreateIndex
CREATE INDEX "UserMediaSubscription_userId_idx" ON "UserMediaSubscription"("userId");

-- CreateIndex
CREATE INDEX "UserMediaSubscription_planId_idx" ON "UserMediaSubscription"("planId");

-- CreateIndex
CREATE INDEX "UserMediaSubscription_status_idx" ON "UserMediaSubscription"("status");

-- AddForeignKey
ALTER TABLE "MediaItem" ADD CONSTRAINT "MediaItem_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMediaSubscription" ADD CONSTRAINT "UserMediaSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMediaSubscription" ADD CONSTRAINT "UserMediaSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "MediaSubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
