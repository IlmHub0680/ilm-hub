import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { buildDocumentPdf } from "@/lib/pdf";

export const dynamic = "force-dynamic";

// Renders the currently PUBLISHED academic calendar as a real, downloadable
// PDF, generated on the fly from the same rows every portal displays (no
// separate stored copy to go stale) — same document writer and "Ulul
// Azm Institute" letterhead convention used for transcripts and graduation
// documents (lib/pdf.js).
export async function GET() {
  try {
    await requireUser();

    const calendar = await prisma.academicCalendar.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      include: { entries: { orderBy: [{ sortOrder: "asc" }] } },
    });

    if (!calendar) {
      return NextResponse.json({ success: false, error: "No academic calendar has been published yet." }, { status: 404 });
    }

    const rows = calendar.entries.map((e) => [e.section, e.procedure, e.gregorianDate, e.hijriDate]);

    const pdfBuffer = buildDocumentPdf({
      title: "Academic Calendar",
      subtitle: "Ulul Azm Institute",
      meta: [
        { label: "Academic Year", value: calendar.academicYearLabel },
        { label: "Hijri Year", value: calendar.hijriYearLabel },
        {
          label: "Published On",
          value: calendar.publishedAt
            ? new Date(calendar.publishedAt).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })
            : "",
        },
      ],
      table: {
        headers: ["Semester", "Procedure", "Gregorian Date", "Hijri Date"],
        rows,
        widths: [0.2, 0.42, 0.22, 0.16],
      },
      footerNote:
        "Issued by Ulul Azm Institute's Office of the Registrar. This calendar governs all academic activities for the year stated above.",
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Academic-Calendar-${calendar.academicYearLabel.replace(/\//g, "-")}.pdf"`,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Sign in required." }, { status: 401 });
    }
    console.error("Academic calendar download error:", error);
    return NextResponse.json({ success: false, error: "Unable to generate the academic calendar PDF." }, { status: 500 });
  }
}
