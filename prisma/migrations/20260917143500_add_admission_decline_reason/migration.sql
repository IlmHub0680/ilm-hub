-- Model 16 (Admissions & Application System)
-- Adds an optional, staff-authored, applicant-visible reason a Registry/
-- Admissions staff member can record when declining an admission
-- application. Additive and nullable: existing rows are unaffected.
ALTER TABLE "AdmissionApplication" ADD COLUMN "declineReason" TEXT;
