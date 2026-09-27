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

MID = "·"  # real middot character, single backslash escape (NOT double)

# =======================================================================
# 1. app/api/search/route.js -- add Faculty and Department to the
#    federated search, same pattern as every other section. (Retry:
#    previous attempt failed here because the old_string used a
#    double-escaped \\u00b7 that never matched the real file content.)
# =======================================================================
path = "app/api/search/route.js"
c = load(path)

c = r1(
    c,
    "    const [academyPages, programs, courses, media, library, books] = await Promise.all([",
    "    const [academyPages, programs, courses, departments, faculty, media, library, books] = await Promise.all([",
    "search: add departments+faculty to Promise.all destructure",
)

c = r1(
    c,
    "      prisma.course.findMany({\n"
    "        where: {\n"
    "          isPublished: true,\n"
    "          approvalStatus: 'APPROVED',\n"
    "          OR: [{ titleEn: ci(q) }, { courseCode: ci(q) }],\n"
    "        },\n"
    "        select: { id: true, titleEn: true, courseCode: true, programId: true },\n"
    "        take: LIMIT_PER_GROUP,\n"
    "      }),\n",
    "      prisma.course.findMany({\n"
    "        where: {\n"
    "          isPublished: true,\n"
    "          approvalStatus: 'APPROVED',\n"
    "          OR: [{ titleEn: ci(q) }, { courseCode: ci(q) }],\n"
    "        },\n"
    "        select: { id: true, titleEn: true, courseCode: true, programId: true },\n"
    "        take: LIMIT_PER_GROUP,\n"
    "      }),\n"
    "      prisma.department.findMany({\n"
    "        where: {\n"
    "          isActive: true,\n"
    "          OR: [{ nameEn: ci(q) }, { code: ci(q) }],\n"
    "        },\n"
    "        select: { id: true, nameEn: true, code: true },\n"
    "        take: LIMIT_PER_GROUP,\n"
    "      }),\n"
    "      prisma.staffProfile.findMany({\n"
    "        where: {\n"
    "          isActive: true,\n"
    "          position: { isAcademic: true },\n"
    "          user: { name: ci(q) },\n"
    "        },\n"
    "        select: { id: true, user: { select: { name: true } }, title: true },\n"
    "        take: LIMIT_PER_GROUP,\n"
    "      }),\n",
    "search: add department + faculty queries",
)

old_programs_map = (
    "      programs: programs.map((program) => ({\n"
    "        title: program.nameEn,\n"
    "        href: `/programs/${program.id}`,\n"
    "        meta: [program.code, program.level].filter(Boolean).join(\" " + MID + " \"),\n"
    "      })),\n"
)
new_programs_map = (
    old_programs_map +
    "      departments: departments.map((dept) => ({\n"
    "        title: dept.nameEn,\n"
    "        href: `/departments/${dept.id}`,\n"
    "        meta: dept.code,\n"
    "      })),\n"
    "      faculty: faculty.map((person) => ({\n"
    "        title: person.user.name,\n"
    "        href: `/faculty/${person.id}`,\n"
    "        meta: person.title,\n"
    "      })),\n"
)

c = r1(
    c,
    old_programs_map,
    new_programs_map,
    "search: add department + faculty to results object",
)

save(path, c)
print("app/api/search/route.js: Faculty + Department now indexed.")

# =======================================================================
# 2. lib/assistantKnowledge.js -- a real, general-zone entry so "what
#    programs/departments do you offer" routes to the real Academy
#    pages instead of falling through to the generic fallback.
# =======================================================================
path = "lib/assistantKnowledge.js"
c = load(path)

c = r1(
    c,
    "  {\n"
    "    id: 'employee-academic-resources',\n",
    "  {\n"
    "    id: 'visitor-academy-programs',\n"
    "    zones: ['general', 'student', 'visitor'],\n"
    "    keywords: [\n"
    "      'what programs', 'which programs', 'what programmes', 'programs do you offer',\n"
    "      'programmes do you offer', 'programs available', 'what courses do you offer',\n"
    "      'what can i study', 'what do you teach', 'academic programs', 'academic programmes',\n"
    "    ],\n"
    "    department: 'Academy',\n"
    "    href: '/programs',\n"
    "    answer:\n"
    "      \"The Academy's real, currently-offered programmes -- Foundation Studies, Intermediate Islamic Studies, Advanced Islamic Studies, and the Diploma in Islamic Studies -- are listed with their departments, courses and entry requirements on the Programmes page.\",\n"
    "  },\n"
    "  {\n"
    "    id: 'visitor-academy-departments-faculty',\n"
    "    zones: ['general', 'student', 'visitor'],\n"
    "    keywords: [\n"
    "      'departments', 'academic departments', 'what departments', 'faculty members',\n"
    "      'who teaches', 'instructors', 'teaching staff', 'meet the faculty',\n"
    "    ],\n"
    "    department: 'Academy',\n"
    "    href: '/departments',\n"
    "    answer:\n"
    "      \"The Academy's academic departments -- Islamic Studies, Qur'anic Studies, Arabic Language, Islamic Education & Tarbiyah, and Islamic Civilization & Society -- are listed on the Departments page, and the teaching staff on the Faculty page.\",\n"
    "  },\n"
    "  {\n"
    "    id: 'employee-academic-resources',\n",
    "assistantKnowledge: add real program/department/faculty discovery entries",
)

save(path, c)
print("lib/assistantKnowledge.js: real Academy program/department/faculty discovery entries added.")

# =======================================================================
# 3. app/admission/page.js -- read ?program=<id> and pre-select it once
#    the real programme list has loaded, so /programs/[id]'s Apply Now
#    link doesn't make the visitor re-pick their programme from scratch.
# =======================================================================
path = "app/admission/page.js"
c = load(path)

c = r1(
    c,
    "import { useState, useEffect, useMemo } from 'react';\nimport Link from 'next/link';\nimport { useLanguage } from './LanguageContext';\n",
    "import { useState, useEffect, useMemo } from 'react';\nimport { useSearchParams } from 'next/navigation';\nimport Link from 'next/link';\nimport { useLanguage } from './LanguageContext';\n",
    "admission: add useSearchParams import",
)

c = r1(
    c,
    "export default function AdmissionPage() {\n  const { t } = useLanguage();\n",
    "export default function AdmissionPage() {\n  const { t } = useLanguage();\n  const searchParams = useSearchParams();\n",
    "admission: read searchParams",
)

c = r1(
    c,
    "        if (!cancelled) {\n"
    "          setAcademicProgrammes(result.data || []);\n"
    "        }",
    "        if (!cancelled) {\n"
    "          setAcademicProgrammes(result.data || []);\n"
    "\n"
    "          // Coming from a specific programme's page (Apply Now) --\n"
    "          // pre-select it instead of asking the visitor to find it\n"
    "          // again among every active programme.\n"
    "          const requestedProgramId = searchParams?.get('program');\n"
    "          if (requestedProgramId) {\n"
    "            const match = (result.data || []).find(\n"
    "              (programme) => programme.id === requestedProgramId && programme.status === 'Active'\n"
    "            );\n"
    "            if (match) {\n"
    "              setFormData((f) => (f.programId ? f : { ...f, programId: match.id }));\n"
    "            }\n"
    "          }\n"
    "        }",
    "admission: pre-select programId from ?program= query param",
)

save(path, c)
print("app/admission/page.js: pre-selects the programme passed via ?program=<id>.")

# =======================================================================
# 4. app/programs/[id]/page.jsx -- Apply Now now carries the programme's
#    id through to /admission, closing the other half of the loop.
# =======================================================================
path = "app/programs/[id]/page.jsx"
c = load(path)

c = r1(
    c,
    '          <Link href="/admission" style={ctaButton}>Start Your Application →</Link>',
    '          <Link href={`/admission?program=${programme.id}`} style={ctaButton}>Start Your Application →</Link>',
    "program detail: Apply Now passes program id",
)

save(path, c)
print("app/programs/[id]/page.jsx: Apply Now now links to /admission?program=<id>.")
