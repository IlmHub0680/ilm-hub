-- Adds two nullable text columns to SectionBanner: titleEn and bodyEn.
--
-- Used, for now, only by the 'homepage-beneficial-knowledge' row (the
-- homepage's "Beneficial Knowledge" box) so its heading and paragraph
-- can be edited from the admin instead of being hardcoded in
-- app/page.jsx. bookstore/media/library rows simply leave these NULL
-- and keep their existing hardcoded page copy -- nothing about their
-- behavior changes.
ALTER TABLE "SectionBanner" ADD COLUMN "titleEn" TEXT;
ALTER TABLE "SectionBanner" ADD COLUMN "bodyEn" TEXT;
