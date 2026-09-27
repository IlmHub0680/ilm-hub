import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdvisor } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const SELF_RATED_LEVELS = ["NONE", "BEGINNER", "INTERMEDIATE", "ADVANCED", "PROFICIENT"];
const PLACEMENT_STATUSES = ["PENDING", "SCHEDULED", "IN_PROGRESS", "COMPLETED"];

function normalizeLevel(value: unknown) {
  return typeof value === "string" && SELF_RATED_LEVELS.includes(value) ? value : null;
}

// Records or updates a student's Placement result — the evidence-based
// assessment Academy Pathways §8 requires before a learner is confirmed
// into a pathway. Completing it (status COMPLETED, with a recommended
// pathway) is what moves the student from ADMITTED to ACTIVE and, when
// a specific programme was recommended, sets their StudentProfile's
// programme — the handoff into Registration/Enrollment.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { staff } = await requireAdvisor();

    const { studentId } = await params;

    const student = await prisma.studentProfile.findUnique({ where: { id: studentId } });

    if (!student) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    const body = await request.json();

    const status = PLACEMENT_STATUSES.includes(body.status) ? body.status : "IN_PROGRESS";

    if (status === "COMPLETED" && !(typeof body.recommendedPathway === "string" && body.recommendedPathway.trim())) {
      return NextResponse.json(
        { error: "A recommended pathway is required to complete placement." },
        { status: 400 }
      );
    }

    const data = {
      status,
      quranReadingLevel: normalizeLevel(body.quranReadingLevel),
      quranTajweedLevel: normalizeLevel(body.quranTajweedLevel),
      quranHifzLevel: normalizeLevel(body.quranHifzLevel),
      quranRecitationLevel: normalizeLevel(body.quranRecitationLevel),
      arabicReadingLevel: normalizeLevel(body.arabicReadingLevel),
      arabicWritingLevel: normalizeLevel(body.arabicWritingLevel),
      arabicGrammarLevel: normalizeLevel(body.arabicGrammarLevel),
      arabicVocabularyLevel: normalizeLevel(body.arabicVocabularyLevel),
      arabicConversationLevel: normalizeLevel(body.arabicConversationLevel),
      quranicArabicLevel: normalizeLevel(body.quranicArabicLevel),
      recommendedPathway:
        typeof body.recommendedPathway === "string" && body.recommendedPathway.trim()
          ? body.recommendedPathway.trim()
          : null,
      recommendedProgramId:
        typeof body.recommendedProgramId === "string" && body.recommendedProgramId.trim()
          ? body.recommendedProgramId.trim()
          : null,
      assessorNote: typeof body.assessorNote === "string" ? body.assessorNote.trim() || null : null,
      assessedByStaffId: staff.id,
      completedAt: status === "COMPLETED" ? new Date() : null,
    };

    const assessment = await prisma.$transaction(async (tx) => {
      const saved = await tx.placementAssessment.upsert({
        where: { studentId },
        update: data,
        create: { studentId, ...data },
      });

      if (status === "COMPLETED") {
        await tx.studentProfile.update({
          where: { id: studentId },
          data: {
            status: "ACTIVE",
            ...(data.recommendedProgramId ? { programId: data.recommendedProgramId } : {}),
          },
        });
      }

      return saved;
    });

    return NextResponse.json({ success: true, data: assessment });
  } catch (error) {
    console.error("Placement assessment save error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ error: "Failed to save the placement assessment." }, { status: 500 });
  }
}
