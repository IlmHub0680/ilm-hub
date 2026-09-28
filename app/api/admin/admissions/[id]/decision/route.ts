import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmissionsEdit } from "@/lib/permissions";
import { generateStudentNumber } from "@/lib/studentNumber";
import {
  sendAdmissionApprovedEmail,
  sendAdmissionDeclinedEmail,
} from "@/lib/admissionEmails";
import { logAdmissionEvent } from "@/lib/admissionAudit";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireAdmissionsEdit();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Application ID is required." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const decision =
      typeof body.decision === "string"
        ? body.decision.trim().toUpperCase()
        : "";

    // Optional, staff-authored, applicant-visible reason for a decline.
    // No appeals process is implied or offered here -- this is purely a
    // courtesy explanation, exactly as Model 16 asks for.
    const declineReason =
      typeof body.reason === "string" && body.reason.trim()
        ? body.reason.trim().slice(0, 2000)
        : null;

    if (!["APPROVED", "REJECTED"].includes(decision)) {
      return NextResponse.json(
        {
          success: false,
          error: "Decision must be APPROVED or REJECTED.",
        },
        { status: 400 }
      );
    }

    const application = await prisma.admissionApplication.findUnique({
      where: { id },
      include: {
        payment: true,
        program: { include: { department: true } },
      },
    });

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          error: "Admission application not found.",
        },
        { status: 404 }
      );
    }

    const REVIEWABLE_STATUSES = [
      "UNDER_REVIEW",
      "INITIAL_ACCEPTANCE",
      "PENDING_FINAL_APPROVAL",
    ];

    if (
      decision === "REJECTED" &&
      !REVIEWABLE_STATUSES.includes(application.status)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only applications under review (Under Review, Initial Acceptance, or Pending Final Approval) can be declined.",
          currentStatus: application.status,
        },
        { status: 409 }
      );
    }

    if (
      decision === "APPROVED" &&
      application.status !== "PENDING_FINAL_APPROVAL"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Applications can only be approved from Pending Final Approval. Move it through Initial Acceptance and Pending Final Approval first.",
          currentStatus: application.status,
        },
        { status: 409 }
      );
    }

    if (!application.payment || application.payment.status !== "PAID") {
      return NextResponse.json(
        {
          success: false,
          error:
            "The admission payment must be verified before making an admission decision.",
        },
        { status: 409 }
      );
    }

    /*
     * REJECTION:
     * Only update the admission application.
     * Never create a student account.
     */
    if (decision === "REJECTED") {
      const fromStatus = application.status;

      const updated = await prisma.admissionApplication.update({
        where: { id },
        data: { status: "REJECTED", declineReason },
        include: { payment: true },
      });

      await logAdmissionEvent({
        applicationId: id,
        action: "DECLINED",
        fromStatus,
        toStatus: "REJECTED",
        actorUserId: actor.id,
        actorName: actor.name,
        note: declineReason,
      });

      const emailResult = await sendAdmissionDeclinedEmail({
        to: updated.email,
        applicantName: updated.fullName,
        applicationNumber: updated.applicationNumber,
        reason: declineReason,
      });

      return NextResponse.json({
        success: true,
        message: "Student admission rejected successfully.",
        data: updated,
        emailSent: emailResult.sent,
      });
    }

    /*
     * APPROVAL:
     * Create or reuse the real User account so the applicant
     * becomes visible in Student Management and can use the
     * normal student login.
     */
    const result = await prisma.$transaction(async (tx) => {
      let user = await tx.user.findUnique({
        where: { email: application.email },
      });

      if (!user) {
        const temporaryPassword = crypto.randomBytes(16).toString("hex");

        user = await tx.user.create({
          data: {
            id: crypto.randomUUID(),
            name: application.fullName,
            email: application.email,
            passwordHash:
              application.passwordHash || temporaryPassword,
            role: "STUDENT",
          },
        });
      } else if (user.role !== "STUDENT") {
        user = await tx.user.update({
          where: { id: user.id },
          data: {
            role: "STUDENT",
            name: application.fullName,
          },
        });
      }

      const updatedApplication =
        await tx.admissionApplication.update({
          where: { id },
          data: { status: "APPROVED" },
          include: { payment: true },
        });

      /*
       * Student Lifecycle: Admission -> Placement -> Enrollment.
       * Approval is also where the applicant becomes a real student
       * record — everything downstream (Placement, Attendance,
       * Advising, Term Records, Graduation) hangs off StudentProfile,
       * not off AdmissionApplication or User alone. ADMITTED marks a
       * student who has been approved but not yet placed or
       * registered into courses (StudentStatus).
       */
      let studentProfile = await tx.studentProfile.findUnique({
        where: { userId: user.id },
      });

      if (!studentProfile) {
        const admissionYear = new Date().getFullYear();
        const studentNo = await generateStudentNumber(admissionYear);

        studentProfile = await tx.studentProfile.create({
          data: {
            userId: user.id,
            studentNo,
            facultyId: application.program?.facultyId || null,
            departmentId:
              application.program?.departmentId ||
              application.preferredDepartmentId ||
              null,
            programId: application.programId || null,
            admissionYear,
            studySession: application.studySession || null,
            status: "ADMITTED",
          },
        });
      }

      return {
        user,
        application: updatedApplication,
        studentProfile,
      };
    });

    await logAdmissionEvent({
      applicationId: id,
      action: "APPROVED",
      fromStatus: "PENDING_FINAL_APPROVAL",
      toStatus: "APPROVED",
      actorUserId: actor.id,
      actorName: actor.name,
    });

    const emailResult = await sendAdmissionApprovedEmail({
      to: result.application.email,
      applicantName: result.application.fullName,
      applicationNumber: result.application.applicationNumber,
      programName: application.program?.nameEn || null,
      departmentName: application.program?.department?.nameEn || null,
      studentNo: result.studentProfile.studentNo,
    });

    return NextResponse.json({
      success: true,
      message: "Student admission approved and student account created successfully.",
      data: {
        application: result.application,
        student: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        },
        studentProfile: {
          id: result.studentProfile.id,
          studentNo: result.studentProfile.studentNo,
          status: result.studentProfile.status,
        },
      },
      emailSent: emailResult.sent,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json(
          { success: false, error: "Authentication required." },
          { status: 401 }
        );
      }
      if (error.message === "FORBIDDEN") {
        return NextResponse.json(
          { success: false, error: "Admissions edit access required." },
          { status: 403 }
        );
      }
    }

    console.error("Admissions decision error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to update admission decision." },
      { status: 500 }
    );
  }
}