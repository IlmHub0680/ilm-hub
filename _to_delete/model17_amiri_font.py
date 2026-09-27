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
# app/globals.css -- every Arabic-rendering component in the app reads
# its font from one of two CSS variables (--font-arabic-display for
# headings, --font-arabic for body text/RTL blocks) defined once here.
# --font-arabic-display already used Amiri first; --font-arabic was
# still Noto Sans Arabic, so ordinary RTL body text (application forms,
# programme/course pages, admin RTL inputs, etc.) rendered in a
# different typeface than headings. Making both Amiri-first makes
# "all Arabic, everywhere" consistent with a single change, since
# every component already references the variable rather than a
# hardcoded font.
# =======================================================================
path = "app/globals.css"
c = load(path)

c = r1(
    c,
    "  --font-arabic-display:'Amiri','Traditional Arabic','Noto Naskh Arabic',serif;\n"
    "  --font-arabic:'Noto Sans Arabic','Segoe UI',Tahoma,sans-serif;",
    "  --font-arabic-display:'Amiri','Traditional Arabic','Noto Naskh Arabic',serif;\n"
    "  --font-arabic:'Amiri','Traditional Arabic','Noto Naskh Arabic','Noto Sans Arabic',serif;",
    "globals.css: make Arabic body text Amiri too, not just headings",
)

save(path, c)
print("app/globals.css: Amiri is now the font for all Arabic text sitewide (body and headings).")
