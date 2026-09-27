# -*- coding: utf-8 -*-
import io

def load(path):
    with io.open(path, "r", encoding="utf-8") as f:
        return f.read()

def save(path, content):
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(content)

def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d (context: %r)" % (label, c, old[:100])
    return content.replace(old, new)

# =======================================================================
# HIGH-PRIORITY FIX confirmed live on real data: five seeded courses
# (IS-304, IE-402, IE-405, IC-301, IC-402) carry approvalStatus
# UNDER_REVIEW but isPublished: true -- and every public read path
# (programme detail, search) filters only on isPublished, never on
# approvalStatus. Those five courses are visible to the public right
# now even though Academic Governance has not approved them. This is
# exactly Model 15 Section 24/28's "draft/under-review content must
# never be publicly exposed" requirement, currently violated.
# =======================================================================

# -----------------------------------------------------------------------
# app/api/academic/programs/route.js
# -----------------------------------------------------------------------
path = "app/api/academic/programs/route.js"
c = load(path)

c = r1(
    c,
    "    const programmes = await prisma.program.findMany({\n"
    "      where: {\n"
    "        isActive: true,\n"
    "      },\n",
    "    const programmes = await prisma.program.findMany({\n"
    "      where: {\n"
    "        isActive: true,\n"
    "        // A programme sitting at DRAFT/UNDER_REVIEW/RETURNED_FOR_REVISION\n"
    "        // must never be publicly listed, even if left isActive -- backend\n"
    "        // permissions stay authoritative rather than relying on the UI to\n"
    "        // hide it (Model 15 Section 28).\n"
    "        approvalStatus: 'APPROVED',\n"
    "      },\n",
    "programs list: add approvalStatus filter",
)

# The POST handler below is unreachable dead code: grep across the whole
# app confirms nothing calls POST /api/academic/programs. Both branches
# ("submit_curriculum" and the generic fallback) return a canned success
# response without ever writing to the database -- exactly the kind of
# fake-looking-real endpoint this project's standing rule flags. Real
# programme/course curriculum creation already goes through the
# Coordinator/HOD/Dean approval workflow's own APIs; this stub duplicates
# nothing real and is simply removed.
c = r1(
    c,
    "\n"
    "export async function POST(request) {\n"
    "  try {\n"
    "    const body = await request.json();\n"
    "\n"
    "    const {\n"
    "      action,\n"
    "      programName,\n"
    "      level,\n"
    "      description,\n"
    "      courses,\n"
    "    } = body;\n"
    "\n"
    "    if (action === 'submit_curriculum') {\n"
    "      return jsonResponse({\n"
    "        success: true,\n"
    "        message:\n"
    "          'Curriculum proposal submitted successfully and set to Pending Approval.',\n"
    "        status: 'Pending Approval',\n"
    "      });\n"
    "    }\n"
    "\n"
    "    return jsonResponse({\n"
    "      success: true,\n"
    "      message: 'Academic program created successfully.',\n"
    "      data: {\n"
    "        programName,\n"
    "        level,\n"
    "        description,\n"
    "        courses,\n"
    "        status: 'Active',\n"
    "      },\n"
    "    });\n"
    "  } catch (error) {\n"
    "    return jsonResponse(\n"
    "      {\n"
    "        success: false,\n"
    "        error: error instanceof Error ? error.message : String(error),\n"
    "      },\n"
    "      500\n"
    "    );\n"
    "  }\n"
    "}\n",
    "\n",
    "programs route: remove dead fake-success POST handler",
)

save(path, c)
print("app/api/academic/programs/route.js: approvalStatus filter added; dead POST handler removed.")

# -----------------------------------------------------------------------
# app/api/academic/programs/[id]/route.js
# -----------------------------------------------------------------------
path = "app/api/academic/programs/[id]/route.js"
c = load(path)

c = r1(
    c,
    "    if (!program || !program.isActive) {\n"
    "      return jsonResponse({ success: false, error: 'Programme not found.' }, 404);\n"
    "    }",
    "    if (!program || !program.isActive || program.approvalStatus !== 'APPROVED') {\n"
    "      return jsonResponse({ success: false, error: 'Programme not found.' }, 404);\n"
    "    }",
    "program detail: reject non-APPROVED programme",
)

c = r1(
    c,
    "        courses: {\n"
    "          where: { isPublished: true },\n",
    "        courses: {\n"
    "          // A course at DRAFT/UNDER_REVIEW/RETURNED_FOR_REVISION never\n"
    "          // appears on a public programme page, even if left isPublished\n"
    "          // true -- confirmed live on real seed data (IS-304, IE-402,\n"
    "          // IE-405, IC-301, IC-402 are all isPublished but UNDER_REVIEW).\n"
    "          where: { isPublished: true, approvalStatus: 'APPROVED' },\n",
    "program detail: course sub-query approvalStatus filter",
)

save(path, c)
print("app/api/academic/programs/[id]/route.js: approvalStatus filter added to programme + course sub-query.")

# -----------------------------------------------------------------------
# app/api/search/route.js
# -----------------------------------------------------------------------
path = "app/api/search/route.js"
c = load(path)

c = r1(
    c,
    "      prisma.program.findMany({\n"
    "        where: {\n"
    "          isActive: true,\n"
    "          OR: [{ nameEn: ci(q) }, { code: ci(q) }],\n"
    "        },\n",
    "      prisma.program.findMany({\n"
    "        where: {\n"
    "          isActive: true,\n"
    "          approvalStatus: 'APPROVED',\n"
    "          OR: [{ nameEn: ci(q) }, { code: ci(q) }],\n"
    "        },\n",
    "search: program approvalStatus filter",
)

c = r1(
    c,
    "      prisma.course.findMany({\n"
    "        where: {\n"
    "          isPublished: true,\n"
    "          OR: [{ titleEn: ci(q) }, { courseCode: ci(q) }],\n"
    "        },\n",
    "      prisma.course.findMany({\n"
    "        where: {\n"
    "          isPublished: true,\n"
    "          approvalStatus: 'APPROVED',\n"
    "          OR: [{ titleEn: ci(q) }, { courseCode: ci(q) }],\n"
    "        },\n",
    "search: course approvalStatus filter",
)

save(path, c)
print("app/api/search/route.js: approvalStatus filter added to program + course search.")
