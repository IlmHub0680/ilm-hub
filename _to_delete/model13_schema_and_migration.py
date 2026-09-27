# -*- coding: utf-8 -*-
import io

def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d" % (label, c)
    return content.replace(old, new)

def load(path):
    with io.open(path, "r", encoding="utf-8") as f:
        return f.read()

def save(path, content):
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(content)

path = "prisma/schema.prisma"
c = load(path)

# 1. User back-relations for the new Community models.
c = r1(
    c,
    """  discussionsAuthored Discussion[]
  discussionComments  DiscussionComment[]
  exerciseSubmissions ExerciseSubmission[]
  academicCalendars   AcademicCalendar[]""",
    """  discussionsAuthored Discussion[]
  discussionComments  DiscussionComment[]
  exerciseSubmissions ExerciseSubmission[]
  academicCalendars   AcademicCalendar[]

  // Ulul Azm Community (student-wide, cross-course -- distinct from the
  // course-scoped Discussion/DiscussionComment above).
  communityPosts    CommunityPost[]
  communityComments CommunityComment[]""",
    "schema.prisma: User back-relations for Community",
)
save(path, c)
print("prisma/schema.prisma: User back-relations added.")

# 2. Append the new models at the end of the file.
c = load(path)
NEW_MODELS = """
// =====================================================================
// AI ASSISTANT
// The assistant's own rule-based logic, knowledge base and zone/menu
// system live in code (lib/assistantKnowledge.js, lib/assistantI18n.js,
// app/api/assistant/route.js) -- these two models hold only what
// genuinely has to be data: an admin-editable settings singleton, and a
// minimal, non-identifying interaction log (never raw message text, so
// this is safe to keep indefinitely without becoming a privacy record
// of what any one person asked).
// =====================================================================

model AssistantSettings {
  id                 String   @id @default(cuid())
  isEnabled          Boolean  @default(true)
  welcomeMessageEn   String?  @db.Text
  welcomeMessageAr   String?  @db.Text
  supportedLanguages String[] @default(["en", "ar"])
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}

model AssistantEvent {
  id        String   @id @default(cuid())
  // 'open' | 'identity_selected' | 'language_selected' | 'quick_option'
  // | 'query_matched' | 'query_unmatched'
  type      String
  zone      String?
  identity  String?
  language  String?
  // A quick-option label or matched knowledge-entry id only -- never
  // the visitor's raw typed message.
  label     String?
  createdAt DateTime @default(now())

  @@index([type])
  @@index([createdAt])
}

// =====================================================================
// ULUL AZM COMMUNITY
// Student-wide, cross-course discussion space -- distinct from the
// existing course-scoped Discussion/DiscussionComment models (which
// stay exactly as they are, for in-course exercise discussion). Kept
// deliberately modest: posts, comments, light moderation via isHidden.
// Reachable from inside the existing Student Portal (/academics), not
// as a new top-level system.
// =====================================================================

model CommunityPost {
  id        String   @id @default(cuid())
  authorId  String
  title     String
  body      String   @db.Text
  category  String   @default("GENERAL")
  isPinned  Boolean  @default(false)
  isHidden  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  author   User                @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments CommunityComment[]

  @@index([authorId])
  @@index([category])
  @@index([createdAt])
}

model CommunityComment {
  id        String   @id @default(cuid())
  postId    String
  authorId  String
  body      String   @db.Text
  isHidden  Boolean  @default(false)
  createdAt DateTime @default(now())

  post   CommunityPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  author User          @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([authorId])
}
"""
c = c.rstrip("\n") + "\n" + NEW_MODELS
save(path, c)
print("prisma/schema.prisma: AssistantSettings, AssistantEvent, CommunityPost, CommunityComment appended.")

# 3. Migration SQL, hand-authored to match this project's convention
#    (migrate deploy, not migrate dev -- see the Windows/Smart App
#    Control note from earlier in this project).
import os
mig_dir = "prisma/migrations/20260917180000_add_assistant_and_community"
os.makedirs(mig_dir, exist_ok=True)

MIGRATION_SQL = '''-- Model 13 (AI Assistant & Ulul Azm Community).
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
'''

with io.open(os.path.join(mig_dir, "migration.sql"), "w", encoding="utf-8") as f:
    f.write(MIGRATION_SQL)
print("prisma/migrations/20260917180000_add_assistant_and_community/migration.sql written.")
