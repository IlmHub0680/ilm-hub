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

path = "app/admission/page.js"
c = load(path)

# -----------------------------------------------------------------------
# The International wizard track leaves countryOfResidence blank on
# purpose (Ghana would be wrong), so the field needs a real placeholder
# option to render sensibly, plus a one-line reminder of what the
# applicant already told the wizard -- this is the one place the
# wizard's Student Type answer becomes a question again, and only
# because a specific country genuinely wasn't asked yet.
# -----------------------------------------------------------------------
c = r1(
    c,
    "                      <div>\n"
    "                        <label style={commonLabelStyle}>{t('Country of Residence *')}</label>\n"
    "                        <select required value={formData.countryOfResidence} onChange={(e) => setFormData({...formData, countryOfResidence: e.target.value})} style={commonInputStyle}>\n"
    "                          {countryList.map((c, i) => <option key={i} value={c}>{c}</option>)}\n"
    "                        </select>\n"
    "                      </div>",
    "                      <div>\n"
    "                        <label style={commonLabelStyle}>{t('Country of Residence *')}</label>\n"
    "                        <select required value={formData.countryOfResidence} onChange={(e) => setFormData({...formData, countryOfResidence: e.target.value})} style={commonInputStyle}>\n"
    "                          {!formData.countryOfResidence && (\n"
    "                            <option value=\"\" disabled>{t('-- Select your country --')}</option>\n"
    "                          )}\n"
    "                          {countryList.map((c, i) => <option key={i} value={c}>{c}</option>)}\n"
    "                        </select>\n"
    "                        {wizardResidency === 'INTERNATIONAL' && !formData.countryOfResidence && (\n"
    "                          <p style={{ fontSize: '12px', color: 'var(--gold-dark)', margin: '6px 0 0' }}>\n"
    "                            {t('You told us you are applying as an International student -- please select your specific country.')}\n"
    "                          </p>\n"
    "                        )}\n"
    "                      </div>",
    "admission page: country field placeholder + international reminder",
)

save(path, c)
print("app/admission/page.js: country field now supports the wizard's blank International default.")
