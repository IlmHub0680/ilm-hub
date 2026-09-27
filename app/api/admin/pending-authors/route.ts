import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();

    // Only surface applicants who have actually paid the author
    // application fee (AuthorAdmission moves PENDING -> PAID once
    // /api/author/paystack/verify or the webhook confirms payment).
    // An author who registered but never paid should not appear in
    // the admin review queue at all.
    const pendingAdmissions = await prisma.authorAdmission.findMany({
      where: {
        status: { in: ["PAID", "UNDER_REVIEW"] },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, authorStatus: true, createdAt: true },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const pendingAuthors = pendingAdmissions
      .filter((admission) => admission.user.authorStatus === "PENDING")
      .map((admission) => ({
        id: admission.user.id,
        name: admission.user.name,
        email: admission.user.email,
        authorStatus: admission.user.authorStatus,
        createdAt: admission.user.createdAt,
        admissionId: admission.id,
        admissionStatus: admission.status,
        applicationFee: admission.applicationFee ? Number(admission.applicationFee) : null,
        currencyCode: admission.currencyCode,
        feeBasis: admission.feeBasis,
        countryOfResidence: admission.countryOfResidence,
      }));

    return NextResponse.json({
      success: true,
      data: pendingAuthors,
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

    console.error("Pending authors error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load pending author applications.",
      },
      { status: 500 }
    );
  }
}
