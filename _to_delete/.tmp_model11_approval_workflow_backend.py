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
# 1. Coordinator course creation — a new course starts life as a real
#    DRAFT, not silently APPROVED like the back-compat default on
#    existing rows.
# ---------------------------------------------------------------------
path = "app/api/coordinator/courses/route.js"
c = load(path)
c = r1(
    c,
    '        isPublished: Boolean(body.isPublished),\n        ...(prerequisiteIds.length > 0',
    '        isPublished: Boolean(body.isPublished),\n        // A brand-new course starts as a real DRAFT (Model 11) — distinct\n        // from the APPROVED default this migration gave every existing,\n        // already-taught course so as not to retroactively unapprove them.\n        approvalStatus: "DRAFT",\n        ...(prerequisiteIds.length > 0',
    "coordinator course create approvalStatus DRAFT",
)
save(path, c)
print("updated", path)

# ---------------------------------------------------------------------
# 2. Coordinator course PUT — a "submit_for_review" action, handled
#    before the general field-update logic so it never silently mixes
#    with an ordinary edit.
# ---------------------------------------------------------------------
path = "app/api/coordinator/courses/[id]/route.js"
c = load(path)
c = r1(
    c,
    "    const body = await request.json();\n    const values = {};\n\n    if (body.titleEn !== undefined) values.titleEn = String(body.titleEn).trim();",
    """    const body = await request.json();

    // A coordinator explicitly submits a DRAFT (or returned) course for
    // Head of Department review (Model 11) — a distinct action from an
    // ordinary field edit, so a coordinator's routine typo fix never
    // accidentally re-submits an already-approved course.
    if (body.action === "submit_for_review") {
      if (course.approvalStatus !== "DRAFT" && course.approvalStatus !== "RETURNED_FOR_REVISION") {
        return errorResponse(
          `This course is ${course.approvalStatus.replace(/_/g, " ").toLowerCase()} and cannot be submitted again.`,
          409
        );
      }
      const submitted = await prisma.course.update({
        where: { id },
        data: { approvalStatus: "UNDER_REVIEW", approvalNote: null },
      });
      return NextResponse.json({ success: true, data: submitted });
    }

    const values = {};

    if (body.titleEn !== undefined) values.titleEn = String(body.titleEn).trim();""",
    "coordinator course submit_for_review action",
)
save(path, c)
print("updated", path)

# ---------------------------------------------------------------------
# 3. HoD program creation — same DRAFT-by-default treatment.
# ---------------------------------------------------------------------
path = "app/api/hod/programs/route.js"
c = load(path)
c = r1(
    c,
    '        isActive: body.isActive !== false,\n        coordinatorId,\n      },\n    });',
    '        isActive: body.isActive !== false,\n        // A brand-new programme starts as a real DRAFT (Model 11) — see\n        // the matching Course comment above for why existing rows keep\n        // the APPROVED default instead.\n        approvalStatus: "DRAFT",\n        coordinatorId,\n      },\n    });',
    "hod program create approvalStatus DRAFT",
)
save(path, c)
print("updated", path)

# ---------------------------------------------------------------------
# 4. HoD program PUT — the same submit_for_review action, Dean-bound.
# ---------------------------------------------------------------------
path = "app/api/hod/programs/[id]/route.js"
c = load(path)
c = r1(
    c,
    "    const body = await request.json();\n    const values = {};\n\n    if (body.nameEn !== undefined) values.nameEn = String(body.nameEn).trim();",
    """    const body = await request.json();

    // A Head of Department explicitly submits a DRAFT (or returned)
    // programme for Dean approval (Model 11) — see the matching Course
    // action above for why this is a separate action from an edit.
    if (body.action === "submit_for_review") {
      if (program.approvalStatus !== "DRAFT" && program.approvalStatus !== "RETURNED_FOR_REVISION") {
        return errorResponse(
          `This programme is ${program.approvalStatus.replace(/_/g, " ").toLowerCase()} and cannot be submitted again.`,
          409
        );
      }
      const submitted = await prisma.program.update({
        where: { id },
        data: { approvalStatus: "UNDER_REVIEW", approvalNote: null },
      });
      return NextResponse.json({ success: true, data: submitted });
    }

    const values = {};

    if (body.nameEn !== undefined) values.nameEn = String(body.nameEn).trim();""",
    "hod program submit_for_review action",
)
save(path, c)
print("updated", path)

print("\nApproval-workflow submission actions wired into the existing coordinator/HoD create+edit routes.")
