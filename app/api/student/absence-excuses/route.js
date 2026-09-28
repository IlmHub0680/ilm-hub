import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const VALID_TYPES = ["LECTURE", "MIDTERM", "FINAL"];

// Creates a real AbsenceExcuse row. Previously handleAbsenceSubmit in
// app/login/page.jsx only pushed the excuse into local React state --
// no AbsenceExcuse model existed at all, so nothing was ever saved or
// seen by staff.
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

    const type = typeof body.type === "string" ? body.type.trim().toUpperCase() : "";
    const courseId = typeof body.courseId === "string" ? body.courseId : "";
    const absenceDate = typeof body.absenceDate === "string" ? body.absenceDate : "";
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { success: false, error: "A valid absence type is required." },
        { status: 400 }
      );
    }

    if (!courseId || !absenceDate || !reason) {
      return NextResponse.json(
        { success: false, error: "Please complete all absence excuse fields." },
        { status: 400 }
      );
    }

    const parsedDate = new Date(absenceDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid absence date." },
        { status: 400 }
      );
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "You are not enrolled in this course." },
        { status: 403 }
      );
    }

    const excuse = await prisma.absenceExcuse.create({
      data: {
        studentId: studentProfile.id,
        courseId,
        type,
        absenceDate: parsedDate,
        reason,
      },
    });

    return NextResponse.json({ success: true, data: excuse });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("Absence excuse submit error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to submit absence excuse." },
      { status: 500 }
    );
  }
}
