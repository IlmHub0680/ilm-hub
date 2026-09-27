-- BookstorePageContent + BookstoreValueCard (Model 27): makes the
-- /bookstore page's own surrounding copy (hero, section headings,
-- value-strip cards, publisher CTA, footer About blurb)
-- admin-editable, same pattern as the homepage sections CMS. The
-- book catalogue itself was already editable before this migration.
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

CREATE INDEX "BookstoreValueCard_order_idx" ON "BookstoreValueCard"("order");
