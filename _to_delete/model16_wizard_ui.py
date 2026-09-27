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

WIZARD_JSX = """          {!submitted && !isPaymentReturn && !wizardComplete && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '28px' }}>
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      color: step <= wizardStep ? 'var(--on-accent, #fff)' : 'var(--ink-soft)',
                      background: step <= wizardStep ? 'var(--brand)' : 'var(--border-soft)',
                      border: step === wizardStep ? '2px solid var(--gold)' : '2px solid transparent',
                    }}
                  >
                    {step}
                  </div>
                ))}
              </div>

              {wizardStep === 1 && (
                <div>
                  <h2 style={{ fontSize: '20px', color: 'var(--ink)', textAlign: 'center', margin: '0 0 6px 0', fontWeight: 'bold' }}>
                    {t('Step 1 of 3: Who Are You Applying As?')}
                  </h2>
                  <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', textAlign: 'center', margin: '0 0 26px 0' }}>
                    {t('This determines your application fee currency and payment method. You can still refine your country of residence in the application itself.')}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                    <button
                      type="button"
                      onClick={() => { setWizardResidency('RESIDENT'); setWizardStep(2); }}
                      style={wizardCardStyle(wizardResidency === 'RESIDENT')}
                    >
                      <div style={{ fontSize: '28px', marginBottom: '10px' }} aria-hidden="true">🇬🇭</div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--brand)', marginBottom: '6px' }}>
                        {t('New Student — Resident')}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
                        {t('Living in Ghana. Application fee is charged in GHS via Mobile Money or card.')}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setWizardResidency('INTERNATIONAL'); setWizardStep(2); }}
                      style={wizardCardStyle(wizardResidency === 'INTERNATIONAL')}
                    >
                      <div style={{ fontSize: '28px', marginBottom: '10px' }} aria-hidden="true">🌍</div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--brand)', marginBottom: '6px' }}>
                        {t('New Student — International')}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
                        {t('Living outside Ghana. Application fee is charged in USD by card.')}
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    style={wizardBackLinkStyle}
                  >
                    ← {t('Back')}
                  </button>

                  <h2 style={{ fontSize: '20px', color: 'var(--ink)', textAlign: 'center', margin: '0 0 6px 0', fontWeight: 'bold' }}>
                    {t('Step 2 of 3: Choose Your Programme')}
                  </h2>
                  <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', textAlign: 'center', margin: '0 0 26px 0' }}>
                    {t('These are the programmes currently open for admission.')}
                  </p>

                  {programmesLoading && (
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', color: 'var(--ink-soft)', fontSize: '13px', textAlign: 'center' }}>
                      {t('Loading academic programmes...')}
                    </div>
                  )}

                  {programmesError && (
                    <div style={{ background: 'var(--danger-tint)', border: '1px solid var(--danger-tint)', borderRadius: '12px', padding: '12px 14px', color: 'var(--danger)', fontSize: '13px', marginBottom: '12px' }}>
                      {programmesError}
                    </div>
                  )}

                  {!programmesLoading && !programmesError && activeProgrammes.length === 0 && (
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', color: 'var(--ink-soft)', fontSize: '13px', textAlign: 'center' }}>
                      {t('No programmes are currently open for admission. Please check back soon.')}
                    </div>
                  )}

                  {!programmesLoading && !programmesError && activeProgrammes.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                      {activeProgrammes.map((programme) => (
                        <button
                          key={programme.id}
                          type="button"
                          onClick={() => { setWizardProgramId(programme.id); setWizardStep(3); }}
                          style={wizardCardStyle(wizardProgramId === programme.id)}
                        >
                          <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--brand)', marginBottom: '6px' }}>
                            {programme.name}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                            {programme.level}{programme.duration ? ` · ${programme.duration}` : ''}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {wizardStep === 3 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    style={wizardBackLinkStyle}
                  >
                    ← {t('Back')}
                  </button>

                  <h2 style={{ fontSize: '20px', color: 'var(--ink)', textAlign: 'center', margin: '0 0 6px 0', fontWeight: 'bold' }}>
                    {t('Step 3 of 3: Ready to Apply')}
                  </h2>
                  <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', textAlign: 'center', margin: '0 0 26px 0' }}>
                    {t("Here's what you told us. You can change your specific country and programme details inside the application.")}
                  </p>

                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-soft)' }}>
                      <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-soft)', fontWeight: 'bold' }}>
                        {t('Applying as')}
                      </span>
                      <strong style={{ color: 'var(--ink)' }}>
                        {wizardResidency === 'RESIDENT' ? t('New Student — Resident') : t('New Student — International')}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                      <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-soft)', fontWeight: 'bold' }}>
                        {t('Programme')}
                      </span>
                      <strong style={{ color: 'var(--ink)', textAlign: 'right' }}>
                        {wizardSelectedProgramme ? wizardSelectedProgramme.name : '—'}
                      </strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={restartWizard}
                      style={{ padding: '12px 26px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink-soft)', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
                    >
                      {t('Start Over')}
                    </button>
                    <button
                      type="button"
                      disabled={!wizardResidency || !wizardProgramId}
                      onClick={startApplicationFromWizard}
                      style={{
                        padding: '12px 32px',
                        borderRadius: '10px',
                        border: 'none',
                        background: (!wizardResidency || !wizardProgramId) ? 'var(--border)' : 'var(--brand)',
                        color: 'var(--on-accent, #fff)',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        cursor: (!wizardResidency || !wizardProgramId) ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {t('Go to Application →')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

"""

c = r1(
    c,
    "          {!submitted && !isPaymentReturn && (\n"
    "            <>\n"
    "              {/* Stepper navigation bar */}",
    WIZARD_JSX +
    "          {!submitted && !isPaymentReturn && wizardComplete && (\n"
    "            <>\n"
    "              {/* Stepper navigation bar */}",
    "admission page: insert wizard JSX + gate the existing form on wizardComplete",
)

c = r1(
    c,
    "  const commonLabelStyle = {\n"
    "    display: 'block',\n"
    "    fontSize: '12px',\n"
    "    fontWeight: 'bold',\n"
    "    color: 'var(--ink-soft)',\n"
    "    textTransform: 'uppercase',\n"
    "    letterSpacing: '0.05em',\n"
    "  };",
    "  const commonLabelStyle = {\n"
    "    display: 'block',\n"
    "    fontSize: '12px',\n"
    "    fontWeight: 'bold',\n"
    "    color: 'var(--ink-soft)',\n"
    "    textTransform: 'uppercase',\n"
    "    letterSpacing: '0.05em',\n"
    "  };\n"
    "\n"
    "  // Model 16 \"Apply Now\" wizard card/back-link styling.\n"
    "  const wizardCardStyle = (isSelected) => ({\n"
    "    textAlign: 'left',\n"
    "    border: isSelected ? '2px solid var(--brand)' : '1px solid var(--border)',\n"
    "    background: isSelected ? 'var(--brand-tint)' : 'var(--surface)',\n"
    "    borderRadius: '14px',\n"
    "    padding: '18px',\n"
    "    cursor: 'pointer',\n"
    "    transition: 'all 0.2s ease',\n"
    "    boxShadow: isSelected ? '0 5px 18px rgba(21, 128, 61, 0.14)' : '0 2px 8px rgba(15, 23, 42, 0.04)',\n"
    "  });\n"
    "\n"
    "  const wizardBackLinkStyle = {\n"
    "    display: 'inline-flex',\n"
    "    alignItems: 'center',\n"
    "    gap: '6px',\n"
    "    marginBottom: '16px',\n"
    "    background: 'none',\n"
    "    border: 'none',\n"
    "    padding: 0,\n"
    "    color: 'var(--ink-soft)',\n"
    "    fontSize: '13.5px',\n"
    "    fontWeight: 'bold',\n"
    "    cursor: 'pointer',\n"
    "  };",
    "admission page: add wizardCardStyle + wizardBackLinkStyle helpers",
)

save(path, c)
print("app/admission/page.js: wizard JSX inserted, existing form gated on wizardComplete.")
