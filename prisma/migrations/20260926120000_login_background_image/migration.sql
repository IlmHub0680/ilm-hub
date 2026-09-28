-- Adds an optional admin-managed institute banner background image,
-- shared by all three real login pages (/login, /staff-login,
-- /account). Nullable, so existing rows are unaffected and every
-- login page keeps its current gradient background until an admin
-- uploads one via the existing Homepage Hero brand-assets flow.
ALTER TABLE "HomepageHero" ADD COLUMN "loginBackgroundUrl" TEXT;
