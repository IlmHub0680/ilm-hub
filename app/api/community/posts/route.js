import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { communityCanPost as canPost, communityIsModerator as isModerator, communityBlockedUserIds, communityHasAcceptedGuidelines } from "@/lib/community";

// Ulul Azm Community — a student-wide discussion space, distinct from
// the existing course-scoped Discussion/DiscussionComment models (which
// stay exactly as they are, for in-course exercise discussion). Reached
// from inside the existing Student Portal at /academics/community, not
// as a new top-level system.
//
// Who can post: a signed-in user with a StudentProfile, or staff with
// STUDENT_MATTERS edit access (Student Affairs and similar), or an
// ADMIN/SUPER_ADMIN — the same real permission model used everywhere
// else, never a parallel one invented for this feature. (canPost/
// isModerator now live in lib/community.js so the blocking/reporting/
// profile routes added alongside this reuse the exact same logic.)
export const dynamic = "force-dynamic";

const CATEGORIES = new Set(["GENERAL", "ACADEMIC", "EVENTS", "ANNOUNCEMENTS"]);

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Please log in to view the Community." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const moderator = await isModerator(user);
    // Model 25 §7: a member-to-member block hides that member's posts
    // from the blocker's feed and vice versa -- moderators still see
    // everything (their job is to review it, block relationships
    // aside), matching how isHidden already works for them above.
    const blockedIds = moderator ? new Set() : await communityBlockedUserIds(user.id);

    const posts = await prisma.communityPost.findMany({
      where: {
        ...(category && CATEGORIES.has(category) ? { category } : {}),
        ...(moderator ? {} : { isHidden: false }),
        ...(blockedIds.size > 0 ? { authorId: { notIn: Array.from(blockedIds) } } : {}),
      },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: 50,
      include: {
        author: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: posts.map((p) => ({
        id: p.id,
        title: p.title,
        body: p.body,
        category: p.category,
        isPinned: p.isPinned,
        isHidden: p.isHidden,
        authorId: p.author.id,
        authorName: p.author.name,
        commentCount: p._count.comments,
        createdAt: p.createdAt,
      })),
      canPost: await canPost(user),
      isModerator: moderator,
    });
  } catch (error) {
    console.error("GET community posts error:", error);
    return NextResponse.json({ success: false, error: "Failed to load Community posts." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Please log in to post." }, { status: 401 });
    }
    if (!(await canPost(user))) {
      return NextResponse.json({ success: false, error: "You don't have access to post in the Community." }, { status: 403 });
    }
    if (!(await communityHasAcceptedGuidelines(user.id))) {
      return NextResponse.json({ success: false, error: "Please review and accept the Community Guidelines first.", code: "GUIDELINES_NOT_ACCEPTED" }, { status: 403 });
    }

    const body = await request.json();
    const title = typeof body?.title === "string" ? body.title.trim().slice(0, 150) : "";
    const postBody = typeof body?.body === "string" ? body.body.trim().slice(0, 5000) : "";
    const category = CATEGORIES.has(body?.category) ? body.category : "GENERAL";

    // ANNOUNCEMENTS is reserved for staff/admin, matching how
    // Announcements work everywhere else on the site.
    if (category === "ANNOUNCEMENTS" && user.role === "STUDENT") {
      return NextResponse.json({ success: false, error: "Only staff can post under Announcements." }, { status: 403 });
    }

    if (!title || !postBody) {
      return NextResponse.json({ success: false, error: "Title and body are required." }, { status: 400 });
    }

    const post = await prisma.communityPost.create({
      data: { authorId: user.id, title, body: postBody, category },
      include: { author: { select: { name: true } } },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: post.id,
        title: post.title,
        body: post.body,
        category: post.category,
        isPinned: post.isPinned,
        isHidden: post.isHidden,
        authorId: post.authorId,
        authorName: post.author.name,
        commentCount: 0,
        createdAt: post.createdAt,
      },
    });
  } catch (error) {
    console.error("POST community post error:", error);
    return NextResponse.json({ success: false, error: "Failed to create post." }, { status: 500 });
  }
}
