# -*- coding: utf-8 -*-
import io

PATH = "lib/legalContentDefaults.js"

with io.open(PATH, "r", encoding="utf-8") as f:
    c = f.read()


def r1(c, old, new, label):
    n = c.count(old)
    assert n == 1, "%s: expected 1, found %d" % (label, n)
    return c.replace(old, new)


c = r1(
    c,
    "Where a portal already existed and worked, this document states it as it already behaves rather than redesigning it; where a portal was missing a piece the brief called for and the platform's own data could genuinely support it, that piece was built as part of this pass, not merely proposed.",
    "Where a portal already existed and worked, this document states it as it already behaves rather than redesigning it; where a portal was missing a piece this framework specifies and the platform's own data could genuinely support it, that piece was built as part of this pass, not merely proposed.",
    "leak fix 1 (scope section)",
)

c = r1(
    c,
    "It held nothing about who the person actually is as a teacher. This section is the profile the brief asked for, and it is now real and populated per instructor rather than only specified here.",
    "It held nothing about who the person actually is as a teacher. This section is the profile the Academy's faculty framework requires, and it is now real and populated per instructor rather than only specified here.",
    "leak fix 2 (instructor profile intro)",
)

c = r1(
    c,
    'The two-value split exists specifically because the brief calls out "Islamic qualifications where relevant" as distinct from general academic ones (a B.A. in Arabic Literature versus an Ijazah in Hafs recitation, for example) — both are qualifications, recorded the same way, distinguished only by this one field, never by two separate tables that could drift apart.',
    "The two-value split exists specifically to record Islamic qualifications — an Ijazah in Hafs recitation, for example — separately from general academic ones such as a B.A. in Arabic Literature: both are qualifications, recorded the same way, distinguished only by this one field, never by two separate tables that could drift apart.",
    "leak fix 3 (qualifications)",
)

c = r1(
    c,
    "The Student Portal is not one new build — every item the brief lists already exists as a real page or API, most of it predating this document, several pieces added by Student Lifecycle &amp; Academic Administration.",
    "The Student Portal is not one new build — every item named below already exists as a real page or API, most of it predating this document, several pieces added by Student Lifecycle &amp; Academic Administration.",
    "leak fix 4 (student portal intro)",
)

c = r1(
    c,
    'The brief\'s "at-risk students," "enrollment," and "assessment" sub-items are not separately re-shown here: they are Assessment, Grading &amp; Progression\'s academic-standing and attendance-tier signals',
    'The "at-risk students," "enrollment," and "assessment" items above are not separately re-shown here: they are Assessment, Grading &amp; Progression\'s academic-standing and attendance-tier signals',
    "leak fix 5 (coordinator portal)",
)

c = r1(
    c,
    "This document extends that same pattern rather than building beside it, closing three of the four gaps the brief names and naming the fourth honestly.",
    "This document extends that same pattern rather than building beside it, closing three of the four gaps named above and naming the fourth honestly.",
    "leak fix 6 (qa portal intro)",
)

c = r1(
    c,
    'The brief asks for "PLO achievement" alongside course evaluations, assessment quality, and instructor evaluation.',
    'Quality Assurance\'s remit includes "PLO achievement" alongside course evaluations, assessment quality, and instructor evaluation.',
    "leak fix 7 (PLO section)",
)

with io.open(PATH, "w", encoding="utf-8") as f:
    f.write(c)

print("All 7 'the brief' leak phrases fixed in the Model 10 document.")
