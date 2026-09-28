CREATE TABLE "PageFeedback" (
    "id" TEXT NOT NULL,
    "pageSlug" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageFeedback_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PageFeedback_pageSlug_idx" ON "PageFeedback"("pageSlug");
