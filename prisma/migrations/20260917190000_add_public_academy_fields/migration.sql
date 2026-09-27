-- Model 15 (Academy Digital Structure & Academic Content Integration).
-- Two small, additive changes so the public Academy pages can show real
-- data instead of either inventing it or sending every visitor to a
-- governance document:
--   1. StaffProfile.bio / StaffProfile.photoUrl -- no field anywhere in
--      the schema previously held a faculty biography or profile photo.
--      Both nullable: a staff member appears on the public Faculty page
--      without one until someone actually supplies it.
--   2. Course.outcomeEn / Course.assessmentType -- the real, already-
--      approved per-course outcome and assessment type, currently only
--      readable as prose inside the academy-course-catalogue document.
--      Populated by a follow-up content script from that same approved
--      text, never invented here.
ALTER TABLE "StaffProfile" ADD COLUMN "bio" TEXT;
ALTER TABLE "StaffProfile" ADD COLUMN "photoUrl" TEXT;
ALTER TABLE "Course" ADD COLUMN "outcomeEn" TEXT;
ALTER TABLE "Course" ADD COLUMN "assessmentType" TEXT;
