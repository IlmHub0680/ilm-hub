-- QualityReview.actionOwner: who (a person or, more often, a whole
-- unit) owns following up on a review's corrective action / improvement
-- plan, distinct from reviewedById (who conducted the review itself).
-- followUpDate already covers the deadline half of "Corrective
-- actions... Action owners... Deadlines" -- this is the missing owner
-- half. Free text, nullable, purely additive; no backfill needed.

-- AlterTable
ALTER TABLE "QualityReview" ADD COLUMN "actionOwner" TEXT;
