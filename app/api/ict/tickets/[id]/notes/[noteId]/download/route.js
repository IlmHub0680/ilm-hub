import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";
import { getR2PresignedUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    await requireModulePermission("ICT_OPS", "view");

    const { noteId } = await params;

    const note = await prisma.iCTTicketNote.findUnique({ where: { id: noteId } });

    if (!note || !note.attachmentUrl) {
      return NextResponse.json({ success: false, error: "Attachment not found." }, { status: 404 });
    }

    const url = await getR2PresignedUrl(note.attachmentUrl, 300);

    return NextResponse.json({ success: true, url });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (error?.message === "FORBIDDEN") {
      return NextResponse.json({ success: false, error: "ICT access required" }, { status: 403 });
    }

    console.error("ICT ticket note attachment download error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to generate download link." },
      { status: 500 }
    );
  }
}
