import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_QUOTE_AMOUNT = 1_000_000;

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
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

    const quoteAmount = Number(body.quoteAmount);

    const quoteDetails =
      typeof body.quoteDetails === "string"
        ? body.quoteDetails.trim()
        : "";

    if (
      !Number.isFinite(quoteAmount) ||
      quoteAmount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A valid quote amount greater than zero is required.",
        },
        { status: 400 }
      );
    }

    if (quoteAmount > MAX_QUOTE_AMOUNT) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Quote amount exceeds the allowed maximum.",
        },
        { status: 400 }
      );
    }

    const submission =
      await prisma.manuscriptSubmission.findUnique({
        where: {
          id: submissionId,
        },
      });

    if (!submission) {
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
          quoteAmount,
          quoteDetails,
          status: "QUOTE_GENERATED",
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
      message: "Quote generated successfully.",
      data: updatedSubmission,
    });
  } catch (error) {
    console.error("Error generating quote:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to generate quote.",
      },
      { status: 500 }
    );
  }
}
