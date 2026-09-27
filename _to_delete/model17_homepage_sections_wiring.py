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
# app/page.jsx -- wire the Welcome text/cards, Academy section/icons,
# Our Approach section/steps and Bismillah banner to the new
# /admin/homepage/sections CMS, sourced from the same
# /api/homepage-content fetch the page already makes for the hero (no
# extra round trip). Defaults match the text that was hardcoded here
# before, so the page looks identical until an admin edits something.
# =======================================================================
path = "app/page.jsx"
c = load(path)

# --- state: seed with the exact previous hardcoded defaults ---
c = r1(
    c,
    "  useEffect(() => {\n"
    "    let cancelled = false;\n"
    "\n"
    "    fetch('/api/homepage-content')\n"
    "      .then((res) => (res.ok ? res.json() : null))\n"
    "      .then((result) => {\n"
    "        if (cancelled || !result?.success) return;\n"
    "\n"
    "        if (result.data.hero) setHero(result.data.hero);\n"
    "      })\n"
    "      .catch(() => {\n"
    "        // Keep the seeded defaults above — the homepage must never\n"
    "        // break because the CMS content couldn't be fetched.\n"
    "      });\n"
    "\n"
    "    return () => {\n"
    "      cancelled = true;\n"
    "    };\n"
    "  }, []);",
    "  // Welcome section, its four feature cards, the Academy section and\n"
    "  // its eight subject icons, the Our Approach section and its three\n"
    "  // steps, and the closing Bismillah banner -- all admin-editable at\n"
    "  // /admin/homepage/sections. Seeded with the site's original\n"
    "  // hardcoded copy so nothing changes on screen until an admin edits\n"
    "  // something there.\n"
    "  const [welcome, setWelcome] = useState({\n"
    "    badge: 'WELCOME TO ULUL AZM',\n"
    "    title: 'A place to seek knowledge with sincerity',\n"
    "    subtitle:\n"
    "      'Ulul Azm Institute brings together structured academic learning, classical Islamic scholarship, digital resources, and a community committed to beneficial knowledge, upright character, and lifelong learning.',\n"
    "  });\n"
    "\n"
    "  const [featureCards, setFeatureCards] = useState([\n"
    "    {\n"
    "      icon: '📚',\n"
    "      title: 'Structured Learning',\n"
    "      text: 'Progress through carefully organized academic programmes and courses designed to build knowledge systematically.',\n"
    "    },\n"
    "    {\n"
    "      icon: '🕌',\n"
    "      title: 'Islamic Scholarship',\n"
    "      text: \"Engage with the Qur'an, Sunnah, classical texts, and established Islamic disciplines through sound scholarly tradition.\",\n"
    "    },\n"
    "    {\n"
    "      icon: '🎓',\n"
    "      title: 'Student Development',\n"
    "      text: 'Develop sound knowledge, disciplined study habits, research ability, humility, and beneficial character.',\n"
    "    },\n"
    "    {\n"
    "      icon: '🌐',\n"
    "      title: 'Learning Without Borders',\n"
    "      text: 'Access educational opportunities and digital resources designed to support students wherever they are.',\n"
    "    },\n"
    "  ]);\n"
    "\n"
    "  const [academySection, setAcademySection] = useState({\n"
    "    badge: 'ACADEMY',\n"
    "    title: 'Explore Our Academic Programmes',\n"
    "    subtitle:\n"
    "      \"Explore our academic departments, programmes, courses, and areas of Islamic study, rooted in the Qur'an and Sunnah and presented through structured and disciplined learning.\",\n"
    "  });\n"
    "\n"
    "  const [academyItems, setAcademyItems] = useState([\n"
    "    { icon: '📖', text: \"Qur'anic Sciences\" },\n"
    "    { icon: '🗣️', text: 'Arabic Language' },\n"
    "    { icon: '📚', text: 'Hadith Studies' },\n"
    "    { icon: '⚖️', text: 'Fiqh & Usul' },\n"
    "    { icon: '☪️', text: 'Aqidah' },\n"
    "    { icon: '🎙️', text: 'Tajwid & Recitation' },\n"
    "    { icon: '☪️', text: 'Tauheed (Monotheism)' },\n"
    "    { icon: '🌱', text: 'Tarbiyah (Education)' },\n"
    "  ]);\n"
    "\n"
    "  const [approachSection, setApproachSection] = useState({\n"
    "    badge: 'OUR APPROACH',\n"
    "    title: 'More than a website — a learning environment',\n"
    "    subtitle: 'We aim to make the pursuit of Islamic knowledge organized, accessible, responsible and beneficial.',\n"
    "  });\n"
    "\n"
    "  const [approachSteps, setApproachSteps] = useState([\n"
    "    {\n"
    "      number: '01',\n"
    "      title: 'Authentic Foundations',\n"
    "      text: 'Begin with foundational disciplines before progressing into advanced studies.',\n"
    "    },\n"
    "    {\n"
    "      number: '02',\n"
    "      title: 'Structured Programmes',\n"
    "      text: 'Study through clearly defined academic areas rather than disconnected lessons.',\n"
    "    },\n"
    "    {\n"
    "      number: '03',\n"
    "      title: 'Responsible Scholarship',\n"
    "      text: 'Approach Islamic knowledge with sincerity, humility, discipline and respect for scholarship.',\n"
    "    },\n"
    "  ]);\n"
    "\n"
    "  const [ctaBanner, setCtaBanner] = useState({\n"
    "    arabicLine: 'BISMILLAH • SEEK KNOWLEDGE • SERVE WITH EXCELLENCE',\n"
    "    title: 'Begin Your Journey of Knowledge',\n"
    "    description: 'Explore academic programmes, educational resources, media library, and admissions opportunities.',\n"
    "  });\n"
    "\n"
    "  useEffect(() => {\n"
    "    let cancelled = false;\n"
    "\n"
    "    fetch('/api/homepage-content')\n"
    "      .then((res) => (res.ok ? res.json() : null))\n"
    "      .then((result) => {\n"
    "        if (cancelled || !result?.success) return;\n"
    "\n"
    "        if (result.data.hero) setHero(result.data.hero);\n"
    "        if (result.data.welcome) setWelcome(result.data.welcome);\n"
    "        if (Array.isArray(result.data.featureCards) && result.data.featureCards.length > 0) {\n"
    "          setFeatureCards(result.data.featureCards);\n"
    "        }\n"
    "        if (result.data.academySection) setAcademySection(result.data.academySection);\n"
    "        if (Array.isArray(result.data.academyItems) && result.data.academyItems.length > 0) {\n"
    "          setAcademyItems(result.data.academyItems);\n"
    "        }\n"
    "        if (result.data.approachSection) setApproachSection(result.data.approachSection);\n"
    "        if (Array.isArray(result.data.approachSteps) && result.data.approachSteps.length > 0) {\n"
    "          setApproachSteps(result.data.approachSteps);\n"
    "        }\n"
    "        if (result.data.ctaBanner) setCtaBanner(result.data.ctaBanner);\n"
    "      })\n"
    "      .catch(() => {\n"
    "        // Keep the seeded defaults above — the homepage must never\n"
    "        // break because the CMS content couldn't be fetched.\n"
    "      });\n"
    "\n"
    "    return () => {\n"
    "      cancelled = true;\n"
    "    };\n"
    "  }, []);",
    "app/page.jsx: add CMS state for Welcome/Academy/Approach/CTA sections and fetch them",
)

# --- WELCOME heading text ---
c = r1(
    c,
    "          <span style={goldLabel}>\n"
    "            {t('WELCOME TO ULUL AZM')}\n"
    "          </span>\n"
    "\n"
    "          <h2 style={sectionTitle}>\n"
    "            {t('A place to seek knowledge with sincerity')}\n"
    "          </h2>\n"
    "\n"
    "          <p style={sectionDescription}>\n"
    "            {t(\"Ulul Azm Institute brings together structured academic learning, classical Islamic scholarship, digital resources, and a community committed to beneficial knowledge, upright character, and lifelong learning.\")}\n"
    "          </p>",
    "          <span style={goldLabel}>\n"
    "            {t(welcome.badge)}\n"
    "          </span>\n"
    "\n"
    "          <h2 style={sectionTitle}>\n"
    "            {t(welcome.title)}\n"
    "          </h2>\n"
    "\n"
    "          <p style={sectionDescription}>\n"
    "            {t(welcome.subtitle)}\n"
    "          </p>",
    "app/page.jsx: Welcome heading reads from CMS state",
)

# --- Feature cards ---
c = r1(
    c,
    "        <div style={cardGrid}>\n"
    "\n"
    "          <FeatureCard\n"
    "            icon=\"📚\"\n"
    "            title={t('Structured Learning')}\n"
    "            text={t('Progress through carefully organized academic programmes and courses designed to build knowledge systematically.')}\n"
    "          />\n"
    "\n"
    "          <FeatureCard\n"
    "            icon=\"🕌\"\n"
    "            title={t('Islamic Scholarship')}\n"
    "            text={t(\"Engage with the Qur'an, Sunnah, classical texts, and established Islamic disciplines through sound scholarly tradition.\")}\n"
    "          />\n"
    "\n"
    "          <FeatureCard\n"
    "            icon=\"🎓\"\n"
    "            title={t('Student Development')}\n"
    "            text={t('Develop sound knowledge, disciplined study habits, research ability, humility, and beneficial character.')}\n"
    "          />\n"
    "\n"
    "          <FeatureCard\n"
    "            icon=\"🌐\"\n"
    "            title={t('Learning Without Borders')}\n"
    "            text={t('Access educational opportunities and digital resources designed to support students wherever they are.')}\n"
    "          />\n"
    "\n"
    "        </div>",
    "        <div style={cardGrid}>\n"
    "\n"
    "          {featureCards.map((card, i) => (\n"
    "            <FeatureCard key={i} icon={card.icon} title={t(card.title)} text={t(card.text)} />\n"
    "          ))}\n"
    "\n"
    "        </div>",
    "app/page.jsx: feature cards render from CMS state",
)

# --- ACADEMY heading text ---
c = r1(
    c,
    "          <span style={goldLabel}>\n"
    "            {t('ACADEMY')}\n"
    "          </span>\n"
    "\n"
    "          <h2 style={sectionTitleWhite}>\n"
    "            {t('Explore Our Academic Programmes')}\n"
    "          </h2>\n"
    "\n"
    "          <p style={whiteDescription}>\n"
    "            {t(\"Explore our academic departments, programmes, courses, and areas of Islamic study, rooted in the Qur'an and Sunnah and presented through structured and disciplined learning.\")}\n"
    "          </p>",
    "          <span style={goldLabel}>\n"
    "            {t(academySection.badge)}\n"
    "          </span>\n"
    "\n"
    "          <h2 style={sectionTitleWhite}>\n"
    "            {t(academySection.title)}\n"
    "          </h2>\n"
    "\n"
    "          <p style={whiteDescription}>\n"
    "            {t(academySection.subtitle)}\n"
    "          </p>",
    "app/page.jsx: Academy heading reads from CMS state",
)

# --- Academy subject icons ---
c = r1(
    c,
    "          <div style={miniFeatureGrid}>\n"
    "\n"
    "            <MiniFeature\n"
    "              icon=\"📖\"\n"
    "              text={t(\"Qur'anic Sciences\")}\n"
    "            />\n"
    "\n"
    "            <MiniFeature\n"
    "              icon=\"🗣️\"\n"
    "              text={t('Arabic Language')}\n"
    "            />\n"
    "\n"
    "            <MiniFeature\n"
    "              icon=\"📚\"\n"
    "              text={t('Hadith Studies')}\n"
    "            />\n"
    "\n"
    "            <MiniFeature\n"
    "              icon=\"⚖️\"\n"
    "              text={t('Fiqh & Usul')}\n"
    "            />\n"
    "\n"
    "            <MiniFeature\n"
    "              icon=\"☪️\"\n"
    "              text={t('Aqidah')}\n"
    "            />\n"
    "\n"
    "            <MiniFeature\n"
    "              icon=\"🎙️\"\n"
    "              text={t('Tajwid & Recitation')}\n"
    "            />\n"
    "\n"
    "            <MiniFeature\n"
    "              icon=\"☪️\"\n"
    "              text={t('Tauheed (Monotheism)')}\n"
    "            />\n"
    "\n"
    "            <MiniFeature\n"
    "              icon=\"🌱\"\n"
    "              text={t('Tarbiyah (Education)')}\n"
    "            />\n"
    "\n"
    "          </div>",
    "          <div style={miniFeatureGrid}>\n"
    "\n"
    "            {academyItems.map((item, i) => (\n"
    "              <MiniFeature key={i} icon={item.icon} text={t(item.text)} />\n"
    "            ))}\n"
    "\n"
    "          </div>",
    "app/page.jsx: Academy subject icons render from CMS state",
)

# --- OUR APPROACH heading text ---
c = r1(
    c,
    "          <span style={goldLabel}>\n"
    "            {t('OUR APPROACH')}\n"
    "          </span>\n"
    "\n"
    "          <h2 style={sectionTitle}>\n"
    "            {t('More than a website — a learning environment')}\n"
    "          </h2>\n"
    "\n"
    "          <p style={sectionDescription}>\n"
    "            {t('We aim to make the pursuit of Islamic knowledge organized, accessible, responsible and beneficial.')}\n"
    "          </p>",
    "          <span style={goldLabel}>\n"
    "            {t(approachSection.badge)}\n"
    "          </span>\n"
    "\n"
    "          <h2 style={sectionTitle}>\n"
    "            {t(approachSection.title)}\n"
    "          </h2>\n"
    "\n"
    "          <p style={sectionDescription}>\n"
    "            {t(approachSection.subtitle)}\n"
    "          </p>",
    "app/page.jsx: Our Approach heading reads from CMS state",
)

# --- Approach steps ---
c = r1(
    c,
    "        <div style={infoGrid}>\n"
    "\n"
    "          <InfoBox\n"
    "            number=\"01\"\n"
    "            title={t('Authentic Foundations')}\n"
    "            text={t('Begin with foundational disciplines before progressing into advanced studies.')}\n"
    "          />\n"
    "\n"
    "          <InfoBox\n"
    "            number=\"02\"\n"
    "            title={t('Structured Programmes')}\n"
    "            text={t('Study through clearly defined academic areas rather than disconnected lessons.')}\n"
    "          />\n"
    "\n"
    "          <InfoBox\n"
    "            number=\"03\"\n"
    "            title={t('Responsible Scholarship')}\n"
    "            text={t('Approach Islamic knowledge with sincerity, humility, discipline and respect for scholarship.')}\n"
    "          />\n"
    "\n"
    "        </div>",
    "        <div style={infoGrid}>\n"
    "\n"
    "          {approachSteps.map((step, i) => (\n"
    "            <InfoBox key={i} number={step.number} title={t(step.title)} text={t(step.text)} />\n"
    "          ))}\n"
    "\n"
    "        </div>",
    "app/page.jsx: approach steps render from CMS state",
)

# --- Bismillah / CTA banner ---
c = r1(
    c,
    "          <div style={arabic}>\n"
    "            {t('BISMILLAH • SEEK KNOWLEDGE • SERVE WITH EXCELLENCE')}\n"
    "          </div>\n"
    "\n"
    "          <h2 style={ctaTitle}>\n"
    "            {t('Begin Your Journey of Knowledge')}\n"
    "          </h2>\n"
    "\n"
    "          <p style={whiteDescription}>\n"
    "            {t('Explore academic programmes, educational resources, media library, and admissions opportunities.')}\n"
    "          </p>",
    "          <div style={arabic}>\n"
    "            {t(ctaBanner.arabicLine)}\n"
    "          </div>\n"
    "\n"
    "          <h2 style={ctaTitle}>\n"
    "            {t(ctaBanner.title)}\n"
    "          </h2>\n"
    "\n"
    "          <p style={whiteDescription}>\n"
    "            {t(ctaBanner.description)}\n"
    "          </p>",
    "app/page.jsx: Bismillah banner reads from CMS state",
)

save(path, c)
print("app/page.jsx: Welcome/feature cards, Academy/subject icons, Our Approach/steps and the Bismillah banner are all now CMS-driven via /admin/homepage/sections.")
