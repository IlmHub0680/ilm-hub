-- CreateTable
CREATE TABLE "HomepageSectionsText" (
    "id" TEXT NOT NULL,
    "welcomeBadge" TEXT NOT NULL,
    "welcomeTitle" TEXT NOT NULL,
    "welcomeSubtitle" TEXT NOT NULL,
    "academyBadge" TEXT NOT NULL,
    "academyTitle" TEXT NOT NULL,
    "academySubtitle" TEXT NOT NULL,
    "approachBadge" TEXT NOT NULL,
    "approachTitle" TEXT NOT NULL,
    "approachSubtitle" TEXT NOT NULL,
    "ctaArabicLine" TEXT NOT NULL,
    "ctaTitle" TEXT NOT NULL,
    "ctaDescription" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HomepageSectionsText_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageFeatureCard" (
    "id" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageFeatureCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HomepageFeatureCard_order_idx" ON "HomepageFeatureCard"("order");

-- CreateTable
CREATE TABLE "HomepageAcademyItem" (
    "id" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageAcademyItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HomepageAcademyItem_order_idx" ON "HomepageAcademyItem"("order");

-- CreateTable
CREATE TABLE "HomepageApproachStep" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageApproachStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HomepageApproachStep_order_idx" ON "HomepageApproachStep"("order");
