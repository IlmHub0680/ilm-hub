import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

// GET /api/dean/students -- named faculty student roster (gap #2:
// app/api/dean/portal only ever returned studentCount, a number).
// Read-only, simple searchable list scoped to the faculty. Same
// faculty-derivation and admin-fallback pattern as
// app/api/dean/portal/route.ts and app/api/dean/staff/route.ts.
// Optional ?q= filters by student name/number/email server-side so a
// large faculty roster doesn't have to be fetched in full to search
// it, and a bounded `take` keeps this from ever returning an
// unbounded result set.
export async function GET(request: Request) {
  try {
    const user = await requireUser();
    await requireModulePermission("FACULTY_MATTERS", "view");

    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    const staff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });

    if (!staff && !isAdmin) {
      return NextResponse.json({ error: "No staff profile found" }, { status: 403 });
    }

    const faculty = staff
      ? await prisma.faculty.findUnique({ where: { deanId: staff.id } })
      : null;

    if (!faculty && !isAdmin) {
      return NextResponse.json({
        faculty: null,
        message: "You are not currently assigned as Dean of a faculty.",
      });
    }

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();

    const facultyScope = faculty ? { facultyId: faculty.id } : {};
    const searchScope = q
      ? {
          OR: [
            { studentNo: { contains: q, mode: "insensitive" as const } },
            { user: { name: { contains: q, mode: "insensitive" as const } } },
            { user: { email: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {};

    const students = await prisma.studentProfile.findMany({
      where: { ...facultyScope, ...searchScope },
      select: {
        id: true,
        studentNo: true,
        level: true,
        admissionYear: true,
        status: true,
        user: { select: { name: true, email: true } },
        department: { select: { nameEn: true } },
        program: { select: { nameEn: true } },
        termRecords: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { gpa: true, standing: true },
        },
      },
      orderBy: { user: { name: "asc" } },
      take: 200,
    });

    return NextResponse.json({
      faculty: faculty ? { id: faculty.id, nameEn: faculty.nameEn } : null,
      students: students.map((s) => ({
        id: s.id,
        studentNo: s.studentNo,
        name: s.user.name,
        email: s.user.email,
        level: s.level,
        admissionYear: s.admissionYear,
        status: s.status,
        department: s.department?.nameEn ?? null,
        program: s.program?.nameEn ?? null,
        latestGpa: s.termRecords[0]?.gpa ?? null,
        standing: s.termRecords[0]?.standing ?? null,
      })),
      truncated: students.length === 200,
    });
  } catch (error) {
    console.error("Dean student roster error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Faculty Matters access required" }, { status: 403 });
    }

    return NextResponse.json({ error: "Failed to load faculty student roster." }, { status: 500 });
  }
}
