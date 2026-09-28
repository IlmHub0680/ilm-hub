// Translation dictionary for the public homepage (app/page.jsx).
//
// Same pattern as app/admission/i18n.js: each key is the exact English
// string as it already appears in the JSX, mapped to its Arabic
// translation, so call sites stay as `{t('Exact English Text')}`
// without a separate key namespace. Anything not found here is
// returned unchanged (English), so a missed string never breaks
// rendering.
//
// Deliberately NOT covering: the Hero section's badge/title/subtitle
// (admin-edited CMS content -- stored in one language at a time, not a
// translation-pair field, so it stays in whatever language the admin
// wrote it), and live announcement/notice bodies (real-time DB content
// authored per-announcement). Both are flagged honestly rather than
// faked with a static translation.
export const AR_TRANSLATIONS = {
  // Top bar
  'Hijri:': 'هجري:',
  '(Umm al-Qura)': '(أم القرى)',

  // Welcome section
  'WELCOME TO ULUL AZM': 'مرحبًا بكم في أولو العزم',
  'A place to seek knowledge with sincerity': 'مكانٌ لطلب العلم بإخلاص',
  "Ulul Azm Institute brings together structured academic learning, classical Islamic scholarship, digital resources, and a community committed to beneficial knowledge, upright character, and lifelong learning.":
    'يجمع معهد أولو العزم بين التعليم الأكاديمي المنظم، والعلم الشرعي الأصيل، والموارد الرقمية، ومجتمعٍ ملتزم بالعلم النافع وحسن الخلق والتعلّم المستمر مدى الحياة.',

  'Structured Learning': 'تعلّم منظّم',
  'Progress through carefully organized academic programmes and courses designed to build knowledge systematically.':
    'تقدّم عبر برامج ومقررات أكاديمية منظمة بعناية، مصمَّمة لبناء المعرفة بأسلوب متدرّج ومنهجي.',

  'Islamic Scholarship': 'العلم الشرعي',
  "Engage with the Qur'an, Sunnah, classical texts, and established Islamic disciplines through sound scholarly tradition.":
    'تفاعل مع القرآن الكريم والسنة النبوية والكتب التراثية والعلوم الشرعية الثابتة، من خلال منهجٍ علمي أصيل.',

  'Student Development': 'تطوير الطالب',
  'Develop sound knowledge, disciplined study habits, research ability, humility, and beneficial character.':
    'اكتساب علمٍ صحيح، وعادات دراسية منضبطة، وقدرة على البحث، والتواضع، وحسن الخلق النافع.',

  'Learning Without Borders': 'تعلّم بلا حدود',
  'Access educational opportunities and digital resources designed to support students wherever they are.':
    'الوصول إلى فرص تعليمية وموارد رقمية مصمَّمة لدعم الطلاب أينما كانوا.',

  // Academy (green) section
  'ACADEMY': 'الأكاديمية',
  'Explore Our Academic Programmes': 'استكشف برامجنا الأكاديمية',
  "Explore our academic departments, programmes, courses, and areas of Islamic study, rooted in the Qur'an and Sunnah and presented through structured and disciplined learning.":
    'استكشف أقسامنا الأكاديمية وبرامجنا ومقرراتنا ومجالات الدراسة الشرعية، المتأصلة في القرآن والسنة، والمقدَّمة عبر تعلّمٍ منظّم ومنضبط.',

  "Qur'anic Sciences": 'علوم القرآن',
  'Arabic Language': 'اللغة العربية',
  'Hadith Studies': 'علوم الحديث',
  'Fiqh & Usul': 'الفقه وأصوله',
  'Aqidah': 'العقيدة',
  'Tajwid & Recitation': 'التجويد والتلاوة',
  'Tauheed (Monotheism)': 'التوحيد',
  'Tarbiyah (Education)': 'التربية',

  'Explore Academic Departments →': 'استكشف الأقسام الأكاديمية ←',

  // Academic Programs section
  'ACADEMIC PROGRAMS': 'البرامج الأكاديمية',
  'Five Pathways, One Progression': 'خمسة مسارات، تدرّج واحد',
  "Every learner enters at the pathway that matches their starting point and progresses in sequence -- from Foundation Studies through to the Diploma in Islamic Studies, with a Specialized Certificate reachable after Advanced or the Diploma. This is an overview of each tier; the full framework and course-by-course detail live on their own pages.":
    'يلتحق كل طالب بالمسار الذي يناسب مستواه، ويتدرّج تصاعديًا بدءًا من مرحلة التأسيس وصولًا إلى دبلوم الدراسات الإسلامية، مع إمكانية الحصول على شهادة تخصصية بعد المرحلة المتقدمة أو الدبلوم. وفيما يلي نظرة عامة على كل مستوى؛ أما التفاصيل الكاملة للإطار الأكاديمي والمقررات فهي متاحة في صفحاتها الخاصة.',
  'Read the Full Academic Pathways Framework →': 'اطّلع على إطار المسارات الأكاديمية كاملاً ←',

  "Who it's for": 'لمن هذا المسار',
  'Study areas': 'مجالات الدراسة',
  'Duration': 'المدة',
  'Delivery': 'طريقة التقديم',
  'Progression': 'التدرّج',
  'Admission': 'شروط القبول',
  'Programme Details': 'تفاصيل البرنامج',
  'Learn About This Pathway': 'تعرّف على هذا المسار',
  'Apply': 'التقديم',

  'Tier 1': 'المستوى ١',
  'Tier 2': 'المستوى ٢',
  'Tier 3': 'المستوى ٣',
  'Tier 4': 'المستوى ٤',
  'Tier 5': 'المستوى ٥',

  // Pathway tier 1 -- Foundation Studies
  'Foundation Studies': 'برنامج التأسيس',
  "Establishes the basic Islamic knowledge, Qur'an reading ability, and study habits every later pathway assumes.":
    'يؤسس المعرفة الشرعية الأساسية، والقدرة على قراءة القرآن الكريم، والعادات الدراسية التي تُبنى عليها جميع المراحل اللاحقة.',
  'Learners with little or no prior structured Islamic education, at any age from young learner to adult.':
    'الدارسون الذين لديهم معرفة شرعية منظمة قليلة أو معدومة، من أي فئة عمرية من الصغار إلى الكبار.',
  "Aqeedah & Fiqh essentials · Qur'an reading & Tajweed foundations · Arabic foundations · Islamic character & adab · Basic study skills":
    'أساسيات العقيدة والفقه · أساسيات قراءة القرآن والتجويد · أساسيات اللغة العربية · الأخلاق والآداب الإسلامية · مهارات الدراسة الأساسية',
  "The Academy's shortest pathway -- a small number of academic terms.":
    'أقصر مسارات الأكاديمية -- عدد قليل من الفصول الدراسية.',
  "Online, through instructor-led live classes and the Academy's own course portal.":
    'عن بُعد، من خلال حصص مباشرة يقودها معلّمون وعبر بوابة المقررات الخاصة بالأكاديمية.',
  'The normal route into Intermediate Islamic Studies.': 'الطريق المعتاد للانتقال إلى برنامج الدراسات الإسلامية المتوسطة.',
  'No prior study required -- placement by a short readiness assessment.':
    'لا يُشترط دراسة سابقة -- يتم التنسيب عبر تقييم قصير للجاهزية.',

  // Pathway tier 2 -- Intermediate Islamic Studies
  'Intermediate Islamic Studies': 'الدراسات الإسلامية المتوسطة',
  'Moves a learner from basic knowledge to systematic, connected understanding across the core disciplines.':
    'ينقل الطالب من المعرفة الأساسية إلى فهمٍ منهجي ومترابط عبر العلوم الشرعية الأساسية.',
  'Learners who have completed Foundation Studies, or who test in with equivalent prior learning.':
    'الطلاب الذين أتمّوا برنامج التأسيس، أو اجتازوا اختبار تحديد المستوى بما يعادله.',
  "Systematic Aqeedah & Fiqh · Seerah · Applied Tajweed & Qur'an comprehension · Arabic grammar · Islamic history & civilization · Communication & leadership":
    'العقيدة والفقه بشكل منهجي · السيرة النبوية · التجويد التطبيقي وفهم القرآن · النحو العربي · التاريخ والحضارة الإسلامية · التواصل والقيادة',
  'Longer than Foundation, shorter than Advanced -- a multi-term sequence.':
    'أطول من برنامج التأسيس وأقصر من المرحلة المتقدمة -- تسلسل من عدة فصول دراسية.',
  'The normal route into Advanced Islamic Studies.': 'الطريق المعتاد للانتقال إلى الدراسات الإسلامية المتقدمة.',
  'Completed Foundation Studies, or a placement assessment demonstrating equivalent competence.':
    'إتمام برنامج التأسيس، أو اجتياز تقييم تنسيب يثبت كفاءة معادلة.',

  // Pathway tier 3 -- Advanced Islamic Studies
  'Advanced Islamic Studies': 'الدراسات الإسلامية المتقدمة',
  'Independent engagement with primary texts and a first taste of specialization, preparing a learner for the Diploma.':
    'تفاعل مستقل مع المصادر الأصلية وتذوّق أولي للتخصص، تمهيدًا لدخول برنامج الدبلوم.',
  'Learners who have completed Intermediate Islamic Studies and are ready to work with less guidance.':
    'الطلاب الذين أتمّوا الدراسات الإسلامية المتوسطة، والمستعدون للدراسة بتوجيه أقل.',
  'Independent Aqeedah reasoning · Usul al-Fiqh & Hadith Sciences · Tajweed mastery & introductory Tafsir · Source-level Arabic · Islamic thought & research preparation · One specialization elective':
    'الاستدلال المستقل في العقيدة · أصول الفقه وعلوم الحديث · إتقان التجويد ومدخل إلى التفسير · اللغة العربية على مستوى المصادر · الفكر الإسلامي والإعداد للبحث · مقرر اختياري تخصصي واحد',
  'Comparable to or slightly longer than Intermediate.': 'مماثل للمرحلة المتوسطة أو أطول منها قليلاً.',
  'The normal route into the Diploma -- or directly into a Specialized Certificate.':
    'الطريق المعتاد للانتقال إلى الدبلوم -- أو مباشرة إلى شهادة تخصصية.',
  'Completed Intermediate Islamic Studies, or a placement assessment demonstrating equivalent competence.':
    'إتمام الدراسات الإسلامية المتوسطة، أو اجتياز تقييم تنسيب يثبت كفاءة معادلة.',

  // Pathway tier 4 -- Diploma in Islamic Studies
  'Diploma in Islamic Studies': 'دبلوم الدراسات الإسلامية',
  'The Academy\'s flagship structured qualification, integrating all six departments into one assessed credential.':
    'المؤهل الرئيسي المنظّم للأكاديمية، يجمع بين الأقسام الستة كافة في مؤهَّل واحد مُقيَّم.',
  "Learners who have completed Advanced Islamic Studies and are pursuing the Academy's most complete credential.":
    'الطلاب الذين أتمّوا الدراسات الإسلامية المتقدمة والساعون إلى أشمل مؤهَّل تقدّمه الأكاديمية.',
  "Islamic Studies · Qur'anic Studies · Arabic Language · Islamic Education & Tarbiyah · Islamic Civilization & Society · Research & Learning Skills":
    'الدراسات الإسلامية · الدراسات القرآنية · اللغة العربية · التربية الإسلامية · الحضارة الإسلامية والمجتمع · مهارات البحث والتعلّم',
  "The Academy's longest structured pathway.": 'أطول مسارات الأكاديمية المنظّمة.',
  'The normal route into a Specialized Certificate for a teaching or research track.':
    'الطريق المعتاد نحو شهادة تخصصية في مسار التدريس أو البحث.',
  'Completed Advanced Islamic Studies, or a comprehensive placement assessment.':
    'إتمام الدراسات الإسلامية المتقدمة، أو اجتياز تقييم تنسيب شامل.',
  'An Academy-issued credential -- not an externally accredited one.':
    'مؤهَّل صادر عن الأكاديمية -- وليس معتمدًا من جهة خارجية.',

  // Pathway tier 5 -- Specialized Certificate Programs
  'Specialized Certificate Programs': 'برامج الشهادات التخصصية',
  'Focused, single-area competence beyond the general pathway, for a learner who wants depth in one discipline.':
    'كفاءة مركّزة في مجال واحد بعد المسار العام، لمن يرغب في التعمّق في تخصص محدد.',
  'Learners who have completed Advanced Islamic Studies or the Diploma and want to go deep in one area.':
    'الطلاب الذين أتمّوا الدراسات الإسلامية المتقدمة أو الدبلوم ويرغبون في التعمّق في مجال واحد.',
  'One focused competency area, defined per certificate at approval':
    'مجال كفاءة واحد مركّز، يُحدَّد لكل شهادة عند اعتمادها',
  'Shorter and more focused than the Diploma -- varies by certificate.':
    'أقصر وأكثر تركيزًا من الدبلوم -- تختلف المدة باختلاف الشهادة.',
  'A terminal award within its area -- a learner may hold more than one certificate over time.':
    'مؤهَّل نهائي ضمن مجاله -- ويمكن للطالب الحصول على أكثر من شهادة بمرور الوقت.',
  "Completed Advanced or the Diploma, plus that certificate's own prerequisite, set when the certificate is approved.":
    'إتمام المرحلة المتقدمة أو الدبلوم، إضافةً إلى المتطلب الخاص بتلك الشهادة، والذي يُحدَّد عند اعتمادها.',
  'A framework, not yet an open programme -- no Specialized Certificate has been approved with a defined course list yet.':
    'إطار عام وليس برنامجًا مفتوحًا بعد -- لم تُعتمد أي شهادة تخصصية بقائمة مقررات محددة حتى الآن.',

  // Bookstore section
  'ULUL AZM BOOKSTORE': 'مكتبة أولو العزم',
  'Islamic Bookstore': 'المكتبة الإسلامية',
  'Explore selected Islamic books, classical texts, student resources, workbooks and educational publications.':
    'استكشف مجموعة مختارة من الكتب الإسلامية والمصادر التراثية وموارد الطلاب والكرّاسات والمطبوعات التعليمية.',
  'Visit Islamic Bookstore →': 'زيارة المكتبة الإسلامية ←',
  'Become an Author & Sell Your Books': 'كن مؤلفًا وبِع كتبك',
  'Beneficial Knowledge': 'العلم النافع',
  'Quality books are companions for the serious student. Explore our dedicated bookstore for academic and Islamic publications.':
    'الكتب الجيدة رفيقٌ للطالب الجاد. تصفّح مكتبتنا المخصصة للمطبوعات الأكاديمية والإسلامية.',

  // Media & Library section
  'MEDIA & LIBRARY': 'الإعلام والمكتبة',
  'Learn, Listen & Read': 'تعلّم واستمع واقرأ',
  'Recorded lessons, Khutbahs, Mutun Al-Ilmiyyah and Manzumat live in Media; articles, fatwas, research papers and classical texts live in the Library — two separate, dedicated sections.':
    'الدروس المسجّلة والخطب والمتون العلمية والمنظومات تجدها في قسم الإعلام؛ أما المقالات والفتاوى والأبحاث والكتب التراثية فتجدها في قسم المكتبة — وهما قسمان منفصلان ومخصصان.',
  'Explore Media →': 'استكشف الإعلام ←',
  'Browse Library →': 'تصفّح المكتبة ←',

  // Why Ulul Azm section
  'OUR APPROACH': 'منهجنا',
  'More than a website — a learning environment': 'أكثر من مجرد موقع — بيئة تعليمية متكاملة',
  'We aim to make the pursuit of Islamic knowledge organized, accessible, responsible and beneficial.':
    'نسعى إلى جعل طلب العلم الشرعي منظمًا وميسّرًا ومسؤولًا ونافعًا.',

  'Authentic Foundations': 'أسسٌ أصيلة',
  'Begin with foundational disciplines before progressing into advanced studies.':
    'ابدأ بالعلوم التأسيسية قبل الانتقال إلى الدراسات المتقدمة.',
  'Structured Programmes': 'برامج منظّمة',
  'Study through clearly defined academic areas rather than disconnected lessons.':
    'ادرس ضمن مجالات أكاديمية محددة بوضوح بدلاً من دروس متفرقة.',
  'Responsible Scholarship': 'علمٌ بمسؤولية',
  'Approach Islamic knowledge with sincerity, humility, discipline and respect for scholarship.':
    'تعامل مع العلم الشرعي بإخلاص وتواضع وانضباط واحترام للعلم وأهله.',

  // CTA section
  'BISMILLAH • SEEK KNOWLEDGE • SERVE WITH EXCELLENCE': 'بسم الله • اطلب العلم • واخدم بإتقان',
  'Begin Your Journey of Knowledge': 'ابدأ رحلتك في طلب العلم',
  'Explore academic programmes, educational resources, media library, and admissions opportunities.':
    'استكشف البرامج الأكاديمية والموارد التعليمية والمكتبة الإعلامية وفرص القبول.',

  // Announcements strip (the notices themselves are live DB content and
  // stay untranslated -- only these two static labels are covered)
  'NOTICES & ANNOUNCEMENTS': 'الإعلانات والتنبيهات',
  "What's happening at Ulul Azm": 'آخر مستجدات أولو العزم',
};

export function translate(lang, text) {
  if (lang !== 'ar') return text;
  if (typeof text !== 'string') return text;
  return AR_TRANSLATIONS[text] || text;
}
