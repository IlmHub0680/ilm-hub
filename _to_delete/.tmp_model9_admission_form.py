# -*- coding: utf-8 -*-
import io

PATH = "app/admission/page.js"

with io.open(PATH, "r", encoding="utf-8") as f:
    content = f.read()


def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d" % (label, c)
    return content.replace(old, new)


# ============================================================
# 1. formData initial state — new fields, grouped by step.
# ============================================================

content = r1(
    content,
    "    email: '',\n    password: '',\n    fullName: '',\n    dateOfBirth: '',",
    "    email: '',\n    password: '',\n    fullName: '',\n    preferredName: '',\n    dateOfBirth: '',",
    "formData.preferredName",
)

content = r1(
    content,
    "    highestEducation: 'High School',\n    institutionName: '',\n\n    // Step 3: Programme, Session & Documents\n    programId: '',\n    academicProgramme: '',\n    studySession: 'Morning Session',\n    identityDocType: 'Ghana Card',",
    """    highestEducation: 'High School',
    institutionName: '',

    // Step 2 (cont.): Academic background & placement self-assessment
    islamicStudiesBackground: '',
    quranReadingSelf: '',
    quranTajweedSelf: '',
    quranHifzSelf: '',
    quranRecitationSelf: '',
    arabicReadingSelf: '',
    arabicWritingSelf: '',
    arabicGrammarSelf: '',
    arabicVocabularySelf: '',
    arabicConversationSelf: '',
    quranicArabicSelf: '',
    learningGoals: '',
    supportNeeds: '',

    // Step 3: Programme, Session & Documents
    programId: '',
    academicProgramme: '',
    pathwayPreference: '',
    preferredDepartmentId: '',
    specialization: '',
    studyMode: '',
    studySession: 'Morning Session',
    identityDocType: 'Ghana Card',""",
    "formData Step2/Step3 new fields",
)

content = r1(
    content,
    "    documents: {\n      identityDocument: null,\n      passportPicture: null,\n      transcripts: null,\n      certificate: null,\n      testimonial: null,\n      recommendation: null,\n    },",
    "    documents: {\n      identityDocument: null,\n      passportPicture: null,\n      transcripts: null,\n      certificate: null,\n      testimonial: null,\n      recommendation: null,\n    },\n    declarationAccepted: false,",
    "formData.declarationAccepted",
)

# ============================================================
# 2. Shared option lists + a departments list derived from the
#    already-fetched programmes (no extra API call needed).
# ============================================================

content = r1(
    content,
    "  const selectedProgramme = useMemo(\n    () => activeProgrammes.find((programme) => programme.id === formData.programId),\n    [activeProgrammes, formData.programId]\n  );",
    """  const selectedProgramme = useMemo(
    () => activeProgrammes.find((programme) => programme.id === formData.programId),
    [activeProgrammes, formData.programId]
  );

  // Preferred department options, derived from the programmes already
  // loaded for Step 3 rather than a second network call — a program's
  // department (Program.departmentId) is real, so a genuine department
  // preference can be recorded even before a specific programme is
  // chosen.
  const departmentOptions = useMemo(() => {
    const seen = new Map();
    for (const programme of activeProgrammes) {
      if (programme.departmentId && programme.department && !seen.has(programme.departmentId)) {
        seen.set(programme.departmentId, programme.department);
      }
    }
    return Array.from(seen, ([id, name]) => ({ id, name }));
  }, [activeProgrammes]);

  // The Academy's five pathways (Academy Pathways §1) — a starting
  // preference only; Placement (Academy Pathways §8) decides the
  // pathway a learner actually enters.
  const PATHWAY_OPTIONS = [
    'Foundation Studies',
    'Intermediate Islamic Studies',
    'Advanced Islamic Studies',
    'Diploma in Islamic Studies',
    'Specialized Certificate Programs',
  ];

  // Shared five-point self-rating scale for the Qur'an and Arabic
  // placement inputs below (Academy Pathways §8's seven placement
  // inputs, made concrete) — the applicant's own account, not the
  // placement result itself.
  const SELF_LEVEL_OPTIONS = [
    { value: '', label: t('Prefer not to say') },
    { value: 'NONE', label: t('None yet') },
    { value: 'BEGINNER', label: t('Beginner') },
    { value: 'INTERMEDIATE', label: t('Intermediate') },
    { value: 'ADVANCED', label: t('Advanced') },
    { value: 'PROFICIENT', label: t('Proficient') },
  ];

  const renderSelfLevelField = (label, field) => (
    <div>
      <label style={commonLabelStyle}>{t(label)}</label>
      <select value={formData[field]} onChange={(e) => setFormData({ ...formData, [field]: e.target.value })} style={commonInputStyle}>
        {SELF_LEVEL_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );""",
    "departmentOptions/PATHWAY_OPTIONS/SELF_LEVEL_OPTIONS + renderSelfLevelField",
)

with io.open(PATH, "w", encoding="utf-8") as f:
    f.write(content)

print("Part A (state + option lists) done.")
