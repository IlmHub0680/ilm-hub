import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();

    const userId = typeof body.userId === "string" ? body.userId.trim() : "";

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "userId is required.",
        },
        { status: 400 }
      );
    }

    const author = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        authorStatus: true,
        authorAdmission: { select: { id: true, status: true } },
      },
    });

    if (!author || author.role !== "AUTHOR") {
      return NextResponse.json(
        {
          success: false,
          error: "Author not found.",
        },
        { status: 404 }
      );
    }

    if (author.authorStatus === "REJECTED") {
      return NextResponse.json(
        {
          success: false,
          error: "This author has already been rejected.",
        },
        { status: 409 }
      );
    }

    // Keep the User record and its AuthorAdmission in lock-step, same
    // as approve-author.
    const [rejectedAuthor] = await prisma.$transaction([
      prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          authorStatus: "REJECTED",
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          authorStatus: true,
        },
      }),
      ...(author.authorAdmission
        ? [
            prisma.authorAdmission.update({
              where: { id: author.authorAdmission.id },
              data: { status: "REJECTED" },
            }),
          ]
        : []),
    ]);

    return NextResponse.json({
      success: true,
      message: "Author application rejected.",
      data: rejectedAuthor,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json(
          {
            success: false,
            error: "Authentication required.",
          },
          { status: 401 }
        );
      }

      if (error.message === "FORBIDDEN") {
        return NextResponse.json(
          {
            success: false,
            error: "Administrator access required.",
          },
          { status: 403 }
        );
      }
    }

    console.error("Reject author error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to reject author.",
      },
      { status: 500 }
    );
  }
}
