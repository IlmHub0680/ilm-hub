-- SectionBanner: one uploadable banner image per public section
-- (bookstore, media, library), independent of HomepageHero. One row
-- per section, upserted by a fixed id (the section key itself).
CREATE TABLE "SectionBanner" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SectionBanner_pkey" PRIMARY KEY ("id")
);
