import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { uploadToR2, deleteFromR2, getR2PresignedUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// Persists a profile picture to R2 and stores its key on the User row.
// Replaces the previous behaviour of app/login/page.jsx's
// handleProfilePicture, which only read the file into a data: URL in
// React state -- never uploaded anywhere, so it reverted on refresh.
export async function POST(request) {
  try {
    const user = await requireUser();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, error: "No file provided." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Please select a JPG, PNG or WEBP image." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "Image is too large (max 5MB)." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `avatars/${user.id}/${Date.now()}-${safeName}`;

    await uploadToR2(key, buffer, file.type);

    const existing = await prisma.user.findUnique({
      where: { id: user.id },
      select: { avatarUrl: true },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: key },
    });

    if (existing?.avatarUrl) {
      try {
        await deleteFromR2(existing.avatarUrl);
      } catch (cleanupError) {
        console.error("Old avatar cleanup error:", cleanupError);
      }
    }

    const url = await getR2PresignedUrl(key, 3600);

    return NextResponse.json({ success: true, url });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("Profile photo upload error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to upload profile picture." },
      { status: 500 }
    );
  }
}
