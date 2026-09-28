import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, createLoginSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Changes the password ("passcode") for the currently logged-in user.
// Works for any authenticated User -- the Change Passcode form in the
// student portal (app/login/page.jsx) is the first caller, but nothing
// here is student-specific.
export async function POST(request) {
  try {
    const user = await requireUser();

    const body = await request.json();

    const currentPassword =
      typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword =
      typeof body.newPassword === "string" ? body.newPassword : "";
    const confirmPassword =
      typeof body.confirmPassword === "string" ? body.confirmPassword : "";

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Please complete all passcode fields." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "New passcodes do not match." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "New passcode must be at least 6 characters." },
        { status: 400 }
      );
    }

    const record = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });

    if (!record) {
      return NextResponse.json(
        { success: false, error: "Account not found." },
        { status: 404 }
      );
    }

    const currentValid = await bcrypt.compare(currentPassword, record.passwordHash);

    if (!currentValid) {
      return NextResponse.json(
        { success: false, error: "Current passcode is incorrect." },
        { status: 400 }
      );
    }

    const newHash = await bcrypt.hash(newPassword, 12);

    // Security audit fix -- bumping tokenVersion invalidates every
    // session token issued before this change (e.g. a stolen cookie
    // from another device), not just this browser's cookie. The fresh
    // login session issued right after keeps the device that just
    // changed the passcode signed in, instead of also logging itself
    // out.
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash, tokenVersion: { increment: 1 } },
    });

    await createLoginSession(user.id);

    return NextResponse.json({ success: true, message: "Passcode changed successfully." });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("Change password error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to change passcode." },
      { status: 500 }
    );
  }
}
