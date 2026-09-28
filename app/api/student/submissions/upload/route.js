import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { uploadToR2 } from "@/lib/r2";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export async function POST(request) {
  try {
    const user = await requireUser();

    if (user.role !== "STUDENT") {
      return NextResponse.json(
        { success: false, error: "Student access required." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const assignmentId = formData.get("assignmentId");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, error: "No file provided." },
        { status: 400 }
      );
    }

    if (!assignmentId || typeof assignmentId !== "string") {
      return NextResponse.json(
        { success: false, error: "Assignment id is required." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Only PDF or DOCX files are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "File is too large (max 15MB)." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `submissions/${user.id}/${assignmentId}/${Date.now()}-${safeName}`;

    await uploadToR2(key, buffer, file.type);

    return NextResponse.json({ success: true, key });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("Assignment file upload error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to upload file." },
      { status: 500 }
    );
  }
}