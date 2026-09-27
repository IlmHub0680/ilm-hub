import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const submissionId = params.id?.trim();

    if (!submissionId) {
      return NextResponse.json(
        { success: false, error: "Submission ID is required." },
        { status: 400 }
      );
    }

    const submission = await prisma.manuscriptSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      return NextResponse.json(
        { success: false, error: "Manuscript submission not found." },
        { status: 404 }
      );
    }

    if (submission.authorId !== user.id) {
      return NextResponse.json(
        { success: false, error: "This submission does not belong to you." },
        { status: 403 }
      );
    }

    if (submission.status !== "QUOTE_GENERATED") {
      return NextResponse.json(
        {
          success: false,
          error:
            submission.status === "QUOTE_ACCEPTED" ||
            submission.status === "IN_PRODUCTION" ||
            submission.status === "PUBLISHED"
              ? "This quote has already been accepted."
              : "There is no pending quote to accept for this submission.",
        },
        { status: 409 }
      );
    }

    const updated = await prisma.manuscriptSubmission.update({
      where: { id: submissionId },
      data: { status: "QUOTE_ACCEPTED" },
    });

    return NextResponse.json({
      success: true,
      message: "Quote accepted. Your manuscript will move into production.",
      submission: updated,
    });
  } catch (error) {
    console.error("Error accepting manuscript quote:", error);

    return NextResponse.json(
      { success: false, error: "Unable to accept quote." },
      { status: 500 }
    );
  }
}
