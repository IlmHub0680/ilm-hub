import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();

    const userId =
      typeof body.userId === "string"
        ? body.userId.trim()
        : "";

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

    if (author.authorStatus === "APPROVED") {
      return NextResponse.json(
        {
          success: false,
          error: "This author has already been approved.",
        },
        { status: 409 }
      );
    }

    const approvedAuthor = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        authorStatus: "APPROVED",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        authorStatus: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Author approved successfully.",
      data: approvedAuthor,
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

    console.error("Approve author error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to approve author.",
      },
      { status: 500 }
    );
  }
}
