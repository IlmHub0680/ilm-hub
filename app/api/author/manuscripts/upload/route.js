import { NextResponse } from "next/server";
import { requireApprovedAuthor } from "@/lib/auth";
import { uploadToR2 } from "@/lib/r2";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/epub+zip",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

export async function POST(request) {
  try {
    const user = await requireApprovedAuthor();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, error: "No manuscript file provided." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Only PDF or Word documents are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "File is too large (max 25MB)." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `manuscripts/${user.id}/${Date.now()}-${safeName}`;

    await uploadToR2(key, buffer, file.type);

    const base =
      (process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin).replace(/\/$/, "");
    const manuscriptUrl = `${base}/api/publishing/manuscripts/file?key=${encodeURIComponent(key)}`;

    return NextResponse.json({ success: true, key, manuscriptUrl });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    if (
      error instanceof Error &&
      (error.message === "FORBIDDEN" || error.message === "AUTHOR_NOT_APPROVED")
    ) {
      return NextResponse.json(
        { success: false, error: "Approved author access is required." },
        { status: 403 }
      );
    }

    console.error("Manuscript upload error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to upload manuscript." },
      { status: 500 }
    );
  }
}
