import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { communityCanPost as canPost, communityIsModerator as isModerator, communityBlockedUserIds, communityHasAcceptedGuidelines } from "@/lib/community";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Please log in to view comments." }, { status: 401 });
    }
    const { id } = await params;
    const moderator = await isModerator(user);
    const blockedIds = moderator ? new Set() : await communityBlockedUserIds(user.id);

    const comments = await prisma.communityComment.findMany({
      where: {
        postId: id,
        ...(moderator ? {} : { isHidden: false }),
        ...(blockedIds.size > 0 ? { authorId: { notIn: Array.from(blockedIds) } } : {}),
      },
      orderBy: { createdAt: "asc" },
      include: { author: { select: { id: true, name: true } } },
    });

    return NextResponse.json({
      success: true,
      data: comments.map((c) => ({
        id: c.id,
        body: c.body,
        isHidden: c.isHidden,
        authorId: c.author.id,
        authorName: c.author.name,
        createdAt: c.createdAt,
      })),
    });
  } catch (error) {
    console.error("GET community comments error:", error);
    return NextResponse.json({ success: false, error: "Failed to load comments." }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Please log in to comment." }, { status: 401 });
    }
    if (!(await canPost(user))) {
      return NextResponse.json({ success: false, error: "You don't have access to comment in the Community." }, { status: 403 });
    }
    if (!(await communityHasAcceptedGuidelines(user.id))) {
      return NextResponse.json({ success: false, error: "Please review and accept the Community Guidelines first.", code: "GUIDELINES_NOT_ACCEPTED" }, { status: 403 });
    }

    const { id } = await params;
    const post = await prisma.communityPost.findUnique({
      where: { id },
      select: { id: true, isHidden: true, authorId: true, title: true },
    });
    if (!post || post.isHidden) {
      return NextResponse.json({ success: false, error: "This post is not available." }, { status: 404 });
    }

    const body = await request.json();
    const commentBody = typeof body?.body === "string" ? body.body.trim().slice(0, 2000) : "";
    if (!commentBody) {
      return NextResponse.json({ success: false, error: "Comment cannot be empty." }, { status: 400 });
    }

    const comment = await prisma.communityComment.create({
      data: { postId: id, authorId: user.id, body: commentBody },
      include: { author: { select: { id: true, name: true } } },
    });

    // Notify the post's author that someone replied -- Model 25 §13
    // requires this go through an isolated pipeline from high-priority
    // academic/registration alerts, which the nullable `type` column
    // on the existing single Notification table already gives us (see
    // prisma/schema.prisma) without a second notifications system.
    // Never notify yourself for commenting on your own post.
    if (post.authorId && post.authorId !== user.id) {
      try {
        await prisma.notification.create({
          data: {
            userId: post.authorId,
            title: "New reply in the Community",
            message: `${comment.author.name} replied to your post "${post.title}".`,
            type: "COMMUNITY",
          },
        });
      } catch (notifyError) {
        // A failed notification must never fail the comment itself.
        console.error("Community comment notification error:", notifyError);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: comment.id,
        body: comment.body,
        isHidden: comment.isHidden,
        authorId: comment.author.id,
        authorName: comment.author.name,
        createdAt: comment.createdAt,
      },
    });
  } catch (error) {
    console.error("POST community comment error:", error);
    return NextResponse.json({ success: false, error: "Failed to add comment." }, { status: 500 });
  }
}
