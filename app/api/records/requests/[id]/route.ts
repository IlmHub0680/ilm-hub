import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";
import { buildDocumentPdf } from "@/lib/pdf";
import { uploadToR2 } from "@/lib/r2";
import { gradeLetter, computeGpa, latestGradeByCourse } from "@/lib/grading";
import { generateVerificationCode } from "@/lib/verificationCode";
import { logAudit } from "@/lib/auditLog";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actingUser = await requireModulePermission("ACADEMIC_RECORDS", "edit");

    const { id } = await params;
    const body = await request.json();
    const action = typeof body.action === "string" ? body.action : "";

    const existing = await prisma.request.findUnique({ where: { id } });

    if (!existing || existing.type !== "TRANSCRIPT") {
      return errorResponse("Transcript request not found", 404);
    }

    if (existing.status === "COMPLETED" || existing.status === "REJECTED") {
      return errorResponse(`Request is already ${existing.status.toLowerCase()}`, 409);
    }

    if (action === "reject") {
      const responseNote =
        typeof body.responseNote === "string" ? body.responseNote.trim() : undefined;

      const updated = await prisma.request.update({
        where: { id },
        data: { status: "REJECTED", resolvedAt: new Date(), responseNote },
      });

      await logAudit({
        actor: actingUser,
        action: "TRANSCRIPT_REJECTED",
        category: "ACADEMIC_RECORD_ADJUSTMENT",
        targetType: "Request",
        targetId: id,
        summary: `Transcript request ${id} rejected${responseNote ? ` — ${responseNote}` : ""}`,
        metadata: { previousStatus: existing.status, responseNote: responseNote ?? null },
      });

      return NextResponse.json({ success: true, data: updated });
    }

    if (action === "issue") {
      // Real GPA — computed live from this student's actual final
      // grades and each course's real credit hours (lib/grading.js),
      // exactly like the student portal and the graduation documents.
      // Never a manually-entered figure, so the transcript always
      // agrees with what the student sees in their own portal.
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { id: existing.studentId },
        include: {
          user: { select: { name: true, email: true } },
          program: { select: { nameEn: true, level: true } },
        },
      });

      const [grades, termRecords] = await Promise.all([
        studentProfile
          ? prisma.grade.findMany({
              where: { studentId: studentProfile.userId },
              include: { course: true, term: { select: { name: true } } },
            })
          : Promise.resolve([]),
        prisma.termRecord.findMany({
          where: { studentId: existing.studentId },
          include: { term: { select: { name: true, startDate: true } } },
          orderBy: { term: { startDate: "asc" } },
        }),
      ]);

      // A repeated course can now have more than one Grade row on
      // record (see lib/grading.js). termGpaGrades keeps every
      // attempt -- a course can only have one Grade row per actual
      // term, so filtering this by a single termId gives that term's
      // real courses/grades, used for the per-term rows below.
      // cgpaGrades collapses to each course's most recently saved
      // attempt so a repeated course is never counted twice toward
      // the cumulative figure.
      const termGpaGrades = grades.map((g) => ({
        letter: gradeLetter(g.final),
        creditHours: g.course.creditHours,
        termId: g.termId,
      }));
      const latestGrades = Array.from(latestGradeByCourse(grades).values());
      const cgpaGrades = latestGrades.map((g) => ({
        letter: gradeLetter(g.final),
        creditHours: g.course.creditHours,
        termId: g.termId,
      }));

      const cumulativeGpa = computeGpa(cgpaGrades);
      const roundedCumulative = cumulativeGpa ?? 0;

      const result = await prisma.$transaction(async (tx) => {
        const issue = await tx.transcriptIssue.create({
          data: {
            studentId: existing.studentId,
            requestId: existing.id,
            pdfUrl: `pending/${existing.id}`,
            cumulative: roundedCumulative,
            verificationCode: generateVerificationCode(),
          },
        });

        const updatedRequest = await tx.request.update({
          where: { id },
          data: { status: "COMPLETED", resolvedAt: new Date() },
        });

        return { issue, updatedRequest };
      });

      // Generate the real transcript PDF and store it in R2, then point
      // the issue record at the real file instead of the placeholder key.
      try {
        const termRows = termRecords;

        const pdfBuffer = buildDocumentPdf({
          title: "Official Academic Transcript",
          subtitle: "Ulul Azm Institute",
          meta: [
            { label: "Student Name", value: studentProfile?.user?.name || "" },
            { label: "Student No", value: studentProfile?.studentNo || "" },
            { label: "Programme", value: studentProfile?.program?.nameEn || "" },
            { label: "Level", value: studentProfile?.program?.level || "" },
            {
              label: "Cumulative GPA",
              value: cumulativeGpa != null ? cumulativeGpa.toFixed(2) : "N/A",
            },
            {
              label: "Issued On",
              value: new Date().toLocaleDateString("en-GB", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
            },
          ],
          table: {
            headers: ["Term", "GPA", "Credits Attempted", "Credits Earned", "Standing"],
            rows: termRows.map((t) => {
              const termGpa = computeGpa(termGpaGrades.filter((g) => g.termId === t.termId));
              return [
                t.term?.name || "",
                termGpa != null ? termGpa.toFixed(2) : "N/A",
                String(t.creditsAttempted),
                String(t.creditsEarned),
                t.standing.replace(/_/g, " "),
              ];
            }),
            widths: [0.3, 0.13, 0.19, 0.17, 0.21],
          },
          footerNote:
            "This transcript was generated by Ulul Azm Institute's Academic Records office and reflects the academic record on file at the time of issue.",
        });

        const pdfKey = `transcripts/${existing.studentId}/${result.issue.id}.pdf`;
        await uploadToR2(pdfKey, pdfBuffer, "application/pdf");

        await prisma.transcriptIssue.update({
          where: { id: result.issue.id },
          data: { pdfUrl: pdfKey },
        });

        result.issue.pdfUrl = pdfKey;
      } catch (pdfError) {
        // The request is still marked COMPLETED and the issue record exists;
        // if PDF generation/upload fails (e.g. R2 misconfigured), the issue
        // keeps a "pending/<requestId>" placeholder key so records staff can
        // see it needs manual regeneration rather than silently failing.
        console.error("Transcript PDF generation error:", pdfError);
      }

      await logAudit({
        actor: actingUser,
        action: "TRANSCRIPT_ISSUED",
        category: "ACADEMIC_RECORD_ADJUSTMENT",
        targetType: "TranscriptIssue",
        targetId: result.issue.id,
        summary: `Transcript issued for request ${id} (cumulative GPA ${cumulativeGpa != null ? cumulativeGpa.toFixed(2) : "N/A"})`,
        metadata: { requestId: id, previousStatus: existing.status, cumulative: roundedCumulative },
      });

      return NextResponse.json({
        success: true,
        data: { ...result, issue: { ...result.issue, pdfUrl: result.issue.pdfUrl ? true : null } },
      });
    }

    return errorResponse("Unknown action", 400);
  } catch (error) {
    console.error("Records request update error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Academic Records edit access required", 403);

    return errorResponse("Failed to update transcript request", 500);
  }
}
