-- Adds a per-banner, non-animated body/description (English + Arabic)
-- to HomepageHeroBanner, separate from the existing captionEn/
-- captionAr (which types out character by character). Without this
-- field admins had nowhere to put a real per-slide description and
-- pasted it into the caption instead, causing the whole paragraph to
-- type out. Nullable: an existing banner (or one added without a
-- body) falls back to HomepageHero.subtitle/subtitleAr on the client.
ALTER TABLE "HomepageHeroBanner" ADD COLUMN "bodyEn" TEXT;
ALTER TABLE "HomepageHeroBanner" ADD COLUMN "bodyAr" TEXT;
