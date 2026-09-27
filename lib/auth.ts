import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";
import type { Role, AuthorStatus } from "@prisma/client";

const SESSION_COOKIE_NAME = "memo_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  authorStatus: AuthorStatus;
};

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }

  return secret;
}

function createSessionToken(userId: string, tokenVersion: number): string {
  const secret = getAuthSecret();
  const timestamp = Date.now().toString();

  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${userId}.${tokenVersion}.${timestamp}`)
    .digest("hex");

  return `${userId}.${tokenVersion}.${timestamp}.${signature}`;
}

function verifySessionToken(
  token: string
): { userId: string; tokenVersion: number } | null {
  try {
    const secret = getAuthSecret();
    const parts = token.split(".");

    if (parts.length !== 4) {
      return null;
    }

    const [userId, tokenVersionRaw, timestamp, signature] = parts;

    if (!userId || !tokenVersionRaw || !timestamp || !signature) {
      return null;
    }

    const tokenVersion = Number(tokenVersionRaw);

    if (!Number.isFinite(tokenVersion) || tokenVersion < 0) {
      return null;
    }

    const timestampNumber = Number(timestamp);

    if (!Number.isFinite(timestampNumber)) {
      return null;
    }

    const age = Date.now() - timestampNumber;

    if (age < 0 || age > SESSION_MAX_AGE * 1000) {
      return null;
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${userId}.${tokenVersion}.${timestamp}`)
      .digest("hex");

    const providedBuffer = new Uint8Array(
      Buffer.from(signature, "hex")
    );

    const expectedBuffer = new Uint8Array(
      Buffer.from(expectedSignature, "hex")
    );

    if (providedBuffer.length !== expectedBuffer.length) {
      return null;
    }

    if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
      return null;
    }

    return { userId, tokenVersion };
  } catch {
    return null;
  }
}

export async function createLoginSession(userId: string) {
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { tokenVersion: true },
  });

  const token = createSessionToken(userId, currentUser?.tokenVersion ?? 0);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearLoginSession() {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

// Security audit fix -- invalidates every session token issued before
// the user's most recent password change (or a future "log out of all
// devices" action), by comparing the tokenVersion embedded in the
// cookie against the User row's current tokenVersion. A stale token
// (old version) is rejected here even though its HMAC signature is
// still cryptographically valid, closing the "stolen token still works
// after password change" gap.
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const verified = verifySessionToken(token);

    if (!verified) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: verified.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        authorStatus: true,
        tokenVersion: true,
      },
    });

    if (!user) {
      await clearLoginSession();
      return null;
    }

    if (user.tokenVersion !== verified.tokenVersion) {
      await clearLoginSession();
      return null;
    }

    const { tokenVersion, ...sessionUser } = user;

    return sessionUser;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}

export async function requireInstructor(): Promise<SessionUser> {
  const { requireModulePermission } = await import("@/lib/permissions");

  return requireModulePermission("COURSES_GRADES", "view");
}

export async function requireInstructorEdit(): Promise<SessionUser> {
  const { requireModulePermission } = await import("@/lib/permissions");

  return requireModulePermission("COURSES_GRADES", "edit");
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();

  if (
    user.role !== "ADMIN" &&
    user.role !== "SUPER_ADMIN"
  ) {
    throw new Error("FORBIDDEN");
  }

  return user;
}

export async function requireApprovedAuthor(): Promise<SessionUser> {
  const user = await requireUser();

  if (user.role !== "AUTHOR") {
    throw new Error("FORBIDDEN");
  }

  if (user.authorStatus !== "APPROVED") {
    throw new Error("AUTHOR_NOT_APPROVED");
  }

  return user;
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<SessionUser | null> {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      authorStatus: true,
      passwordHash: true,
    },
  });

  if (!user) {
    return null;
  }

  const passwordValid = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordValid) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    authorStatus: user.authorStatus,
  };
}
