-- Adds a per-banner accent color to HomepageHeroBanner, so the hero
-- section's background/frame can tint toward that banner's own color
-- instead of always using the fixed green gradient. Nullable: an
-- existing banner (or one added without a color) keeps the original
-- green gradient/frame exactly as before.
ALTER TABLE "HomepageHeroBanner" ADD COLUMN "accentColor" TEXT;
