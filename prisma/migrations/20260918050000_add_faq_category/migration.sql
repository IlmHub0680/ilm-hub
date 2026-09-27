-- FaqItem.category (Model 26): splits the single FAQ list into
-- "general" (the existing public /faq page) and "technical" (the
-- new /it-support page). Every existing row defaults to "general",
-- so the current /faq page's content is completely unchanged by
-- this migration.
ALTER TABLE "FaqItem" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'general';

CREATE INDEX "FaqItem_category_idx" ON "FaqItem"("category");
