import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApprovedAuthor } from "@/lib/auth";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

function serializeAdmission(admission) {
  return {
    bio: admission?.bio || "",
    specialty: admission?.specialty || "",
    payoutMethodPreference: admission?.payoutMethodPreference || null,
    bankName: admission?.bankName || "",
    bankAccountNumber: admission?.bankAccountNumber || "",
    momoProvider: admission?.momoProvider || "",
    momoNumber: admission?.momoNumber || "",
  };
}

// An author's own real profile + standing payout preference — own
// data only, scoped strictly to the requesting author's userId.
// Real rows only: an author who hasn't set these yet simply gets
// empty strings back, never a fabricated placeholder.
export async function GET() {
  try {
    const user = await requireApprovedAuthor();

    const admission = await prisma.authorAdmission.findUnique({
      where: { userId: user.id },
      select: {
        bio: true,
        specialty: true,
        payoutMethodPreference: true,
        bankName: true,
        bankAccountNumber: true,
        momoProvider: true,
        momoNumber: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: serializeAdmission(admission),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required.", 401);
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("Author access is required.", 403);
    }

    if (error instanceof Error && error.message === "AUTHOR_NOT_APPROVED") {
      return NextResponse.json(
        {
          success: false,
          error: "Your author application has not been approved yet.",
          code: "AUTHOR_NOT_APPROVED",
        },
        { status: 403 }
      );
    }

    console.error("AUTHOR PROFILE GET ERROR:", error);
    return errorResponse("Unable to load your author profile.", 500);
  }
}

const VALID_PAYOUT_METHODS = ["BANK_TRANSFER", "MOBILE_MONEY"];

// Lets the author update their own bio/specialty/payout preference.
// Real validation: a payout method with no matching destination
// details is rejected rather than silently accepted, mirroring the
// "reject with a clear 400 message" convention already used by other
// PATCH routes in this codebase (e.g. admin library resources).
export async function PATCH(request) {
  try {
    const user = await requireApprovedAuthor();

    const body = await request.json();
    const data = {};

    if (typeof body.bio === "string") {
      data.bio = body.bio.trim() || null;
    }

    if (typeof body.specialty === "string") {
      data.specialty = body.specialty.trim() || null;
    }

    if (body.payoutMethodPreference !== undefined) {
      const method =
        typeof body.payoutMethodPreference === "string"
          ? body.payoutMethodPreference.trim().toUpperCase()
          : "";

      if (method && !VALID_PAYOUT_METHODS.includes(method)) {
        return errorResponse(
          "Invalid payout method. Choose bank transfer or mobile money.",
          400
        );
      }

      if (method === "BANK_TRANSFER") {
        const bankName =
          typeof body.bankName === "string" ? body.bankName.trim() : "";
        const bankAccountNumber =
          typeof body.bankAccountNumber === "string"
            ? body.bankAccountNumber.trim()
            : "";

        if (!bankName || !bankAccountNumber) {
          return errorResponse(
            "Bank name and account number / IBAN are required for bank transfer payouts.",
            400
          );
        }

        data.payoutMethodPreference = "BANK_TRANSFER";
        data.bankName = bankName;
        data.bankAccountNumber = bankAccountNumber;
        data.momoProvider = null;
        data.momoNumber = null;
      } else if (method === "MOBILE_MONEY") {
        const momoProvider =
          typeof body.momoProvider === "string" ? body.momoProvider.trim() : "";
        const momoNumber =
          typeof body.momoNumber === "string" ? body.momoNumber.trim() : "";

        if (!momoProvider || !momoNumber) {
          return errorResponse(
            "Mobile Money provider and number are required for Mobile Money payouts.",
            400
          );
        }

        data.payoutMethodPreference = "MOBILE_MONEY";
        data.momoProvider = momoProvider;
        data.momoNumber = momoNumber;
        data.bankName = null;
        data.bankAccountNumber = null;
      } else {
        // Explicitly cleared payout preference.
        data.payoutMethodPreference = null;
        data.bankName = null;
        data.bankAccountNumber = null;
        data.momoProvider = null;
        data.momoNumber = null;
      }
    }

    if (Object.keys(data).length === 0) {
      return errorResponse("No changes supplied.", 400);
    }

    const admission = await prisma.authorAdmission.update({
      where: { userId: user.id },
      data,
      select: {
        bio: true,
        specialty: true,
        payoutMethodPreference: true,
        bankName: true,
        bankAccountNumber: true,
        momoProvider: true,
        momoNumber: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Your author profile and payout settings have been updated.",
      data: serializeAdmission(admission),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required.", 401);
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("Author access is required.", 403);
    }

    if (error instanceof Error && error.message === "AUTHOR_NOT_APPROVED") {
      return NextResponse.json(
        {
          success: false,
          error: "Your author application has not been approved yet.",
          code: "AUTHOR_NOT_APPROVED",
        },
        { status: 403 }
      );
    }

    console.error("AUTHOR PROFILE PATCH ERROR:", error);
    return errorResponse("Unable to update your author profile.", 500);
  }
}
