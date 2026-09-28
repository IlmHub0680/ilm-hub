import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "default-author-fees";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    const countryOfResidence =
      typeof body.countryOfResidence === "string"
        ? body.countryOfResidence.trim()
        : "";

    if (!name || !email || !password || !countryOfResidence) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Name, email, password and country of residence are required.",
        },
        { status: 400 }
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a valid name.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 8 characters.",
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "An account already exists with this email.",
        },
        { status: 409 }
      );
    }

    // The Author Application Fee is configured separately from the
    // Student Admission Fee (see AuthorFeeSettings / /admin/author-fees)
    // and, like student fees, depends only on country of residence —
    // not nationality.
    const feeSettings = await prisma.authorFeeSettings.findUnique({
      where: { id: SETTINGS_ID },
    });

    if (!feeSettings) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The author application fee has not been configured by the administration yet. Please try again later.",
        },
        { status: 500 }
      );
    }

    if (!feeSettings.isActive) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Author applications are not currently being accepted. Please check back later.",
        },
        { status: 403 }
      );
    }

    if (feeSettings.effectiveDate && feeSettings.effectiveDate > new Date()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Author applications are not yet open. Please check back after the announced opening date.",
        },
        { status: 403 }
      );
    }

    const isGhanaResident = countryOfResidence.toLowerCase() === "ghana";
    const applicationFee = isGhanaResident
      ? Number(feeSettings.ghana)
      : Number(feeSettings.international);
    const currencyCode = isGhanaResident
      ? feeSettings.ghanaCurrency
      : feeSettings.internationalCurrency;
    const feeBasis = isGhanaResident
      ? "Ghana Resident Rate"
      : "International Resident Rate";
    const feeExpiresAt = feeSettings.validityDays
      ? new Date(Date.now() + feeSettings.validityDays * 24 * 60 * 60 * 1000)
      : null;

    if (!Number.isFinite(applicationFee) || applicationFee <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid author application fee configuration.",
        },
        { status: 500 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const now = new Date();
    const authorId = crypto.randomUUID();

    const author = await prisma.user.create({
      data: {
        id: authorId,
        name,
        email,
        passwordHash,
        role: "AUTHOR",
        authorStatus: "PENDING",
        updatedAt: now,

        authorAdmission: {
          create: {
            status: "PENDING",
            countryOfResidence,
            applicationFee,
            currencyCode,
            feeBasis,
            feeExpiresAt,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        authorStatus: true,
        createdAt: true,
        authorAdmission: {
          select: {
            id: true,
            status: true,
            applicationFee: true,
            currencyCode: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Your author application has been created. Pay the application fee to submit it for review.",
        data: {
          authorId: author.id,
          admissionId: author.authorAdmission?.id ?? null,
          name: author.name,
          email: author.email,
          status: author.authorStatus,
          admissionStatus:
            author.authorAdmission?.status ?? "PENDING",
          applicationFee: author.authorAdmission?.applicationFee
            ? Number(author.authorAdmission.applicationFee)
            : applicationFee,
          currencyCode: author.authorAdmission?.currencyCode ?? currencyCode,
          submittedAt: author.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Author registration error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to complete author registration.",
      },
      { status: 500 }
    );
  }
}
