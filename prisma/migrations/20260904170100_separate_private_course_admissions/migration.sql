-- ============================================================
-- Separate formal programme admissions from private-course
-- admissions.
-- ============================================================

-- 1. Create the PostgreSQL enum used by admissionType.
CREATE TYPE "AdmissionType" AS ENUM (
    'PROGRAM',
    'PRIVATE_COURSE'
);

-- 1. Add admission type.
ALTER TABLE "AdmissionApplication"
ADD COLUMN "admissionType" "AdmissionType"
NOT NULL DEFAULT 'PROGRAM';

-- 2. Private-course admissions do not require a formal programme.
ALTER TABLE "AdmissionApplication"
ALTER COLUMN "programId" DROP NOT NULL;

-- 3. Convert the legacy Private Courses admission.
UPDATE "AdmissionApplication"
SET
    "admissionType" = 'PRIVATE_COURSE',
    "programId" = NULL
WHERE "programId" = 'prog-06';
