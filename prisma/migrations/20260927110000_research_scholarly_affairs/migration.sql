-- Research & Scholarly Affairs (spec §17) -- from-scratch build.
--
-- This is a Delegated Operation: a real institute department run by its
-- own designated role (Research & Scholarly Affairs Officer), gated by
-- the new RESEARCH_OPS module -- never an Admin-operated function.
--
-- ALTER TYPE ... ADD VALUE must run as its own standalone statement,
-- outside any transaction that also uses the new value, so it is the
-- very first statement in this file (the safe conventional pattern
-- already used elsewhere in this codebase's migration history).

ALTER TYPE "Module" ADD VALUE 'RESEARCH_OPS';

-- =====================================================================
-- ENUMS
-- =====================================================================

CREATE TYPE "ResearchProjectStatus" AS ENUM (
  'PROPOSED',
  'UNDER_REVIEW',
  'APPROVED',
  'ACTIVE',
  'COMPLETED',
  'REJECTED',
  'SUSPENDED'
);

CREATE TYPE "ResearchProposalStatus" AS ENUM (
  'SUBMITTED',
  'UNDER_REVIEW',
  'REVISION_REQUESTED',
  'APPROVED',
  'REJECTED',
  'WITHDRAWN'
);

CREATE TYPE "ResearchReviewDecision" AS ENUM (
  'PENDING',
  'APPROVE',
  'REQUEST_REVISION',
  'REJECT'
);

CREATE TYPE "ResearchProposalDecisionType" AS ENUM (
  'SUBMITTED',
  'REVIEWER_ASSIGNED',
  'REVISION_REQUESTED',
  'RESUBMITTED',
  'APPROVED',
  'REJECTED',
  'WITHDRAWN'
);

CREATE TYPE "ResearchTeamRole" AS ENUM (
  'PRINCIPAL_INVESTIGATOR',
  'CO_INVESTIGATOR',
  'RESEARCHER',
  'RESEARCH_ASSISTANT',
  'EXTERNAL_COLLABORATOR'
);

CREATE TYPE "ResearchPublicationType" AS ENUM (
  'JOURNAL_ARTICLE',
  'BOOK',
  'BOOK_CHAPTER',
  'CONFERENCE_PAPER',
  'RESEARCH_REPORT',
  'WORKING_PAPER',
  'OTHER'
);

CREATE TYPE "ResearchPublicationStatus" AS ENUM (
  'DRAFT',
  'SUBMITTED',
  'ACCEPTED',
  'PUBLISHED',
  'RETRACTED'
);

CREATE TYPE "ResearchSupervisionStatus" AS ENUM (
  'ACTIVE',
  'ON_HOLD',
  'COMPLETED',
  'DISCONTINUED'
);

CREATE TYPE "ResearchGrantStatus" AS ENUM (
  'APPLIED',
  'AWARDED',
  'DECLINED',
  'ACTIVE',
  'CLOSED'
);

CREATE TYPE "ResearchIntegrityConcernType" AS ENUM (
  'PLAGIARISM',
  'DATA_FABRICATION',
  'AUTHORSHIP_DISPUTE',
  'ETHICS_VIOLATION',
  'CONFLICT_OF_INTEREST',
  'OTHER'
);

CREATE TYPE "ResearchIntegrityCaseStatus" AS ENUM (
  'REPORTED',
  'UNDER_INVESTIGATION',
  'RESOLVED',
  'DISMISSED'
);

CREATE TYPE "EventCategory" AS ENUM (
  'RESEARCH',
  'SEMINAR',
  'CONFERENCE',
  'WORKSHOP',
  'GENERAL'
);

-- =====================================================================
-- Event integration -- additive, nullable column only. Every existing
-- Event row and every existing Event-creation code path keeps working
-- unchanged with no value (backward-compatible, not a breaking
-- required field). Per spec: integrate with the existing institute
-- Events system rather than build a second events platform.
-- =====================================================================

ALTER TABLE "Event" ADD COLUMN "category" "EventCategory";

CREATE INDEX "Event_category_idx" ON "Event"("category");

-- =====================================================================
-- RESEARCH AREA -- simple lookup used to categorize projects/proposals.
-- =====================================================================

CREATE TABLE "ResearchArea" (
  "id"          TEXT NOT NULL,
  "nameEn"      TEXT NOT NULL,
  "nameAr"      TEXT,
  "description" TEXT,
  "isActive"    BOOLEAN NOT NULL DEFAULT true,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ResearchArea_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ResearchArea_nameEn_key" ON "ResearchArea"("nameEn");

-- =====================================================================
-- RESEARCH PROJECT
-- =====================================================================

CREATE TABLE "ResearchProject" (
  "id"            TEXT NOT NULL,
  "title"         TEXT NOT NULL,
  "description"   TEXT NOT NULL,
  "areaId"        TEXT,
  "principalInvestigatorId" TEXT NOT NULL,
  "status"        "ResearchProjectStatus" NOT NULL DEFAULT 'PROPOSED',
  "startDate"     TIMESTAMP(3),
  "endDate"       TIMESTAMP(3),
  "progressNotes" TEXT,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ResearchProject_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ResearchProject"
  ADD CONSTRAINT "ResearchProject_areaId_fkey"
  FOREIGN KEY ("areaId") REFERENCES "ResearchArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ResearchProject"
  ADD CONSTRAINT "ResearchProject_principalInvestigatorId_fkey"
  FOREIGN KEY ("principalInvestigatorId") REFERENCES "StaffProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "ResearchProject_areaId_idx" ON "ResearchProject"("areaId");
CREATE INDEX "ResearchProject_principalInvestigatorId_idx" ON "ResearchProject"("principalInvestigatorId");
CREATE INDEX "ResearchProject_status_idx" ON "ResearchProject"("status");

-- =====================================================================
-- RESEARCH MILESTONE -- child of ResearchProject, progress tracking.
-- =====================================================================

CREATE TABLE "ResearchMilestone" (
  "id"          TEXT NOT NULL,
  "projectId"   TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "description" TEXT,
  "dueDate"     TIMESTAMP(3),
  "isCompleted" BOOLEAN NOT NULL DEFAULT false,
  "completedAt" TIMESTAMP(3),
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ResearchMilestone_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ResearchMilestone"
  ADD CONSTRAINT "ResearchMilestone_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "ResearchProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "ResearchMilestone_projectId_idx" ON "ResearchMilestone"("projectId");

-- =====================================================================
-- RESEARCH TEAM MEMBER -- join to ResearchProject; either an internal
-- StaffProfile or a plain external-collaborator record (name/
-- affiliation/email), since external collaborators aren't platform
-- users. Exactly one of staffId / externalName should be set -- enforced
-- in application code (Postgres CHECK across nullable FK + plain field
-- is avoidable complexity for a hand-authored migration).
-- =====================================================================

CREATE TABLE "ResearchTeamMember" (
  "id"                TEXT NOT NULL,
  "projectId"         TEXT NOT NULL,
  "staffId"           TEXT,
  "externalName"      TEXT,
  "externalAffiliation" TEXT,
  "externalEmail"     TEXT,
  "role"              "ResearchTeamRole" NOT NULL DEFAULT 'RESEARCHER',
  "joinedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ResearchTeamMember_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ResearchTeamMember"
  ADD CONSTRAINT "ResearchTeamMember_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "ResearchProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ResearchTeamMember"
  ADD CONSTRAINT "ResearchTeamMember_staffId_fkey"
  FOREIGN KEY ("staffId") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "ResearchTeamMember_projectId_idx" ON "ResearchTeamMember"("projectId");
CREATE INDEX "ResearchTeamMember_staffId_idx" ON "ResearchTeamMember"("staffId");

-- =====================================================================
-- RESEARCH PROPOSAL -- submission-then-becomes-a-project workflow.
-- Standalone at submission time (projectId null); once approved, the
-- resulting ResearchProject is linked back via projectId.
-- =====================================================================

CREATE TABLE "ResearchProposal" (
  "id"              TEXT NOT NULL,
  "title"           TEXT NOT NULL,
  "summary"         TEXT NOT NULL,
  "areaId"          TEXT,
  "submittedById"   TEXT NOT NULL,
  "projectId"       TEXT,
  "status"          "ResearchProposalStatus" NOT NULL DEFAULT 'SUBMITTED',
  "submittedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "decidedAt"       TIMESTAMP(3),
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ResearchProposal_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ResearchProposal"
  ADD CONSTRAINT "ResearchProposal_areaId_fkey"
  FOREIGN KEY ("areaId") REFERENCES "ResearchArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ResearchProposal"
  ADD CONSTRAINT "ResearchProposal_submittedById_fkey"
  FOREIGN KEY ("submittedById") REFERENCES "StaffProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ResearchProposal"
  ADD CONSTRAINT "ResearchProposal_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "ResearchProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE UNIQUE INDEX "ResearchProposal_projectId_key" ON "ResearchProposal"("projectId");
CREATE INDEX "ResearchProposal_areaId_idx" ON "ResearchProposal"("areaId");
CREATE INDEX "ResearchProposal_submittedById_idx" ON "ResearchProposal"("submittedById");
CREATE INDEX "ResearchProposal_status_idx" ON "ResearchProposal"("status");

-- =====================================================================
-- RESEARCH PROPOSAL REVIEW -- reviewer assignment + comments + decision.
-- =====================================================================

CREATE TABLE "ResearchProposalReview" (
  "id"           TEXT NOT NULL,
  "proposalId"   TEXT NOT NULL,
  "reviewerId"   TEXT NOT NULL,
  "assignedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "comments"     TEXT,
  "revisionNote" TEXT,
  "decision"     "ResearchReviewDecision" NOT NULL DEFAULT 'PENDING',
  "decidedAt"    TIMESTAMP(3),
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ResearchProposalReview_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ResearchProposalReview"
  ADD CONSTRAINT "ResearchProposalReview_proposalId_fkey"
  FOREIGN KEY ("proposalId") REFERENCES "ResearchProposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ResearchProposalReview"
  ADD CONSTRAINT "ResearchProposalReview_reviewerId_fkey"
  FOREIGN KEY ("reviewerId") REFERENCES "StaffProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "ResearchProposalReview_proposalId_idx" ON "ResearchProposalReview"("proposalId");
CREATE INDEX "ResearchProposalReview_reviewerId_idx" ON "ResearchProposalReview"("reviewerId");
CREATE INDEX "ResearchProposalReview_decision_idx" ON "ResearchProposalReview"("decision");

-- =====================================================================
-- RESEARCH PROPOSAL DECISION -- append-only decision history / audit
-- trail, distinct from the single mutable `status` field on
-- ResearchProposal above so the full history is never overwritten.
-- =====================================================================

CREATE TABLE "ResearchProposalDecision" (
  "id"          TEXT NOT NULL,
  "proposalId"  TEXT NOT NULL,
  "type"        "ResearchProposalDecisionType" NOT NULL,
  "actorId"     TEXT,
  "note"        TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ResearchProposalDecision_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ResearchProposalDecision"
  ADD CONSTRAINT "ResearchProposalDecision_proposalId_fkey"
  FOREIGN KEY ("proposalId") REFERENCES "ResearchProposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ResearchProposalDecision"
  ADD CONSTRAINT "ResearchProposalDecision_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "StaffProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "ResearchProposalDecision_proposalId_idx" ON "ResearchProposalDecision"("proposalId");
CREATE INDEX "ResearchProposalDecision_actorId_idx" ON "ResearchProposalDecision"("actorId");

-- =====================================================================
-- RESEARCH PUBLICATION -- scholarly outputs. Its own model, entirely
-- separate from the personal ManuscriptSubmission/Book pipeline (zero
-- coupling by design). Optionally linked to a ResearchProject.
-- =====================================================================

CREATE TABLE "ResearchPublication" (
  "id"          TEXT NOT NULL,
  "projectId"   TEXT,
  "type"        "ResearchPublicationType" NOT NULL,
  "status"      "ResearchPublicationStatus" NOT NULL DEFAULT 'DRAFT',
  "title"       TEXT NOT NULL,
  "venue"       TEXT,
  "publisher"   TEXT,
  "year"        INTEGER,
  "doiOrLink"   TEXT,
  "abstract"    TEXT,
  "isPublic"    BOOLEAN NOT NULL DEFAULT false,
  "publishedAt" TIMESTAMP(3),
  "createdById" TEXT NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ResearchPublication_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ResearchPublication"
  ADD CONSTRAINT "ResearchPublication_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "ResearchProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ResearchPublication"
  ADD CONSTRAINT "ResearchPublication_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "StaffProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "ResearchPublication_projectId_idx" ON "ResearchPublication"("projectId");
CREATE INDEX "ResearchPublication_createdById_idx" ON "ResearchPublication"("createdById");
CREATE INDEX "ResearchPublication_status_idx" ON "ResearchPublication"("status");
CREATE INDEX "ResearchPublication_type_idx" ON "ResearchPublication"("type");

-- =====================================================================
-- RESEARCH PUBLICATION AUTHOR -- internal + external authors, ordered.
-- =====================================================================

CREATE TABLE "ResearchPublicationAuthor" (
  "id"             TEXT NOT NULL,
  "publicationId"  TEXT NOT NULL,
  "staffId"        TEXT,
  "externalName"   TEXT,
  "order"          INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "ResearchPublicationAuthor_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ResearchPublicationAuthor"
  ADD CONSTRAINT "ResearchPublicationAuthor_publicationId_fkey"
  FOREIGN KEY ("publicationId") REFERENCES "ResearchPublication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ResearchPublicationAuthor"
  ADD CONSTRAINT "ResearchPublicationAuthor_staffId_fkey"
  FOREIGN KEY ("staffId") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "ResearchPublicationAuthor_publicationId_idx" ON "ResearchPublicationAuthor"("publicationId");
CREATE INDEX "ResearchPublicationAuthor_staffId_idx" ON "ResearchPublicationAuthor"("staffId");

-- =====================================================================
-- RESEARCH COLLABORATION PARTNER -- external institutional partners,
-- and their link to collaborative projects. Kept intentionally simple
-- (a lookup + a join table) rather than a full partner-management CRM.
-- =====================================================================

CREATE TABLE "ResearchCollaborationPartner" (
  "id"          TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "type"        TEXT,
  "country"     TEXT,
  "contactName" TEXT,
  "contactEmail" TEXT,
  "notes"       TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ResearchCollaborationPartner_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ResearchProjectPartner" (
  "id"        TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "partnerId" TEXT NOT NULL,
  "role"      TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ResearchProjectPartner_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ResearchProjectPartner"
  ADD CONSTRAINT "ResearchProjectPartner_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "ResearchProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ResearchProjectPartner"
  ADD CONSTRAINT "ResearchProjectPartner_partnerId_fkey"
  FOREIGN KEY ("partnerId") REFERENCES "ResearchCollaborationPartner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "ResearchProjectPartner_projectId_partnerId_key" ON "ResearchProjectPartner"("projectId", "partnerId");
CREATE INDEX "ResearchProjectPartner_projectId_idx" ON "ResearchProjectPartner"("projectId");
CREATE INDEX "ResearchProjectPartner_partnerId_idx" ON "ResearchProjectPartner"("partnerId");

-- =====================================================================
-- RESEARCH SUPERVISION -- "if the institute offers research-based
-- programmes" (currently none are seeded -- see schema comment). Built
-- fully at the schema/API layer so it's ready; UI kept a light,
-- honest empty-state scaffold given zero real usage today.
-- =====================================================================

CREATE TABLE "ResearchSupervision" (
  "id"                TEXT NOT NULL,
  "studentId"         TEXT NOT NULL,
  "supervisorId"      TEXT NOT NULL,
  "topic"             TEXT NOT NULL,
  "status"            "ResearchSupervisionStatus" NOT NULL DEFAULT 'ACTIVE',
  "startedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt"       TIMESTAMP(3),
  "progressNotes"     TEXT,
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ResearchSupervision_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ResearchSupervision"
  ADD CONSTRAINT "ResearchSupervision_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ResearchSupervision"
  ADD CONSTRAINT "ResearchSupervision_supervisorId_fkey"
  FOREIGN KEY ("supervisorId") REFERENCES "StaffProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "ResearchSupervision_studentId_idx" ON "ResearchSupervision"("studentId");
CREATE INDEX "ResearchSupervision_supervisorId_idx" ON "ResearchSupervision"("supervisorId");
CREATE INDEX "ResearchSupervision_status_idx" ON "ResearchSupervision"("status");

-- Co-supervisors -- join table so a supervision can have zero or more
-- co-supervisors in addition to its one primary supervisor above.
CREATE TABLE "ResearchCoSupervisor" (
  "id"            TEXT NOT NULL,
  "supervisionId" TEXT NOT NULL,
  "staffId"       TEXT NOT NULL,

  CONSTRAINT "ResearchCoSupervisor_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ResearchCoSupervisor"
  ADD CONSTRAINT "ResearchCoSupervisor_supervisionId_fkey"
  FOREIGN KEY ("supervisionId") REFERENCES "ResearchSupervision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ResearchCoSupervisor"
  ADD CONSTRAINT "ResearchCoSupervisor_staffId_fkey"
  FOREIGN KEY ("staffId") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "ResearchCoSupervisor_supervisionId_staffId_key" ON "ResearchCoSupervisor"("supervisionId", "staffId");
CREATE INDEX "ResearchCoSupervisor_supervisionId_idx" ON "ResearchCoSupervisor"("supervisionId");
CREATE INDEX "ResearchCoSupervisor_staffId_idx" ON "ResearchCoSupervisor"("staffId");

-- Supervision meetings -- child model tracking progress meetings.
CREATE TABLE "ResearchSupervisionMeeting" (
  "id"            TEXT NOT NULL,
  "supervisionId" TEXT NOT NULL,
  "meetingDate"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes"         TEXT NOT NULL,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ResearchSupervisionMeeting_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ResearchSupervisionMeeting"
  ADD CONSTRAINT "ResearchSupervisionMeeting_supervisionId_fkey"
  FOREIGN KEY ("supervisionId") REFERENCES "ResearchSupervision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "ResearchSupervisionMeeting_supervisionId_idx" ON "ResearchSupervisionMeeting"("supervisionId");

-- =====================================================================
-- RESEARCH GRANT -- "if applicable". Records only -- Finance remains
-- responsible for actual financial transactions; no money-movement
-- logic here.
-- =====================================================================

CREATE TABLE "ResearchGrant" (
  "id"               TEXT NOT NULL,
  "projectId"        TEXT NOT NULL,
  "fundingSource"    TEXT NOT NULL,
  "amountRequested"  DECIMAL(12,2),
  "amountAwarded"    DECIMAL(12,2),
  "currency"         TEXT NOT NULL DEFAULT 'USD',
  "status"           "ResearchGrantStatus" NOT NULL DEFAULT 'APPLIED',
  "appliedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "decidedAt"        TIMESTAMP(3),
  "closedAt"         TIMESTAMP(3),
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ResearchGrant_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ResearchGrant"
  ADD CONSTRAINT "ResearchGrant_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "ResearchProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "ResearchGrant_projectId_idx" ON "ResearchGrant"("projectId");
CREATE INDEX "ResearchGrant_status_idx" ON "ResearchGrant"("status");

-- Grant reporting -- child model for periodic reporting notes required
-- by a funding source, kept separate from the grant's own status.
CREATE TABLE "ResearchGrantReport" (
  "id"         TEXT NOT NULL,
  "grantId"    TEXT NOT NULL,
  "reportDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes"      TEXT NOT NULL,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ResearchGrantReport_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ResearchGrantReport"
  ADD CONSTRAINT "ResearchGrantReport_grantId_fkey"
  FOREIGN KEY ("grantId") REFERENCES "ResearchGrant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "ResearchGrantReport_grantId_idx" ON "ResearchGrantReport"("grantId");

-- =====================================================================
-- RESEARCH INTEGRITY CASE -- "where applicable". Deliberately its own
-- model, entirely separate from IntegrityCase (student academic
-- integrity in a course context) -- this tracks misconduct by a
-- RESEARCHER in a RESEARCH PROJECT/PUBLICATION context (authorship
-- disputes, data fabrication, ethics violations). Strict permissions
-- applied at the application layer (see lib/permissions.ts /
-- app/api/research/integrity routes): only the Research role holder
-- and Admin/SUPER_ADMIN may ever view/create/resolve these records.
-- =====================================================================

CREATE TABLE "ResearchIntegrityCase" (
  "id"              TEXT NOT NULL,
  "projectId"       TEXT,
  "publicationId"   TEXT,
  "concernType"     "ResearchIntegrityConcernType" NOT NULL,
  "description"     TEXT NOT NULL,
  "reportedById"    TEXT NOT NULL,
  "status"          "ResearchIntegrityCaseStatus" NOT NULL DEFAULT 'REPORTED',
  "investigationNotes" TEXT,
  "outcome"         TEXT,
  "isConfidential"  BOOLEAN NOT NULL DEFAULT true,
  "resolvedById"    TEXT,
  "resolvedAt"      TIMESTAMP(3),
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ResearchIntegrityCase_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ResearchIntegrityCase"
  ADD CONSTRAINT "ResearchIntegrityCase_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "ResearchProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ResearchIntegrityCase"
  ADD CONSTRAINT "ResearchIntegrityCase_publicationId_fkey"
  FOREIGN KEY ("publicationId") REFERENCES "ResearchPublication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ResearchIntegrityCase"
  ADD CONSTRAINT "ResearchIntegrityCase_reportedById_fkey"
  FOREIGN KEY ("reportedById") REFERENCES "StaffProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ResearchIntegrityCase"
  ADD CONSTRAINT "ResearchIntegrityCase_resolvedById_fkey"
  FOREIGN KEY ("resolvedById") REFERENCES "StaffProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "ResearchIntegrityCase_projectId_idx" ON "ResearchIntegrityCase"("projectId");
CREATE INDEX "ResearchIntegrityCase_publicationId_idx" ON "ResearchIntegrityCase"("publicationId");
CREATE INDEX "ResearchIntegrityCase_reportedById_idx" ON "ResearchIntegrityCase"("reportedById");
CREATE INDEX "ResearchIntegrityCase_status_idx" ON "ResearchIntegrityCase"("status");
