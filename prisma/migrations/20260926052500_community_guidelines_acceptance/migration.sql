-- Model 25 addendum: mandatory Community Guidelines acknowledgment.
-- Purely additive -- one new table, no changes to any existing
-- Community/Discussion table or column.

-- CreateTable
CREATE TABLE "CommunityGuidelinesAcceptance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityGuidelinesAcceptance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CommunityGuidelinesAcceptance_userId_key" ON "CommunityGuidelinesAcceptance"("userId");

-- AddForeignKey
ALTER TABLE "CommunityGuidelinesAcceptance" ADD CONSTRAINT "CommunityGuidelinesAcceptance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
