CREATE TYPE "StudentAdmissionStatus" AS ENUM (
  'PENDING_PAYMENT',
  'PAID',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED'
);

CREATE TABLE "AdmissionApplication" (
    "id" TEXT NOT NULL,
    "applicationNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "fullName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "countryOfResidence" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "idNumber" TEXT NOT NULL,
    "residentialAddress" TEXT NOT NULL,
    "applicantCategory" TEXT NOT NULL,
    "guardianName" TEXT NOT NULL,
    "guardianPhone" TEXT NOT NULL,
    "guardianRelationship" TEXT NOT NULL,
    "emergencyName" TEXT NOT NULL,
    "emergencyPhone" TEXT NOT NULL,
    "emergencyRelationship" TEXT NOT NULL,
    "highestEducation" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "programName" TEXT NOT NULL,
    "programLevel" TEXT NOT NULL,
    "studySession" TEXT NOT NULL,
    "identityDocType" TEXT NOT NULL,
    "identityDocumentUrl" TEXT,
    "passportPictureUrl" TEXT,
    "transcriptsUrl" TEXT,
    "certificateUrl" TEXT,
    "testimonialUrl" TEXT,
    "recommendationUrl" TEXT,
    "admissionFee" DECIMAL(10,2) NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "feeBasis" TEXT NOT NULL,
    "status" "StudentAdmissionStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "AdmissionApplication_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdmissionApplication_applicationNumber_key"
ON "AdmissionApplication"("applicationNumber");

CREATE INDEX "AdmissionApplication_email_idx"
ON "AdmissionApplication"("email");

CREATE INDEX "AdmissionApplication_status_idx"
ON "AdmissionApplication"("status");

CREATE INDEX "AdmissionApplication_createdAt_idx"
ON "AdmissionApplication"("createdAt");

CREATE INDEX "AdmissionApplication_countryOfResidence_idx"
ON "AdmissionApplication"("countryOfResidence");

CREATE INDEX "AdmissionApplication_programId_idx"
ON "AdmissionApplication"("programId");

CREATE TABLE "AdmissionPayment" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "gateway" "PaymentGateway" NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(10,2) NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "gatewayReference" TEXT,
    "checkoutReference" TEXT,
    "transactionId" TEXT,
    "authorizationUrl" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdmissionPayment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdmissionPayment_applicationId_key"
ON "AdmissionPayment"("applicationId");

CREATE INDEX "AdmissionPayment_gateway_idx"
ON "AdmissionPayment"("gateway");

CREATE INDEX "AdmissionPayment_status_idx"
ON "AdmissionPayment"("status");

CREATE INDEX "AdmissionPayment_gatewayReference_idx"
ON "AdmissionPayment"("gatewayReference");

CREATE INDEX "AdmissionPayment_transactionId_idx"
ON "AdmissionPayment"("transactionId");

ALTER TABLE "AdmissionPayment"
ADD CONSTRAINT "AdmissionPayment_applicationId_fkey"
FOREIGN KEY ("applicationId")
REFERENCES "AdmissionApplication"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
