# -*- coding: utf-8 -*-
import io

def apply(path, pairs):
    with io.open(path, "r", encoding="utf-8") as f:
        content = f.read()
    for old, new in pairs:
        c = content.count(old)
        assert c == 1, (path, c, old[:80])
        content = content.replace(old, new)
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("OK:", path)


# --- app/admin/(overview)/layout.jsx ---
apply(
    "app/admin/(overview)/layout.jsx",
    [
        (
            "Manage the Academy's institutional identity, educational philosophy and governing principles (Model 1) — grouped here alongside Homepage Management.",
            "Manage the Academy's institutional identity, educational philosophy and governing principles — grouped here alongside Homepage Management.",
        ),
        (
            "Manage the Academy's organizational structure, academic governance, departments and committees (Model 2).",
            "Manage the Academy's organizational structure, academic governance, departments and committees.",
        ),
        (
            "Manage the Academy's academic pathways and qualification framework — Foundation through Diploma and Specialized Certificates (Model 3).",
            "Manage the Academy's academic pathways and qualification framework — Foundation through Diploma and Specialized Certificates.",
        ),
        (
            "Manage the Academy's program architecture and curriculum framework — study plans, prerequisites and learning outcomes (Model 4).",
            "Manage the Academy's program architecture and curriculum framework — study plans, prerequisites and learning outcomes.",
        ),
        (
            "Manage which department owns which curriculum topic, program-to-department mapping, and the course duplication audit (Model 5).",
            "Manage which department owns which curriculum topic, program-to-department mapping, and the course duplication audit.",
        ),
        (
            "Manage the permanent course-coding system and the master course catalogue — every course's code, level, units, prerequisites and type (Model 6).",
            "Manage the permanent course-coding system and the master course catalogue — every course's code, level, units, prerequisites and type.",
        ),
        (
            "Manage full course specifications and weekly syllabi, built batch by batch — CLOs, weekly topics, assessment design and alignment (Model 7).",
            "Manage full course specifications and weekly syllabi, built batch by batch — CLOs, weekly topics, assessment design and alignment.",
        ),
        (
            "Manage the Academy's assessment, grading and progression framework — assessment families, grading scale, practical rubrics, progression and graduation requirements (Model 8).",
            "Manage the Academy's assessment, grading and progression framework — assessment families, grading scale, practical rubrics, progression and graduation requirements.",
        ),
    ],
)

# --- layout.jsx sidebar description paragraphs ---
apply(
    "app/admin/academy-foundation/layout.jsx",
    [
        (
            "The Academy's institutional identity and educational philosophy\n            (Model 1) live here, admin-editable like the Legal & Info Pages —",
            "The Academy's institutional identity and educational philosophy\n            live here, admin-editable like the Legal & Info Pages —",
        ),
    ],
)
apply(
    "app/admin/academy-governance/layout.jsx",
    [
        (
            "The Academy's organizational structure and academic governance\n            (Model 2) live here, admin-editable like the Legal & Info Pages —",
            "The Academy's organizational structure and academic governance\n            live here, admin-editable like the Legal & Info Pages —",
        ),
    ],
)
apply(
    "app/admin/academy-pathways/layout.jsx",
    [
        (
            "The Academy's academic pathways and qualification framework\n            (Model 3) live here, admin-editable like the Legal & Info Pages —",
            "The Academy's academic pathways and qualification framework\n            live here, admin-editable like the Legal & Info Pages —",
        ),
    ],
)
apply(
    "app/admin/academy-curriculum/layout.jsx",
    [
        (
            "The Academy's program architecture and curriculum framework\n            (Model 4) live here, admin-editable like the Legal & Info Pages —",
            "The Academy's program architecture and curriculum framework\n            live here, admin-editable like the Legal & Info Pages —",
        ),
    ],
)
apply(
    "app/admin/academy-department-curriculum/layout.jsx",
    [
        (
            "Which department owns which topic, and how programs draw on\n            them (Model 5) — admin-editable like the Legal & Info Pages,",
            "Which department owns which topic, and how programs draw on\n            them — admin-editable like the Legal & Info Pages,",
        ),
    ],
)
apply(
    "app/admin/academy-course-catalogue/layout.jsx",
    [
        (
            "The permanent course-coding system and master course catalogue\n            (Model 6) live here, admin-editable like the Legal & Info Pages —",
            "The permanent course-coding system and master course catalogue\n            live here, admin-editable like the Legal & Info Pages —",
        ),
    ],
)
apply(
    "app/admin/academy-course-specifications/layout.jsx",
    [
        (
            "Full course specifications and weekly syllabi, built batch by\n            batch (Model 7) — admin-editable like the Legal &amp; Info",
            "Full course specifications and weekly syllabi, built batch by\n            batch — admin-editable like the Legal &amp; Info",
        ),
    ],
)
apply(
    "app/admin/academy-assessment-grading/layout.jsx",
    [
        (
            "The Academy's assessment, grading &amp; progression framework\n            (Model 8) — admin-editable like the Legal &amp; Info Pages,",
            "The Academy's assessment, grading &amp; progression framework\n            — admin-editable like the Legal &amp; Info Pages,",
        ),
    ],
)

# --- page.jsx hint text ---
apply(
    "app/admin/academy-foundation/page.jsx",
    [
        (
            "hint=\"Ulul Azm Academy's institutional identity, educational philosophy and governing principles (Model 1). Shown publicly at /academy-foundation and linked from the homepage footer. This is a living foundation document — expect it to be revised as later models are confirmed.\"",
            "hint=\"Ulul Azm Academy's institutional identity, educational philosophy and governing principles. Shown publicly at /academy-foundation and linked from the homepage footer. This is a living foundation document, revisited as the Academy matures.\"",
        ),
    ],
)
apply(
    "app/admin/academy-governance/page.jsx",
    [
        (
            "hint=\"The Academy's organizational structure, academic governance, departments, cross-cutting units, committees and instructor governance (Model 2). Shown publicly at /academy-governance. Builds on Academy Foundation (Model 1) — expect both to be revised as later models are confirmed.\"",
            "hint=\"The Academy's organizational structure, academic governance, departments, cross-cutting units, committees and instructor governance. Shown publicly at /academy-governance. Builds on the Academy Foundation document.\"",
        ),
    ],
)
apply(
    "app/admin/academy-pathways/page.jsx",
    [
        (
            "hint=\"The Academy's academic pathway and qualification framework — Foundation, Intermediate, Advanced, Diploma and Specialized Certificates (Model 3). Shown publicly at /academy-pathways. Builds on Academy Foundation (Model 1) and Academy Governance (Model 2) — expect all three to be revised as later models are confirmed.\"",
            "hint=\"The Academy's academic pathway and qualification framework — Foundation, Intermediate, Advanced, Diploma and Specialized Certificates. Shown publicly at /academy-pathways. Builds on the Academy Foundation and Academy Governance documents.\"",
        ),
    ],
)
apply(
    "app/admin/academy-curriculum/page.jsx",
    [
        (
            "hint=\"The Academy's program architecture and curriculum framework — study plans, prerequisite chains, and program learning outcomes using temporary course-code placeholders (Model 4). Shown publicly at /academy-curriculum. Builds on Models 1–3 — expect all four to be revised as later models are confirmed.\"",
            "hint=\"The Academy's program architecture and curriculum framework — study plans, prerequisite chains, and program learning outcomes using temporary course-code placeholders. Shown publicly at /academy-curriculum. Builds on Academy Foundation, Academy Governance and Academy Pathways.\"",
        ),
    ],
)
apply(
    "app/admin/academy-department-curriculum/page.jsx",
    [
        (
            "hint=\"Which department owns which topic, department-by-department curriculum frameworks, program-to-department mapping, the specialization framework, and the course duplication audit (Model 5). Shown publicly at /academy-department-curriculum. Builds on Models 1–4 — expect all five to be revised as later models are confirmed.\"",
            "hint=\"Which department owns which topic, department-by-department curriculum frameworks, program-to-department mapping, the specialization framework, and the course duplication audit. Shown publicly at /academy-department-curriculum. Builds on Academy Foundation, Academy Governance, Academy Pathways and Academy Curriculum.\"",
        ),
    ],
)
apply(
    "app/admin/academy-course-catalogue/page.jsx",
    [
        (
            "hint=\"The Academy's permanent course-coding system, numbering framework, and master course catalogue — every course's code, title, pathway, level, units, hours, prerequisite, type, description, outcome and assessment (Model 6). Shown publicly at /academy-course-catalogue. Builds on Models 1–5 — expect all six to be revised as later models are confirmed.\"",
            "hint=\"The Academy's permanent course-coding system, numbering framework, and master course catalogue — every course's code, title, pathway, level, units, hours, prerequisite, type, description, outcome and assessment. Shown publicly at /academy-course-catalogue. Builds on Academy Foundation, Academy Governance, Academy Pathways, Academy Curriculum and Department Curriculum.\"",
        ),
    ],
)
apply(
    "app/admin/academy-course-specifications/page.jsx",
    [
        (
            "hint=\"Full course specifications and weekly syllabi built in batches — CLOs, weekly topics, assessment design, and CLO-to-assessment alignment for every catalogued course (Model 7). Shown publicly at /academy-course-specifications. Builds on Models 1–6 — expect all seven to be revised as later models are confirmed. This page grows batch by batch; only a subset of courses may be complete at any time.\"",
            "hint=\"Full course specifications and weekly syllabi built in batches — CLOs, weekly topics, assessment design, and CLO-to-assessment alignment for every catalogued course. Shown publicly at /academy-course-specifications. Builds on Academy Foundation, Academy Governance, Academy Pathways, Academy Curriculum, Department Curriculum and Course Catalogue. This page grows batch by batch; only a subset of courses may be complete at any time.\"",
        ),
    ],
)
apply(
    "app/admin/academy-assessment-grading/page.jsx",
    [
        (
            "hint=\"The Academy's assessment and progression framework (Model 8): the two assessment families, CLO/PLO alignment, the grading scale and academic standing rules, practical rubric principles, progression rules, and graduation requirements per pathway tier. Shown publicly at /academy-assessment-grading. Builds on Models 1–7 — expect all eight to be revised as later models are confirmed.\"",
            "hint=\"The Academy's assessment and progression framework: the two assessment families, CLO/PLO alignment, the grading scale and academic standing rules, practical rubric principles, progression rules, and graduation requirements per pathway tier. Shown publicly at /academy-assessment-grading. Builds on Academy Foundation, Academy Governance, Academy Pathways, Academy Curriculum, Department Curriculum, Course Catalogue and Course Specifications.\"",
        ),
    ],
)

print("ALL DONE")
