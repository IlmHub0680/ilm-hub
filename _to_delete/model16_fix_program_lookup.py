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
    assert c == 1, "%s: expected 1 match, found %d (context: %r)" % (label, c, old[:120])
    return content.replace(old, new)

# =======================================================================
# app/api/admissions/paystack/initialize/route.js
# =======================================================================
path = "app/api/admissions/paystack/initialize/route.js"
c = load(path)

c = r1(
    c,
    'import { getAcademicProgrammeById } from "@/lib/academic-programmes";',
    'import { getAdmissibleProgram } from "@/lib/academicProgram";',
    "paystack/initialize: swap import",
)

c = r1(
    c,
    "    const programme =\n"
    "      getAcademicProgrammeById(programId);",
    "    const programme =\n"
    "      await getAdmissibleProgram(programId);",
    "paystack/initialize: swap lookup call",
)

save(path, c)
print("app/api/admissions/paystack/initialize/route.js: now validates programId against real Academy Data.")

# =======================================================================
# app/api/admissions/stripe/initialize/route.js
# =======================================================================
path = "app/api/admissions/stripe/initialize/route.js"
c = load(path)

c = r1(
    c,
    "import { getAcademicProgrammeById } from '@/lib/academic-programmes';",
    "import { getAdmissibleProgram } from '@/lib/academicProgram';",
    "stripe/initialize: swap import",
)

c = r1(
    c,
    "    const programme =\n"
    "      getAcademicProgrammeById(programId);",
    "    const programme =\n"
    "      await getAdmissibleProgram(programId);",
    "stripe/initialize: swap lookup call",
)

save(path, c)
print("app/api/admissions/stripe/initialize/route.js: now validates programId against real Academy Data.")

# =======================================================================
# app/api/admissions/register/route.js
# =======================================================================
path = "app/api/admissions/register/route.js"
c = load(path)

c = r1(
    c,
    "import {\n"
    "  getAcademicProgrammeById,\n"
    "} from '@/lib/academic-programmes';",
    "import {\n"
    "  getAdmissibleProgram,\n"
    "} from '@/lib/academicProgram';",
    "register: swap import",
)

c = r1(
    c,
    "    const programme = programId\n"
    "      ? getAcademicProgrammeById(programId)\n"
    "      : null;",
    "    const programme = programId\n"
    "      ? await getAdmissibleProgram(programId)\n"
    "      : null;",
    "register: swap lookup call",
)

save(path, c)
print("app/api/admissions/register/route.js: now validates programId against real Academy Data.")

# =======================================================================
# app/api/admissions/submit/route.js -- the Diploma extra-documents
# check was matching a hardcoded English programme *name*, which is
# fragile (breaks the moment the programme is renamed or shown in
# Arabic) and was itself a second, independent copy of "which
# programme is the Diploma". Now that programLevel on the application
# is snapshotted from the real Program.level enum (fixed above), key
# off that instead -- it is the same signal the schema itself uses.
# =======================================================================
path = "app/api/admissions/submit/route.js"
c = load(path)

c = r1(
    c,
    "    const isDiploma =\n"
    "      application.programName ===\n"
    '      "Diploma in Islamic Sciences";',
    "    const isDiploma =\n"
    '      application.programLevel === "DIPLOMA";',
    "submit: isDiploma keyed off real Program.level",
)

save(path, c)
print("app/api/admissions/submit/route.js: Diploma document requirement now keyed off Program.level.")
