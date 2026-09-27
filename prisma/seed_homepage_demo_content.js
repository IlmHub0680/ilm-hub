// One-off script: adds ONE real Announcement and ONE real Sponsor so
// the user can see the homepage's new Announcements and Sponsors
// sections actually rendering with live data, exactly as they'll look
// once the user replaces this with their own content via the admin.
//
// Both records are clearly marked as placeholder/demo content in their
// own text, so nothing here is presented as real institutional
// information -- the user can edit or delete them from:
//   - Admin -> Homepage -> Announcements
//   - Admin -> Sponsor Manager
//
// Run with:  node prisma/seed_homepage_demo_content.js
// (same DIRECT_URL / adapter pattern as prisma/seed.js)

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL is missing from .env");
}

const adapter = new PrismaPg({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // A real admin/super-admin user is required as Announcement.createdById
  // and Sponsor.createdById -- never fabricated. If none exists yet,
  // this script stops rather than guessing an id.
  const admin = await prisma.user.findFirst({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    select: { id: true, name: true, email: true },
  });

  if (!admin) {
    console.error(
      "No ADMIN or SUPER_ADMIN user found -- create one first, then re-run this script."
    );
    process.exit(1);
  }

  console.log(`Using admin: ${admin.name} <${admin.email}>`);

  const announcement = await prisma.announcement.upsert({
    where: { id: "demo-homepage-announcement" },
    update: {},
    create: {
      id: "demo-homepage-announcement",
      titleEn: "Welcome to the new Ulul Azm Institute website",
      titleAr: "أهلاً بكم في الموقع الجديد لمعهد أولي العزم",
      bodyEn:
        "This is a placeholder announcement so you can see how the homepage's Notices & Announcements section looks with live content. Edit or delete it from Admin -> Homepage -> Announcements once you're ready to publish real notices.",
      bodyAr:
        "هذا إعلان تجريبي لمعاينة شكل قسم الإشعارات والإعلانات في الصفحة الرئيسية. يمكنكم تعديله أو حذفه من لوحة التحكم.",
      scope: "INSTITUTION",
      createdById: admin.id,
      isActive: true,
    },
  });

  const sponsor = await prisma.sponsor.upsert({
    where: { id: "demo-homepage-sponsor" },
    update: {},
    create: {
      id: "demo-homepage-sponsor",
      name: "Sample Sponsor & Partner",
      description:
        "Placeholder sponsor entry so you can see how the homepage's Sponsors & Partners section looks with live content. Edit or delete it from Admin -> Sponsor Manager once you're ready to add real sponsors.",
      status: "ACTIVE",
      isPublic: true,
      createdById: admin.id,
    },
  });

  console.log("Created/updated announcement:", announcement.id);
  console.log("Created/updated sponsor:", sponsor.id);
  console.log("\nDone. Visit the homepage to see both sections rendering live.");
  console.log(
    "Remember to run `npx prisma generate` first if you haven't already applied the SectionBanner migration from this session."
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
