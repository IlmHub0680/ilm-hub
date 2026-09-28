-- HomepageHeroBanner: up to 5 rotating banner images for the
-- homepage hero slider (Model 25), independent of
-- HomepageHero.heroImageUrl, which remains the single fallback
-- image used when no banners here are enabled.
CREATE TABLE "HomepageHeroBanner" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HomepageHeroBanner_pkey" PRIMARY KEY ("id")
);
