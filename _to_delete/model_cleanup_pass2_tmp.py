# -*- coding: utf-8 -*-
import io
import re

PATH = "lib/legalContentDefaults.js"

with io.open(PATH, "r", encoding="utf-8") as f:
    content = f.read()

# --- Fix doubled words left by the mechanical Model-N -> title substitution ---
doubled_pairs = [
    (
        "matching its Academic Pathways pathway definition.",
        "matching its pathway definition in Academic Pathways.",
    ),
    (
        "(Academic Pathways §4; Course Catalogue catalogue): one per Qur'anic Studies",
        "(Academic Pathways §4; Course Catalogue): one per Qur'anic Studies",
    ),
    (
        "despite Course Catalogue catalogue \"type\" labels not distinguishing this",
        "despite the Course Catalogue's \"type\" labels not distinguishing this",
    ),
    (
        "Course Specifications is now complete: every course in the Course Catalogue catalogue has a full specification and syllabus.",
        "Course Specifications is now complete: every course in the Course Catalogue has a full specification and syllabus.",
    ),
    (
        "its own Course Specifications specification (its CLOs and assessments)",
        "its own specification in Course Specifications (its CLOs and assessments)",
    ),
]
for old, new in doubled_pairs:
    c = content.count(old)
    assert c == 1, ("doubled-word pair not found exactly once:", c, old[:60])
    content = content.replace(old, new)

# --- Custom exact-text fixes for meta / drafting-process leakage ---
custom_pairs = [
    (
        "Per the standing rule to update earlier models rather than let them go stale, IC-301 is renamed",
        "Consistent with the Academy's practice of keeping earlier documents current when later work reveals a needed correction, IC-301 is renamed",
    ),
    (
        "<em>Riyad As-Salihin</em>, unused in Models so far, is a genuine (if partial) fit",
        "<em>Riyad As-Salihin</em>, not yet used elsewhere in the Course Specifications, is a genuine (if partial) fit",
    ),
    (
        "\"this content model\" flags",  # safety no-op if quoted form doesn't exist
        "\"this content model\" flags",
    ),
    (
        "a schema-level decision this content model flags but does not make.",
        "a schema-level decision this document flags but does not make.",
    ),
    (
        "rather than assumed by this content model.",
        "rather than assumed by this document.",
    ),
]
for old, new in custom_pairs:
    c = content.count(old)
    if old == new:
        continue
    assert c == 1, ("custom pair not found exactly once:", c, old[:60])
    content = content.replace(old, new)

# --- Generic self-referential "model(s)" -> "document(s)" sweep ---
# Covers: this/This, future/Future, earlier/Earlier, later/Later,
# prior/Prior, next/Next, previous/Previous, subsequent/Subsequent
# + model/models. Deliberately narrow so it never touches legitimate
# uses like "<code>Grade</code> model", "a content model", "a fuller
# model", or "Islamic leadership models".
LEAD_WORDS = [
    "this", "This",
    "future", "Future",
    "earlier", "Earlier",
    "later", "Later",
    "prior", "Prior",
    "next", "Next",
    "previous", "Previous",
    "subsequent", "Subsequent",
]
lead_alt = "|".join(LEAD_WORDS)
pattern = re.compile(r"\b(" + lead_alt + r") (model|models)\b")


def repl(m):
    lead = m.group(1)
    word = m.group(2)
    newword = "documents" if word == "models" else "document"
    return "%s %s" % (lead, newword)


before = len(pattern.findall(content))
content = pattern.sub(repl, content)
print("Generic lead+model/models replacements made:", before)

# --- Residual sanity checks ---
remaining_leftover = re.findall(r"\bModel[s]? [0-9]", content)
print("Remaining 'Model[s] N' matches:", len(remaining_leftover))
assert len(remaining_leftover) == 0

with io.open(PATH, "w", encoding="utf-8") as f:
    f.write(content)

print("Pass 2 done. New file length:", len(content))
