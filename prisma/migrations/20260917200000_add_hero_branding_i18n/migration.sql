-- Model 15/16 follow-up: homepage professionalization -- bilingual
-- (EN/AR) hero content and uploaded brand assets (logo + hero image).
-- All columns are additive and nullable/defaulted, so existing rows
-- keep working with no data loss.
ALTER TABLE "HomepageHero" ADD COLUMN "badgeAr" TEXT;
ALTER TABLE "HomepageHero" ADD COLUMN "titleAr" TEXT;
ALTER TABLE "HomepageHero" ADD COLUMN "subtitleAr" TEXT;
ALTER TABLE "HomepageHero" ADD COLUMN "primaryLabelAr" TEXT;
ALTER TABLE "HomepageHero" ADD COLUMN "secondaryLabelAr" TEXT;
ALTER TABLE "HomepageHero" ADD COLUMN "featuresAr" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "HomepageHero" ADD COLUMN "logoUrl" TEXT;
ALTER TABLE "HomepageHero" ADD COLUMN "heroImageUrl" TEXT;
