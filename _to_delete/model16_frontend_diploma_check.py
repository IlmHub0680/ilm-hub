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
# app/admission/page.js -- the "which extra documents does this
# programme need" check was matching a hardcoded English programme
# *name* in three places, the same fragile pattern just fixed on the
# backend (submit/route.js). Now that the programme picker already has
# each programme's real Program.level (returned by
# GET /api/academic/programs), capture it alongside the display name
# and key the Diploma check off the level instead -- consistent with
# the backend, and no longer broken by a rename or by viewing the page
# in Arabic.
# =======================================================================
path = "app/admission/page.js"
c = load(path)

c = r1(
    c,
    "    academicProgramme: '',",
    "    academicProgramme: '',\n"
    "    academicProgrammeLevel: '',",
    "admission page: add academicProgrammeLevel to formData",
)

c = r1(
    c,
    "                                    setFormData({\n"
    "                                      ...formData,\n"
    "                                      programId: programme.id,\n"
    "                                      academicProgramme: programme.name,\n"
    "                                    })",
    "                                    setFormData({\n"
    "                                      ...formData,\n"
    "                                      programId: programme.id,\n"
    "                                      academicProgramme: programme.name,\n"
    "                                      academicProgrammeLevel: programme.level,\n"
    "                                    })",
    "admission page: capture programme.level on selection",
)

c = r1(
    c,
    "      const isDiploma = formData.academicProgramme === 'Diploma in Islamic Sciences';",
    "      const isDiploma = formData.academicProgrammeLevel === 'DIPLOMA';",
    "admission page: isDiploma keyed off level (stage validation)",
)

c = r1(
    c,
    "                        {formData.academicProgramme === 'Diploma in Islamic Sciences' \n"
    "                          ? t('Diploma applicants must provide all supporting academic and identification documents.')",
    "                        {formData.academicProgrammeLevel === 'DIPLOMA'\n"
    "                          ? t('Diploma applicants must provide all supporting academic and identification documents.')",
    "admission page: isDiploma keyed off level (helper text)",
)

c = r1(
    c,
    "                        {formData.academicProgramme === 'Diploma in Islamic Sciences' && (",
    "                        {formData.academicProgrammeLevel === 'DIPLOMA' && (",
    "admission page: isDiploma keyed off level (extra document fields)",
)

save(path, c)
print("app/admission/page.js: Diploma document requirement now keyed off Program.level, matching the backend.")
