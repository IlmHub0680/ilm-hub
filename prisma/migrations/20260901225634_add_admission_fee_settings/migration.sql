CREATE TABLE "AdmissionFeeSettings" (
    "id" TEXT NOT NULL,
    "juniorGhana" DECIMAL(10,2) NOT NULL,
    "seniorGhana" DECIMAL(10,2) NOT NULL,
    "matureGhana" DECIMAL(10,2) NOT NULL,
    "juniorInternational" DECIMAL(10,2) NOT NULL,
    "seniorInternational" DECIMAL(10,2) NOT NULL,
    "matureInternational" DECIMAL(10,2) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdmissionFeeSettings_pkey" PRIMARY KEY ("id")
);
