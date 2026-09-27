# -*- coding: utf-8 -*-
import io

def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d" % (label, c)
    return content.replace(old, new)


# ============================================================
# app/api/academic/programs/route.js — expose departmentId so the
# admission form can build a real "Preferred Department" list
# without a second network call.
# ============================================================

PATH1 = "app/api/academic/programs/route.js"
with io.open(PATH1, "r", encoding="utf-8") as f:
    c1 = f.read()

c1 = r1(
    c1,
    "    department: program.department?.nameEn || null,",
    "    department: program.department?.nameEn || null,\n    departmentId: program.department?.id || null,",
    "formatProgramme departmentId",
)
c1 = r1(
    c1,
    "        department: { select: { nameEn: true } },",
    "        department: { select: { id: true, nameEn: true } },",
    "department select id",
)

with io.open(PATH1, "w", encoding="utf-8") as f:
    f.write(c1)

print("academic/programs route updated.")


# ============================================================
# Helper snippets shared (by duplication, matching this codebase's
# existing convention of duplicating logic between the Paystack and
# Stripe initialize routes) across both payment-initialization
# routes.
# ============================================================

SELF_LEVEL_VALUES = ["NONE", "BEGINNER", "INTERMEDIATE", "ADVANCED", "PROFICIENT"]


def self_level_helper_double_quotes():
    values = ", ".join('"%s"' % v for v in SELF_LEVEL_VALUES)
    return (
        "const SELF_RATED_LEVELS = [%s];\n\n"
        "function normalizeSelfLevel(value) {\n"
        "  return typeof value === \"string\" && SELF_RATED_LEVELS.includes(value) ? value : null;\n"
        "}\n"
    ) % values


def self_level_helper_single_quotes():
    values = ", ".join("'%s'" % v for v in SELF_LEVEL_VALUES)
    return (
        "const SELF_RATED_LEVELS = [%s];\n\n"
        "function normalizeSelfLevel(value) {\n"
        "  return typeof value === 'string' && SELF_RATED_LEVELS.includes(value) ? value : null;\n"
        "}\n"
    ) % values


# ============================================================
# app/api/admissions/paystack/initialize/route.js
# ============================================================

PATH2 = "app/api/admissions/paystack/initialize/route.js"
with io.open(PATH2, "r", encoding="utf-8") as f:
    c2 = f.read()

c2 = r1(
    c2,
    'const SETTINGS_ID = "default-admission-fees";',
    'const SETTINGS_ID = "default-admission-fees";\n\n' + self_level_helper_double_quotes(),
    "paystack normalizeSelfLevel helper",
)

c2 = r1(
    c2,
    """      identityDocType:
        typeof body.identityDocType === "string"
          ? body.identityDocType.trim()
          : "",

      admissionFee,
      currencyCode: admissionCurrency,""",
    """      identityDocType:
        typeof body.identityDocType === "string"
          ? body.identityDocType.trim()
          : "",

      preferredName:
        typeof body.preferredName === "string" && body.preferredName.trim()
          ? body.preferredName.trim()
          : null,

      pathwayPreference:
        typeof body.pathwayPreference === "string" && body.pathwayPreference.trim()
          ? body.pathwayPreference.trim()
          : null,

      preferredDepartmentId:
        typeof body.preferredDepartmentId === "string" && body.preferredDepartmentId.trim()
          ? body.preferredDepartmentId.trim()
          : null,

      specialization:
        typeof body.specialization === "string" && body.specialization.trim()
          ? body.specialization.trim()
          : null,

      studyMode:
        body.studyMode === "FULL_TIME" || body.studyMode === "PART_TIME"
          ? body.studyMode
          : null,

      islamicStudiesBackground:
        typeof body.islamicStudiesBackground === "string" && body.islamicStudiesBackground.trim()
          ? body.islamicStudiesBackground.trim()
          : null,

      quranReadingSelf: normalizeSelfLevel(body.quranReadingSelf),
      quranTajweedSelf: normalizeSelfLevel(body.quranTajweedSelf),
      quranHifzSelf: normalizeSelfLevel(body.quranHifzSelf),
      quranRecitationSelf: normalizeSelfLevel(body.quranRecitationSelf),
      arabicReadingSelf: normalizeSelfLevel(body.arabicReadingSelf),
      arabicWritingSelf: normalizeSelfLevel(body.arabicWritingSelf),
      arabicGrammarSelf: normalizeSelfLevel(body.arabicGrammarSelf),
      arabicVocabularySelf: normalizeSelfLevel(body.arabicVocabularySelf),
      arabicConversationSelf: normalizeSelfLevel(body.arabicConversationSelf),
      quranicArabicSelf: normalizeSelfLevel(body.quranicArabicSelf),

      learningGoals:
        typeof body.learningGoals === "string" && body.learningGoals.trim()
          ? body.learningGoals.trim()
          : null,

      supportNeeds:
        typeof body.supportNeeds === "string" && body.supportNeeds.trim()
          ? body.supportNeeds.trim()
          : null,

      declarationAccepted: Boolean(body.declarationAccepted),
      declarationAcceptedAt: body.declarationAccepted ? new Date() : null,

      admissionFee,
      currencyCode: admissionCurrency,""",
    "paystack applicationFieldsData new fields",
)

with io.open(PATH2, "w", encoding="utf-8") as f:
    f.write(c2)

print("paystack/initialize route updated.")


# ============================================================
# app/api/admissions/stripe/initialize/route.js
# ============================================================

PATH3 = "app/api/admissions/stripe/initialize/route.js"
with io.open(PATH3, "r", encoding="utf-8") as f:
    c3 = f.read()

c3 = r1(
    c3,
    "const applicationFieldsData = {",
    self_level_helper_single_quotes() + "\n    const applicationFieldsData = {",
    "stripe normalizeSelfLevel helper",
)

c3 = r1(
    c3,
    """      identityDocType:
        body.identityDocType || '',

      admissionFee:
        fee.amount,""",
    """      identityDocType:
        body.identityDocType || '',

      preferredName:
        body.preferredName || null,

      pathwayPreference:
        body.pathwayPreference || null,

      preferredDepartmentId:
        body.preferredDepartmentId || null,

      specialization:
        body.specialization || null,

      studyMode:
        body.studyMode === 'FULL_TIME' || body.studyMode === 'PART_TIME'
          ? body.studyMode
          : null,

      islamicStudiesBackground:
        body.islamicStudiesBackground || null,

      quranReadingSelf: normalizeSelfLevel(body.quranReadingSelf),
      quranTajweedSelf: normalizeSelfLevel(body.quranTajweedSelf),
      quranHifzSelf: normalizeSelfLevel(body.quranHifzSelf),
      quranRecitationSelf: normalizeSelfLevel(body.quranRecitationSelf),
      arabicReadingSelf: normalizeSelfLevel(body.arabicReadingSelf),
      arabicWritingSelf: normalizeSelfLevel(body.arabicWritingSelf),
      arabicGrammarSelf: normalizeSelfLevel(body.arabicGrammarSelf),
      arabicVocabularySelf: normalizeSelfLevel(body.arabicVocabularySelf),
      arabicConversationSelf: normalizeSelfLevel(body.arabicConversationSelf),
      quranicArabicSelf: normalizeSelfLevel(body.quranicArabicSelf),

      learningGoals:
        body.learningGoals || null,

      supportNeeds:
        body.supportNeeds || null,

      declarationAccepted: Boolean(body.declarationAccepted),
      declarationAcceptedAt: body.declarationAccepted ? new Date() : null,

      admissionFee:
        fee.amount,""",
    "stripe applicationFieldsData new fields",
)

with io.open(PATH3, "w", encoding="utf-8") as f:
    f.write(c3)

print("stripe/initialize route updated.")
