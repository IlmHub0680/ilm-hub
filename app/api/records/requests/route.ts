import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    await requireModulePermission("ACADEMIC_RECORDS", "view");

    const requests = await prisma.request.findMany({
      where: { type: "TRANSCRIPT" },
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
        transcriptIssue: { select: { id: true, pdfUrl: true, cumulative: true, issuedAt: true } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({
      requests: requests.map((r) => ({
        id: r.id,
        status: r.status,
        details: r.details,
        createdAt: r.createdAt,
        studentName: r.student.user.name,
        studentNo: r.student.studentNo,
        studentId: r.studentId,
        transcriptIssue: r.transcriptIssue
          ? { ...r.transcriptIssue, pdfUrl: r.transcriptIssue.pdfUrl ? true : null }
          : null,
      })),
    });
  } catch (error) {
    console.error("Records requests GET error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Academic Records access required", 403);

    return errorResponse("Failed to fetch transcript requests", 500);
  }
}
