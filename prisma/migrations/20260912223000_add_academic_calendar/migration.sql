-- CreateEnum
CREATE TYPE "CalendarStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

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

-- CreateIndex
CREATE INDEX "AcademicCalendar_status_idx" ON "AcademicCalendar"("status");

-- CreateIndex
CREATE INDEX "AcademicCalendarEntry_calendarId_idx" ON "AcademicCalendarEntry"("calendarId");

-- AddForeignKey
ALTER TABLE "AcademicCalendar" ADD CONSTRAINT "AcademicCalendar_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicCalendarEntry" ADD CONSTRAINT "AcademicCalendarEntry_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "AcademicCalendar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
