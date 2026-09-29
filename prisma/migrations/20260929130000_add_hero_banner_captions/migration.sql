-- Adds per-banner English/Arabic captions to HomepageHeroBanner, so
-- the hero headline can type out a caption describing the currently
-- active slide instead of always showing the same static title.
-- Both columns are nullable: an existing banner (or one added
-- without a caption) keeps working exactly as before, falling back
-- to HomepageHero.title/titleAr on the client.
ALTER TABLE "HomepageHeroBanner" ADD COLUMN "captionEn" TEXT;
ALTER TABLE "HomepageHeroBanner" ADD COLUMN "captionAr" TEXT;
