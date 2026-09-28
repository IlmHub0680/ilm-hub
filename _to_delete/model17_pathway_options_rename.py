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

OLD_BLOCK = (
    "    'Foundation Studies',\n"
    "    'Intermediate Islamic Studies',\n"
    "    'Advanced Islamic Studies',\n"
    "    'Diploma in Islamic Studies',\n"
    "    'Specialized Certificate Programs',"
)
NEW_BLOCK = (
    "    'Foundation Learning Program',\n"
    "    'Intermediate Learning Program',\n"
    "    'Advanced Islamic Studies',\n"
    "    'Diploma in Islamic Studies',\n"
    "    'Specialized Certificate Programs',"
)

path = "app/admission/page.js"
c = load(path)
c = r1(c, OLD_BLOCK, NEW_BLOCK, "admission page: rename PATHWAY_OPTIONS")
save(path, c)
print("app/admission/page.js: PATHWAY_OPTIONS renamed.")

OLD_BLOCK_TS = OLD_BLOCK.replace("    '", "  '")
NEW_BLOCK_TS = NEW_BLOCK.replace("    '", "  '")

path = "app/advisor-dashboard/page.tsx"
c = load(path)
c = r1(c, OLD_BLOCK_TS, NEW_BLOCK_TS, "advisor dashboard: rename PATHWAY_OPTIONS")
save(path, c)
print("app/advisor-dashboard/page.tsx: PATHWAY_OPTIONS renamed.")
