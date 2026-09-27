import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

// GET /api/hod/students -- gap #1: "Review student numbers" AND
// "Monitor student academic progression" as list-level capability, not
// just the aggregate studentCount/atRiskCount app/api/hod/portal
// already returns. Read-only, department-scoped, with each student's
// latest recorded standing/GPA so progression is actually reviewable
// per-student, not just as a department-wide average. Same
// department-derivation and admin-fallback pattern as
// app/api/hod/portal/route.ts. Optional ?q= and ?atRiskOnly=1 filters.
export async function GET(request: Request) {
  try {
    const user = await requireUser();
    await requireModulePermission("DEPARTMENT_MATTERS", "view");

    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    const staff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });

    if (!staff && !isAdmin) {
      return NextResponse.json({ error: "No staff profile found" }, { status: 403 });
    }

    const department = staff
      ? await prisma.department.findUnique({ where: { headId: staff.id } })
      : null;

    if (!department && !isAdmin) {
      return NextResponse.json({
        department: null,
        message: "You are not currently assigned as Head of a department.",
      });
    }

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const atRiskOnly = searchParams.get("atRiskOnly") === "1";

    const departmentScope = department ? { departmentId: department.id } : {};
    const searchScope = q
      ? {
          OR: [
            { studentNo: { contains: q, mode: "insensitive" as const } },
            { user: { name: { contains: q, mode: "insensitive" as const } } },
            { user: { email: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {};
    const atRiskScope = atRiskOnly
      ? { termRecords: { some: { standing: { in: ["PROBATION", "SUSPENDED"] as const } } } }
      : {};

    const students = await prisma.studentProfile.findMany({
      where: { ...departmentScope, ...searchScope, ...atRiskScope },
      select: {
        id: true,
        studentNo: true,
        level: true,
        admissionYear: true,
        status: true,
        user: { select: { name: true, email: true } },
        program: { select: { nameEn: true } },
        termRecords: {
          orderBy: { createdAt: "desc" },
          take: 3,
          select: { gpa: true, standing: true, creditsEarned: true, creditsAttempted: true, term: { select: { name: true, code: true } } },
        },
      },
      orderBy: { user: { name: "asc" } },
      take: 200,
    });

    return NextResponse.json({
      department: department ? { id: department.id, nameEn: department.nameEn } : null,
      students: students.map((s) => ({
        id: s.id,
        studentNo: s.studentNo,
        name: s.user.name,
        email: s.user.email,
        level: s.level,
        admissionYear: s.admissionYear,
        status: s.status,
        program: s.program?.nameEn ?? null,
        latestGpa: s.termRecords[0]?.gpa ?? null,
        standing: s.termRecords[0]?.standing ?? null,
        progression: s.termRecords.map((t) => ({
          gpa: t.gpa,
          standing: t.standing,
          creditsEarned: t.creditsEarned,
          creditsAttempted: t.creditsAttempted,
          term: t.term?.code || t.term?.name || null,
        })),
      })),
      truncated: students.length === 200,
    });
  } catch (error) {
    console.error("HOD student roster error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Department Matters access required" }, { status: 403 });
    }

    return NextResponse.json({ error: "Failed to load department student roster." }, { status: 500 });
  }
}
