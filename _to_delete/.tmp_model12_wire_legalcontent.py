# -*- coding: utf-8 -*-
import io

def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d" % (label, c)
    return content.replace(old, new)

with io.open("model12_document_body.html", "r", encoding="utf-8") as f:
    body = f.read()

path = "lib/legalContentDefaults.js"
with io.open(path, "r", encoding="utf-8") as f:
    c = f.read()

NEW_ENTRY = (
    "  'academy-master-integration': {\n"
    "    title: 'Website, Recognition Readiness & Master Integration',\n"
    "    bodyHtml: `" + body + "\n    `.trim(),\n"
    "  },\n"
)

c = r1(
    c,
    """  'academy-academic-regulations': {""",
    NEW_ENTRY + """  'academy-academic-regulations': {""",
    "insert academy-master-integration entry before academy-academic-regulations",
)

with io.open(path, "w", encoding="utf-8") as f:
    f.write(c)
print("lib/legalContentDefaults.js: academy-master-integration document inserted.")
