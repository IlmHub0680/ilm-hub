import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();

    const pendingAuthors = await prisma.user.findMany({
      where: {
        role: "AUTHOR",
        authorStatus: "PENDING",
      },
      select: {
        id: true,
        name: true,
        email: true,
        authorStatus: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: pendingAuthors,
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

    console.error("Pending authors error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load pending author applications.",
      },
      { status: 500 }
    );
  }
}
