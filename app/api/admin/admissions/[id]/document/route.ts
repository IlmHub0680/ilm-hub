import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { getR2PresignedUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";

const ALLOWED_DOCUMENTS = [
  "identityDocumentUrl",
  "passportPictureUrl",
  "transcriptsUrl",
  "certificateUrl",
  "testimonialUrl",
  "recommendationUrl",
] as const;

type DocumentField = (typeof ALLOWED_DOCUMENTS)[number];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Application ID is required.",
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const field = searchParams.get("field") as DocumentField | null;

    if (!field || !ALLOWED_DOCUMENTS.includes(field)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid admission document.",
        },
        { status: 400 }
      );
    }

    const application =
      await prisma.admissionApplication.findUnique({
        where: { id },
        select: {
          id: true,
          [field]: true,
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

    const key = application[field];

    if (!key) {
      return NextResponse.json(
        {
          success: false,
          error: "This document has not been uploaded.",
        },
        { status: 404 }
      );
    }

    const url = await getR2PresignedUrl(key, 300);

    return NextResponse.json({
      success: true,
      data: {
        url,
        expiresIn: 300,
        field,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json(
          {
            success: false,
            error: "Authentication required.",
          },
          { status: 401 }
        );
      }

      if (error.message === "FORBIDDEN") {
        return NextResponse.json(
          {
            success: false,
            error: "Administrator access required.",
          },
          { status: 403 }
        );
      }
    }

    console.error(
      "Admin admission document error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to access admission document.",
      },
      { status: 500 }
    );
  }
}
