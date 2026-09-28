import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

const VALID_SUBJECT_TYPES = ["COURSE", "PROGRAM", "CATEGORY"];

async function subjectLabel(subjectType: string, id: string): Promise<string | null> {
  if (subjectType === "COURSE") {
    const c = await prisma.course.findUnique({ where: { id }, select: { titleEn: true, courseCode: true } });
    return c ? `${c.titleEn} (${c.courseCode})` : null;
  }
  if (subjectType === "PROGRAM") {
    const p = await prisma.program.findUnique({ where: { id }, select: { nameEn: true, code: true } });
    return p ? `${p.nameEn} (${p.code})` : null;
  }
  const cat = await prisma.category.findUnique({ where: { id }, select: { nameEn: true } });
  return cat ? cat.nameEn : null;
}

// Duplication / overlap flags (Model 30 §7). This never deletes or
// merges anything automatically -- it only raises a flag naming two
// possibly-overlapping subjects for a human reviewer to confirm, so
// existing records stay untouched until someone with QA edit access
// explicitly decides.
export async function GET() {
  try {
    await requireModulePermission("QUALITY_ASSURANCE", "view");

    const flags = await prisma.duplicateFlag.findMany({
      include: {
        flaggedBy: { select: { user: { select: { name: true } } } },
        resolvedBy: { select: { user: { select: { name: true } } } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });

    const withLabels = await Promise.all(
      flags.map(async (f) => ({
        id: f.id,
        subjectType: f.subjectType,
        subjectAId: f.subjectAId,
        subjectBId: f.subjectBId,
        subjectALabel: await subjectLabel(f.subjectType, f.subjectAId),
        subjectBLabel: await subjectLabel(f.subjectType, f.subjectBId),
        reason: f.reason,
        status: f.status,
        resolutionNote: f.resolutionNote,
        flaggedByName: f.flaggedBy.user.name,
        resolvedByName: f.resolvedBy?.user?.name || null,
        createdAt: f.createdAt,
        resolvedAt: f.resolvedAt,
      }))
    );

    return NextResponse.json({ success: true, data: withLabels });
  } catch (error: any) {
    console.error("GET duplicate flags error:", error);
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("QA access required", 403);
    return errorResponse("Failed to load duplication flags", 500);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireModulePermission("QUALITY_ASSURANCE", "edit");
    const staff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });
    if (!staff) return errorResponse("No staff profile found for this account", 403);

    const body = await request.json();
    const subjectType = typeof body.subjectType === "string" ? body.subjectType : "";
    const subjectAId = typeof body.subjectAId === "string" ? body.subjectAId.trim() : "";
    const subjectBId = typeof body.subjectBId === "string" ? body.subjectBId.trim() : "";
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";

    if (!VALID_SUBJECT_TYPES.includes(subjectType)) {
      return errorResponse("A valid subject type is required", 400);
    }
    if (!subjectAId || !subjectBId) {
      return errorResponse("Two subjects must be selected", 400);
    }
    if (subjectAId === subjectBId) {
      return errorResponse("Select two different subjects to compare", 400);
    }
    if (!reason) {
      return errorResponse("A reason for the flag is required", 400);
    }

    const [labelA, labelB] = await Promise.all([
      subjectLabel(subjectType, subjectAId),
      subjectLabel(subjectType, subjectBId),
    ]);
    if (!labelA || !labelB) return errorResponse("One or both subjects could not be found", 404);

    const flag = await prisma.duplicateFlag.create({
      data: { subjectType: subjectType as any, subjectAId, subjectBId, reason, flaggedById: staff.id },
    });

    return NextResponse.json({ success: true, data: flag }, { status: 201 });
  } catch (error: any) {
    console.error("POST duplicate flag error:", error);
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("QA edit access required", 403);
    return errorResponse("Failed to raise duplication flag", 500);
  }
}
