# -*- coding: utf-8 -*-
import io

def load(path):
    with io.open(path, "r", encoding="utf-8") as f:
        return f.read()

def save(path, content):
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(content)

path = "prisma/seed.js"
c = load(path)

MARKER = "async function seedAcademyPrograms() {"
idx = c.index(MARKER)
assert c.count(MARKER) == 1

IMG = {
    "IS": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85",
    "QS": "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=85",
    "AR": "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=85",
    "IE": "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=900&q=85",
    "IC": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85",
    "RL": "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=900&q=85",
}

# Each tuple: (courseCode, titleEn, titleAr, descriptionEn, descriptionAr,
#              creditHours, categoryId, programCode, semesterLevel,
#              [prerequisiteCodes], isPublished, approvalStatus)
COURSES = [
  # --- Islamic Studies (IS) ---
  ("IS-101", "Islamic Foundations", "أساسيات العقيدة والفقه",
   "Core Aqeedah and Fiqh essentials for a learner starting from zero prior knowledge.",
   "أساسيات العقيدة والفقه الجوهرية لمن يبدأ من غير معرفة سابقة.",
   3, "cat-aqidah", "FOUNDATION-STUDIES", 1, [], True, "APPROVED"),
  ("IS-201", "Intermediate Aqeedah", "العقيدة (المستوى المتوسط)",
   "Aqeedah taught as a connected, systematic body of knowledge rather than scattered facts.",
   "تدريس العقيدة كمنظومة معرفية مترابطة لا مجرد معلومات متفرقة.",
   3, "cat-aqidah", "INTERMEDIATE-ISLAMIC-STUDIES", 1, ["IS-101"], True, "APPROVED"),
  ("IS-202", "Intermediate Fiqh", "الفقه (المستوى المتوسط)",
   "Systematic Fiqh instruction building on Foundation's essentials, applied to everyday situations.",
   "تدريس الفقه بشكل منهجي مبني على أساسيات التأسيس، وتطبيقه في المواقف اليومية.",
   3, "cat-fiqh", "INTERMEDIATE-ISLAMIC-STUDIES", 1, ["IS-101"], True, "APPROVED"),
  ("IS-203", "Seerah I", "السيرة النبوية (١)",
   "The learner's first dedicated Seerah course — the essential events of the Prophetic biography.",
   "أول مقرر مخصص للسيرة يتناول الأحداث الجوهرية للسيرة النبوية.",
   2, "cat-seerah", "INTERMEDIATE-ISLAMIC-STUDIES", 1, ["IS-101"], True, "APPROVED"),
  ("IS-301", "Advanced Aqeedah", "العقيدة (المستوى المتقدم)",
   "Deepens Aqeedah to independent, argument-following engagement within the Academy's manhaj.",
   "تعميق العقيدة نحو التفاعل المستقل مع الأدلة ضمن منهج الأكاديمية.",
   3, "cat-aqidah", "ADVANCED-ISLAMIC-STUDIES", 1, ["IS-201"], True, "APPROVED"),
  ("IS-302", "Usul al-Fiqh", "أصول الفقه",
   "The methodology behind Fiqh rulings — how a ruling is derived from its sources, not just the ruling itself.",
   "منهجية استنباط الأحكام الفقهية من مصادرها، لا الأحكام ذاتها فحسب.",
   3, "cat-fiqh", "ADVANCED-ISLAMIC-STUDIES", 1, ["IS-202"], True, "APPROVED"),
  ("IS-303", "Hadith Sciences", "علوم الحديث",
   "Hadith introduced and developed as its own dedicated discipline — classification and authentication criteria.",
   "تقديم علم الحديث كعلم مستقل، مع أسس التصنيف ومعايير التوثيق.",
   3, "cat-hadith", "ADVANCED-ISLAMIC-STUDIES", 1, ["IS-202"], True, "APPROVED"),
  ("IS-304", "Islamic Thought", "الفكر الإسلامي",
   "Classical and contemporary Islamic intellectual tradition — kalam, philosophical theology, schools of thought.",
   "التراث الفكري الإسلامي الكلاسيكي والمعاصر — علم الكلام والمدارس الفكرية.",
   2, "cat-aqidah", "ADVANCED-ISLAMIC-STUDIES", 2, ["IS-301"], True, "UNDER_REVIEW"),
  ("IS-305", "Islamic Ethics", "الأخلاق الإسلامية",
   "Akhlaq as a reasoned discipline — the theoretical counterpart to Tazkiyah's practiced formation.",
   "الأخلاق كعلم يُبحث فيه بالنظر، مكمّلاً للتزكية العملية.",
   2, "cat-aqidah", "ADVANCED-ISLAMIC-STUDIES", 2, ["IS-301"], True, "APPROVED"),
  ("IS-401", "Comparative Fiqh", "الفقه المقارن",
   "Comparative treatment of Fiqh positions across schools — the Diploma's mastery-tier Fiqh course.",
   "دراسة مقارنة للمذاهب الفقهية، وهو مقرر الفقه في مستوى الإتقان بالدبلوم.",
   3, "cat-fiqh", "DIPLOMA-ISLAMIC-STUDIES", 1, ["IS-302"], True, "APPROVED"),
  ("IS-402", "Hadith Methodology (Takhrij)", "منهجية تخريج الحديث",
   "Hadith authentication methodology at mastery level — tracing and evaluating a chain of transmission.",
   "منهجية توثيق الحديث في مستوى متقدم — تتبع السند وتقييمه.",
   3, "cat-hadith", "DIPLOMA-ISLAMIC-STUDIES", 1, ["IS-303"], True, "APPROVED"),
  ("IS-403", "Contemporary Islamic Issues", "القضايا الإسلامية المعاصرة",
   "Fiqh- and Aqeedah-based reasoning applied to modern questions — bioethics, Islamic finance, technology.",
   "تطبيق الاستدلال الفقهي والعقدي على القضايا المعاصرة كالأخلاقيات الطبية والتمويل الإسلامي والتقنية.",
   2, "cat-fiqh", "DIPLOMA-ISLAMIC-STUDIES", 2, ["IS-401"], False, "DRAFT"),

  # --- Qur'anic Studies (QS) ---
  ("QS-101", "Qur'an Reading Foundations", "أساسيات قراءة القرآن",
   "Correct Qur'anic reading from a zero-prior-knowledge start.",
   "القراءة الصحيحة للقرآن الكريم لمن يبدأ من غير معرفة سابقة.",
   3, "cat-quran", "FOUNDATION-STUDIES", 1, [], True, "APPROVED"),
  ("QS-102", "Tajweed Foundations", "أساسيات التجويد",
   "Foundational Tajwid rules applied to correct recitation.",
   "قواعد التجويد الأساسية وتطبيقها في التلاوة الصحيحة.",
   2, "cat-quran", "FOUNDATION-STUDIES", 2, ["QS-101"], True, "APPROVED"),
  ("QS-201", "Applied Tajweed", "التجويد التطبيقي",
   "Tajwid applied with growing fluency across longer passages.",
   "تطبيق أحكام التجويد بطلاقة متزايدة على مقاطع أطول.",
   2, "cat-quran", "INTERMEDIATE-ISLAMIC-STUDIES", 1, ["QS-102"], True, "APPROVED"),
  ("QS-202", "Qur'an Comprehension I", "فهم القرآن (١)",
   "The beginning of Qur'anic comprehension, not just correct reading.",
   "بدايات فهم معاني القرآن، لا القراءة الصحيحة فحسب.",
   2, "cat-quran", "INTERMEDIATE-ISLAMIC-STUDIES", 1, ["QS-101"], True, "APPROVED"),
  ("QS-301", "Advanced Tajweed", "التجويد المتقدم",
   "Tajwid mastered — the last dedicated Tajwid course before it is assumed rather than re-taught.",
   "إتقان التجويد، وهو آخر مقرر مخصص له قبل افتراض إتقانه فيما بعد.",
   2, "cat-quran", "ADVANCED-ISLAMIC-STUDIES", 1, ["QS-201"], True, "APPROVED"),
  ("QS-302", "Tafsir I", "التفسير (١)",
   "Verse-by-verse exegesis, comprehension deepened from Intermediate.",
   "تفسير آيات مختارة تفسيراً تحليلياً، بعمق أكبر من المستوى المتوسط.",
   3, "cat-quran", "ADVANCED-ISLAMIC-STUDIES", 1, ["QS-202"], True, "APPROVED"),
  ("QS-401", "Tafsir II", "التفسير (٢)",
   "Tafsir mastered at Diploma tier — independently researching and presenting a Tafsir analysis.",
   "إتقان التفسير في مستوى الدبلوم، ببحث مستقل وعرض تحليلي.",
   3, "cat-quran", "DIPLOMA-ISLAMIC-STUDIES", 1, ["QS-302"], True, "APPROVED"),
  ("QS-402", "Ulum al-Qur'an", "علوم القرآن",
   "Sciences of the Qur'an — revelation circumstances, makki/madani, compilation history.",
   "علوم القرآن — أسباب النزول، والمكي والمدني، وتاريخ الجمع.",
   2, "cat-quran", "DIPLOMA-ISLAMIC-STUDIES", 1, ["QS-302"], True, "APPROVED"),

  # --- Arabic Language (AR) ---
  ("AR-101", "Arabic Foundations", "أساسيات اللغة العربية",
   "Zero-Arabic entry point building basic vocabulary and sentence structure.",
   "نقطة بداية لمن لا يعرف العربية، لبناء المفردات الأساسية وبنية الجملة.",
   3, "cat-arabic", "FOUNDATION-STUDIES", 1, [], True, "APPROVED"),
  ("AR-201", "Arabic Grammar I", "النحو العربي (١)",
   "Grammar sufficient to reduce dependence on translation.",
   "قواعد نحوية كافية لتقليل الاعتماد على الترجمة.",
   3, "cat-arabic", "INTERMEDIATE-ISLAMIC-STUDIES", 1, ["AR-101"], True, "APPROVED"),
  ("AR-301", "Arabic Grammar II", "النحو العربي (٢)",
   "Grammar deepened toward reading primary texts directly.",
   "تعميق النحو تمهيداً لقراءة النصوص الأصلية مباشرة.",
   3, "cat-arabic", "ADVANCED-ISLAMIC-STUDIES", 1, ["AR-201"], True, "APPROVED"),
  ("AR-302", "Conversation", "المحادثة العربية",
   "Spoken fluency and applied dialogue, running alongside Grammar II rather than after it.",
   "الطلاقة في التحدث والحوار التطبيقي، بالتوازي مع النحو (٢).",
   2, "cat-arabic", "ADVANCED-ISLAMIC-STUDIES", 1, ["AR-201"], True, "APPROVED"),
  ("AR-401", "Classical Arabic & Source Reading", "قراءة النصوص العربية الكلاسيكية",
   "Source-reading mastery — reading a classical source text directly, without translation support.",
   "إتقان قراءة النصوص الكلاسيكية مباشرة دون الاعتماد على الترجمة.",
   3, "cat-arabic", "DIPLOMA-ISLAMIC-STUDIES", 1, ["AR-301"], True, "APPROVED"),
  ("AR-402", "Writing", "الكتابة العربية",
   "Composition and written expression — composing a structured piece of Arabic writing on a given topic.",
   "التعبير الكتابي — إنشاء نص عربي منظم حول موضوع محدد.",
   2, "cat-arabic", "DIPLOMA-ISLAMIC-STUDIES", 2, ["AR-401"], True, "APPROVED"),

  # --- Islamic Education & Tarbiyah (IE) ---
  ("IE-101", "Islamic Character & Adab", "الأخلاق والآداب الإسلامية",
   "The Foundation-tier adab/character anchor — demonstrating Islamic adab consistently in conduct.",
   "الركيزة التأسيسية للأخلاق والآداب — إظهار الأدب الإسلامي بثبات في السلوك.",
   2, "cat-education", "FOUNDATION-STUDIES", 1, [], True, "APPROVED"),
  ("IE-201", "Communication & Leadership", "التواصل والقيادة",
   "Early responsibility and expressing what has been learned clearly, in writing and speech.",
   "التعبير الواضح عمّا تعلمه الطالب، كتابةً ونطقاً، وتحمل المسؤولية المبكرة.",
   2, "cat-education", "INTERMEDIATE-ISLAMIC-STUDIES", 1, [], True, "APPROVED"),
  ("IE-202", "Tazkiyah I", "التزكية (١)",
   "Builds on Foundation's adab rather than re-teaching it — applying Tazkiyah principles to personal conduct.",
   "يبني على أدب التأسيس ولا يعيد تدريسه — تطبيق مبادئ التزكية على السلوك الشخصي.",
   2, "cat-tazkiyah", "INTERMEDIATE-ISLAMIC-STUDIES", 1, ["IE-101"], True, "APPROVED"),
  ("IE-401", "Islamic Education & Teaching Methodology", "التربية الإسلامية ومنهجية التدريس",
   "Teacher-preparation for the Diploma's teaching-track learners — designing and delivering a basic lesson.",
   "إعداد المعلمين لمسار التدريس بالدبلوم — تصميم درس أساسي وتقديمه.",
   2, "cat-education", "DIPLOMA-ISLAMIC-STUDIES", 1, ["IE-101"], True, "APPROVED"),
  ("IE-402", "Da'wah & Outreach", "الدعوة والتواصل الدعوي",
   "Outreach methodology — applying basic da'wah/outreach methodology to a sample scenario. Placement provisional.",
   "منهجية الدعوة والتواصل — تطبيق أساسيات منهجية الدعوة على سيناريو نموذجي. (موضعه في المسار ما زال مبدئياً)",
   2, "cat-education", "DIPLOMA-ISLAMIC-STUDIES", 1, ["IE-201"], True, "UNDER_REVIEW"),
  ("IE-403", "Islamic Curriculum Design", "تصميم المناهج الإسلامية",
   "How to design and sequence Islamic teaching material — a companion to IE-401 for the same track.",
   "كيفية تصميم وترتيب المادة التعليمية الإسلامية، مكمّلاً لمقرر منهجية التدريس.",
   2, "cat-education", "DIPLOMA-ISLAMIC-STUDIES", 1, ["IE-101"], True, "APPROVED"),
  ("IE-404", "Youth Education", "تربية الناشئة",
   "Age-specific pedagogy for younger learners, distinct from IE-401's general teaching methodology.",
   "أساليب تربوية خاصة بصغار السن، تختلف عن منهجية التدريس العامة.",
   2, "cat-education", "DIPLOMA-ISLAMIC-STUDIES", 1, ["IE-101"], True, "APPROVED"),
  ("IE-405", "Family Education", "التربية الأسرية",
   "How to raise and teach children Islamically — advising on age-appropriate Islamic upbringing practices.",
   "كيفية تربية الأبناء وتعليمهم إسلامياً — إرشادات تربوية مناسبة لكل عمر.",
   2, "cat-education", "DIPLOMA-ISLAMIC-STUDIES", 1, ["IE-101"], True, "UNDER_REVIEW"),

  # --- Islamic Civilization & Society (IC) ---
  ("IC-201", "Islamic History & Civilization I", "التاريخ والحضارة الإسلامية (١)",
   "The learner's first structured exposure to the department's subject matter — the essential arc of Islamic history.",
   "أول تعرّف منظم على مادة القسم — المسار الجوهري للتاريخ والحضارة الإسلامية.",
   2, "cat-civilization", "INTERMEDIATE-ISLAMIC-STUDIES", 1, [], True, "APPROVED"),
  ("IC-301", "Islamic Social Thought", "الفكر الاجتماعي الإسلامي",
   "Civilizational and social application of Islamic thought — how it has shaped social and civilizational life.",
   "التطبيق الاجتماعي والحضاري للفكر الإسلامي — أثره في الحياة الاجتماعية والحضارية.",
   2, "cat-civilization", "ADVANCED-ISLAMIC-STUDIES", 1, ["IC-201"], True, "UNDER_REVIEW"),
  ("IC-401", "Contemporary Muslim Issues", "قضايا المسلمين المعاصرة",
   "Sociological and communal challenges facing Muslim societies — analyzing a contemporary community challenge.",
   "التحديات الاجتماعية والمجتمعية التي تواجه المسلمين — تحليل تحدٍّ معاصر لمجتمع مسلم.",
   2, "cat-civilization", "DIPLOMA-ISLAMIC-STUDIES", 1, ["IC-301"], True, "APPROVED"),
  ("IC-402", "Family & Society", "الأسرة والمجتمع",
   "The family as a social institution within Muslim civilization — a sociological/historical lens.",
   "الأسرة كمؤسسة اجتماعية ضمن الحضارة الإسلامية — منظور اجتماعي وتاريخي.",
   2, "cat-civilization", "DIPLOMA-ISLAMIC-STUDIES", 1, ["IC-301"], True, "UNDER_REVIEW"),

  # --- Research & Learning Skills (RL — cross-cutting unit) ---
  ("RL-101", "Basic Study Skills", "مهارات الدراسة الأساسية",
   "How to learn, take notes, and prepare for assessment.",
   "كيفية التعلم وتدوين الملاحظات والاستعداد للتقييم.",
   1, "cat-research", "FOUNDATION-STUDIES", 1, [], True, "APPROVED"),
  ("RL-201", "Introductory Analytical Skills", "مهارات التحليل التمهيدية",
   "The first step toward reasoning within an Islamic epistemological framework, still guided rather than independent.",
   "الخطوة الأولى نحو التفكير ضمن إطار معرفي إسلامي، بتوجيه لا باستقلالية بعد.",
   1, "cat-research", "INTERMEDIATE-ISLAMIC-STUDIES", 1, ["RL-101"], True, "APPROVED"),
  ("RL-301", "Research Preparation", "الإعداد للبحث العلمي",
   "Foundational research and source-verification skills, readying a learner for the Diploma's capstone.",
   "مهارات البحث الأساسية والتحقق من المصادر، إعداداً لمشروع التخرج.",
   2, "cat-research", "ADVANCED-ISLAMIC-STUDIES", 1, ["RL-201"], True, "APPROVED"),
  ("RL-401", "Capstone Research Project", "مشروع البحث التكميلي (الكابستون)",
   "The Diploma's mastery-tier research component — producing and defending an independent research project.",
   "عنصر البحث في مستوى الإتقان بالدبلوم — إعداد بحث مستقل والدفاع عنه.",
   3, "cat-research", "DIPLOMA-ISLAMIC-STUDIES", 1, ["RL-301"], True, "APPROVED"),
]

def dept(code):
    return code.split("-")[0]

lines = []
lines.append("")
lines.append("// The Academy's 42 real courses (Model 12) — every course in the Course")
lines.append("// Catalogue & Coding System document, actually created as real Course")
lines.append("// records for the first time. Course Catalogue's own closing line said")
lines.append("// these were \"illustrative — not yet real Course records\"; later")
lines.append("// documents (Assessment, Faculty & Portals, Academic Regulations) then")
lines.append("// described them as already real without this ever having been done —")
lines.append("// a genuine inconsistency this document's audit found and this seed")
lines.append("// closes. SPEC-3xx is deliberately not created: the catalogue itself")
lines.append("// says it \"has no defined content of its own,\" so seeding it would be")
lines.append("// inventing a course, not recording one. Prerequisites, semesterLevel")
lines.append("// (per-program sequencing for lib/courseAssignment.js's auto-assignment")
lines.append("// engine) and approvalStatus are all set from what the Course Catalogue")
lines.append("// and Course Specifications documents already, specifically say —")
lines.append("// including the courses those documents themselves flagged as pending")
lines.append("// Scholarly Review Committee sign-off (UNDER_REVIEW) or not yet able to")
lines.append("// run at all (IS-403: isPublished false, DRAFT).")
lines.append("const academyCourses = [")
for (code, titleEn, titleAr, descEn, descAr, credits, catId, progCode, level, prereqs, published, approval) in COURSES:
    slug = code.lower() + "-" + "".join(ch if ch.isalnum() else "-" for ch in titleEn.lower()).strip("-")
    while "--" in slug:
        slug = slug.replace("--", "-")
    course_id = "course-" + code.lower()
    prereq_js = "[" + ", ".join('"%s"' % p for p in prereqs) + "]"
    lines.append("  {")
    lines.append('    id: "%s",' % course_id)
    lines.append('    courseCode: "%s",' % code)
    lines.append('    titleEn: "%s",' % titleEn.replace('"', '\\"'))
    lines.append('    titleAr: "%s",' % titleAr)
    lines.append('    slug: "%s",' % slug)
    lines.append('    descriptionEn:')
    lines.append('      "%s",' % descEn.replace('"', '\\"'))
    lines.append('    descriptionAr:')
    lines.append('      "%s",' % descAr)
    lines.append('    creditHours: %d,' % credits)
    lines.append('    categoryId: "%s",' % catId)
    lines.append('    programCode: "%s",' % progCode)
    lines.append('    semesterLevel: %d,' % level)
    lines.append('    prerequisiteCodes: %s,' % prereq_js)
    lines.append('    isPublished: %s,' % ("true" if published else "false"))
    lines.append('    approvalStatus: "%s",' % approval)
    lines.append('    thumbnailUrl: "%s",' % IMG[dept(code)])
    lines.append("  },")
lines.append("];")
lines.append("")

courses_block = "\n".join(lines)

new_content = c[:idx] + courses_block + "\n" + c[idx:]
save(path, new_content)
print("Step 2: academyCourses data array (%d courses) inserted." % len(COURSES))
