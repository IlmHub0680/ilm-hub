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

# AnnouncementsStrip -- static label/heading only; the notices themselves
# are live DB content authored per-announcement, left untranslated.
c = r1(
    c,
    "function AnnouncementsStrip() {\n"
    "  const [announcements, setAnnouncements] = useState([]);\n"
    "  const [loaded, setLoaded] = useState(false);\n",
    "function AnnouncementsStrip() {\n"
    "  const { t, dir } = useLanguage();\n"
    "  const [announcements, setAnnouncements] = useState([]);\n"
    "  const [loaded, setLoaded] = useState(false);\n",
    "AnnouncementsStrip: pull in useLanguage",
)

c = r1(
    c,
    "  return (\n"
    "    <section style={announcementsSectionStyle}>\n"
    "      <div style={headingContainer}>\n"
    "        <span style={goldLabel}>NOTICES &amp; ANNOUNCEMENTS</span>\n"
    "\n"
    "        <h2 style={sectionTitle}>\n"
    "          What&apos;s happening at Ulul Azm\n"
    "        </h2>\n"
    "      </div>",
    "  return (\n"
    "    <section style={announcementsSectionStyle} dir={dir}>\n"
    "      <div style={headingContainer}>\n"
    "        <span style={goldLabel}>{t('NOTICES & ANNOUNCEMENTS')}</span>\n"
    "\n"
    "        <h2 style={sectionTitle}>\n"
    "          {t(\"What's happening at Ulul Azm\")}\n"
    "        </h2>\n"
    "      </div>",
    "AnnouncementsStrip: translate label + heading",
)

save(path, c)
print("app/page.jsx: pass 2d-1 (AnnouncementsStrip) done.")
