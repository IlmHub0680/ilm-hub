# -*- coding: utf-8 -*-
import io

def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d" % (label, c)
    return content.replace(old, new)

def load(path):
    with io.open(path, "r", encoding="utf-8") as f:
        return f.read()

def save(path, content):
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(content)


path = "prisma/seed.js"
c = load(path)

# ---------------------------------------------------------------------
# 1. Three new categories for the three departments that had no fitting
#    one yet (Islamic Education & Tarbiyah beyond Tazkiyah, Islamic
#    Civilization & Society, Research & Learning Skills).
# ---------------------------------------------------------------------
c = r1(
    c,
    """  {
    id: "cat-arabic",
    nameEn: "Arabic Language",
    nameAr: "اللغة العربية",
    slug: "arabic",
  },
];""",
    """  {
    id: "cat-arabic",
    nameEn: "Arabic Language",
    nameAr: "اللغة العربية",
    slug: "arabic",
  },
  {
    id: "cat-education",
    nameEn: "Islamic Education",
    nameAr: "التربية الإسلامية",
    slug: "islamic-education",
  },
  {
    id: "cat-civilization",
    nameEn: "Islamic Civilization & Society",
    nameAr: "الحضارة الإسلامية والمجتمع",
    slug: "civilization-society",
  },
  {
    id: "cat-research",
    nameEn: "Research & Learning Skills",
    nameAr: "مهارات البحث والتعلم",
    slug: "research-learning-skills",
  },
];""",
    "categories array: add 3 new categories",
)

# ---------------------------------------------------------------------
# 2. Three new real Programs — Foundation Studies, Intermediate Islamic
#    Studies, Advanced Islamic Studies — the pathway tiers the seed.js
#    comment already flagged as "framework-only for now" pending new
#    ProgramLevel enum values (Model 12). Diploma in Islamic Studies
#    (already real) is left untouched.
# ---------------------------------------------------------------------
c = r1(
    c,
    """// The Academy's Diploma in Islamic Studies (Model 3 — Academic Pathways
// & Qualification Framework), created here because it fits the existing
// ProgramLevel enum (DIPLOMA) without a schema change. Foundation,
// Intermediate and Advanced are framework-only for now — they need new
// ProgramLevel values (a migration) before they can become real Program
// records; see /academy-pathways decision 20. Administratively hosted
// under the Department of Islamic Studies, though — per Model 3 §6 — its
// actual course content is meant to draw on all five departments plus
// Research & Learning Skills once the course catalogue is built.
const academyPrograms = [
  {
    code: "DIPLOMA-ISLAMIC-STUDIES",
    nameEn: "Diploma in Islamic Studies",
    nameAr: "دبلوم الدراسات الإسلامية",
    level: "DIPLOMA",
    departmentCode: "DEPT-ISLAMIC-STUDIES",
    descriptionEn:
      "The Academy's integrated credential, drawing a defined contribution from Islamic Studies, Qur'anic Studies, Arabic Language, Islamic Education & Tarbiyah, Islamic Civilization & Society, and Research & Learning Skills — not a bundle of unrelated courses. Entry normally follows completion of Advanced Islamic Studies.",
    descriptionAr:
      "المؤهل المتكامل للأكاديمية، يجمع إسهاماً محدداً من الدراسات الإسلامية والدراسات القرآنية واللغة العربية والتربية الإسلامية والتزكية والحضارة الإسلامية والمجتمع ومهارات البحث والتعلم.",
  },
];""",
    """// The Academy's four real pathway-tier programs (Model 3 — Academic
// Pathways & Qualification Framework). Foundation, Intermediate and
// Advanced were framework-only until Model 12 added FOUNDATION,
// INTERMEDIATE and ADVANCED to the ProgramLevel enum (see
// prisma/migrations/*_add_pathway_program_levels) closing
// /academy-pathways decision 20. All four are administratively hosted
// under the Department of Islamic Studies, matching the Diploma's own
// already-established convention (Model 3 §6) — their actual course
// content draws on all five departments plus Research & Learning
// Skills, via each course's own programId (see seedAcademyCourses).
const academyPrograms = [
  {
    code: "FOUNDATION-STUDIES",
    nameEn: "Foundation Studies",
    nameAr: "برنامج التأسيس",
    level: "FOUNDATION",
    departmentCode: "DEPT-ISLAMIC-STUDIES",
    descriptionEn:
      "The Academy's zero-prior-knowledge entry pathway — Aqeedah and Fiqh essentials, Qur'an reading and Tajweed foundations, Arabic foundations, Islamic character and adab, and basic study skills. Entry requires no prior study, only basic literacy and willingness to be placed by assessment.",
    descriptionAr:
      "برنامج الأكاديمية التأسيسي لمن لا يملك معرفة سابقة — أساسيات العقيدة والفقه، وأساسيات قراءة القرآن والتجويد، وأساسيات اللغة العربية، والأخلاق والآداب الإسلامية، ومهارات الدراسة الأساسية.",
  },
  {
    code: "INTERMEDIATE-ISLAMIC-STUDIES",
    nameEn: "Intermediate Islamic Studies",
    nameAr: "الدراسات الإسلامية (المستوى المتوسط)",
    level: "INTERMEDIATE",
    departmentCode: "DEPT-ISLAMIC-STUDIES",
    descriptionEn:
      "Builds on Foundation Studies with systematic Aqeedah and Fiqh, a first dedicated Seerah course, applied Tajweed and early Qur'an comprehension, Arabic grammar, Islamic history and civilization, communication and leadership, and the beginning of Tazkiyah as a taught discipline.",
    descriptionAr:
      "يبني على برنامج التأسيس بتدريس العقيدة والفقه بشكل منهجي، وأول مقرر مخصص للسيرة، والتجويد التطبيقي وبدايات فهم القرآن، والنحو العربي، والتاريخ والحضارة الإسلامية، والتواصل والقيادة، وبداية التزكية كعلم يُدرَّس.",
  },
  {
    code: "ADVANCED-ISLAMIC-STUDIES",
    nameEn: "Advanced Islamic Studies",
    nameAr: "الدراسات الإسلامية (المستوى المتقدم)",
    level: "ADVANCED",
    departmentCode: "DEPT-ISLAMIC-STUDIES",
    descriptionEn:
      "Deepens Aqeedah to independent reasoning, introduces Usul al-Fiqh and Hadith Sciences as their own disciplines, masters Tajweed and begins Tafsir, advances Arabic grammar toward direct source reading, and adds Islamic social thought, research preparation, and one specialization elective previewing a future Specialized Certificate track.",
    descriptionAr:
      "يعمّق العقيدة نحو الاستدلال المستقل، ويُدخل أصول الفقه وعلوم الحديث كعلمين مستقلين، ويتقن التجويد ويبدأ التفسير، ويرتقي بالنحو العربي نحو قراءة المصادر مباشرة، ويضيف الفكر الاجتماعي الإسلامي والإعداد للبحث ومقرراً اختيارياً تخصصياً واحداً.",
  },
  {
    code: "DIPLOMA-ISLAMIC-STUDIES",
    nameEn: "Diploma in Islamic Studies",
    nameAr: "دبلوم الدراسات الإسلامية",
    level: "DIPLOMA",
    departmentCode: "DEPT-ISLAMIC-STUDIES",
    descriptionEn:
      "The Academy's integrated credential, drawing a defined contribution from Islamic Studies, Qur'anic Studies, Arabic Language, Islamic Education & Tarbiyah, Islamic Civilization & Society, and Research & Learning Skills — not a bundle of unrelated courses. Entry normally follows completion of Advanced Islamic Studies.",
    descriptionAr:
      "المؤهل المتكامل للأكاديمية، يجمع إسهاماً محدداً من الدراسات الإسلامية والدراسات القرآنية واللغة العربية والتربية الإسلامية والتزكية والحضارة الإسلامية والمجتمع ومهارات البحث والتعلم.",
  },
];""",
    "academyPrograms: add Foundation/Intermediate/Advanced",
)

save(path, c)
print("Step 1: categories + programs updated.")
