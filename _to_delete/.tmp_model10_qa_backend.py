# -*- coding: utf-8 -*-
import io

def r1(c, old, new, label):
    n = c.count(old)
    assert n == 1, "%s: expected 1, found %d" % (label, n)
    return c.replace(old, new)

def load(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()

def save(p, c):
    with io.open(p, "w", encoding="utf-8") as f:
        f.write(c)


# ---------------------------------------------------------------------
# 1. /api/qa/portal — add the staff subject list + course-evaluation
#    and improvement-plan summary stats.
# ---------------------------------------------------------------------
path = "app/api/qa/portal/route.ts"
c = load(path)
c = r1(
    c,
    """      prisma.department.findMany({
        select: { id: true, nameEn: true },
        orderBy: { nameEn: "asc" },
      }),
      prisma.faculty.findMany({
        select: { id: true, nameEn: true },
        orderBy: { nameEn: "asc" },
      }),
    ]);""",
    """      prisma.department.findMany({
        select: { id: true, nameEn: true },
        orderBy: { nameEn: "asc" },
      }),
      prisma.faculty.findMany({
        select: { id: true, nameEn: true },
        orderBy: { nameEn: "asc" },
      }),
    ]);

    const [staff, openImprovementPlanCount, evaluationCount, evaluationAvg] = await Promise.all([
      prisma.staffProfile.findMany({
        where: { isActive: true, position: { isAcademic: true } },
        select: { id: true, user: { select: { name: true } } },
        orderBy: { user: { name: "asc" } },
      }),
      prisma.qualityReview.count({ where: { improvementStatus: { in: ["PENDING", "IN_PROGRESS"] } } }),
      prisma.courseEvaluation.count(),
      prisma.courseEvaluation.aggregate({ _avg: { ratingOverall: true } }),
    ]);""",
    "qa portal extra data",
)
c = r1(
    c,
    """      subjects: {
        programs,
        courses,
        departments,
        faculties,
      },
    });""",
    """      subjects: {
        programs,
        courses,
        departments,
        faculties,
        staff: staff.map((s) => ({ id: s.id, nameEn: s.user.name })),
      },
      openImprovementPlanCount,
      courseEvaluations: {
        count: evaluationCount,
        avgOverall: evaluationAvg._avg.ratingOverall,
      },
    });""",
    "qa portal response payload",
)
save(path, c)
print("updated", path)

# ---------------------------------------------------------------------
# 2. /api/qa/reviews — STAFF subject type (instructor evaluation) +
#    evidenceUrls on create.
# ---------------------------------------------------------------------
path = "app/api/qa/reviews/route.ts"
c = load(path)
c = r1(
    c,
    'const VALID_SUBJECT_TYPES = ["PROGRAM", "COURSE", "DEPARTMENT", "FACULTY"];\n\nconst SUBJECT_FIELD: Record<string, string> = {\n  PROGRAM: "programId",\n  COURSE: "courseId",\n  DEPARTMENT: "departmentId",\n  FACULTY: "facultyId",\n};',
    'const VALID_SUBJECT_TYPES = ["PROGRAM", "COURSE", "DEPARTMENT", "FACULTY", "STAFF"];\n\nconst SUBJECT_FIELD: Record<string, string> = {\n  PROGRAM: "programId",\n  COURSE: "courseId",\n  DEPARTMENT: "departmentId",\n  FACULTY: "facultyId",\n  STAFF: "staffId",\n};',
    "qa reviews subject types + field map",
)
c = r1(
    c,
    """      include: {
        program: { select: { nameEn: true } },
        course: { select: { titleEn: true } },
        department: { select: { nameEn: true } },
        faculty: { select: { nameEn: true } },
        reviewedBy: { include: { user: { select: { name: true } } } },
      },""",
    """      include: {
        program: { select: { nameEn: true } },
        course: { select: { titleEn: true } },
        department: { select: { nameEn: true } },
        faculty: { select: { nameEn: true } },
        staff: { select: { user: { select: { name: true } } } },
        reviewedBy: { include: { user: { select: { name: true } } } },
      },""",
    "qa reviews GET include staff",
)
c = r1(
    c,
    """        subjectName:
          r.program?.nameEn ||
          r.course?.titleEn ||
          r.department?.nameEn ||
          r.faculty?.nameEn ||
          "Unknown",
        reviewType: r.reviewType,
        status: r.status,
        outcome: r.outcome,
        findings: r.findings,
        recommendation: r.recommendation,
        followUpDate: r.followUpDate,
        createdAt: r.createdAt,
        completedAt: r.completedAt,
        reviewedByName: r.reviewedBy.user.name,
      })),""",
    """        subjectName:
          r.program?.nameEn ||
          r.course?.titleEn ||
          r.department?.nameEn ||
          r.faculty?.nameEn ||
          r.staff?.user?.name ||
          "Unknown",
        reviewType: r.reviewType,
        status: r.status,
        outcome: r.outcome,
        findings: r.findings,
        recommendation: r.recommendation,
        improvementStatus: r.improvementStatus,
        evidenceUrls: r.evidenceUrls,
        followUpDate: r.followUpDate,
        createdAt: r.createdAt,
        completedAt: r.completedAt,
        reviewedByName: r.reviewedBy.user.name,
      })),""",
    "qa reviews GET payload fields",
)
c = r1(
    c,
    """    const followUpDate =
      typeof body.followUpDate === "string" && body.followUpDate
        ? new Date(body.followUpDate)
        : null;""",
    """    const followUpDate =
      typeof body.followUpDate === "string" && body.followUpDate
        ? new Date(body.followUpDate)
        : null;
    const evidenceUrls = Array.isArray(body.evidenceUrls)
      ? body.evidenceUrls.map((u: unknown) => String(u).trim()).filter(Boolean)
      : [];""",
    "qa reviews POST evidenceUrls parse",
)
c = r1(
    c,
    """        reviewType,
        findings: findings || "Review scheduled — findings pending.",
        followUpDate,
        reviewedById: staff.id,
      },""",
    """        reviewType,
        findings: findings || "Review scheduled — findings pending.",
        followUpDate,
        evidenceUrls,
        reviewedById: staff.id,
      },""",
    "qa reviews POST create data",
)
save(path, c)
print("updated", path)

# ---------------------------------------------------------------------
# 3. /api/qa/reviews/[id] — complete action gains improvementStatus +
#    evidenceUrls; a new update_progress action tracks an improvement
#    plan after completion without re-completing the review.
# ---------------------------------------------------------------------
path = "app/api/qa/reviews/[id]/route.ts"
c = load(path)
c = r1(
    c,
    'const VALID_OUTCOMES = [\n  "COMPLIANT",\n  "MINOR_NON_COMPLIANCE",\n  "MAJOR_NON_COMPLIANCE",\n];',
    'const VALID_OUTCOMES = [\n  "COMPLIANT",\n  "MINOR_NON_COMPLIANCE",\n  "MAJOR_NON_COMPLIANCE",\n];\n\nconst VALID_IMPROVEMENT_STATUSES = ["NOT_REQUIRED", "PENDING", "IN_PROGRESS", "COMPLETED"];',
    "qa review id valid improvement statuses",
)
c = r1(
    c,
    """      const updated = await prisma.qualityReview.update({
        where: { id },
        data: {
          status: "COMPLETED",
          findings,
          recommendation,
          outcome: outcome as any,
          completedAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, data: updated });
    }

    return errorResponse("Unknown action", 400);""",
    """      const improvementStatus = VALID_IMPROVEMENT_STATUSES.includes(body.improvementStatus)
        ? body.improvementStatus
        : recommendation
          ? "PENDING"
          : "NOT_REQUIRED";
      const evidenceUrls = Array.isArray(body.evidenceUrls)
        ? body.evidenceUrls.map((u: unknown) => String(u).trim()).filter(Boolean)
        : existing.evidenceUrls;

      const updated = await prisma.qualityReview.update({
        where: { id },
        data: {
          status: "COMPLETED",
          findings,
          recommendation,
          outcome: outcome as any,
          improvementStatus: improvementStatus as any,
          evidenceUrls,
          completedAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, data: updated });
    }

    // Tracks an improvement plan (and adds evidence) after a review has
    // already been completed — a review's improvement plan is often
    // followed up over several later visits, not resolved in one step.
    if (action === "update_progress") {
      if (existing.status !== "COMPLETED") {
        return errorResponse("Only a completed review has an improvement plan to update", 409);
      }

      const improvementStatus = VALID_IMPROVEMENT_STATUSES.includes(body.improvementStatus)
        ? body.improvementStatus
        : existing.improvementStatus;
      const evidenceUrls = Array.isArray(body.evidenceUrls)
        ? Array.from(new Set([...existing.evidenceUrls, ...body.evidenceUrls.map((u: unknown) => String(u).trim()).filter(Boolean)]))
        : existing.evidenceUrls;

      const updated = await prisma.qualityReview.update({
        where: { id },
        data: {
          improvementStatus: improvementStatus as any,
          evidenceUrls,
        },
      });

      return NextResponse.json({ success: true, data: updated });
    }

    return errorResponse("Unknown action", 400);""",
    "qa review id complete + update_progress",
)
save(path, c)
print("updated", path)

print("\nQA backend extended for instructor evaluation, improvement plans, and evidence.")
