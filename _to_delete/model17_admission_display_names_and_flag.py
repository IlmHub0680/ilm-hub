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
    assert c == 1, "%s: expected 1 match, found %d (context: %r)" % (label, c, old[:160])
    return content.replace(old, new)

# =======================================================================
# app/admission/page.js
#   1. Step 2 ("Choose Your Programme") and Step 3's summary, plus the
#      classic (non-wizard) programme picker further down the same
#      page, all render the real Program records' nameEn straight from
#      the database ("Foundation Studies", "Intermediate Islamic
#      Studies", ...). Those DB records are left as-is (renaming them
#      would also change /programs, admin screens, etc.), but a small
#      display-only mapping now shows the same friendly wording used
#      for PATHWAY_OPTIONS/PATHWAY_TIERS wherever a programme name is
#      shown to an applicant on this page. What's actually submitted
#      with the application (academicProgramme) still carries the real
#      database name, since that is what admin/email/records already
#      expect.
#   2. The Step 3 "Applying as" summary line was missing the flag emoji
#      that Step 1's own cards already show.
# =======================================================================
path = "app/admission/page.js"
c = load(path)

c = r1(
    c,
    "export default function AdmissionPage() {\n"
    "  const { t } = useLanguage();",
    "// Display-only friendly names for the real Program records shown in\n"
    "// this admission flow -- matches PATHWAY_OPTIONS/PATHWAY_TIERS' wording\n"
    "// elsewhere on the site. The database's Program.nameEn values (and\n"
    "// what gets submitted with the application) are unchanged.\n"
    "const PROGRAMME_DISPLAY_NAMES = {\n"
    "  'Foundation Studies': 'Foundation Learner Programme',\n"
    "  'Intermediate Islamic Studies': 'Intermediate Learner Programme',\n"
    "  'Advanced Islamic Studies': 'Advanced Islamic Studies',\n"
    "  'Diploma in Islamic Studies': 'Diploma in Islamic Studies',\n"
    "};\n"
    "\n"
    "function programmeDisplayName(name) {\n"
    "  return PROGRAMME_DISPLAY_NAMES[name] || name;\n"
    "}\n"
    "\n"
    "export default function AdmissionPage() {\n"
    "  const { t } = useLanguage();",
    "admission page: add programmeDisplayName() helper",
)

# --- Step 2 wizard grid ---
c = r1(
    c,
    "                          <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--brand)', marginBottom: '6px' }}>\n"
    "                            {programme.name}\n"
    "                          </div>\n"
    "                          <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>\n"
    "                            {programme.level}{programme.duration ? ` · ${programme.duration}` : ''}\n"
    "                          </div>",
    "                          <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--brand)', marginBottom: '6px' }}>\n"
    "                            {programmeDisplayName(programme.name)}\n"
    "                          </div>\n"
    "                          <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>\n"
    "                            {programme.level}{programme.duration ? ` · ${programme.duration}` : ''}\n"
    "                          </div>",
    "admission page: Step 2 wizard grid uses friendly programme names",
)

# --- Step 3 wizard summary: programme name + missing flag ---
c = r1(
    c,
    "                      <strong style={{ color: 'var(--ink)' }}>\n"
    "                        {wizardResidency === 'RESIDENT' ? t('New Student — Resident') : t('New Student — International')}\n"
    "                      </strong>",
    "                      <strong style={{ color: 'var(--ink)' }}>\n"
    "                        {wizardResidency === 'RESIDENT'\n"
    "                          ? `🇬🇭 ${t('New Student — Resident')}`\n"
    "                          : `🌍 ${t('New Student — International')}`}\n"
    "                      </strong>",
    "admission page: Step 3 summary gets the same flag as Step 1's cards",
)

c = r1(
    c,
    "                      <strong style={{ color: 'var(--ink)', textAlign: 'right' }}>\n"
    "                        {wizardSelectedProgramme ? wizardSelectedProgramme.name : '—'}\n"
    "                      </strong>",
    "                      <strong style={{ color: 'var(--ink)', textAlign: 'right' }}>\n"
    "                        {wizardSelectedProgramme ? programmeDisplayName(wizardSelectedProgramme.name) : '—'}\n"
    "                      </strong>",
    "admission page: Step 3 summary uses friendly programme name",
)

# --- classic (non-wizard) programme picker further down the page ---
c = r1(
    c,
    "                                      <div\n"
    "                                        style={{\n"
    "                                          color: 'var(--brand)',\n"
    "                                          fontSize: '15px',\n"
    "                                          fontWeight: '800',\n"
    "                                          lineHeight: 1.35,\n"
    "                                        }}\n"
    "                                      >\n"
    "                                        {programme.name}\n"
    "                                      </div>",
    "                                      <div\n"
    "                                        style={{\n"
    "                                          color: 'var(--brand)',\n"
    "                                          fontSize: '15px',\n"
    "                                          fontWeight: '800',\n"
    "                                          lineHeight: 1.35,\n"
    "                                        }}\n"
    "                                      >\n"
    "                                        {programmeDisplayName(programme.name)}\n"
    "                                      </div>",
    "admission page: classic programme picker uses friendly programme names",
)

save(path, c)
print("app/admission/page.js: programme names shown to applicants now use the friendly wording, and the Step 3 summary shows the flag emoji.")
