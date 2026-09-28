# -*- coding: utf-8 -*-
import io

PATH = "app/api/dean/portal/route.ts"

with io.open(PATH, "r", encoding="utf-8") as f:
    c = f.read()


def r1(c, old, new, label):
    n = c.count(old)
    assert n == 1, "%s: expected 1, found %d" % (label, n)
    return c.replace(old, new)


c = r1(
    c,
    """    const [departmentCount, programCount, staffCount, studentCount, announcements] =
      await Promise.all([
        prisma.department.count({ where: { facultyId: faculty.id } }),
        prisma.program.count({ where: { facultyId: faculty.id } }),
        prisma.staffProfile.count({ where: { facultyId: faculty.id, isActive: true } }),
        prisma.studentProfile.count({ where: { facultyId: faculty.id } }),
        prisma.announcement.findMany({
          where: { facultyId: faculty.id },
          orderBy: { publishedAt: "desc" },
          take: 20,
        }),
      ]);""",
    """    const [departmentCount, programCount, staffCount, studentCount, announcements, programs, atRiskCount, termRecords, graduationCandidates, qualityReviews] =
      await Promise.all([
        prisma.department.count({ where: { facultyId: faculty.id } }),
        prisma.program.count({ where: { facultyId: faculty.id } }),
        prisma.staffProfile.count({ where: { facultyId: faculty.id, isActive: true } }),
        prisma.studentProfile.count({ where: { facultyId: faculty.id } }),
        prisma.announcement.findMany({
          where: { facultyId: faculty.id },
          orderBy: { publishedAt: "desc" },
          take: 20,
        }),
        prisma.program.findMany({
          where: { facultyId: faculty.id },
          select: {
            id: true,
            nameEn: true,
            level: true,
            isActive: true,
            department: { select: { nameEn: true } },
            coordinator: { select: { user: { select: { name: true } } } },
            _count: { select: { courses: true, students: true } },
          },
          orderBy: { nameEn: "asc" },
        }),
        prisma.studentProfile.count({
          where: {
            facultyId: faculty.id,
            termRecords: { some: { standing: { in: ["PROBATION", "SUSPENDED"] } } },
          },
        }),
        prisma.termRecord.findMany({
          where: { student: { facultyId: faculty.id } },
          orderBy: { createdAt: "desc" },
          take: 500,
          select: { gpa: true },
        }),
        prisma.graduationApplication.findMany({
          where: { program: { facultyId: faculty.id }, status: { in: ["ELIGIBLE", "APPLIED", "CLEARANCE_IN_PROGRESS"] } },
          select: { id: true, status: true, student: { select: { studentNo: true, user: { select: { name: true } } } } },
          take: 100,
        }),
        prisma.qualityReview.findMany({
          where: {
            OR: [
              { facultyId: faculty.id },
              { department: { facultyId: faculty.id } },
              { program: { facultyId: faculty.id } },
            ],
          },
          select: { id: true, outcome: true, improvementStatus: true },
        }),
      ]);

    const avgGpa =
      termRecords.length > 0
        ? termRecords.reduce((sum, t) => sum + t.gpa, 0) / termRecords.length
        : null;

    const qualityIndicators = {
      totalReviews: qualityReviews.length,
      compliant: qualityReviews.filter((r) => r.outcome === "COMPLIANT").length,
      minorNonCompliance: qualityReviews.filter((r) => r.outcome === "MINOR_NON_COMPLIANCE").length,
      majorNonCompliance: qualityReviews.filter((r) => r.outcome === "MAJOR_NON_COMPLIANCE").length,
      openImprovementPlans: qualityReviews.filter((r) => r.improvementStatus === "PENDING" || r.improvementStatus === "IN_PROGRESS").length,
    };""",
    "dean portal extra data",
)

c = r1(
    c,
    """      announcements: announcements.map((a) => ({
        id: a.id,
        titleEn: a.titleEn,
        bodyEn: a.bodyEn,
        isActive: a.isActive,
        publishedAt: a.publishedAt,
      })),
    });""",
    """      announcements: announcements.map((a) => ({
        id: a.id,
        titleEn: a.titleEn,
        bodyEn: a.bodyEn,
        isActive: a.isActive,
        publishedAt: a.publishedAt,
      })),
      programs,
      progression: {
        studentCount,
        atRiskCount,
        avgGpa,
      },
      graduationCandidates,
      qualityIndicators,
    });""",
    "dean portal response payload",
)

with io.open(PATH, "w", encoding="utf-8") as f:
    f.write(c)

print("dean portal route extended with programs, progression, graduation, quality indicators.")
