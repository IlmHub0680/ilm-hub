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

    const body = await request.json();

    const courseId = typeof body.courseId === "string" ? body.courseId : "";
    const instructorStaffId =
      typeof body.instructorStaffId === "string" ? body.instructorStaffId : null;
    const notes = typeof body.notes === "string" ? body.notes.trim() : null;
    const preferredSchedule =
      typeof body.preferredSchedule === "string" ? body.preferredSchedule.trim() : null;

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "A course is required." },
        { status: 400 }
      );
    }

    let feeUSD = null;

    if (instructorStaffId) {
      const instructor = await prisma.staffProfile.findUnique({
        where: { id: instructorStaffId },
      });

      feeUSD = null; // Fee schedule is set by administration after review, not by the student's request.
      void instructor;
    }

    const tutoringRequest = await prisma.tutoringRequest.create({
      data: {
        studentId: studentProfile.id,
        courseId,
        instructorStaffId,
        preferredSchedule,
        notes,
        feeUSD,
      },
    });

    return NextResponse.json({ success: true, data: tutoringRequest });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("Tutoring request error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to submit tutoring request." },
      { status: 500 }
    );
  }
}