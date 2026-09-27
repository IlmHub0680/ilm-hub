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

# 1. Close HomeContent and add the real default export, wrapping it in
#    the homepage-scoped LanguageProvider (mirrors the Admission flow's
#    own layout.jsx + LanguageProvider split, just inline in one file
#    since app/page.jsx has no layout.jsx of its own).
c = r1(
    c,
    "    </div>\n"
    "  );\n"
    "}\n"
    "\n"
    "/* ============================================================\n"
    "   COMPONENTS\n"
    "============================================================ */\n"
    "\n"
    "function NavLink({ href, children }) {",
    "    </div>\n"
    "  );\n"
    "}\n"
    "\n"
    "export default function Home() {\n"
    "  return (\n"
    "    <LanguageProvider>\n"
    "      <HomeContent />\n"
    "    </LanguageProvider>\n"
    "  );\n"
    "}\n"
    "\n"
    "/* ============================================================\n"
    "   COMPONENTS\n"
    "============================================================ */\n"
    "\n"
    "function NavLink({ href, children }) {",
    "page: add default export Home() wrapping HomeContent in LanguageProvider",
)

# 2. Style constants for the top-bar EN/AR toggle buttons.
c = r1(
    c,
    "const topBarDivider = {\n"
    "  margin: '0 8px',\n"
    "  opacity: 0.5,\n"
    "};\n",
    "const topBarDivider = {\n"
    "  margin: '0 8px',\n"
    "  opacity: 0.5,\n"
    "};\n"
    "\n"
    "const langToggleRow = {\n"
    "  display: 'flex',\n"
    "  gap: 6,\n"
    "};\n"
    "\n"
    "const langToggleBtn = {\n"
    "  background: 'transparent',\n"
    "  border: '1px solid rgba(255,255,255,.4)',\n"
    "  color: 'var(--on-accent)',\n"
    "  borderRadius: 999,\n"
    "  padding: '3px 11px',\n"
    "  fontSize: '11px',\n"
    "  fontWeight: 700,\n"
    "  cursor: 'pointer',\n"
    "  opacity: 0.75,\n"
    "};\n"
    "\n"
    "const langToggleBtnActive = {\n"
    "  ...langToggleBtn,\n"
    "  background: 'rgba(255,255,255,.2)',\n"
    "  opacity: 1,\n"
    "};\n",
    "page: add langToggle style constants",
)

save(path, c)
print("app/page.jsx: pass 2f (default export wrapper + toggle button styles) done.")
