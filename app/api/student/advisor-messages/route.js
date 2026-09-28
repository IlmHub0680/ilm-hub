import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const user = await requireUser();

    if (user.role !== "STUDENT") {
      return NextResponse.json(
        { success: false, error: "Student access required." },
        { status: 403 }
      );
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { success: false, error: "No student profile found for this account." },
        { status: 404 }
      );
    }

    if (!studentProfile.academicAdvisorId) {
      return NextResponse.json(
        { success: false, error: "No academic advisor is assigned to your profile yet." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message cannot be empty." },
        { status: 400 }
      );
    }

    const saved = await prisma.advisorMessage.create({
      data: {
        studentId: studentProfile.id,
        senderRole: "STUDENT",
        message,
      },
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("Advisor message error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to send message." },
      { status: 500 }
    );
  }
}