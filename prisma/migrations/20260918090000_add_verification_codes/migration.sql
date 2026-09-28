ALTER TABLE "TranscriptIssue" ADD COLUMN "verificationCode" TEXT;
UPDATE "TranscriptIssue" SET "verificationCode" = 'ULU-' || upper(substr(md5(random()::text || clock_timestamp()::text || id), 1, 5)) || '-' || upper(substr(md5(random()::text || clock_timestamp()::text || id || 'b'), 1, 5)) WHERE "verificationCode" IS NULL;
ALTER TABLE "TranscriptIssue" ALTER COLUMN "verificationCode" SET NOT NULL;
CREATE UNIQUE INDEX "TranscriptIssue_verificationCode_key" ON "TranscriptIssue"("verificationCode");

ALTER TABLE "GraduationDocument" ADD COLUMN "verificationCode" TEXT;
UPDATE "GraduationDocument" SET "verificationCode" = 'ULU-' || upper(substr(md5(random()::text || clock_timestamp()::text || id), 1, 5)) || '-' || upper(substr(md5(random()::text || clock_timestamp()::text || id || 'b'), 1, 5)) WHERE "verificationCode" IS NULL;
ALTER TABLE "GraduationDocument" ALTER COLUMN "verificationCode" SET NOT NULL;
CREATE UNIQUE INDEX "GraduationDocument_verificationCode_key" ON "GraduationDocument"("verificationCode");
