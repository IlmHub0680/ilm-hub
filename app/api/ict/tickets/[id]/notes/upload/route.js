import { NextResponse } from "next/server";
import { requireModulePermission } from "@/lib/permissions";
import { uploadToR2 } from "@/lib/r2";

export const dynamic = "force-dynamic";

// Same R2 upload pattern as app/api/student/requests/upload/route.js
// (the transcript-request attachment flow) -- reused rather than a
// new upload mechanism. Returns the R2 key, to be passed as
// attachmentKey to the notes POST route.
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

const MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export async function POST(request, { params }) {
  try {
    await requireModulePermission("ICT_OPS", "edit");

    const { id } = await params;

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
        { success: false, error: "Only PDF, DOCX, JPG or PNG files are allowed." },
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
    const key = `ict-tickets/${id}/${Date.now()}-${safeName}`;

    await uploadToR2(key, buffer, file.type);

    return NextResponse.json({ success: true, key });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (error?.message === "FORBIDDEN") {
      return NextResponse.json({ success: false, error: "ICT edit access required" }, { status: 403 });
    }

    console.error("ICT ticket note attachment upload error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to upload file." },
      { status: 500 }
    );
  }
}
