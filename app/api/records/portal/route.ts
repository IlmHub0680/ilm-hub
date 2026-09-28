import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireModulePermission("ACADEMIC_RECORDS", "view");

    const [studentCount, pendingTranscriptRequests, transcriptsIssued] =
      await Promise.all([
        prisma.studentProfile.count(),
        prisma.request.count({
          where: {
            type: "TRANSCRIPT",
            status: { in: ["SUBMITTED", "UNDER_REVIEW"] },
          },
        }),
        prisma.transcriptIssue.count(),
      ]);

    return NextResponse.json({
      studentCount,
      pendingTranscriptRequests,
      transcriptsIssued,
    });
  } catch (error) {
    console.error("Records portal error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "Academic Records access required" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to load Academic Records data." },
      { status: 500 }
    );
  }
}
