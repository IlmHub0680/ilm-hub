-- Institute Digital Library (spec §12) -- from-scratch build, and the
-- correction of an earlier mistake (see prisma/migrations history:
-- 20260927100000_library_resource_visibility was removed entirely --
-- it mistakenly added viewer-tiering to the PERSONAL LibraryResource
-- model instead of a genuine institute-owned model, and was reverted
-- before ever being deployed to any real database).
--
-- This is a Delegated Operation: a real institute department (the
-- Librarian / Library Services role) already owns the physical
-- circulation catalogue (LibraryItem/LibraryLoan/LibraryReservation)
-- via the existing LIBRARY_OPS module; this migration adds that same
-- role's ownership of the institute's DIGITAL content, on a THIRD,
-- distinct model (InstituteLibraryResource) that must never be
-- confused with either LibraryResource (the platform owner's own
-- personal public reading library) or LibraryItem (physical lending).
-- No new Module value is needed -- LIBRARY_OPS already exists.

-- =====================================================================
-- ENUMS
-- =====================================================================

CREATE TYPE "InstituteLibraryCategory" AS ENUM (
  'DIGITAL_BOOKS',
  'EBOOKS',
  'ARTICLES',
  'FATWAS',
  'RESEARCH_PAPERS',
  'MANUSCRIPTS',
  'MUTOON_TEXTS',
  'ACADEMIC_RESOURCES',
  'ISLAMIC_SCHOLARLY_RESOURCES',
  'COURSE_RESOURCES'
);

CREATE TYPE "InstituteLibraryVisibility" AS ENUM (
  'INSTITUTE_ONLY',
  'STUDENTS_AND_STAFF',
  'FACULTY_STAFF_ONLY',
  'PUBLIC',
  'RESTRICTED'
);

CREATE TYPE "InstituteLibraryResourceStatus" AS ENUM (
  'DRAFT',
  'UNDER_REVIEW',
  'PUBLISHED',
  'ARCHIVED'
);

-- =====================================================================
-- TABLE: InstituteLibraryResource
-- =====================================================================

CREATE TABLE "InstituteLibraryResource" (
  "id"            TEXT NOT NULL,
  "titleEn"       TEXT NOT NULL,
  "titleAr"       TEXT NOT NULL,
  "descriptionEn" TEXT NOT NULL,
  "descriptionAr" TEXT NOT NULL,
  "slug"          TEXT NOT NULL,
  "category"      "InstituteLibraryCategory" NOT NULL,
  "status"        "InstituteLibraryResourceStatus" NOT NULL DEFAULT 'DRAFT',
  "fileUrl"       TEXT,
  "externalUrl"   TEXT,
  "thumbnailUrl"  TEXT,
  "author"        TEXT,
  "subject"       TEXT,
  "topic"         TEXT,
  -- Conservative default: institute content requires deliberate
  -- publication from day one (no legacy-data concern -- this table
  -- has zero existing rows).
  "isPublished"   BOOLEAN NOT NULL DEFAULT false,
  -- Safe non-public default, per the spec's explicit "default must
  -- NOT be Public" requirement.
  "visibility"    "InstituteLibraryVisibility" NOT NULL DEFAULT 'INSTITUTE_ONLY',
  "uploadedById"  TEXT,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL,

  CONSTRAINT "InstituteLibraryResource_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "InstituteLibraryResource_slug_key" ON "InstituteLibraryResource"("slug");
CREATE INDEX "InstituteLibraryResource_category_idx" ON "InstituteLibraryResource"("category");
CREATE INDEX "InstituteLibraryResource_status_idx" ON "InstituteLibraryResource"("status");
CREATE INDEX "InstituteLibraryResource_isPublished_idx" ON "InstituteLibraryResource"("isPublished");
CREATE INDEX "InstituteLibraryResource_visibility_idx" ON "InstituteLibraryResource"("visibility");
CREATE INDEX "InstituteLibraryResource_uploadedById_idx" ON "InstituteLibraryResource"("uploadedById");

-- References StaffProfile (institute departmental content created by
-- institute staff), not User -- contrast with LibraryResource, whose
-- uploadedById references User (the platform owner personally).
ALTER TABLE "InstituteLibraryResource"
  ADD CONSTRAINT "InstituteLibraryResource_uploadedById_fkey"
  FOREIGN KEY ("uploadedById") REFERENCES "StaffProfile"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- =====================================================================
-- CourseReading: third nullable FK for course-reading integration.
-- "Exactly one of libraryResourceId / bookId / instituteLibraryResourceId"
-- is enforced at the route/application layer (see
-- app/api/coordinator/courses/[id]/readings/route.js), matching how
-- the existing two-FK "exactly one" rule was already enforced there
-- rather than with a DB CHECK constraint.
-- =====================================================================

ALTER TABLE "CourseReading" ADD COLUMN "instituteLibraryResourceId" TEXT;

CREATE INDEX "CourseReading_instituteLibraryResourceId_idx" ON "CourseReading"("instituteLibraryResourceId");

ALTER TABLE "CourseReading"
  ADD CONSTRAINT "CourseReading_instituteLibraryResourceId_fkey"
  FOREIGN KEY ("instituteLibraryResourceId") REFERENCES "InstituteLibraryResource"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
