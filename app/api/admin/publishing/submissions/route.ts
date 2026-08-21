import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const submissions =
      await prisma.manuscriptSubmission.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json({
      success: true,
      data: submissions,
    });
  } catch (error) {
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
