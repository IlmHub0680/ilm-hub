-- Model 16 (Admissions & Application System)
-- Extends the admission review workflow with two intermediate states
-- between "Under Review" and "Approved", so an applicant is never told
-- they are admitted before the decision is actually final.
--
-- Kept as its own migration (no other statement in this file) so these
-- new enum values are safely committed before anything else references
-- them.
ALTER TYPE "StudentAdmissionStatus" ADD VALUE 'INITIAL_ACCEPTANCE';
ALTER TYPE "StudentAdmissionStatus" ADD VALUE 'PENDING_FINAL_APPROVAL';
