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

path = "app/page.jsx"
c = load(path)

# AcademicProgramsSection.
c = r1(
    c,
    "function AcademicProgramsSection() {\n"
    "  const [programIds, setProgramIds] = useState({});\n"
    "  const [loaded, setLoaded] = useState(false);\n",
    "function AcademicProgramsSection() {\n"
    "  const { t, dir } = useLanguage();\n"
    "  const [programIds, setProgramIds] = useState({});\n"
    "  const [loaded, setLoaded] = useState(false);\n",
    "AcademicProgramsSection: pull in useLanguage",
)

c = r1(
    c,
    "  return (\n"
    "    <section style={sectionStyle}>\n"
    "      <div style={headingContainer}>\n"
    "        <span style={goldLabel}>ACADEMIC PROGRAMS</span>\n"
    "\n"
    "        <h2 style={{ ...sectionTitle, whiteSpace: 'normal' }}>\n"
    "          Five Pathways, One Progression\n"
    "        </h2>\n"
    "\n"
    "        <p style={sectionDescription}>\n"
    "          Every learner enters at the pathway that matches their starting\n"
    "          point and progresses in sequence -- from Foundation Studies\n"
    "          through to the Diploma in Islamic Studies, with a Specialized\n"
    "          Certificate reachable after Advanced or the Diploma. This is an\n"
    "          overview of each tier; the full framework and course-by-course\n"
    "          detail live on their own pages.\n"
    "        </p>\n"
    "      </div>\n"
    "\n"
    "      <div style={pathwayGrid}>\n"
    "        {PATHWAY_TIERS.map((tier) => (\n"
    "          <PathwayCard key={tier.level} tier={tier} programId={programIds[tier.level]} loaded={loaded} />\n"
    "        ))}\n"
    "      </div>\n"
    "\n"
    "      <div style={{ textAlign: 'center', marginTop: '34px' }}>\n"
    "        <Link href=\"/academy-pathways\" style={outlineButton}>\n"
    "          Read the Full Academic Pathways Framework →\n"
    "        </Link>\n"
    "      </div>\n"
    "    </section>\n"
    "  );\n"
    "}",
    "  return (\n"
    "    <section style={sectionStyle} dir={dir}>\n"
    "      <div style={headingContainer}>\n"
    "        <span style={goldLabel}>{t('ACADEMIC PROGRAMS')}</span>\n"
    "\n"
    "        <h2 style={{ ...sectionTitle, whiteSpace: 'normal' }}>\n"
    "          {t('Five Pathways, One Progression')}\n"
    "        </h2>\n"
    "\n"
    "        <p style={sectionDescription}>\n"
    "          {t(\"Every learner enters at the pathway that matches their starting point and progresses in sequence -- from Foundation Studies through to the Diploma in Islamic Studies, with a Specialized Certificate reachable after Advanced or the Diploma. This is an overview of each tier; the full framework and course-by-course detail live on their own pages.\")}\n"
    "        </p>\n"
    "      </div>\n"
    "\n"
    "      <div style={pathwayGrid}>\n"
    "        {PATHWAY_TIERS.map((tier) => (\n"
    "          <PathwayCard key={tier.level} tier={tier} programId={programIds[tier.level]} loaded={loaded} />\n"
    "        ))}\n"
    "      </div>\n"
    "\n"
    "      <div style={{ textAlign: 'center', marginTop: '34px' }}>\n"
    "        <Link href=\"/academy-pathways\" style={outlineButton}>\n"
    "          {t('Read the Full Academic Pathways Framework →')}\n"
    "        </Link>\n"
    "      </div>\n"
    "    </section>\n"
    "  );\n"
    "}",
    "AcademicProgramsSection: translate label/heading/paragraph/button",
)

# PathwayCard.
c = r1(
    c,
    "function PathwayCard({ tier, programId, loaded }) {\n"
    "  const detailsHref = tier.hasProgram",
    "function PathwayCard({ tier, programId, loaded }) {\n"
    "  const { t } = useLanguage();\n"
    "  const detailsHref = tier.hasProgram",
    "PathwayCard: pull in useLanguage",
)

c = r1(
    c,
    "    <div style={pathwayCard}>\n"
    "      <div style={pathwayCardHeader}>\n"
    "        <span style={pathwayTierBadge}>{tier.badge}</span>\n"
    "        <h3 style={pathwayCardTitle}>{tier.name}</h3>\n"
    "      </div>\n"
    "\n"
    "      <p style={pathwayPurpose}>{tier.purpose}</p>\n"
    "\n"
    "      <dl style={pathwayMetaList}>\n"
    "        <div style={pathwayMetaRow}>\n"
    "          <dt style={pathwayMetaLabel}>Who it&apos;s for</dt>\n"
    "          <dd style={pathwayMetaValue}>{tier.who}</dd>\n"
    "        </div>\n"
    "        <div style={pathwayMetaRow}>\n"
    "          <dt style={pathwayMetaLabel}>Study areas</dt>\n"
    "          <dd style={pathwayMetaValue}>{tier.studyAreas.join(' · ')}</dd>\n"
    "        </div>\n"
    "        <div style={pathwayMetaRow}>\n"
    "          <dt style={pathwayMetaLabel}>Duration</dt>\n"
    "          <dd style={pathwayMetaValue}>{tier.duration}</dd>\n"
    "        </div>\n"
    "        <div style={pathwayMetaRow}>\n"
    "          <dt style={pathwayMetaLabel}>Delivery</dt>\n"
    "          <dd style={pathwayMetaValue}>{tier.delivery}</dd>\n"
    "        </div>\n"
    "        <div style={pathwayMetaRow}>\n"
    "          <dt style={pathwayMetaLabel}>Progression</dt>\n"
    "          <dd style={pathwayMetaValue}>{tier.progression}</dd>\n"
    "        </div>\n"
    "        <div style={pathwayMetaRow}>\n"
    "          <dt style={pathwayMetaLabel}>Admission</dt>\n"
    "          <dd style={pathwayMetaValue}>{tier.admission}</dd>\n"
    "        </div>\n"
    "      </dl>\n"
    "\n"
    "      {tier.note && <p style={pathwayNote}>{tier.note}</p>}\n"
    "\n"
    "      <div style={pathwayCardFooter}>\n"
    "        <Link href={detailsHref} style={pathwayLinkPrimary}>\n"
    "          {tier.hasProgram ? 'Programme Details' : 'Learn About This Pathway'} →\n"
    "        </Link>\n"
    "\n"
    "        {tier.canApply && (\n"
    "          <Link href=\"/admission\" style={pathwayLinkSecondary}>\n"
    "            Apply\n"
    "          </Link>\n"
    "        )}\n"
    "      </div>\n"
    "    </div>",
    "    <div style={pathwayCard}>\n"
    "      <div style={pathwayCardHeader}>\n"
    "        <span style={pathwayTierBadge}>{t(tier.badge)}</span>\n"
    "        <h3 style={pathwayCardTitle}>{t(tier.name)}</h3>\n"
    "      </div>\n"
    "\n"
    "      <p style={pathwayPurpose}>{t(tier.purpose)}</p>\n"
    "\n"
    "      <dl style={pathwayMetaList}>\n"
    "        <div style={pathwayMetaRow}>\n"
    "          <dt style={pathwayMetaLabel}>{t(\"Who it's for\")}</dt>\n"
    "          <dd style={pathwayMetaValue}>{t(tier.who)}</dd>\n"
    "        </div>\n"
    "        <div style={pathwayMetaRow}>\n"
    "          <dt style={pathwayMetaLabel}>{t('Study areas')}</dt>\n"
    "          <dd style={pathwayMetaValue}>{t(tier.studyAreas.join(' · '))}</dd>\n"
    "        </div>\n"
    "        <div style={pathwayMetaRow}>\n"
    "          <dt style={pathwayMetaLabel}>{t('Duration')}</dt>\n"
    "          <dd style={pathwayMetaValue}>{t(tier.duration)}</dd>\n"
    "        </div>\n"
    "        <div style={pathwayMetaRow}>\n"
    "          <dt style={pathwayMetaLabel}>{t('Delivery')}</dt>\n"
    "          <dd style={pathwayMetaValue}>{t(tier.delivery)}</dd>\n"
    "        </div>\n"
    "        <div style={pathwayMetaRow}>\n"
    "          <dt style={pathwayMetaLabel}>{t('Progression')}</dt>\n"
    "          <dd style={pathwayMetaValue}>{t(tier.progression)}</dd>\n"
    "        </div>\n"
    "        <div style={pathwayMetaRow}>\n"
    "          <dt style={pathwayMetaLabel}>{t('Admission')}</dt>\n"
    "          <dd style={pathwayMetaValue}>{t(tier.admission)}</dd>\n"
    "        </div>\n"
    "      </dl>\n"
    "\n"
    "      {tier.note && <p style={pathwayNote}>{t(tier.note)}</p>}\n"
    "\n"
    "      <div style={pathwayCardFooter}>\n"
    "        <Link href={detailsHref} style={pathwayLinkPrimary}>\n"
    "          {t(tier.hasProgram ? 'Programme Details' : 'Learn About This Pathway')} →\n"
    "        </Link>\n"
    "\n"
    "        {tier.canApply && (\n"
    "          <Link href=\"/admission\" style={pathwayLinkSecondary}>\n"
    "            {t('Apply')}\n"
    "          </Link>\n"
    "        )}\n"
    "      </div>\n"
    "    </div>",
    "PathwayCard: translate all fields + static labels",
)

save(path, c)
print("app/page.jsx: pass 2e (AcademicProgramsSection + PathwayCard) done.")
