import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/auditLog";

const VALID_CATEGORIES = ["ANNOUNCEMENT", "ACADEMIC", "ADMISSIONS", "COMMUNITY", "ACHIEVEMENT", "GENERAL"];

function json(data, status = 200) {
  return Response.json(data, { status });
}

function serialize(article) {
  return {
    id: article.id,
    titleEn: article.titleEn,
    titleAr: article.titleAr || "",
    bodyEnHtml: article.bodyEnHtml,
    bodyArHtml: article.bodyArHtml || "",
    featuredImageUrl: article.featuredImageUrl || "",
    category: article.category,
    isPublished: article.isPublished,
    publishedAt: article.publishedAt,
    createdByName: article.createdBy?.name || "Unknown",
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  };
}

export async function GET() {
  try {
    await requireAdmin();

    const articles = await prisma.newsArticle.findMany({
      include: { createdBy: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return json({ success: true, data: articles.map(serialize) });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Admin access required." }, 403);
    console.error("GET admin news error:", error);
    return json({ success: false, error: "Failed to load news articles." }, 500);
  }
}

export async function POST(request) {
  try {
    const actor = await requireAdmin();

    const body = await request.json();
    const titleEn = typeof body.titleEn === "string" ? body.titleEn.trim() : "";
    const bodyEnHtml = typeof body.bodyEnHtml === "string" ? body.bodyEnHtml.trim() : "";
    const category = VALID_CATEGORIES.includes(body.category) ? body.category : "GENERAL";
    const isPublished = Boolean(body.isPublished);

    if (!titleEn) return json({ success: false, error: "A title is required." }, 400);
    if (!bodyEnHtml) return json({ success: false, error: "Article content is required." }, 400);

    const article = await prisma.newsArticle.create({
      data: {
        titleEn,
        titleAr: typeof body.titleAr === "string" ? body.titleAr.trim() || null : null,
        bodyEnHtml,
        bodyArHtml: typeof body.bodyArHtml === "string" ? body.bodyArHtml.trim() || null : null,
        featuredImageUrl: typeof body.featuredImageUrl === "string" ? body.featuredImageUrl.trim() || null : null,
        category,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
        createdById: actor.id,
      },
      include: { createdBy: { select: { name: true } } },
    });

    await logAudit({
      actor,
      action: "NEWS_ARTICLE_CREATED",
      category: "OTHER",
      targetType: "NewsArticle",
      targetId: article.id,
      summary: `News article "${article.titleEn}" created${article.isPublished ? " and published" : " as a draft"}.`,
    });

    return json({ success: true, data: serialize(article) }, 201);
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Admin access required." }, 403);
    console.error("POST admin news error:", error);
    return json({ success: false, error: "Failed to create the article." }, 500);
  }
}
