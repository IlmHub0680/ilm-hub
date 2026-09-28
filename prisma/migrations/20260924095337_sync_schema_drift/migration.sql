-- CreateEnum
CREATE TYPE "MediaCategory" AS ENUM ('SCHOLARLY_TALKS', 'VIDEO_LESSONS', 'AUDIO_RECORDINGS', 'KHUTBAH', 'POEMS', 'MUTOON', 'LECTURES');

-- CreateEnum
CREATE TYPE "LibraryCategory" AS ENUM ('ARTICLES', 'FATWAS', 'RESEARCH_PAPERS', 'HISTORICAL_MATERIALS', 'MANUSCRIPTS', 'EDUCATIONAL_RESOURCES', 'CLASSICAL_TEXTS');

-- CreateEnum
CREATE TYPE "MediaSubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NoteVisibility" AS ENUM ('INTERNAL', 'APPLICANT_VISIBLE');

-- CreateEnum
CREATE TYPE "AdmissionLetterStatus" AS ENUM ('DRAFT', 'FINALIZED');

-- CreateEnum
CREATE TYPE "RoyaltyEntryStatus" AS ENUM ('PENDING', 'PAID', 'VOID');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'REJECTED');

-- CreateEnum
CREATE TYPE "CalendarStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SponsorStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "StudyMode" AS ENUM ('FULL_TIME', 'PART_TIME');

-- CreateEnum
CREATE TYPE "SelfRatedLevel" AS ENUM ('NONE', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFICIENT');

-- CreateEnum
CREATE TYPE "CourseRequestAction" AS ENUM ('ADD', 'DROP');

-- CreateEnum
CREATE TYPE "PayslipStatus" AS ENUM ('PENDING', 'PAID');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('BORROWED', 'RETURNED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "QASubjectType" AS ENUM ('PROGRAM', 'COURSE', 'DEPARTMENT', 'FACULTY', 'STAFF');

-- CreateEnum
CREATE TYPE "ImprovementPlanStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "QAReviewStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "QAOutcome" AS ENUM ('COMPLIANT', 'MINOR_NON_COMPLIANCE', 'MAJOR_NON_COMPLIANCE');

-- CreateEnum
CREATE TYPE "GraduationStatus" AS ENUM ('NOT_STARTED', 'ELIGIBLE', 'APPLIED', 'CLEARANCE_IN_PROGRESS', 'CLEARED', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ClearanceStatus" AS ENUM ('PENDING', 'CLEARED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "PlacementStatus" AS ENUM ('PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "GraduationDocumentType" AS ENUM ('CERTIFICATE', 'STATEMENT_OF_COMPLETION');

-- CreateEnum
CREATE TYPE "QuizQuestionType" AS ENUM ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'WRITTEN', 'VIDEO');

-- CreateEnum
CREATE TYPE "QuizAttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'AUTO_SUBMITTED', 'GRADED');

-- CreateEnum
CREATE TYPE "QualificationType" AS ENUM ('GENERAL', 'ISLAMIC');

-- CreateEnum
CREATE TYPE "StaffStatus" AS ENUM ('ACTIVE', 'ON_LEAVE', 'INACTIVE', 'FORMER');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'RETURNED_FOR_REVISION');

-- CreateEnum
CREATE TYPE "StaffPerformanceRating" AS ENUM ('NEEDS_IMPROVEMENT', 'MEETS_EXPECTATIONS', 'EXCEEDS_EXPECTATIONS', 'OUTSTANDING');

-- CreateEnum
CREATE TYPE "StaffPerformanceReviewStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'ACKNOWLEDGED');

-- CreateEnum
CREATE TYPE "IntegrityViolationType" AS ENUM ('PLAGIARISM', 'CHEATING', 'UNAUTHORIZED_COLLABORATION', 'FALSIFICATION', 'IMPERSONATION', 'ASSESSMENT_MISCONDUCT', 'AI_MISUSE', 'OTHER');

-- CreateEnum
CREATE TYPE "IntegrityCaseSeverity" AS ENUM ('MINOR', 'MAJOR');

-- CreateEnum
CREATE TYPE "IntegrityCaseStatus" AS ENUM ('REPORTED', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED');

-- AlterEnum
ALTER TYPE "Module" ADD VALUE 'FINANCE_PAYROLL';

-- AlterEnum
ALTER TYPE "ProgramLevel" ADD VALUE 'FOUNDATION';
ALTER TYPE "ProgramLevel" ADD VALUE 'INTERMEDIATE';
ALTER TYPE "ProgramLevel" ADD VALUE 'ADVANCED';

-- AlterEnum
ALTER TYPE "RequestType" ADD VALUE 'COMPLAINT';
ALTER TYPE "RequestType" ADD VALUE 'GRADUATE_SUPPORT';

-- AlterEnum
ALTER TYPE "StudentAdmissionStatus" ADD VALUE 'INITIAL_ACCEPTANCE';
ALTER TYPE "StudentAdmissionStatus" ADD VALUE 'PENDING_FINAL_APPROVAL';

-- DropIndex
DROP INDEX "Grade_studentId_courseId_key";

-- AlterTable
ALTER TABLE "AdmissionApplication" ADD COLUMN     "arabicConversationSelf" "SelfRatedLevel",
ADD COLUMN     "arabicGrammarSelf" "SelfRatedLevel",
ADD COLUMN     "arabicReadingSelf" "SelfRatedLevel",
ADD COLUMN     "arabicVocabularySelf" "SelfRatedLevel",
ADD COLUMN     "arabicWritingSelf" "SelfRatedLevel",
ADD COLUMN     "declarationAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "declarationAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "declineReason" TEXT,
ADD COLUMN     "islamicStudiesBackground" TEXT,
ADD COLUMN     "learningGoals" TEXT,
ADD COLUMN     "pathwayPreference" TEXT,
ADD COLUMN     "preferredDepartmentId" TEXT,
ADD COLUMN     "preferredName" TEXT,
ADD COLUMN     "quranHifzSelf" "SelfRatedLevel",
ADD COLUMN     "quranReadingSelf" "SelfRatedLevel",
ADD COLUMN     "quranRecitationSelf" "SelfRatedLevel",
ADD COLUMN     "quranTajweedSelf" "SelfRatedLevel",
ADD COLUMN     "quranicArabicSelf" "SelfRatedLevel",
ADD COLUMN     "specialization" TEXT,
ADD COLUMN     "studyMode" "StudyMode",
ADD COLUMN     "supportNeeds" TEXT;

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "attachmentUrl" TEXT;

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "late" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "AuthorAdmission" ADD COLUMN     "applicationFee" DECIMAL(10,2),
ADD COLUMN     "countryOfResidence" TEXT,
ADD COLUMN     "currencyCode" TEXT,
ADD COLUMN     "feeBasis" TEXT,
ADD COLUMN     "feeExpiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "AuthorPayment" ADD COLUMN     "transactionId" TEXT;

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "royaltyRatePct" DECIMAL(5,2);

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "approvalNote" TEXT,
ADD COLUMN     "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'APPROVED',
ADD COLUMN     "assessmentType" TEXT,
ADD COLUMN     "creditHours" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "outcomeEn" TEXT,
ADD COLUMN     "practicalPassRequirement" TEXT,
ADD COLUMN     "practicalRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "semesterLevel" INTEGER;

-- AlterTable
ALTER TABLE "Grade" ADD COLUMN     "practical" DOUBLE PRECISION,
ADD COLUMN     "termId" TEXT;

-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "approvalNote" TEXT,
ADD COLUMN     "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'APPROVED';

-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "courseAction" "CourseRequestAction",
ADD COLUMN     "courseId" TEXT,
ADD COLUMN     "recipientDepartmentId" TEXT,
ADD COLUMN     "topic" TEXT;

-- AlterTable
ALTER TABLE "StaffProfile" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "specialization" TEXT,
ADD COLUMN     "status" "StaffStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "yearsExperience" INTEGER;

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "answerText" TEXT;

-- AlterTable
ALTER TABLE "TranscriptIssue" ADD COLUMN     "verificationCode" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "BookstorePageContent" (
    "id" TEXT NOT NULL,
    "heroEyebrow" TEXT NOT NULL,
    "heroTitle" TEXT NOT NULL,
    "heroSubtitle" TEXT NOT NULL,
    "heroTrust" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "categoryLabel" TEXT NOT NULL,
    "categoryHeading" TEXT NOT NULL,
    "featuredLabel" TEXT NOT NULL,
    "featuredHeading" TEXT NOT NULL,
    "featuredSubtitle" TEXT NOT NULL,
    "collectionLabel" TEXT NOT NULL,
    "collectionHeading" TEXT NOT NULL,
    "publisherLabel" TEXT NOT NULL,
    "publisherHeading" TEXT NOT NULL,
    "publisherText" TEXT NOT NULL,
    "footerAboutText" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookstorePageContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookstoreValueCard" (
    "id" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookstoreValueCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlumniPageContent" (
    "id" TEXT NOT NULL,
    "heroEyebrow" TEXT NOT NULL,
    "heroTitle" TEXT NOT NULL,
    "heroSubtitle" TEXT NOT NULL,
    "statsHeading" TEXT NOT NULL,
    "spotlightLabel" TEXT NOT NULL,
    "spotlightHeading" TEXT NOT NULL,
    "spotlightSubtitle" TEXT NOT NULL,
    "ctaHeading" TEXT NOT NULL,
    "ctaText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlumniPageContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlumniStat" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlumniStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlumniProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "graduationYear" TEXT,
    "program" TEXT,
    "photoUrl" TEXT,
    "currentRole" TEXT,
    "quote" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlumniProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaItem" (
    "id" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "descriptionAr" TEXT NOT NULL,
    "category" "MediaCategory" NOT NULL,
    "mediaType" "MediaType" NOT NULL DEFAULT 'VIDEO',
    "mediaUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "speaker" TEXT,
    "durationSec" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "isFreePreview" BOOLEAN NOT NULL DEFAULT false,
    "requiresSubscription" BOOLEAN NOT NULL DEFAULT true,
    "priceUSD" DECIMAL(10,2),
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryResource" (
    "id" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "descriptionAr" TEXT NOT NULL,
    "category" "LibraryCategory" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "author" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaSubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "priceUSD" DECIMAL(10,2) NOT NULL,
    "durationDays" INTEGER NOT NULL DEFAULT 30,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaSubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMediaSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "MediaSubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "paymentGateway" "PaymentGateway",
    "paymentRef" TEXT,
    "paidAmount" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMediaSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Discussion" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isExercise" BOOLEAN NOT NULL DEFAULT false,
    "deadline" TIMESTAMP(3),
    "attachmentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Discussion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscussionComment" (
    "id" TEXT NOT NULL,
    "discussionId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscussionComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseSubmission" (
    "id" TEXT NOT NULL,
    "discussionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "answerText" TEXT,
    "fileUrl" TEXT,
    "feedback" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExerciseSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GradeCorrection" (
    "id" TEXT NOT NULL,
    "gradeId" TEXT NOT NULL,
    "fieldChanged" TEXT NOT NULL,
    "originalValue" DOUBLE PRECISION,
    "correctedValue" DOUBLE PRECISION,
    "reason" TEXT NOT NULL,
    "correctedByStaffId" TEXT NOT NULL,
    "correctedByName" TEXT NOT NULL,
    "correctedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GradeCorrection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdmissionNote" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "visibility" "NoteVisibility" NOT NULL DEFAULT 'INTERNAL',
    "note" TEXT NOT NULL,
    "authorStaffId" TEXT,
    "authorName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdmissionNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdmissionAuditLog" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT,
    "actorUserId" TEXT,
    "actorName" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdmissionAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdmissionLetter" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "status" "AdmissionLetterStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "programmeText" TEXT,
    "departmentText" TEXT,
    "qualificationText" TEXT,
    "intakeSession" TEXT,
    "admissionDate" TIMESTAMP(3),
    "conditions" TEXT,
    "signatoryName" TEXT,
    "signatoryTitle" TEXT,
    "pdfUrl" TEXT,
    "previousVersions" JSONB,
    "generatedByStaffId" TEXT,
    "generatedByName" TEXT,
    "finalizedByStaffId" TEXT,
    "finalizedByName" TEXT,
    "finalizedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdmissionLetter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthorFeeSettings" (
    "id" TEXT NOT NULL,
    "ghana" DECIMAL(10,2) NOT NULL,
    "ghanaCurrency" TEXT NOT NULL DEFAULT 'GHS',
    "international" DECIMAL(10,2) NOT NULL,
    "internationalCurrency" TEXT NOT NULL DEFAULT 'USD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "paymentMethod" TEXT NOT NULL DEFAULT 'Paystack',
    "validityDays" INTEGER,
    "effectiveDate" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthorFeeSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoyaltySettings" (
    "id" TEXT NOT NULL,
    "defaultRatePct" DECIMAL(5,2) NOT NULL DEFAULT 70.00,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoyaltySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthorRoyaltyOverride" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "ratePct" DECIMAL(5,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthorRoyaltyOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoyaltyLedgerEntry" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "saleAmountUSD" DECIMAL(10,2) NOT NULL,
    "royaltyRatePct" DECIMAL(5,2) NOT NULL,
    "royaltyAmountUSD" DECIMAL(10,2) NOT NULL,
    "status" "RoyaltyEntryStatus" NOT NULL DEFAULT 'PENDING',
    "payoutId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoyaltyLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthorPayout" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "amountUSD" DECIMAL(10,2) NOT NULL,
    "method" TEXT,
    "reference" TEXT,
    "note" TEXT,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "processedByStaffId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthorPayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicCalendar" (
    "id" TEXT NOT NULL,
    "academicYearLabel" TEXT NOT NULL,
    "hijriYearLabel" TEXT NOT NULL,
    "status" "CalendarStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicCalendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicCalendarEntry" (
    "id" TEXT NOT NULL,
    "calendarId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "procedure" TEXT NOT NULL,
    "gregorianDate" TEXT NOT NULL,
    "hijriDate" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AcademicCalendarEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstitutionHoliday" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstitutionHoliday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestActivity" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "fromLabel" TEXT,
    "toLabel" TEXT,
    "fromStatus" "RequestStatus",
    "toStatus" "RequestStatus",
    "note" TEXT,
    "actorLabel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sponsor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "websiteUrl" TEXT,
    "amountUSD" DECIMAL(10,2),
    "status" "SponsorStatus" NOT NULL DEFAULT 'ACTIVE',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sponsor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveClass" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMin" INTEGER NOT NULL DEFAULT 60,
    "meetingLink" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlacementAssessment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "PlacementStatus" NOT NULL DEFAULT 'PENDING',
    "quranReadingLevel" "SelfRatedLevel",
    "quranTajweedLevel" "SelfRatedLevel",
    "quranHifzLevel" "SelfRatedLevel",
    "quranRecitationLevel" "SelfRatedLevel",
    "arabicReadingLevel" "SelfRatedLevel",
    "arabicWritingLevel" "SelfRatedLevel",
    "arabicGrammarLevel" "SelfRatedLevel",
    "arabicVocabularyLevel" "SelfRatedLevel",
    "arabicConversationLevel" "SelfRatedLevel",
    "quranicArabicLevel" "SelfRatedLevel",
    "recommendedPathway" TEXT,
    "recommendedProgramId" TEXT,
    "assessorNote" TEXT,
    "assessedByStaffId" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlacementAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffSalary" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "baseSalary" DOUBLE PRECISION NOT NULL,
    "allowances" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffSalary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payslip" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "salaryId" TEXT,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "baseSalary" DOUBLE PRECISION NOT NULL,
    "allowances" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netPay" DOUBLE PRECISION NOT NULL,
    "status" "PayslipStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payslip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "isbn" TEXT,
    "category" TEXT,
    "totalCopies" INTEGER NOT NULL DEFAULT 1,
    "availableCopies" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryLoan" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "borrowedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "returnedAt" TIMESTAMP(3),
    "status" "LoanStatus" NOT NULL DEFAULT 'BORROWED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryLoan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ICTTicket" (
    "id" TEXT NOT NULL,
    "raisedByUserId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "assignedStaffId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ICTTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityReview" (
    "id" TEXT NOT NULL,
    "subjectType" "QASubjectType" NOT NULL,
    "programId" TEXT,
    "courseId" TEXT,
    "departmentId" TEXT,
    "facultyId" TEXT,
    "staffId" TEXT,
    "reviewType" TEXT NOT NULL,
    "findings" TEXT NOT NULL,
    "recommendation" TEXT,
    "status" "QAReviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "outcome" "QAOutcome",
    "improvementStatus" "ImprovementPlanStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
    "evidenceUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "followUpDate" TIMESTAMP(3),
    "reviewedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "QualityReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GraduationApplication" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "programId" TEXT,
    "status" "GraduationStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "appliedAt" TIMESTAMP(3),
    "decidedAt" TIMESTAMP(3),
    "decisionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GraduationApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GraduationClearance" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "status" "ClearanceStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "clearedByStaffId" TEXT,
    "clearedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GraduationClearance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GraduationDocument" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "type" "GraduationDocumentType" NOT NULL,
    "pdfUrl" TEXT NOT NULL,
    "verificationCode" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GraduationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageHero" (
    "id" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "primaryLabel" TEXT NOT NULL,
    "primaryHref" TEXT NOT NULL,
    "secondaryLabel" TEXT NOT NULL,
    "secondaryHref" TEXT NOT NULL,
    "features" TEXT[],
    "badgeAr" TEXT,
    "titleAr" TEXT,
    "subtitleAr" TEXT,
    "primaryLabelAr" TEXT,
    "secondaryLabelAr" TEXT,
    "featuresAr" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "logoUrl" TEXT,
    "heroImageUrl" TEXT,
    "logoSize" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HomepageHero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageHeroBanner" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HomepageHeroBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageSectionsText" (
    "id" TEXT NOT NULL,
    "welcomeBadge" TEXT NOT NULL,
    "welcomeTitle" TEXT NOT NULL,
    "welcomeSubtitle" TEXT NOT NULL,
    "academyBadge" TEXT NOT NULL,
    "academyTitle" TEXT NOT NULL,
    "academySubtitle" TEXT NOT NULL,
    "approachBadge" TEXT NOT NULL,
    "approachTitle" TEXT NOT NULL,
    "approachSubtitle" TEXT NOT NULL,
    "ctaArabicLine" TEXT NOT NULL,
    "ctaTitle" TEXT NOT NULL,
    "ctaDescription" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HomepageSectionsText_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageFeatureCard" (
    "id" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageFeatureCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageAcademyItem" (
    "id" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageAcademyItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageApproachStep" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageApproachStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectionBanner" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SectionBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialLink" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterLinkGroup" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterLinkGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterLink" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademyHubHero" (
    "id" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademyHubHero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademyHubCard" (
    "id" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademyHubCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LegalPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaqItem" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FaqItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactInfo" (
    "id" TEXT NOT NULL,
    "address" TEXT,
    "poBox" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "admissionsEmail" TEXT,
    "bookstoreEmail" TEXT,
    "officeHours" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "timeLimitMinutes" INTEGER NOT NULL,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "maxAttempts" INTEGER NOT NULL DEFAULT 1,
    "passingScore" DOUBLE PRECISION,
    "showResultsImmediately" BOOLEAN NOT NULL DEFAULT true,
    "resultsReleased" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "type" "QuizQuestionType" NOT NULL,
    "promptText" TEXT NOT NULL,
    "videoUrl" TEXT,
    "points" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "requiresReview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QuizOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAttempt" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "status" "QuizAttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "score" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "activeToken" TEXT NOT NULL,
    "tabSwitchCount" INTEGER NOT NULL DEFAULT 0,
    "copyPasteAttemptCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAnswer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOptionIds" TEXT[],
    "answerText" TEXT,
    "score" DOUBLE PRECISION,
    "feedback" TEXT,
    "gradedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffQualification" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "type" "QualificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "institution" TEXT,
    "yearObtained" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffQualification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffDevelopmentRecord" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "provider" TEXT,
    "completedAt" TIMESTAMP(3),
    "hours" DOUBLE PRECISION,
    "certificateUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffDevelopmentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffPerformanceReview" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "rating" "StaffPerformanceRating",
    "strengths" TEXT,
    "areasForGrowth" TEXT,
    "status" "StaffPerformanceReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffPerformanceReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseEvaluation" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "termId" TEXT,
    "ratingOverall" INTEGER NOT NULL,
    "ratingContent" INTEGER,
    "ratingInstructor" INTEGER,
    "comments" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrityCase" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT,
    "violationType" "IntegrityViolationType" NOT NULL,
    "severity" "IntegrityCaseSeverity" NOT NULL DEFAULT 'MINOR',
    "description" TEXT NOT NULL,
    "reportedById" TEXT NOT NULL,
    "status" "IntegrityCaseStatus" NOT NULL DEFAULT 'REPORTED',
    "sanction" TEXT,
    "standingActionTaken" BOOLEAN NOT NULL DEFAULT false,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrityCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssistantSettings" (
    "id" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "welcomeMessageEn" TEXT,
    "welcomeMessageAr" TEXT,
    "supportedLanguages" TEXT[] DEFAULT ARRAY['en', 'ar']::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssistantSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssistantEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "zone" TEXT,
    "identity" TEXT,
    "language" TEXT,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssistantEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityPost" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityComment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageFeedback" (
    "id" TEXT NOT NULL,
    "pageSlug" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CoursePrerequisites" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CoursePrerequisites_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "BookstoreValueCard_order_idx" ON "BookstoreValueCard"("order");

-- CreateIndex
CREATE INDEX "AlumniStat_order_idx" ON "AlumniStat"("order");

-- CreateIndex
CREATE INDEX "AlumniProfile_order_idx" ON "AlumniProfile"("order");

-- CreateIndex
CREATE UNIQUE INDEX "MediaItem_slug_key" ON "MediaItem"("slug");

-- CreateIndex
CREATE INDEX "MediaItem_category_idx" ON "MediaItem"("category");

-- CreateIndex
CREATE INDEX "MediaItem_isPublished_idx" ON "MediaItem"("isPublished");

-- CreateIndex
CREATE INDEX "MediaItem_uploadedById_idx" ON "MediaItem"("uploadedById");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryResource_slug_key" ON "LibraryResource"("slug");

-- CreateIndex
CREATE INDEX "LibraryResource_category_idx" ON "LibraryResource"("category");

-- CreateIndex
CREATE INDEX "LibraryResource_isPublished_idx" ON "LibraryResource"("isPublished");

-- CreateIndex
CREATE INDEX "LibraryResource_uploadedById_idx" ON "LibraryResource"("uploadedById");

-- CreateIndex
CREATE UNIQUE INDEX "UserMediaSubscription_paymentRef_key" ON "UserMediaSubscription"("paymentRef");

-- CreateIndex
CREATE INDEX "UserMediaSubscription_userId_idx" ON "UserMediaSubscription"("userId");

-- CreateIndex
CREATE INDEX "UserMediaSubscription_planId_idx" ON "UserMediaSubscription"("planId");

-- CreateIndex
CREATE INDEX "UserMediaSubscription_status_idx" ON "UserMediaSubscription"("status");

-- CreateIndex
CREATE INDEX "Discussion_courseId_idx" ON "Discussion"("courseId");

-- CreateIndex
CREATE INDEX "Discussion_authorId_idx" ON "Discussion"("authorId");

-- CreateIndex
CREATE INDEX "DiscussionComment_discussionId_idx" ON "DiscussionComment"("discussionId");

-- CreateIndex
CREATE INDEX "DiscussionComment_authorId_idx" ON "DiscussionComment"("authorId");

-- CreateIndex
CREATE INDEX "ExerciseSubmission_discussionId_idx" ON "ExerciseSubmission"("discussionId");

-- CreateIndex
CREATE INDEX "ExerciseSubmission_studentId_idx" ON "ExerciseSubmission"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseSubmission_discussionId_studentId_key" ON "ExerciseSubmission"("discussionId", "studentId");

-- CreateIndex
CREATE INDEX "GradeCorrection_gradeId_idx" ON "GradeCorrection"("gradeId");

-- CreateIndex
CREATE INDEX "AdmissionNote_applicationId_idx" ON "AdmissionNote"("applicationId");

-- CreateIndex
CREATE INDEX "AdmissionNote_visibility_idx" ON "AdmissionNote"("visibility");

-- CreateIndex
CREATE INDEX "AdmissionAuditLog_applicationId_idx" ON "AdmissionAuditLog"("applicationId");

-- CreateIndex
CREATE INDEX "AdmissionAuditLog_createdAt_idx" ON "AdmissionAuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdmissionLetter_applicationId_key" ON "AdmissionLetter"("applicationId");

-- CreateIndex
CREATE INDEX "AdmissionLetter_applicationId_idx" ON "AdmissionLetter"("applicationId");

-- CreateIndex
CREATE INDEX "AdmissionLetter_status_idx" ON "AdmissionLetter"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AuthorRoyaltyOverride_authorId_key" ON "AuthorRoyaltyOverride"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "RoyaltyLedgerEntry_orderItemId_key" ON "RoyaltyLedgerEntry"("orderItemId");

-- CreateIndex
CREATE INDEX "RoyaltyLedgerEntry_authorId_idx" ON "RoyaltyLedgerEntry"("authorId");

-- CreateIndex
CREATE INDEX "RoyaltyLedgerEntry_bookId_idx" ON "RoyaltyLedgerEntry"("bookId");

-- CreateIndex
CREATE INDEX "RoyaltyLedgerEntry_orderId_idx" ON "RoyaltyLedgerEntry"("orderId");

-- CreateIndex
CREATE INDEX "RoyaltyLedgerEntry_status_idx" ON "RoyaltyLedgerEntry"("status");

-- CreateIndex
CREATE INDEX "RoyaltyLedgerEntry_payoutId_idx" ON "RoyaltyLedgerEntry"("payoutId");

-- CreateIndex
CREATE INDEX "AuthorPayout_authorId_idx" ON "AuthorPayout"("authorId");

-- CreateIndex
CREATE INDEX "AuthorPayout_status_idx" ON "AuthorPayout"("status");

-- CreateIndex
CREATE INDEX "AcademicCalendar_status_idx" ON "AcademicCalendar"("status");

-- CreateIndex
CREATE INDEX "AcademicCalendarEntry_calendarId_idx" ON "AcademicCalendarEntry"("calendarId");

-- CreateIndex
CREATE INDEX "InstitutionHoliday_order_idx" ON "InstitutionHoliday"("order");

-- CreateIndex
CREATE INDEX "InstitutionHoliday_startDate_idx" ON "InstitutionHoliday"("startDate");

-- CreateIndex
CREATE INDEX "RequestActivity_requestId_idx" ON "RequestActivity"("requestId");

-- CreateIndex
CREATE INDEX "Sponsor_status_idx" ON "Sponsor"("status");

-- CreateIndex
CREATE INDEX "Sponsor_isPublic_idx" ON "Sponsor"("isPublic");

-- CreateIndex
CREATE INDEX "LiveClass_courseId_idx" ON "LiveClass"("courseId");

-- CreateIndex
CREATE INDEX "LiveClass_instructorId_idx" ON "LiveClass"("instructorId");

-- CreateIndex
CREATE UNIQUE INDEX "PlacementAssessment_studentId_key" ON "PlacementAssessment"("studentId");

-- CreateIndex
CREATE INDEX "PlacementAssessment_status_idx" ON "PlacementAssessment"("status");

-- CreateIndex
CREATE INDEX "PlacementAssessment_recommendedProgramId_idx" ON "PlacementAssessment"("recommendedProgramId");

-- CreateIndex
CREATE INDEX "PlacementAssessment_assessedByStaffId_idx" ON "PlacementAssessment"("assessedByStaffId");

-- CreateIndex
CREATE UNIQUE INDEX "StaffSalary_staffId_key" ON "StaffSalary"("staffId");

-- CreateIndex
CREATE INDEX "StaffSalary_staffId_idx" ON "StaffSalary"("staffId");

-- CreateIndex
CREATE INDEX "Payslip_staffId_idx" ON "Payslip"("staffId");

-- CreateIndex
CREATE INDEX "Payslip_status_idx" ON "Payslip"("status");

-- CreateIndex
CREATE INDEX "Payslip_year_month_idx" ON "Payslip"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "Payslip_staffId_year_month_key" ON "Payslip"("staffId", "year", "month");

-- CreateIndex
CREATE INDEX "LibraryItem_title_idx" ON "LibraryItem"("title");

-- CreateIndex
CREATE INDEX "LibraryLoan_itemId_idx" ON "LibraryLoan"("itemId");

-- CreateIndex
CREATE INDEX "LibraryLoan_studentId_idx" ON "LibraryLoan"("studentId");

-- CreateIndex
CREATE INDEX "LibraryLoan_status_idx" ON "LibraryLoan"("status");

-- CreateIndex
CREATE INDEX "ICTTicket_raisedByUserId_idx" ON "ICTTicket"("raisedByUserId");

-- CreateIndex
CREATE INDEX "ICTTicket_assignedStaffId_idx" ON "ICTTicket"("assignedStaffId");

-- CreateIndex
CREATE INDEX "ICTTicket_status_idx" ON "ICTTicket"("status");

-- CreateIndex
CREATE INDEX "QualityReview_subjectType_idx" ON "QualityReview"("subjectType");

-- CreateIndex
CREATE INDEX "QualityReview_status_idx" ON "QualityReview"("status");

-- CreateIndex
CREATE INDEX "QualityReview_programId_idx" ON "QualityReview"("programId");

-- CreateIndex
CREATE INDEX "QualityReview_courseId_idx" ON "QualityReview"("courseId");

-- CreateIndex
CREATE INDEX "QualityReview_departmentId_idx" ON "QualityReview"("departmentId");

-- CreateIndex
CREATE INDEX "QualityReview_facultyId_idx" ON "QualityReview"("facultyId");

-- CreateIndex
CREATE INDEX "QualityReview_staffId_idx" ON "QualityReview"("staffId");

-- CreateIndex
CREATE INDEX "QualityReview_reviewedById_idx" ON "QualityReview"("reviewedById");

-- CreateIndex
CREATE UNIQUE INDEX "GraduationApplication_studentId_key" ON "GraduationApplication"("studentId");

-- CreateIndex
CREATE INDEX "GraduationApplication_studentId_idx" ON "GraduationApplication"("studentId");

-- CreateIndex
CREATE INDEX "GraduationApplication_programId_idx" ON "GraduationApplication"("programId");

-- CreateIndex
CREATE INDEX "GraduationApplication_status_idx" ON "GraduationApplication"("status");

-- CreateIndex
CREATE INDEX "GraduationClearance_applicationId_idx" ON "GraduationClearance"("applicationId");

-- CreateIndex
CREATE INDEX "GraduationClearance_unitId_idx" ON "GraduationClearance"("unitId");

-- CreateIndex
CREATE INDEX "GraduationClearance_status_idx" ON "GraduationClearance"("status");

-- CreateIndex
CREATE UNIQUE INDEX "GraduationClearance_applicationId_unitId_key" ON "GraduationClearance"("applicationId", "unitId");

-- CreateIndex
CREATE UNIQUE INDEX "GraduationDocument_verificationCode_key" ON "GraduationDocument"("verificationCode");

-- CreateIndex
CREATE INDEX "GraduationDocument_applicationId_idx" ON "GraduationDocument"("applicationId");

-- CreateIndex
CREATE INDEX "GraduationDocument_studentId_idx" ON "GraduationDocument"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "GraduationDocument_applicationId_type_key" ON "GraduationDocument"("applicationId", "type");

-- CreateIndex
CREATE INDEX "HomepageFeatureCard_order_idx" ON "HomepageFeatureCard"("order");

-- CreateIndex
CREATE INDEX "HomepageAcademyItem_order_idx" ON "HomepageAcademyItem"("order");

-- CreateIndex
CREATE INDEX "HomepageApproachStep_order_idx" ON "HomepageApproachStep"("order");

-- CreateIndex
CREATE INDEX "SocialLink_order_idx" ON "SocialLink"("order");

-- CreateIndex
CREATE INDEX "FooterLinkGroup_order_idx" ON "FooterLinkGroup"("order");

-- CreateIndex
CREATE INDEX "FooterLink_groupId_idx" ON "FooterLink"("groupId");

-- CreateIndex
CREATE INDEX "FooterLink_order_idx" ON "FooterLink"("order");

-- CreateIndex
CREATE INDEX "AcademyHubCard_order_idx" ON "AcademyHubCard"("order");

-- CreateIndex
CREATE UNIQUE INDEX "LegalPage_slug_key" ON "LegalPage"("slug");

-- CreateIndex
CREATE INDEX "FaqItem_order_idx" ON "FaqItem"("order");

-- CreateIndex
CREATE INDEX "FaqItem_category_idx" ON "FaqItem"("category");

-- CreateIndex
CREATE INDEX "Quiz_courseId_idx" ON "Quiz"("courseId");

-- CreateIndex
CREATE INDEX "QuizQuestion_quizId_idx" ON "QuizQuestion"("quizId");

-- CreateIndex
CREATE INDEX "QuizQuestion_order_idx" ON "QuizQuestion"("order");

-- CreateIndex
CREATE INDEX "QuizOption_questionId_idx" ON "QuizOption"("questionId");

-- CreateIndex
CREATE INDEX "QuizAttempt_quizId_idx" ON "QuizAttempt"("quizId");

-- CreateIndex
CREATE INDEX "QuizAttempt_studentId_idx" ON "QuizAttempt"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizAttempt_quizId_studentId_attemptNumber_key" ON "QuizAttempt"("quizId", "studentId", "attemptNumber");

-- CreateIndex
CREATE INDEX "QuizAnswer_attemptId_idx" ON "QuizAnswer"("attemptId");

-- CreateIndex
CREATE INDEX "QuizAnswer_questionId_idx" ON "QuizAnswer"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizAnswer_attemptId_questionId_key" ON "QuizAnswer"("attemptId", "questionId");

-- CreateIndex
CREATE INDEX "StaffQualification_staffId_idx" ON "StaffQualification"("staffId");

-- CreateIndex
CREATE INDEX "StaffDevelopmentRecord_staffId_idx" ON "StaffDevelopmentRecord"("staffId");

-- CreateIndex
CREATE INDEX "StaffPerformanceReview_staffId_idx" ON "StaffPerformanceReview"("staffId");

-- CreateIndex
CREATE INDEX "StaffPerformanceReview_reviewerId_idx" ON "StaffPerformanceReview"("reviewerId");

-- CreateIndex
CREATE INDEX "CourseEvaluation_courseId_idx" ON "CourseEvaluation"("courseId");

-- CreateIndex
CREATE INDEX "CourseEvaluation_termId_idx" ON "CourseEvaluation"("termId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseEvaluation_studentId_courseId_termId_key" ON "CourseEvaluation"("studentId", "courseId", "termId");

-- CreateIndex
CREATE INDEX "IntegrityCase_studentId_idx" ON "IntegrityCase"("studentId");

-- CreateIndex
CREATE INDEX "IntegrityCase_courseId_idx" ON "IntegrityCase"("courseId");

-- CreateIndex
CREATE INDEX "IntegrityCase_reportedById_idx" ON "IntegrityCase"("reportedById");

-- CreateIndex
CREATE INDEX "IntegrityCase_status_idx" ON "IntegrityCase"("status");

-- CreateIndex
CREATE INDEX "AssistantEvent_type_idx" ON "AssistantEvent"("type");

-- CreateIndex
CREATE INDEX "AssistantEvent_createdAt_idx" ON "AssistantEvent"("createdAt");

-- CreateIndex
CREATE INDEX "CommunityPost_authorId_idx" ON "CommunityPost"("authorId");

-- CreateIndex
CREATE INDEX "CommunityPost_category_idx" ON "CommunityPost"("category");

-- CreateIndex
CREATE INDEX "CommunityPost_createdAt_idx" ON "CommunityPost"("createdAt");

-- CreateIndex
CREATE INDEX "CommunityComment_postId_idx" ON "CommunityComment"("postId");

-- CreateIndex
CREATE INDEX "CommunityComment_authorId_idx" ON "CommunityComment"("authorId");

-- CreateIndex
CREATE INDEX "PageFeedback_pageSlug_idx" ON "PageFeedback"("pageSlug");

-- CreateIndex
CREATE INDEX "_CoursePrerequisites_B_index" ON "_CoursePrerequisites"("B");

-- CreateIndex
CREATE INDEX "AdmissionApplication_preferredDepartmentId_idx" ON "AdmissionApplication"("preferredDepartmentId");

-- CreateIndex
CREATE INDEX "Grade_termId_idx" ON "Grade"("termId");

-- CreateIndex
CREATE UNIQUE INDEX "Grade_studentId_courseId_termId_key" ON "Grade"("studentId", "courseId", "termId");

-- CreateIndex
CREATE INDEX "Request_recipientDepartmentId_idx" ON "Request"("recipientDepartmentId");

-- CreateIndex
CREATE INDEX "StudentFee_studentId_idx" ON "StudentFee"("studentId");

-- CreateIndex
CREATE INDEX "StudentFee_termId_idx" ON "StudentFee"("termId");

-- CreateIndex
CREATE INDEX "StudentFee_status_idx" ON "StudentFee"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TranscriptIssue_verificationCode_key" ON "TranscriptIssue"("verificationCode");

-- AddForeignKey
ALTER TABLE "MediaItem" ADD CONSTRAINT "MediaItem_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryResource" ADD CONSTRAINT "LibraryResource_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMediaSubscription" ADD CONSTRAINT "UserMediaSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMediaSubscription" ADD CONSTRAINT "UserMediaSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "MediaSubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discussion" ADD CONSTRAINT "Discussion_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discussion" ADD CONSTRAINT "Discussion_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionComment" ADD CONSTRAINT "DiscussionComment_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "Discussion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionComment" ADD CONSTRAINT "DiscussionComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseSubmission" ADD CONSTRAINT "ExerciseSubmission_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "Discussion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseSubmission" ADD CONSTRAINT "ExerciseSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_termId_fkey" FOREIGN KEY ("termId") REFERENCES "AcademicTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeCorrection" ADD CONSTRAINT "GradeCorrection_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionApplication" ADD CONSTRAINT "AdmissionApplication_preferredDepartmentId_fkey" FOREIGN KEY ("preferredDepartmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionNote" ADD CONSTRAINT "AdmissionNote_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "AdmissionApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionAuditLog" ADD CONSTRAINT "AdmissionAuditLog_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "AdmissionApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionLetter" ADD CONSTRAINT "AdmissionLetter_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "AdmissionApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthorRoyaltyOverride" ADD CONSTRAINT "AuthorRoyaltyOverride_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoyaltyLedgerEntry" ADD CONSTRAINT "RoyaltyLedgerEntry_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoyaltyLedgerEntry" ADD CONSTRAINT "RoyaltyLedgerEntry_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoyaltyLedgerEntry" ADD CONSTRAINT "RoyaltyLedgerEntry_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoyaltyLedgerEntry" ADD CONSTRAINT "RoyaltyLedgerEntry_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoyaltyLedgerEntry" ADD CONSTRAINT "RoyaltyLedgerEntry_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "AuthorPayout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthorPayout" ADD CONSTRAINT "AuthorPayout_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicCalendar" ADD CONSTRAINT "AcademicCalendar_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicCalendarEntry" ADD CONSTRAINT "AcademicCalendarEntry_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "AcademicCalendar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_recipientDepartmentId_fkey" FOREIGN KEY ("recipientDepartmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestActivity" ADD CONSTRAINT "RequestActivity_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sponsor" ADD CONSTRAINT "Sponsor_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveClass" ADD CONSTRAINT "LiveClass_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveClass" ADD CONSTRAINT "LiveClass_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutoringRequest" ADD CONSTRAINT "TutoringRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutoringRequest" ADD CONSTRAINT "TutoringRequest_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutoringRequest" ADD CONSTRAINT "TutoringRequest_instructorStaffId_fkey" FOREIGN KEY ("instructorStaffId") REFERENCES "StaffProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvisorMessage" ADD CONSTRAINT "AdvisorMessage_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlacementAssessment" ADD CONSTRAINT "PlacementAssessment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlacementAssessment" ADD CONSTRAINT "PlacementAssessment_recommendedProgramId_fkey" FOREIGN KEY ("recommendedProgramId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlacementAssessment" ADD CONSTRAINT "PlacementAssessment_assessedByStaffId_fkey" FOREIGN KEY ("assessedByStaffId") REFERENCES "StaffProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFee" ADD CONSTRAINT "StudentFee_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFee" ADD CONSTRAINT "StudentFee_termId_fkey" FOREIGN KEY ("termId") REFERENCES "AcademicTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffSalary" ADD CONSTRAINT "StaffSalary_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_salaryId_fkey" FOREIGN KEY ("salaryId") REFERENCES "StaffSalary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryLoan" ADD CONSTRAINT "LibraryLoan_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "LibraryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryLoan" ADD CONSTRAINT "LibraryLoan_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ICTTicket" ADD CONSTRAINT "ICTTicket_raisedByUserId_fkey" FOREIGN KEY ("raisedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ICTTicket" ADD CONSTRAINT "ICTTicket_assignedStaffId_fkey" FOREIGN KEY ("assignedStaffId") REFERENCES "StaffProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityReview" ADD CONSTRAINT "QualityReview_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityReview" ADD CONSTRAINT "QualityReview_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityReview" ADD CONSTRAINT "QualityReview_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityReview" ADD CONSTRAINT "QualityReview_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityReview" ADD CONSTRAINT "QualityReview_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityReview" ADD CONSTRAINT "QualityReview_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraduationApplication" ADD CONSTRAINT "GraduationApplication_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraduationApplication" ADD CONSTRAINT "GraduationApplication_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraduationClearance" ADD CONSTRAINT "GraduationClearance_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "GraduationApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraduationClearance" ADD CONSTRAINT "GraduationClearance_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraduationClearance" ADD CONSTRAINT "GraduationClearance_clearedByStaffId_fkey" FOREIGN KEY ("clearedByStaffId") REFERENCES "StaffProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraduationDocument" ADD CONSTRAINT "GraduationDocument_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "GraduationApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraduationDocument" ADD CONSTRAINT "GraduationDocument_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FooterLink" ADD CONSTRAINT "FooterLink_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "FooterLinkGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizOption" ADD CONSTRAINT "QuizOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAnswer" ADD CONSTRAINT "QuizAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "QuizAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAnswer" ADD CONSTRAINT "QuizAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffQualification" ADD CONSTRAINT "StaffQualification_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffDevelopmentRecord" ADD CONSTRAINT "StaffDevelopmentRecord_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffPerformanceReview" ADD CONSTRAINT "StaffPerformanceReview_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffPerformanceReview" ADD CONSTRAINT "StaffPerformanceReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEvaluation" ADD CONSTRAINT "CourseEvaluation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEvaluation" ADD CONSTRAINT "CourseEvaluation_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEvaluation" ADD CONSTRAINT "CourseEvaluation_termId_fkey" FOREIGN KEY ("termId") REFERENCES "AcademicTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrityCase" ADD CONSTRAINT "IntegrityCase_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrityCase" ADD CONSTRAINT "IntegrityCase_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrityCase" ADD CONSTRAINT "IntegrityCase_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "StaffProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrityCase" ADD CONSTRAINT "IntegrityCase_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "StaffProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityPost" ADD CONSTRAINT "CommunityPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityComment" ADD CONSTRAINT "CommunityComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityComment" ADD CONSTRAINT "CommunityComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoursePrerequisites" ADD CONSTRAINT "_CoursePrerequisites_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoursePrerequisites" ADD CONSTRAINT "_CoursePrerequisites_B_fkey" FOREIGN KEY ("B") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
