import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "memo_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "AUTHOR" | "ADMIN" | "SUPER_ADMIN";
  authorStatus: "PENDING" | "APPROVED" | "REJECTED";
};

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }

  return secret;
}

function createSessionToken(userId: string): string {
  const secret = getAuthSecret();

  const timestamp = Date.now().toString();

  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${userId}.${timestamp}`)
    .digest("hex");

  return `${userId}.${timestamp}.${signature}`;
}

function verifySessionToken(token: string): string | null {
  try {
    const secret = getAuthSecret();

    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const [userId, timestamp, signature] = parts;

    if (!userId || !timestamp || !signature) {
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
      .update(`${userId}.${timestamp}`)
      .digest("hex");

    const providedBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (providedBuffer.length !== expectedBuffer.length) {
      return null;
    }

    if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
      return null;
    }

    return userId;
  } catch {
    return null;
  }
}

export async function createLoginSession(userId: string) {
  const token = createSessionToken(userId);

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

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const userId = verifySessionToken(token);

    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        authorStatus: true,
      },
    });

    if (!user) {
      await clearLoginSession();
      return null;
    }

    return user;
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

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
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
