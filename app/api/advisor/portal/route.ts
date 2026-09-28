import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdvisor } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { staff } = await requireAdvisor();

    const advisees = await prisma.studentProfile.findMany({
      where: { academicAdvisorId: staff.id },
      include: {
        user: { select: { name: true, email: true } },
        program: { select: { nameEn: true } },
        advisorMessages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { studentNo: "asc" },
    });

    return NextResponse.json({
      advisees: advisees.map((s) => ({
        id: s.id,
        name: s.user.name,
        email: s.user.email,
        studentNo: s.studentNo,
        programme: s.program?.nameEn ?? null,
        unreadCount: 0, // computed per-thread on open, see /api/advisor/messages
        lastMessageAt: s.advisorMessages[0]?.createdAt ?? null,
      })),
    });
  } catch (error) {
    console.error("Advisor portal error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ error: "Failed to load advisees." }, { status: 500 });
  }
}
