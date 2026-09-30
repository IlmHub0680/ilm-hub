-- Adds Program.weeksPerLevel and Program.studyMode -- the public
-- programme detail page's "Weeks Per Level" stat tile and "Education
-- Type" meta line, both left for the Head of Department to set per
-- programme. Nullable: an existing programme (or one saved without
-- either value) shows an honest "--" rather than a made-up number.
-- studyMode reuses the already-existing StudyMode enum (previously
-- only used on AdmissionApplication) rather than a new concept.
ALTER TABLE "Program" ADD COLUMN "weeksPerLevel" INTEGER;
ALTER TABLE "Program" ADD COLUMN "studyMode" "StudyMode";
