import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const user = await requireUser();

    const body = await request.json();
    const subject =
      typeof body.subject === "string" ? body.subject.trim() : "";
    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";
    const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
    const priority =
      typeof body.priority === "string" && VALID_PRIORITIES.includes(body.priority)
        ? body.priority
        : "MEDIUM";
    const category =
      typeof body.category === "string" && body.category.trim()
        ? body.category.trim()
        : null;

    if (!subject || !description) {
      return NextResponse.json(
        {
          success: false,
          error: "Subject and description are required.",
        },
        { status: 400 }
      );
    }

    const ticket = await prisma.iCTTicket.create({
      data: {
        raisedByUserId: user.id,
        subject,
        description,
        priority,
        category,
      },
    });

    return NextResponse.json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    console.error("Create ICT ticket error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to submit ticket.",
      },
      { status: 500 }
    );
  }
}