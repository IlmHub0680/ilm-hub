import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdvisor } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function assertAdvisee(staffId: string, studentId: string) {
  const student = await prisma.studentProfile.findUnique({ where: { id: studentId } });

  if (!student || student.academicAdvisorId !== staffId) {
    return { error: errorResponse("This student is not assigned to you", 403) };
  }

  return { student };
}

export async function GET(request: Request) {
  try {
    const { staff } = await requireAdvisor();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId") || "";

    if (!studentId) {
      return errorResponse("studentId is required", 400);
    }

    const check = await assertAdvisee(staff.id, studentId);
    if (check.error) return check.error;

    const messages = await prisma.advisorMessage.findMany({
      where: { studentId },
      orderBy: { createdAt: "asc" },
    });

    await prisma.advisorMessage.updateMany({
      where: { studentId, senderRole: "STUDENT", isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        senderRole: m.senderRole,
        message: m.message,
        createdAt: m.createdAt,
        isRead: m.isRead,
      })),
    });
  } catch (error) {
    console.error("Advisor messages GET error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Forbidden", 403);

    return errorResponse("Failed to load messages", 500);
  }
}

export async function POST(request: Request) {
  try {
    const { staff } = await requireAdvisor();

    const body = await request.json();
    const studentId = typeof body.studentId === "string" ? body.studentId : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!studentId || !message) {
      return errorResponse("studentId and message are required", 400);
    }

    const check = await assertAdvisee(staff.id, studentId);
    if (check.error) return check.error;

    const saved = await prisma.advisorMessage.create({
      data: { studentId, senderRole: "ADVISOR", message },
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error("Advisor messages POST error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Forbidden", 403);

    return errorResponse("Failed to send message", 500);
  }
}
