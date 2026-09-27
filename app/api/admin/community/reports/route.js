import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { communityIsModerator } from "@/lib/community";

export const dynamic = "force-dynamic";

// Admin moderation queue for Community reports (Model 25 §9) --
// distinct from the in-page hide/pin toggles that already existed on
// each post: this is the dedicated stream a moderator actually works
// a report queue from, showing who reported what and why, with a link
// back to the reported content's own hide/pin controls. Gated by the
// exact same STUDENT_MATTERS permission the rest of Community
// moderation already uses.
export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Please log in." }, { status: 401 });
    }
    if (!(await communityIsModerator(user))) {
      return NextResponse.json({ success: false, error: "Moderator access required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "OPEN";
    const validStatus = ["OPEN", "REVIEWED", "DISMISSED"].includes(status) ? status : "OPEN";

    const reports = await prisma.communityReport.findMany({
      where: { status: validStatus },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        reporter: { select: { name: true } },
        reviewedBy: { select: { name: true } },
        post: { select: { id: true, title: true, body: true, isHidden: true, authorId: true, author: { select: { name: true } } } },
        comment: { select: { id: true, body: true, isHidden: true, postId: true, authorId: true, author: { select: { name: true } } } },
      },
    });

    return NextResponse.json({
      success: true,
      data: reports.map((r) => ({
        id: r.id,
        reason: r.reason,
        details: r.details,
        status: r.status,
        reporterName: r.reporter.name,
        reviewedByName: r.reviewedBy?.name || null,
        reviewedAt: r.reviewedAt,
        createdAt: r.createdAt,
        post: r.post
          ? { id: r.post.id, title: r.post.title, body: r.post.body, isHidden: r.post.isHidden, authorName: r.post.author.name }
          : null,
        comment: r.comment
          ? { id: r.comment.id, postId: r.comment.postId, body: r.comment.body, isHidden: r.comment.isHidden, authorName: r.comment.author.name }
          : null,
      })),
    });
  } catch (error) {
    console.error("GET community moderation queue error:", error);
    return NextResponse.json({ success: false, error: "Failed to load reports." }, { status: 500 });
  }
}
