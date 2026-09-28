-- Add per-session "late" tally to the cumulative Attendance aggregate.
-- Existing rows default to 0 (no historical late data exists), preserving
-- the invariant totalClasses = attended + late + absent going forward.
ALTER TABLE "Attendance" ADD COLUMN "late" INTEGER NOT NULL DEFAULT 0;
