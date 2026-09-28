import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdvisor } from "@/lib/permissions";

export const dynamic = "force-dynamic";

// The placement queue: every ADMITTED student not yet placed, plus any
// student whose placement assessment has been started but not
// completed. Deliberately NOT scoped to "my advisees" — Academy
// Pathways §8 assigns placement to Academic Advising / the relevant
// Department as a function, not to one pre-assigned personal advisor,
// and a newly admitted student usually has no advisor yet (that
// assignment normally follows placement, once a programme is set).
export async function GET() {
  try {
    await requireAdvisor();

    const students = await prisma.studentProfile.findMany({
      where: {
        OR: [
          { status: "ADMITTED" },
          { placementAssessment: { status: { not: "COMPLETED" } } },
        ],
      },
      include: {
        user: { select: { name: true, email: true } },
        program: { select: { id: true, nameEn: true } },
        department: { select: { nameEn: true } },
        placementAssessment: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Self-reported placement inputs live on the approved
    // AdmissionApplication (Model 9's application-form fields) — there
    // is no direct relation from StudentProfile to it, since a student
    // can exist without ever having applied through this exact flow,
    // so the match is by email.
    const emails = students.map((s) => s.user.email);

    const applications = emails.length
      ? await prisma.admissionApplication.findMany({
          where: { email: { in: emails }, status: "APPROVED" },
          orderBy: { createdAt: "desc" },
        })
      : [];

    const applicationByEmail = new Map();
    for (const app of applications) {
      if (!applicationByEmail.has(app.email)) {
        applicationByEmail.set(app.email, app);
      }
    }

    return NextResponse.json({
      students: students.map((s) => {
        const app = applicationByEmail.get(s.user.email) || null;

        return {
          id: s.id,
          name: s.user.name,
          email: s.user.email,
          studentNo: s.studentNo,
          status: s.status,
          programme: s.program?.nameEn ?? null,
          department: s.department?.nameEn ?? null,
          placementAssessment: s.placementAssessment,
          selfReported: app
            ? {
                islamicStudiesBackground: app.islamicStudiesBackground,
                pathwayPreference: app.pathwayPreference,
                quranReadingSelf: app.quranReadingSelf,
                quranTajweedSelf: app.quranTajweedSelf,
                quranHifzSelf: app.quranHifzSelf,
                quranRecitationSelf: app.quranRecitationSelf,
                arabicReadingSelf: app.arabicReadingSelf,
                arabicWritingSelf: app.arabicWritingSelf,
                arabicGrammarSelf: app.arabicGrammarSelf,
                arabicVocabularySelf: app.arabicVocabularySelf,
                arabicConversationSelf: app.arabicConversationSelf,
                quranicArabicSelf: app.quranicArabicSelf,
              }
            : null,
        };
      }),
    });
  } catch (error) {
    console.error("Placement queue error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ error: "Failed to load the placement queue." }, { status: 500 });
  }
}
