import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const ALLOWED_STATUSES = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "QUOTE_GENERATED",
  "QUOTE_ACCEPTED",
  "IN_PRODUCTION",
  "PUBLISHED",
  "REJECTED",
] as const;

type SubmissionStatus =
  (typeof ALLOWED_STATUSES)[number];

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireUser();

    if (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Administrator access is required.",
        },
        { status: 403 }
      );
    }

    const submissionId = params.id?.trim();

    if (!submissionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Submission ID is required.",
        },
        { status: 400 }
      );
    }

    const body = await req.json();

    const status =
      typeof body.status === "string"
        ? body.status.trim()
        : "";

    if (
      !ALLOWED_STATUSES.includes(
        status as SubmissionStatus
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid submission status.",
          allowedStatuses: ALLOWED_STATUSES,
        },
        { status: 400 }
      );
    }

    const existingSubmission =
      await prisma.manuscriptSubmission.findUnique({
        where: {
          id: submissionId,
        },
      });

    if (!existingSubmission) {
      return NextResponse.json(
        {
          success: false,
          error: "Manuscript submission not found.",
        },
        { status: 404 }
      );
    }

    const updatedSubmission =
      await prisma.manuscriptSubmission.update({
        where: {
          id: submissionId,
        },
        data: {
          status: status as SubmissionStatus,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

    return NextResponse.json({
      success: true,
      message: "Submission status updated successfully.",
      data: updatedSubmission,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error(
      "Error updating manuscript submission status:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to update manuscript submission status.",
      },
      { status: 500 }
    );
  }
}
