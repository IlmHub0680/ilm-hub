import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Lets a prospective author check their application's current status
// (and, if unpaid, the fee still owed) without needing to be logged
// in — mirroring the student admissions "track" flow.
export const dynamic = "force-dynamic";

const STATUS_MESSAGE = {
  PENDING: "Your application fee has not been paid yet.",
  PAID: "Your application fee has been received and your application is awaiting review.",
  UNDER_REVIEW: "Your application is currently being reviewed by the administration.",
  APPROVED: "Your application has been approved. You can now sign in to your author dashboard.",
  REJECTED: "Your application was not approved.",
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const admissionId = (searchParams.get("admissionId") || "").trim();
    const email = (searchParams.get("email") || "").trim().toLowerCase();

    if (!admissionId && !email) {
      return NextResponse.json(
        { success: false, error: "Provide an admissionId or email to look up an application." },
        { status: 400 }
      );
    }

    const admission = await prisma.authorAdmission.findFirst({
      where: admissionId
        ? { id: admissionId }
        : { user: { email } },
      include: {
        user: { select: { name: true, email: true, authorStatus: true } },
        payment: { select: { status: true, amount: true, currencyCode: true, checkoutUrl: true, paidAt: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!admission) {
      return NextResponse.json(
        { success: false, error: "No author application found for that reference." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        admissionId: admission.id,
        name: admission.user.name,
        email: admission.user.email,
        status: admission.status,
        message: STATUS_MESSAGE[admission.status] || null,
        applicationFee: admission.applicationFee ? Number(admission.applicationFee) : null,
        currencyCode: admission.currencyCode,
        feeBasis: admission.feeBasis,
        submittedAt: admission.createdAt,
        updatedAt: admission.updatedAt,
        payment: admission.payment
          ? {
              status: admission.payment.status,
              amount: Number(admission.payment.amount),
              currencyCode: admission.payment.currencyCode,
              // Only useful to hand back to the applicant while the
              // fee is still unpaid — a paid/failed session shouldn't
              // be reused.
              checkoutUrl:
                admission.status === "PENDING" && admission.payment.status === "PENDING"
                  ? admission.payment.checkoutUrl
                  : null,
              paidAt: admission.payment.paidAt,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Author application track error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to look up this author application." },
      { status: 500 }
    );
  }
}
