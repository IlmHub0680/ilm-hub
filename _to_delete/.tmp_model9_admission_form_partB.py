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
# 1. Step 1 JSX — Preferred Name, right after Full Name.
# ============================================================

content = r1(
    content,
    """                    <div>
                      <label style={commonLabelStyle}>{t('Full Name *')}</label>
                      <input type="text" required placeholder={t('Enter full legal name...')} value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} style={commonInputStyle} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={commonLabelStyle}>{t('Date of Birth *')}</label>""",
    """                    <div>
                      <label style={commonLabelStyle}>{t('Full Name *')}</label>
                      <input type="text" required placeholder={t('Enter full legal name...')} value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} style={commonInputStyle} />
                    </div>

                    <div>
                      <label style={commonLabelStyle}>{t('Preferred Name')}</label>
                      <input type="text" placeholder={t('What you\\'d like to be called, if different from your legal name')} value={formData.preferredName} onChange={(e) => setFormData({...formData, preferredName: e.target.value})} style={commonInputStyle} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={commonLabelStyle}>{t('Date of Birth *')}</label>""",
    "Step1 Preferred Name field",
)

# ============================================================
# 2. Step 2 JSX — academic background & placement self-assessment,
#    right after Institution Name, before the stage closes.
# ============================================================

content = r1(
    content,
    """                      <div>
                        <label style={commonLabelStyle}>{t('Institution Name *')}</label>
                        <input type="text" required value={formData.institutionName} onChange={(e) => setFormData({...formData, institutionName: e.target.value})} style={commonInputStyle} />
                      </div>
                    </div>
                  </>
                )}

                {/* STAGE 3: Programme, Session & Document Uploads */}""",
    """                      <div>
                        <label style={commonLabelStyle}>{t('Institution Name *')}</label>
                        <input type="text" required value={formData.institutionName} onChange={(e) => setFormData({...formData, institutionName: e.target.value})} style={commonInputStyle} />
                      </div>
                    </div>

                    <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 'bold', margin: '20px 0 10px 0', letterSpacing: '0.05em' }}>
                      {t('Islamic Studies & Placement Background')}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--ink-soft)', margin: '0 0 15px 0' }}>
                      {t('Your own account of your current level — used as a starting point for the placement assessment that follows admission, not as the placement result itself.')}
                    </p>

                    <div>
                      <label style={commonLabelStyle}>{t('Islamic Studies Background')}</label>
                      <textarea rows="3" placeholder={t('Any prior Islamic education, self-study, or memorization — in your own words')} value={formData.islamicStudiesBackground} onChange={(e) => setFormData({...formData, islamicStudiesBackground: e.target.value})} style={{...commonInputStyle, resize: 'none'}} />
                    </div>

                    <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 'bold', margin: '18px 0 10px 0', letterSpacing: '0.05em' }}>
                      {t("Qur'an")}
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      {renderSelfLevelField('Reading', 'quranReadingSelf')}
                      {renderSelfLevelField('Tajweed', 'quranTajweedSelf')}
                      {renderSelfLevelField('Hifz (memorization)', 'quranHifzSelf')}
                      {renderSelfLevelField('Recitation', 'quranRecitationSelf')}
                    </div>

                    <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 'bold', margin: '18px 0 10px 0', letterSpacing: '0.05em' }}>
                      {t('Arabic')}
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      {renderSelfLevelField('Reading', 'arabicReadingSelf')}
                      {renderSelfLevelField('Writing', 'arabicWritingSelf')}
                      {renderSelfLevelField('Grammar', 'arabicGrammarSelf')}
                      {renderSelfLevelField('Vocabulary', 'arabicVocabularySelf')}
                      {renderSelfLevelField('Conversation', 'arabicConversationSelf')}
                      {renderSelfLevelField("Qur'anic Arabic", 'quranicArabicSelf')}
                    </div>

                    <div style={{ marginTop: '18px' }}>
                      <label style={commonLabelStyle}>{t('Learning Goals')}</label>
                      <textarea rows="2" placeholder={t('What are you hoping to achieve by studying here?')} value={formData.learningGoals} onChange={(e) => setFormData({...formData, learningGoals: e.target.value})} style={{...commonInputStyle, resize: 'none'}} />
                    </div>

                    <div>
                      <label style={commonLabelStyle}>{t('Accessibility / Support Needs')}</label>
                      <textarea rows="2" placeholder={t('Anything the Academy should know to support your learning (optional)')} value={formData.supportNeeds} onChange={(e) => setFormData({...formData, supportNeeds: e.target.value})} style={{...commonInputStyle, resize: 'none'}} />
                    </div>
                  </>
                )}

                {/* STAGE 3: Programme, Session & Document Uploads */}""",
    "Step2 academic background & placement self-assessment block",
)

# ============================================================
# 3. Step 3 JSX — Pathway / Department / Specialization / Study
#    Mode, right after Study Session, before Document Uploads.
# ============================================================

content = r1(
    content,
    """                    <div>
                      <label style={commonLabelStyle}>{t('Select Study Session *')}</label>
                      <select required value={formData.studySession} onChange={(e) => setFormData({...formData, studySession: e.target.value})} style={commonInputStyle}>
                        <option value="Morning Session">{t('Morning Session')}</option>
                        <option value="Evening Session">{t('Evening Session')}</option>
                        <option value="Weekend Session">{t('Weekend Session')}</option>
                      </select>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '10px' }}>
                      <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--brand)', fontWeight: 'bold', margin: '0 0 5px 0', letterSpacing: '0.05em' }}>
                        {t('Required Document Uploads')}
                      </h4>""",
    """                    <div>
                      <label style={commonLabelStyle}>{t('Select Study Session *')}</label>
                      <select required value={formData.studySession} onChange={(e) => setFormData({...formData, studySession: e.target.value})} style={commonInputStyle}>
                        <option value="Morning Session">{t('Morning Session')}</option>
                        <option value="Evening Session">{t('Evening Session')}</option>
                        <option value="Weekend Session">{t('Weekend Session')}</option>
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={commonLabelStyle}>{t('Pathway Preference')}</label>
                        <select value={formData.pathwayPreference} onChange={(e) => setFormData({...formData, pathwayPreference: e.target.value})} style={commonInputStyle}>
                          <option value="">{t("Not sure — let placement decide")}</option>
                          {PATHWAY_OPTIONS.map((p) => <option key={p} value={p}>{t(p)}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={commonLabelStyle}>{t('Preferred Department')}</label>
                        <select value={formData.preferredDepartmentId} onChange={(e) => setFormData({...formData, preferredDepartmentId: e.target.value})} style={commonInputStyle}>
                          <option value="">{t('No preference')}</option>
                          {departmentOptions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={commonLabelStyle}>{t('Specialization (if any)')}</label>
                        <input type="text" placeholder={t('e.g. a specific area of interest within your pathway')} value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} style={commonInputStyle} />
                      </div>
                      <div>
                        <label style={commonLabelStyle}>{t('Study Mode')}</label>
                        <select value={formData.studyMode} onChange={(e) => setFormData({...formData, studyMode: e.target.value})} style={commonInputStyle}>
                          <option value="">{t('Select study mode')}</option>
                          <option value="FULL_TIME">{t('Full-time')}</option>
                          <option value="PART_TIME">{t('Part-time')}</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '10px' }}>
                      <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--brand)', fontWeight: 'bold', margin: '0 0 5px 0', letterSpacing: '0.05em' }}>
                        {t('Required Document Uploads')}
                      </h4>""",
    "Step3 pathway/department/specialization/studyMode fields",
)

# ============================================================
# 4. Step 3 JSX — Declaration, right after document uploads.
# ============================================================

content = r1(
    content,
    """                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* STAGE 4: Fee & Payment Gateway */}""",
    """                        )}
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: 'var(--ink)', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          required
                          checked={formData.declarationAccepted}
                          onChange={(e) => setFormData({...formData, declarationAccepted: e.target.checked})}
                          style={{ marginTop: '3px' }}
                        />
                        <span>
                          {t('I declare that the information provided in this application is accurate and complete to the best of my knowledge, and I understand that any document or document upload may be verified. *')}
                        </span>
                      </label>
                    </div>
                  </>
                )}

                {/* STAGE 4: Fee & Payment Gateway */}""",
    "Step3 declaration checkbox",
)

# ============================================================
# 5. isStageValid — Stage 3 now also requires the declaration.
# ============================================================

content = r1(
    content,
    """    if (stageNum === 3) {
      const isDiploma = formData.academicProgramme === 'Diploma in Islamic Sciences';
      const requiredBaseDocs = Boolean(formData.documents.passportPicture) && Boolean(formData.documents.identityDocument);

      if (isDiploma) {
        return Boolean(
          requiredBaseDocs &&
          formData.documents.transcripts &&
          formData.documents.certificate &&
          formData.documents.testimonial &&
          formData.documents.recommendation
        );
      }
      return requiredBaseDocs;
    }""",
    """    if (stageNum === 3) {
      const isDiploma = formData.academicProgramme === 'Diploma in Islamic Sciences';
      const requiredBaseDocs = Boolean(formData.documents.passportPicture) && Boolean(formData.documents.identityDocument);

      if (isDiploma) {
        return Boolean(
          requiredBaseDocs &&
          formData.documents.transcripts &&
          formData.documents.certificate &&
          formData.documents.testimonial &&
          formData.documents.recommendation &&
          formData.declarationAccepted
        );
      }
      return Boolean(requiredBaseDocs && formData.declarationAccepted);
    }""",
    "isStageValid declaration requirement",
)

# ============================================================
# 6. initiatePayment — include the new fields in the payload
#    that actually creates/updates the AdmissionApplication row.
# ============================================================

content = r1(
    content,
    """          institutionName: formData.institutionName,
          identityDocType: formData.identityDocType,
        }),
      });""",
    """          institutionName: formData.institutionName,
          identityDocType: formData.identityDocType,
          preferredName: formData.preferredName,
          pathwayPreference: formData.pathwayPreference,
          preferredDepartmentId: formData.preferredDepartmentId,
          specialization: formData.specialization,
          studyMode: formData.studyMode,
          islamicStudiesBackground: formData.islamicStudiesBackground,
          quranReadingSelf: formData.quranReadingSelf,
          quranTajweedSelf: formData.quranTajweedSelf,
          quranHifzSelf: formData.quranHifzSelf,
          quranRecitationSelf: formData.quranRecitationSelf,
          arabicReadingSelf: formData.arabicReadingSelf,
          arabicWritingSelf: formData.arabicWritingSelf,
          arabicGrammarSelf: formData.arabicGrammarSelf,
          arabicVocabularySelf: formData.arabicVocabularySelf,
          arabicConversationSelf: formData.arabicConversationSelf,
          quranicArabicSelf: formData.quranicArabicSelf,
          learningGoals: formData.learningGoals,
          supportNeeds: formData.supportNeeds,
          declarationAccepted: formData.declarationAccepted,
        }),
      });""",
    "initiatePayment payload new fields",
)

with io.open(PATH, "w", encoding="utf-8") as f:
    f.write(content)

print("Part B (JSX + validation + payload) done.")
