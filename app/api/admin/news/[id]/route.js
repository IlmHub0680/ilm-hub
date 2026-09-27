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

const EDITABLE_FIELDS = ["titleEn", "titleAr", "bodyEnHtml", "bodyArHtml", "featuredImageUrl"];

export async function PATCH(request, { params }) {
  try {
    const actor = await requireAdmin();
    const { id } = await params;

    const existing = await prisma.newsArticle.findUnique({ where: { id } });
    if (!existing) return json({ success: false, error: "Article not found." }, 404);

    const body = await request.json();
    const data = {};
    const changes = [];

    for (const field of EDITABLE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        const raw = body[field];
        const value = typeof raw === "string" ? raw.trim() || null : null;
        const requiredField = field === "titleEn" || field === "bodyEnHtml";
        if (requiredField && !value) {
          return json({ success: false, error: `${field} cannot be empty.` }, 400);
        }
        if (value !== (existing[field] ?? null)) {
          data[field] = value;
          changes.push(field);
        }
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, "category")) {
      if (VALID_CATEGORIES.includes(body.category) && body.category !== existing.category) {
        data.category = body.category;
        changes.push("category");
      }
    }

    let publishChange = null;
    if (Object.prototype.hasOwnProperty.call(body, "isPublished") && typeof body.isPublished === "boolean") {
      if (body.isPublished !== existing.isPublished) {
        data.isPublished = body.isPublished;
        // Set publishedAt the first time an article goes live; keep the
        // original publishedAt on later unpublish/republish cycles so
        // the public "published on" date never resets.
        if (body.isPublished && !existing.publishedAt) {
          data.publishedAt = new Date();
        }
        publishChange = body.isPublished;
      }
    }

    const article = Object.keys(data).length > 0
      ? await prisma.newsArticle.update({ where: { id }, data, include: { createdBy: { select: { name: true } } } })
      : await prisma.newsArticle.findUnique({ where: { id }, include: { createdBy: { select: { name: true } } } });

    if (changes.length > 0 || publishChange !== null) {
      await logAudit({
        actor,
        action: publishChange !== null ? (publishChange ? "NEWS_ARTICLE_PUBLISHED" : "NEWS_ARTICLE_UNPUBLISHED") : "NEWS_ARTICLE_UPDATED",
        category: "OTHER",
        targetType: "NewsArticle",
        targetId: article.id,
        summary: `News article "${article.titleEn}" ${publishChange !== null ? (publishChange ? "published" : "unpublished") : `updated (${changes.join(", ")})`}.`,
      });
    }

    return json({ success: true, data: serialize(article) });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Admin access required." }, 403);
    console.error("PATCH admin news error:", error);
    return json({ success: false, error: "Failed to update the article." }, 500);
  }
}

// No hard delete -- unpublish (isPublished:false via PATCH) is the
// supported way to pull an article from the public site, same
// "status flag, not delete" convention as Event above.
