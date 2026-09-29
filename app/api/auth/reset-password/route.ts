import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { verifyResetToken } from "../forgot-password/route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const token = typeof body.token === "string" ? body.token : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Reset link is missing or invalid." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    const verified = verifyResetToken(token);

    if (!verified) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This reset link is invalid or has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: verified.email },
      select: { id: true },
    });

    if (!user) {
      // Token was validly signed but the account no longer exists --
      // same generic-sounding failure as an expired/invalid token, so
      // this doesn't confirm or deny account existence either.
      return NextResponse.json(
        {
          success: false,
          error:
            "This reset link is invalid or has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        // Bumping tokenVersion signs the user out of every device/
        // session that was active before this reset -- same reasoning
        // as the "Security audit fix" already applied to password
        // changes elsewhere (see lib/auth.ts's tokenVersion comment):
        // a stolen session token must stop working once the password
        // it was issued under is no longer valid.
        tokenVersion: { increment: 1 },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Your password has been updated. You can now sign in.",
    });
  } catch (error) {
    console.error("[auth/reset-password] error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to reset your password." },
      { status: 500 }
    );
  }
}
