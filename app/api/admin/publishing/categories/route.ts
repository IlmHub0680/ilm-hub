import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();

    if (
      user.role !== "ADMIN" &&
      user.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Administrator access is required.",
        },
        { status: 403 }
      );
    }

    const categories = await prisma.category.findMany({
      orderBy: {
        nameEn: "asc",
      },
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
        slug: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
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

    console.error("Admin categories error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load categories.",
      },
      { status: 500 }
    );
  }
}
