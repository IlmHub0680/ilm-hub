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

# The user's confirmed wording uses "Programme" (matching the rest of the
# site's British spelling -- "Academic Programmes", "Programme Details",
# etc.) and "Learner" rather than "Learning" -- updating the two names
# that changed from the previous pass.

path = "app/page.jsx"
c = load(path)
c = r1(c, "    name: 'Foundation Learning Program',", "    name: 'Foundation Learner Programme',", "app/page.jsx: Foundation pathway name")
c = r1(c, "    name: 'Intermediate Learning Program',", "    name: 'Intermediate Learner Programme',", "app/page.jsx: Intermediate pathway name")
save(path, c)
print("app/page.jsx: pathway names updated to Foundation/Intermediate Learner Programme.")

path = "app/admission/page.js"
c = load(path)
c = r1(c, "    'Foundation Learning Program',", "    'Foundation Learner Programme',", "admission page: Foundation option")
c = r1(c, "    'Intermediate Learning Program',", "    'Intermediate Learner Programme',", "admission page: Intermediate option")
save(path, c)
print("app/admission/page.js: PATHWAY_OPTIONS updated.")

path = "app/advisor-dashboard/page.tsx"
c = load(path)
c = r1(c, "  'Foundation Learning Program',", "  'Foundation Learner Programme',", "advisor dashboard: Foundation option")
c = r1(c, "  'Intermediate Learning Program',", "  'Intermediate Learner Programme',", "advisor dashboard: Intermediate option")
save(path, c)
print("app/advisor-dashboard/page.tsx: PATHWAY_OPTIONS updated.")
