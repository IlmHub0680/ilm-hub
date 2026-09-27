import { prisma } from "@/lib/prisma";

// Public, read-only endpoint -- only published articles, newest first
// by publishedAt. Same "public routes never see drafts" convention as
// /api/events and /api/legal-content.
export async function GET() {
  try {
    const articles = await prisma.newsArticle.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
    });

    return Response.json({
      success: true,
      data: articles.map((article) => ({
        id: article.id,
        titleEn: article.titleEn,
        titleAr: article.titleAr || "",
        bodyEnHtml: article.bodyEnHtml,
        bodyArHtml: article.bodyArHtml || "",
        featuredImageUrl: article.featuredImageUrl || "",
        category: article.category,
        publishedAt: article.publishedAt,
      })),
    });
  } catch (error) {
    console.error("Public news GET error (serving empty list):", error);
    return Response.json({ success: true, data: [] });
  }
}
