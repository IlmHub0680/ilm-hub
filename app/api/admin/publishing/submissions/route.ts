import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await requireUser();

    if (
      admin.role !== "ADMIN" &&
      admin.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Administrator access is required.",
        },
        { status: 403 }
      );
    }

    const submissions =
      await prisma.manuscriptSubmission.findMany({
        orderBy: {
          createdAt: "desc",
        },

        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          revisions: true,
        },
      });

    return NextResponse.json(
      {
        success: true,
        data: submissions,
      },
      { status: 200 }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    console.error(
      "Error fetching admin manuscript submissions:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to fetch manuscript submissions.",
      },
      { status: 500 }
    );
  }
}
