import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { resend, isResendConfigured } from "@/lib/resend";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Shared password-reset flow for EVERY portal (student, staff, author,
// bookstore/media) -- there is one User table (see prisma/schema.prisma),
// so one route here serves all of them; no per-portal backend needed.
//
// Uses a signed, time-limited token (HMAC over email+expiry, keyed by
// AUTH_SECRET) instead of a separate database table -- this mirrors
// the existing session-token pattern in lib/auth.ts exactly
// (createSessionToken/verifySessionToken) and needs no schema
// migration, which matters here since this project's Prisma CLI
// cannot reach binaries.prisma.sh from this environment to run one.
const RESET_TOKEN_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }
  return secret;
}

export function createResetToken(email: string): string {
  const secret = getAuthSecret();
  const expiresAt = Date.now() + RESET_TOKEN_MAX_AGE_MS;
  const payload = `${email}.${expiresAt}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return Buffer.from(`${payload}.${signature}`).toString("base64url");
}

export function verifyResetToken(token: string): { email: string } | null {
  try {
    const secret = getAuthSecret();
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const [email, expiresAtRaw, signature] = parts;
    const expiresAt = Number(expiresAtRaw);

    if (!email || !Number.isFinite(expiresAt)) {
      return null;
    }

    if (Date.now() > expiresAt) {
      return null;
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${email}.${expiresAtRaw}`)
      .digest("hex");

    const providedBuffer = new Uint8Array(Buffer.from(signature, "hex"));
    const expectedBuffer = new Uint8Array(
      Buffer.from(expectedSignature, "hex")
    );

    if (providedBuffer.length !== expectedBuffer.length) {
      return null;
    }

    if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
      return null;
    }

    return { email };
  } catch {
    return null;
  }
}

// Same validate-before-trust approach as app/layout.jsx's SITE_URL fix
// earlier this session -- NEXT_PUBLIC_APP_URL has already taken the
// whole build down once by being malformed, so this route never
// trusts it blind even though it's required (not optional) here.
function getValidatedSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL;
  if (!raw) {
    throw new Error("NEXT_PUBLIC_APP_URL is missing.");
  }
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("non-http(s) scheme");
    }
    return raw.replace(/\/+$/, "");
  } catch {
    throw new Error(
      `NEXT_PUBLIC_APP_URL ("${raw}") is not a valid http(s) URL.`
    );
  }
}

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    // Generic message returned in every case below, whether or not the
    // email matches an account -- this is deliberate: telling a visitor
    // "no account with that email" lets anyone enumerate which emails
    // are registered on the site. The account/forgot-password page
    // already shows this exact wording as its default message.
    const genericMessage =
      "If an account exists with that email, password reset instructions have been sent.";

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    // Deliberately the SAME response shape/status whether or not a
    // user was found -- see genericMessage above.
    if (!user) {
      return NextResponse.json({ success: true, message: genericMessage });
    }

    if (!isResendConfigured) {
      console.warn(
        "[auth/forgot-password] RESEND_API_KEY is not set -- skipping reset email send."
      );
      return NextResponse.json({ success: true, message: genericMessage });
    }

    const fromAddress = process.env.ADMISSIONS_EMAIL_FROM;
    if (!fromAddress) {
      console.warn(
        "[auth/forgot-password] ADMISSIONS_EMAIL_FROM is not set -- skipping reset email send."
      );
      return NextResponse.json({ success: true, message: genericMessage });
    }

    let siteUrl: string;
    try {
      siteUrl = getValidatedSiteUrl();
    } catch (error) {
      console.error("[auth/forgot-password] Site URL error:", error);
      return NextResponse.json({ success: true, message: genericMessage });
    }

    const token = createResetToken(user.email);
    const resetUrl = `${siteUrl}/account/reset-password?token=${encodeURIComponent(
      token
    )}`;

    try {
      await resend.emails.send({
        from: fromAddress,
        to: user.email,
        subject: "Reset your Ulul Azm Institute password",
        html: `
          <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
            <p>Dear ${escapeHtml(user.name)},</p>
            <p>
              We received a request to reset the password for your Ulul Azm
              Institute account. Click the link below to choose a new
              password. This link expires in 1 hour.
            </p>
            <p>
              <a href="${resetUrl}" style="color: #1a5c38;">Reset your password</a>
            </p>
            <p>
              If you didn't request this, you can safely ignore this email --
              your password will not be changed.
            </p>
            <p>With warm regards,<br />Ulul Azm Institute</p>
          </div>
        `,
      });
    } catch (error) {
      console.error("[auth/forgot-password] Failed to send reset email:", error);
      // Still return the generic success message -- a send failure on
      // our end shouldn't reveal to the caller whether the account
      // exists, and shouldn't be treated as the requester's error.
    }

    return NextResponse.json({ success: true, message: genericMessage });
  } catch (error) {
    console.error("[auth/forgot-password] error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to process the request." },
      { status: 500 }
    );
  }
}
