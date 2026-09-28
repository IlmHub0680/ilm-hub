-- Model 13 (AI Assistant & Ulul Azm Community).
-- Adds the AI Assistant's admin-configurable settings singleton and a
-- minimal, non-identifying interaction log, plus the new Ulul Azm
-- Community space (CommunityPost/CommunityComment) -- distinct from
-- the existing course-scoped Discussion/DiscussionComment, which this
-- migration does not touch.

CREATE TABLE "AssistantSettings" (
    "id" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "welcomeMessageEn" TEXT,
    "welcomeMessageAr" TEXT,
    "supportedLanguages" TEXT[] NOT NULL DEFAULT ARRAY['en', 'ar']::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssistantSettings_pkey" PRIMARY KEY ("id")
);

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

CREATE INDEX "AssistantEvent_type_idx" ON "AssistantEvent"("type");
CREATE INDEX "AssistantEvent_createdAt_idx" ON "AssistantEvent"("createdAt");

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

CREATE INDEX "CommunityPost_authorId_idx" ON "CommunityPost"("authorId");
CREATE INDEX "CommunityPost_category_idx" ON "CommunityPost"("category");
CREATE INDEX "CommunityPost_createdAt_idx" ON "CommunityPost"("createdAt");

CREATE TABLE "CommunityComment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityComment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CommunityComment_postId_idx" ON "CommunityComment"("postId");
CREATE INDEX "CommunityComment_authorId_idx" ON "CommunityComment"("authorId");

ALTER TABLE "CommunityPost" ADD CONSTRAINT "CommunityPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityComment" ADD CONSTRAINT "CommunityComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityComment" ADD CONSTRAINT "CommunityComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
