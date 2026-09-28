import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getR2PresignedUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";

const RECORDS_TYPES = ["TRANSCRIPT"];
const EXAMINATIONS_TYPES = ["GRADE_APPEAL"];

export async function GET(request, { params }) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const record = await prisma.request.findUnique({
      where: { id },
      include: { student: { select: { userId: true } } },
    });

    if (!record) {
      return NextResponse.json(
        { success: false, error: "Request not found." },
        { status: 404 }
      );
    }

    const isOwner = record.student.userId === user.id;
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    let isAssignedStaff = false;

    if (!isOwner && !isAdmin) {
      const staff = await prisma.staffProfile.findUnique({
        where: { userId: user.id },
        include: { position: { include: { permissions: true } } },
      });

      if (staff?.position) {
        const module = RECORDS_TYPES.includes(record.type)
          ? "ACADEMIC_RECORDS"
          : EXAMINATIONS_TYPES.includes(record.type)
          ? "EXAMINATIONS"
          : "STUDENT_MATTERS";

        isAssignedStaff = staff.position.permissions.some(
          (p) => p.module === module && p.canView
        );
      }
    }

    if (!isOwner && !isAdmin && !isAssignedStaff) {
      return NextResponse.json(
        { success: false, error: "Forbidden." },
        { status: 403 }
      );
    }

    if (!record.attachmentUrl) {
      return NextResponse.json(
        { success: false, error: "No attachment on this request." },
        { status: 404 }
      );
    }

    const url = await getR2PresignedUrl(record.attachmentUrl, 300);

    return NextResponse.json({ success: true, url });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("Request attachment download error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to generate download link." },
      { status: 500 }
    );
  }
}
