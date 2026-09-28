-- Move existing MediaItem rows off the retired category values onto
-- their new equivalents (introduced in the previous migration), as
-- part of splitting the old combined "Media Library" feature into
-- separate Media and Library sections. No rows are deleted; only the
-- category label changes:
--   EDUCATIONAL_PROGRAMS -> VIDEO_LESSONS
--   QURAN_RECITATION     -> AUDIO_RECORDINGS
--   NASHEED               -> AUDIO_RECORDINGS
--   OTHER                 -> SCHOLARLY_TALKS
-- This must run as its own migration (after the ALTER TYPE ADD VALUE
-- migration has committed) because Postgres does not allow a newly
-- added enum value to be referenced in the same transaction it was
-- added in.
UPDATE "MediaItem" SET category = 'VIDEO_LESSONS' WHERE category = 'EDUCATIONAL_PROGRAMS';
UPDATE "MediaItem" SET category = 'AUDIO_RECORDINGS' WHERE category = 'QURAN_RECITATION';
UPDATE "MediaItem" SET category = 'AUDIO_RECORDINGS' WHERE category = 'NASHEED';
UPDATE "MediaItem" SET category = 'SCHOLARLY_TALKS' WHERE category = 'OTHER';
