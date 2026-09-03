import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

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

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, email and password are required.",
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
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Your author application has been submitted for review.",
        data: {
          authorId: author.id,
          admissionId: author.authorAdmission?.id ?? null,
          name: author.name,
          email: author.email,
          status: author.authorStatus,
          admissionStatus:
            author.authorAdmission?.status ?? "PENDING",
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
