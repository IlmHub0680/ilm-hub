CREATE TABLE "AlumniPageContent" (
    "id" TEXT NOT NULL,
    "heroEyebrow" TEXT NOT NULL,
    "heroTitle" TEXT NOT NULL,
    "heroSubtitle" TEXT NOT NULL,
    "statsHeading" TEXT NOT NULL,
    "spotlightLabel" TEXT NOT NULL,
    "spotlightHeading" TEXT NOT NULL,
    "spotlightSubtitle" TEXT NOT NULL,
    "ctaHeading" TEXT NOT NULL,
    "ctaText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AlumniPageContent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AlumniStat" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AlumniStat_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AlumniStat_order_idx" ON "AlumniStat"("order");

CREATE TABLE "AlumniProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "graduationYear" TEXT,
    "program" TEXT,
    "photoUrl" TEXT,
    "currentRole" TEXT,
    "quote" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AlumniProfile_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AlumniProfile_order_idx" ON "AlumniProfile"("order");
