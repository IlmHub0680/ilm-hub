-- InstitutionHoliday (Model 28): holidays shown on the public
-- Academic Calendar (/academic-calendar), managed by Academic
-- Records staff. Independent of AcademicCalendar's own
-- draft/publish workflow.
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

CREATE INDEX "InstitutionHoliday_order_idx" ON "InstitutionHoliday"("order");
CREATE INDEX "InstitutionHoliday_startDate_idx" ON "InstitutionHoliday"("startDate");
