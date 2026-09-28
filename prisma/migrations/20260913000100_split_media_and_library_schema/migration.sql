-- Add the 3 new MediaCategory values needed for the Media/Library split.
-- Existing values (KHUTBAH, POEMS, MUTOON, LECTURES) are kept as-is;
-- EDUCATIONAL_PROGRAMS, QURAN_RECITATION, NASHEED and OTHER stay in the
-- Postgres enum type (harmless, unused) but are removed from
-- prisma/schema.prisma — see the next migration for the data move off
-- of them.
ALTER TYPE "MediaCategory" ADD VALUE 'SCHOLARLY_TALKS';
ALTER TYPE "MediaCategory" ADD VALUE 'VIDEO_LESSONS';
ALTER TYPE "MediaCategory" ADD VALUE 'AUDIO_RECORDINGS';

-- CreateEnum
CREATE TYPE "LibraryCategory" AS ENUM ('ARTICLES', 'FATWAS', 'RESEARCH_PAPERS', 'HISTORICAL_MATERIALS', 'MANUSCRIPTS', 'EDUCATIONAL_RESOURCES', 'CLASSICAL_TEXTS');

-- CreateTable
CREATE TABLE "LibraryResource" (
    "id" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "descriptionAr" TEXT NOT NULL,
    "category" "LibraryCategory" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "author" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LibraryResource_slug_key" ON "LibraryResource"("slug");

-- CreateIndex
CREATE INDEX "LibraryResource_category_idx" ON "LibraryResource"("category");

-- CreateIndex
CREATE INDEX "LibraryResource_isPublished_idx" ON "LibraryResource"("isPublished");

-- CreateIndex
CREATE INDEX "LibraryResource_uploadedById_idx" ON "LibraryResource"("uploadedById");

-- AddForeignKey
ALTER TABLE "LibraryResource" ADD CONSTRAINT "LibraryResource_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
