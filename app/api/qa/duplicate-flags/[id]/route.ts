import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

const VALID_STATUSES = ["OPEN", "CONFIRMED_DUPLICATE", "NOT_A_DUPLICATE", "MERGED"];

// PATCH: resolve a duplication flag with a real, recorded decision.
// This never touches the flagged Course/Program/Category rows
// themselves -- MERGED records that a human merge or consolidation was
// decided on and carried out elsewhere, not that this endpoint
// performed one. Nothing here deletes data automatically (§7).
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireModulePermission("QUALITY_ASSURANCE", "edit");
    const staff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });
    if (!staff) return errorResponse("No staff profile found for this account", 403);

    const { id } = await params;
    const existing = await prisma.duplicateFlag.findUnique({ where: { id } });
    if (!existing) return errorResponse("Duplication flag not found", 404);

    const body = await request.json();
    const status = typeof body.status === "string" ? body.status : "";
    const resolutionNote = typeof body.resolutionNote === "string" ? body.resolutionNote.trim() || null : null;

    if (!VALID_STATUSES.includes(status)) {
      return errorResponse("A valid status is required", 400);
    }

    const isResolving = status !== "OPEN";

    const updated = await prisma.duplicateFlag.update({
      where: { id },
      data: {
        status: status as any,
        resolutionNote,
        resolvedById: isResolving ? staff.id : null,
        resolvedAt: isResolving ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PATCH duplicate flag error:", error);
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("QA edit access required", 403);
    return errorResponse("Failed to update duplication flag", 500);
  }
}
