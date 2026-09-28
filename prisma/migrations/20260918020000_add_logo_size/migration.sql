-- Admin-adjustable logo size (percentage of the normal header/footer
-- logo size). Nullable -- existing rows simply mean "use the default
-- size" until an admin picks one.
ALTER TABLE "HomepageHero" ADD COLUMN "logoSize" INTEGER;
