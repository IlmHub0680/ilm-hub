# -*- coding: utf-8 -*-
import io

PATH = "app/api/hod/portal/route.ts"

with io.open(PATH, "r", encoding="utf-8") as f:
    c = f.read()


def r1(c, old, new, label):
    n = c.count(old)
    assert n == 1, "%s: expected 1, found %d" % (label, n)
    return c.replace(old, new)


c = r1(
    c,
    """    const [programCount, staffCount, studentCount, announcements] = await Promise.all([
      prisma.program.count({ where: { departmentId: department.id } }),
      prisma.staffProfile.count({ where: { departmentId: department.id, isActive: true } }),
      prisma.studentProfile.count({ where: { departmentId: department.id } }),
      prisma.announcement.findMany({
        where: { departmentId: department.id },
        orderBy: { publishedAt: "desc" },
        take: 20,
      }),
    ]);""",
    """    const [programCount, staffCount, studentCount, announcements, courses, instructors, atRiskCount, termRecords] = await Promise.all([
      prisma.program.count({ where: { departmentId: department.id } }),
      prisma.staffProfile.count({ where: { departmentId: department.id, isActive: true } }),
      prisma.studentProfile.count({ where: { departmentId: department.id } }),
      prisma.announcement.findMany({
        where: { departmentId: department.id },
        orderBy: { publishedAt: "desc" },
        take: 20,
      }),
      // Department courses (Course has no direct departmentId — a
      // course belongs to a department only through its programme).
      prisma.course.findMany({
        where: { program: { departmentId: department.id } },
        select: {
          id: true,
          titleEn: true,
          courseCode: true,
          isPublished: true,
          program: { select: { nameEn: true } },
          instructors: { select: { instructor: { select: { id: true, name: true } } } },
        },
        orderBy: { courseCode: "asc" },
      }),
      prisma.staffProfile.findMany({
        where: { departmentId: department.id, isActive: true, position: { isAcademic: true } },
        select: {
          id: true,
          userId: true,
          specialization: true,
          user: { select: { name: true } },
          position: { select: { nameEn: true } },
        },
        orderBy: { user: { name: "asc" } },
      }),
      // A crude but real department-level at-risk count: students in
      // the department whose most recent TermRecord standing is
      // Probation or Suspended (Assessment, Grading & Progression §4.7).
      prisma.studentProfile.count({
        where: {
          departmentId: department.id,
          termRecords: { some: { standing: { in: ["PROBATION", "SUSPENDED"] } } },
        },
      }),
      prisma.termRecord.findMany({
        where: { student: { departmentId: department.id } },
        orderBy: { createdAt: "desc" },
        take: 500,
        select: { gpa: true },
      }),
    ]);

    const avgGpa =
      termRecords.length > 0
        ? termRecords.reduce((sum, t) => sum + t.gpa, 0) / termRecords.length
        : null;""",
    "hod portal extra data",
)

c = r1(
    c,
    """      programCount,
      staffCount,
      studentCount,
      announcements: announcements.map((a) => ({
        id: a.id,
        titleEn: a.titleEn,
        bodyEn: a.bodyEn,
        isActive: a.isActive,
        publishedAt: a.publishedAt,
      })),
    });""",
    """      programCount,
      staffCount,
      studentCount,
      announcements: announcements.map((a) => ({
        id: a.id,
        titleEn: a.titleEn,
        bodyEn: a.bodyEn,
        isActive: a.isActive,
        publishedAt: a.publishedAt,
      })),
      courses: courses.map((c) => ({
        id: c.id,
        titleEn: c.titleEn,
        courseCode: c.courseCode,
        isPublished: c.isPublished,
        programName: c.program?.nameEn,
        instructors: c.instructors.map((i) => i.instructor),
      })),
      instructors,
      performance: {
        studentCount,
        atRiskCount,
        avgGpa,
      },
    });""",
    "hod portal response payload",
)

with io.open(PATH, "w", encoding="utf-8") as f:
    f.write(c)

print("hod portal route extended with courses, instructors, performance.")
