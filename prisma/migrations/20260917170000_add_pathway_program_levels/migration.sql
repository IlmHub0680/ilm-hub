-- Model 12 (Website, Recognition Readiness & Master Integration).
-- Academy Pathways already named Foundation, Intermediate and Advanced
-- as real pathway tiers alongside the Diploma; only the Diploma could
-- become a real Program row until now, because ProgramLevel had no
-- matching value for the other three (see /academy-pathways decision
-- 20, and the seedAcademyPrograms comment in prisma/seed.js this
-- migration makes accurate). Each ADD VALUE must be its own statement
-- and this migration must finish before anything references the new
-- values (Postgres will not let a newly added enum value be used in
-- the same transaction it was added in) — prisma/seed.js runs as a
-- separate step afterwards, so this is safe.
ALTER TYPE "ProgramLevel" ADD VALUE 'FOUNDATION';
ALTER TYPE "ProgramLevel" ADD VALUE 'INTERMEDIATE';
ALTER TYPE "ProgramLevel" ADD VALUE 'ADVANCED';
