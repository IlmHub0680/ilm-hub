import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public, unauthenticated site search (Model 14, Sections 17-18).
// Federates the Academy's own institutional documents plus the real,
// already-existing Program/Course/Media/Library/Bookstore data -- it
// does not create a second copy of any of that content, and it never
// returns anything not already public (unpublished/inactive rows are
// excluded at the query level, matching the same filters each section's
// own public page already uses).
export const dynamic = "force-dynamic";

const ACADEMY_SLUGS = [
  "academy-foundation",
  "academy-pathways",
  "admission-requirements",
];

const LIMIT_PER_GROUP = 6;

function ci(term) {
  return { contains: term, mode: "insensitive" };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();

  if (q.length < 2) {
    return NextResponse.json({ success: true, query: q, results: {} });
  }

  try {
    const [academyPages, programs, courses, departments, faculty, media, library, books, news, events] = await Promise.all([
      prisma.legalPage.findMany({
        where: { slug: { in: ACADEMY_SLUGS }, title: ci(q) },
        select: { slug: true, title: true },
        take: LIMIT_PER_GROUP,
      }),
      prisma.program.findMany({
        where: {
          isActive: true,
          approvalStatus: 'APPROVED',
          OR: [{ nameEn: ci(q) }, { code: ci(q) }],
        },
        select: { id: true, nameEn: true, code: true, level: true },
        take: LIMIT_PER_GROUP,
      }),
      prisma.course.findMany({
        where: {
          isPublished: true,
          approvalStatus: 'APPROVED',
          OR: [{ titleEn: ci(q) }, { courseCode: ci(q) }],
        },
        select: { id: true, titleEn: true, courseCode: true, programId: true },
        take: LIMIT_PER_GROUP,
      }),
      prisma.department.findMany({
        where: {
          isActive: true,
          OR: [{ nameEn: ci(q) }, { code: ci(q) }],
        },
        select: { id: true, nameEn: true, code: true },
        take: LIMIT_PER_GROUP,
      }),
      prisma.staffProfile.findMany({
        where: {
          isActive: true,
          position: { isAcademic: true },
          user: { name: ci(q) },
        },
        select: { id: true, user: { select: { name: true } }, title: true },
        take: LIMIT_PER_GROUP,
      }),
      prisma.mediaItem.findMany({
        where: { isPublished: true, titleEn: ci(q) },
        select: { slug: true, titleEn: true, category: true },
        take: LIMIT_PER_GROUP,
      }),
      prisma.libraryResource.findMany({
        where: { isPublished: true, titleEn: ci(q) },
        select: { slug: true, titleEn: true, category: true },
        take: LIMIT_PER_GROUP,
      }),
      prisma.book.findMany({
        where: { status: "PUBLISHED", titleEn: ci(q) },
        select: { id: true, titleEn: true },
        take: LIMIT_PER_GROUP,
      }),
      // Model 28 rule #6: News and Events (Model 27) joined into the
      // same unified search -- same "only what's actually public"
      // rule as every other group above (isPublished only).
      prisma.newsArticle.findMany({
        where: { isPublished: true, titleEn: ci(q) },
        select: { id: true, titleEn: true, category: true },
        take: LIMIT_PER_GROUP,
      }),
      prisma.event.findMany({
        where: { isPublished: true, titleEn: ci(q) },
        select: { id: true, titleEn: true, eventDate: true },
        take: LIMIT_PER_GROUP,
      }),
    ]);

    const results = {
      academy: academyPages.map((page) => ({
        title: page.title,
        href: `/${page.slug}`,
      })),
      programs: programs.map((program) => ({
        title: program.nameEn,
        href: `/programs/${program.id}`,
        meta: [program.code, program.level].filter(Boolean).join(" · "),
      })),
      departments: departments.map((dept) => ({
        title: dept.nameEn,
        href: `/departments/${dept.id}`,
        meta: dept.code,
      })),
      faculty: faculty.map((person) => ({
        title: person.user.name,
        href: `/faculty/${person.id}`,
        meta: person.title,
      })),
      courses: courses.map((course) => ({
        title: course.titleEn,
        // Courses have no standalone public page -- link to the parent
        // programme, the real place this course is shown, rather than
        // inventing a /courses/[id] route that doesn't exist.
        href: course.programId ? `/programs/${course.programId}` : "/programs",
        meta: course.courseCode,
      })),
      media: media.map((item) => ({
        title: item.titleEn,
        href: `/media/${item.slug}`,
        meta: item.category,
      })),
      library: library.map((item) => ({
        title: item.titleEn,
        href: `/library/${item.slug}`,
        meta: item.category,
      })),
      bookstore: books.map((book) => ({
        title: book.titleEn,
        href: `/bookstore/${book.id}`,
      })),
      news: news.map((article) => ({
        title: article.titleEn,
        href: `/news/${article.id}`,
        meta: article.category,
      })),
      events: events.map((event) => ({
        title: event.titleEn,
        href: `/events`,
        meta: new Date(event.eventDate).toLocaleDateString(),
      })),
    };

    return NextResponse.json({ success: true, query: q, results });
  } catch (error) {
    console.error("Site search error:", error);
    return NextResponse.json({ success: false, error: "Search is temporarily unavailable." }, { status: 500 });
  }
}
