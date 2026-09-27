import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getR2PresignedUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const issue = await prisma.transcriptIssue.findUnique({
      where: { id },
      include: { student: { select: { userId: true } } },
    });

    if (!issue) {
      return NextResponse.json(
        { success: false, error: "Transcript not found." },
        { status: 404 }
      );
    }

    const isOwner = issue.student.userId === user.id;
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    let isRecordsStaff = false;

    if (!isOwner && !isAdmin) {
      const staff = await prisma.staffProfile.findUnique({
        where: { userId: user.id },
        include: { position: { include: { permissions: true } } },
      });

      isRecordsStaff = Boolean(
        staff?.position?.permissions.some(
          (p) => p.module === "ACADEMIC_RECORDS" && p.canView
        )
      );
    }

    if (!isOwner && !isAdmin && !isRecordsStaff) {
      return NextResponse.json(
        { success: false, error: "Forbidden." },
        { status: 403 }
      );
    }

    if (!issue.pdfUrl || issue.pdfUrl.startsWith("pending/")) {
      return NextResponse.json(
        {
          success: false,
          error: "This transcript is still being generated. Please check back shortly.",
        },
        { status: 404 }
      );
    }

    const url = await getR2PresignedUrl(issue.pdfUrl, 300);

    return NextResponse.json({ success: true, url });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("Transcript download error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to generate download link." },
      { status: 500 }
    );
  }
}
