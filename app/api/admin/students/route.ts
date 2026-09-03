import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();

    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        enrollments: {
          select: {
            id: true,
            status: true,
            course: {
              select: {
                id: true,
                titleEn: true,
                titleAr: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error("Admin students list error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load students.",
      },
      { status: 500 }
    );
  }
}
