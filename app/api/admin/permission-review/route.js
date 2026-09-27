import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Model 26 rule #13: a review path that flags excessive permissions,
// unused roles, duplicate roles, conflicting permissions, and orphaned
// users -- never auto-fixes or deletes anything, only surfaces issues
// for a human (an admin) to act on. Read-only: no PATCH/DELETE here.
//
// The checks below are grounded directly in rules the spec actually
// states, not arbitrary heuristics:
//   - FINANCE_ISOLATION: rule #9 -- finance data must be completely
//     inaccessible to instructors/ordinary academic staff, so a single
//     position combining finance edit access with any non-finance
//     edit access is a real violation, not a style nitpick.
//   - ACADEMIC_UNRELATED_PERMISSION: rule #5 -- academic departments
//     must not hold unrelated institutional/financial permissions.
//   - DUPLICATE_ROLE / UNUSED_ROLE / EXCESSIVE_PERMISSIONS: rule #13
//     verbatim.
//   - ORPHANED_USER: an INSTRUCTOR-role account with no StaffProfile
//     at all has, in this codebase's actual permission model, zero
//     functional access (every instructor check routes through
//     StaffProfile + PositionPermission) -- a real mismatch between
//     the role granted and what it can do, worth a human look.
const FINANCE_MODULES = new Set(["FINANCE_FEES", "FINANCE_PAYROLL"]);
const EXCESSIVE_EDIT_THRESHOLD = 5;

export async function GET() {
  try {
    await requireAdmin();

    const positions = await prisma.position.findMany({
      include: {
        permissions: true,
        staff: { select: { id: true, isActive: true } },
      },
      orderBy: { nameEn: "asc" },
    });

    const findings = [];

    const signatureOf = (perms) =>
      perms
        .filter((p) => p.canView || p.canEdit)
        .map((p) => `${p.module}:${p.canView ? "v" : ""}${p.canEdit ? "e" : ""}`)
        .sort()
        .join("|");

    const signatureGroups = new Map();

    for (const position of positions) {
      const activeStaffCount = position.staff.filter((s) => s.isActive).length;
      const editModules = position.permissions.filter((p) => p.canEdit).map((p) => p.module);
      const grantedAny = position.permissions.some((p) => p.canView || p.canEdit);

      // Finance isolation
      const financeEdit = editModules.filter((m) => FINANCE_MODULES.has(m));
      const nonFinanceEdit = editModules.filter((m) => !FINANCE_MODULES.has(m));
      if (financeEdit.length > 0 && nonFinanceEdit.length > 0) {
        findings.push({
          type: "FINANCE_ISOLATION_VIOLATION",
          severity: "high",
          positionId: position.id,
          positionName: position.nameEn,
          detail: `Holds edit access to ${financeEdit.join(", ")} together with ${nonFinanceEdit.join(", ")} — financial data must stay isolated from ordinary academic/operational modules.`,
        });
      }

      // Academic department holding unrelated institutional/financial permission
      if (position.isAcademic) {
        const unrelated = editModules.filter((m) => FINANCE_MODULES.has(m) || m === "ICT_OPS");
        if (unrelated.length > 0) {
          findings.push({
            type: "ACADEMIC_UNRELATED_PERMISSION",
            severity: "high",
            positionId: position.id,
            positionName: position.nameEn,
            detail: `An academic position holds edit access to ${unrelated.join(", ")}, which is unrelated to its academic discipline.`,
          });
        }
      }

      // Excessive permissions
      if (editModules.length >= EXCESSIVE_EDIT_THRESHOLD) {
        findings.push({
          type: "EXCESSIVE_PERMISSIONS",
          severity: "medium",
          positionId: position.id,
          positionName: position.nameEn,
          detail: `Holds edit access to ${editModules.length} modules (${editModules.join(", ")}) — worth confirming every one is actually required for this position's core duties.`,
        });
      }

      // Unused role
      if (grantedAny && activeStaffCount === 0) {
        findings.push({
          type: "UNUSED_ROLE",
          severity: "low",
          positionId: position.id,
          positionName: position.nameEn,
          detail: `Has permissions configured but no active staff currently assigned to it.`,
        });
      }

      // Duplicate signature grouping
      const sig = signatureOf(position.permissions);
      if (sig) {
        if (!signatureGroups.has(sig)) signatureGroups.set(sig, []);
        signatureGroups.get(sig).push({ id: position.id, name: position.nameEn });
      }
    }

    for (const [, group] of signatureGroups) {
      if (group.length > 1) {
        findings.push({
          type: "DUPLICATE_ROLE",
          severity: "low",
          positionId: group.map((g) => g.id).join(","),
          positionName: group.map((g) => g.name).join(" / "),
          detail: `These ${group.length} positions have byte-identical permission sets — consider whether they should be consolidated.`,
        });
      }
    }

    // Orphaned users: INSTRUCTOR role with no StaffProfile at all.
    const orphanedInstructors = await prisma.user.findMany({
      where: { role: "INSTRUCTOR", staffProfile: { is: null } },
      select: { id: true, name: true, email: true },
    });
    for (const u of orphanedInstructors) {
      findings.push({
        type: "ORPHANED_USER",
        severity: "medium",
        userId: u.id,
        detail: `${u.name} (${u.email}) has the Instructor role but no Staff Profile at all, so this account currently has zero functional access — likely an incomplete setup.`,
      });
    }

    const severityOrder = { high: 0, medium: 1, low: 2 };
    findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return NextResponse.json({ success: true, data: findings });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    if (error?.message === "FORBIDDEN") return NextResponse.json({ success: false, error: "Admin access required." }, { status: 403 });

    console.error("GET permission review error:", error);
    return NextResponse.json({ success: false, error: "Failed to load permission review." }, { status: 500 });
  }
}
