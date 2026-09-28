import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL is missing from .env");
}

const adapter = new PrismaPg({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({
  adapter,
});

const categories = [
  {
    id: "cat-aqidah",
    nameEn: "Aqidah",
    nameAr: "العقيدة",
    slug: "aqidah",
  },
  {
    id: "cat-quran",
    nameEn: "Quran",
    nameAr: "القرآن",
    slug: "quran",
  },
  {
    id: "cat-hadith",
    nameEn: "Hadith",
    nameAr: "الحديث",
    slug: "hadith",
  },
  {
    id: "cat-fiqh",
    nameEn: "Fiqh",
    nameAr: "الفقه",
    slug: "fiqh",
  },
  {
    id: "cat-seerah",
    nameEn: "Seerah",
    nameAr: "السيرة",
    slug: "seerah",
  },
  {
    id: "cat-tazkiyah",
    nameEn: "Tazkiyah",
    nameAr: "التزكية",
    slug: "tazkiyah",
  },
  {
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
];

const books = [
  {
    id: "book-kitab-tawhid",
    titleEn: "Kitab At-Tawhid",
    titleAr: "كتاب التوحيد",
    slug: "kitab-at-tawhid",
    descriptionEn:
      "A foundational work on Islamic monotheism and the worship of Allah alone.",
    descriptionAr:
      "كتاب تأسيسي في توحيد الله وإفراده بالعبادة.",
    priceUSD: "9.99",
    coverImageUrl:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85",
    r2FileKey: "books/kitab-at-tawhid.pdf",
    isFeatured: true,
    isNewRelease: false,
    categoryId: "cat-aqidah",
  },

  {
    id: "book-three-fundamental-principles",
    titleEn: "The Three Fundamental Principles",
    titleAr: "الأصول الثلاثة",
    slug: "three-fundamental-principles",
    descriptionEn:
      "A concise introduction to the fundamental knowledge every Muslim should learn.",
    descriptionAr:
      "رسالة مختصرة في أصول العلم التي ينبغي لكل مسلم معرفتها.",
    priceUSD: "7.99",
    coverImageUrl:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=85",
    r2FileKey: "books/three-fundamental-principles.pdf",
    isFeatured: true,
    isNewRelease: true,
    categoryId: "cat-aqidah",
  },

  {
    id: "book-forty-hadith",
    titleEn: "Forty Hadith of Imam An-Nawawi",
    titleAr: "الأربعون النووية",
    slug: "forty-hadith-imam-nawawi",
    descriptionEn:
      "A collection of forty foundational prophetic traditions compiled by Imam An-Nawawi.",
    descriptionAr:
      "مجموعة من الأحاديث النبوية الجامعة التي جمعها الإمام النووي رحمه الله.",
    priceUSD: "12.99",
    coverImageUrl:
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=85",
    r2FileKey: "books/forty-hadith-imam-nawawi.pdf",
    isFeatured: true,
    isNewRelease: false,
    categoryId: "cat-hadith",
  },

  {
    id: "book-riyad-us-saliheen",
    titleEn: "Riyad As-Salihin",
    titleAr: "رياض الصالحين",
    slug: "riyad-as-salihin",
    descriptionEn:
      "A major collection of authentic prophetic traditions covering manners, worship and righteous conduct.",
    descriptionAr:
      "من أشهر كتب الحديث التي تجمع أحاديث في العبادات والآداب والأخلاق.",
    priceUSD: "19.99",
    coverImageUrl:
      "https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=900&q=85",
    r2FileKey: "books/riyad-as-salihin.pdf",
    isFeatured: true,
    isNewRelease: false,
    categoryId: "cat-hadith",
  },

  {
    id: "book-tafsir-ibn-kathir",
    titleEn: "Tafsir Ibn Kathir",
    titleAr: "تفسير ابن كثير",
    slug: "tafsir-ibn-kathir",
    descriptionEn:
      "A renowned classical commentary on the Quran based on the Quran, Sunnah and statements of the early generations.",
    descriptionAr:
      "من أشهر كتب تفسير القرآن الكريم بالمأثور.",
    priceUSD: "24.99",
    coverImageUrl:
      "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=900&q=85",
    r2FileKey: "books/tafsir-ibn-kathir.pdf",
    isFeatured: true,
    isNewRelease: false,
    categoryId: "cat-quran",
  },

  {
    id: "book-quranic-sciences",
    titleEn: "Introduction to Quranic Sciences",
    titleAr: "مقدمة في علوم القرآن",
    slug: "introduction-quranic-sciences",
    descriptionEn:
      "An introductory academic resource covering important subjects related to the sciences of the Quran.",
    descriptionAr:
      "مدخل تعليمي إلى أهم مباحث علوم القرآن.",
    priceUSD: "14.99",
    coverImageUrl:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85",
    r2FileKey: "books/introduction-quranic-sciences.pdf",
    isFeatured: false,
    isNewRelease: true,
    categoryId: "cat-quran",
  },

  {
    id: "book-umdatul-ahkam",
    titleEn: "Umdat Al-Ahkam",
    titleAr: "عمدة الأحكام",
    slug: "umdat-al-ahkam",
    descriptionEn:
      "A concise collection of authentic hadith dealing primarily with rulings of worship and daily practice.",
    descriptionAr:
      "مختصر جامع لأحاديث الأحكام الصحيحة.",
    priceUSD: "15.99",
    coverImageUrl:
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=900&q=85",
    r2FileKey: "books/umdat-al-ahkam.pdf",
    isFeatured: false,
    isNewRelease: true,
    categoryId: "cat-fiqh",
  },

  {
    id: "book-madinah-arabic",
    titleEn: "Arabic Language Foundations",
    titleAr: "أساسيات اللغة العربية",
    slug: "arabic-language-foundations",
    descriptionEn:
      "A foundational resource for students beginning their study of the Arabic language.",
    descriptionAr:
      "مادة تأسيسية للطلاب المبتدئين في دراسة اللغة العربية.",
    priceUSD: "17.99",
    coverImageUrl:
      "https://images.unsplash.com/photo-1455885666463-6d7f4c7e5a2d?auto=format&fit=crop&w=900&q=85",
    r2FileKey: "books/arabic-language-foundations.pdf",
    isFeatured: true,
    isNewRelease: true,
    categoryId: "cat-arabic",
  },

  {
    id: "book-prophetic-biography",
    titleEn: "The Prophetic Biography",
    titleAr: "السيرة النبوية",
    slug: "prophetic-biography",
    descriptionEn:
      "A study resource covering the life, character and mission of Prophet Muhammad ﷺ.",
    descriptionAr:
      "مادة علمية لدراسة حياة النبي محمد ﷺ وسيرته وشمائله.",
    priceUSD: "21.99",
    coverImageUrl:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85",
    r2FileKey: "books/prophetic-biography.pdf",
    isFeatured: true,
    isNewRelease: false,
    categoryId: "cat-seerah",
  },

  {
    id: "book-purification-soul",
    titleEn: "Purification of the Soul",
    titleAr: "تزكية النفس",
    slug: "purification-of-the-soul",
    descriptionEn:
      "A beneficial introduction to spiritual purification, sincerity and righteous character.",
    descriptionAr:
      "مدخل نافع إلى تزكية النفس والإخلاص وحسن الخلق.",
    priceUSD: "13.99",
    coverImageUrl:
      "https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=900&q=85",
    r2FileKey: "books/purification-of-the-soul.pdf",
    isFeatured: false,
    isNewRelease: true,
    categoryId: "cat-tazkiyah",
  },
];

const countries = [
  {
    id: "country-ghana",
    code: "GH",
    name: "Ghana",
    currencyCode: "GHS",
    currencySymbol: "GH₵",
  },
  {
    id: "country-saudi-arabia",
    code: "SA",
    name: "Saudi Arabia",
    currencyCode: "SAR",
    currencySymbol: "﷼",
  },
  {
    id: "country-nigeria",
    code: "NG",
    name: "Nigeria",
    currencyCode: "NGN",
    currencySymbol: "₦",
  },
  {
    id: "country-united-states",
    code: "US",
    name: "United States",
    currencyCode: "USD",
    currencySymbol: "$",
  },
  {
    id: "country-united-kingdom",
    code: "GB",
    name: "United Kingdom",
    currencyCode: "GBP",
    currencySymbol: "£",
  },
];

const exchangeRates = [
  {
    id: "rate-ghs",
    currencyCode: "GHS",
    rateToUSD: "12.500000",
    countryId: "country-ghana",
  },
  {
    id: "rate-sar",
    currencyCode: "SAR",
    rateToUSD: "3.750000",
    countryId: "country-saudi-arabia",
  },
  {
    id: "rate-ngn",
    currencyCode: "NGN",
    rateToUSD: "1500.000000",
    countryId: "country-nigeria",
  },
  {
    id: "rate-usd",
    currencyCode: "USD",
    rateToUSD: "1.000000",
    countryId: "country-united-states",
  },
  {
    id: "rate-gbp",
    currencyCode: "GBP",
    rateToUSD: "0.750000",
    countryId: "country-united-kingdom",
  },
];

// =====================================================================
// INSTITUTIONAL DATA — administrative Units, staff Positions, and the
// PositionPermission matrix that drives the Admin oversight console.
// =====================================================================

// The Academy's real Faculty and its five Departments (Model 2 —
// Academic Governance & Organizational Structure), created here because
// none existed yet in the live database. Upserted by `code`, so this is
// safe to re-run and will never duplicate. Each department houses one
// or more of the seven disciplines named in Model 1 (Academy
// Foundation) — see /academy-governance for the full mapping.
const academyFaculty = {
  code: "ACADEMY",
  nameEn: "Ulul Azm Academy",
  nameAr: "أكاديمية أولي العزم",
  description:
    "The Institute's educational and teaching arm — the structured environment through which Ulul Azm's mission of Islamic knowledge reaches learners.",
};

const academyDepartments = [
  {
    code: "DEPT-ISLAMIC-STUDIES",
    nameEn: "Department of Islamic Studies",
    nameAr: "قسم الدراسات الإسلامية",
    description:
      "Aqidah, Hadith Sciences, Fiqh, and Seerah — the Academy's core traditional-sciences department.",
  },
  {
    code: "DEPT-QURANIC-STUDIES",
    nameEn: "Department of Qur'anic Studies",
    nameAr: "قسم الدراسات القرآنية",
    description:
      "Tajwid, Qur'an memorization and recitation, and Tafsir — the learner's direct relationship with the Qur'anic text.",
  },
  {
    code: "DEPT-ARABIC-LANGUAGE",
    nameEn: "Department of Arabic Language",
    nameAr: "قسم اللغة العربية",
    description:
      "Grammar, morphology, vocabulary and comprehension — the Arabic proficiency every other department's advanced study depends on.",
  },
  {
    code: "DEPT-EDUCATION-TARBIYAH",
    nameEn: "Department of Islamic Education & Tarbiyah",
    nameAr: "قسم التربية الإسلامية والتزكية",
    description:
      "Tazkiyah and Islamic pedagogy — character formation as a taught discipline, and preparation for learners on the teaching track.",
  },
  {
    code: "DEPT-CIVILIZATION-SOCIETY",
    nameEn: "Department of Islamic Civilization & Society",
    nameAr: "قسم الحضارة الإسلامية والمجتمع",
    description:
      "Islamic history, contemporary community issues, and da'wah methodology — situating knowledge in its historical and present context.",
  },
];

// The Academy's four real pathway-tier programs (Model 3 — Academic
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
  // Academy Pathways §7's fifth tier -- approved 2026-09 as one
  // combined applyable programme (rather than as separate
  // individually-approved certificates), with its initial course
  // list drawn from §7's own candidate table. Administratively
  // hosted under Islamic Studies, matching the other four pathway
  // tiers' own convention -- its real courses span all five
  // departments via each course's own categoryId (see academyCourses
  // below), and the Department can add further certificate courses
  // to it over time the same way any other programme's courses are
  // managed.
  {
    code: "SPECIALIZED-CERTIFICATE-PROGRAMS",
    nameEn: "Specialized Certificate Programs",
    nameAr: "برامج الشهادات التخصصية",
    level: "CERTIFICATE",
    departmentCode: "DEPT-ISLAMIC-STUDIES",
    descriptionEn:
      "Focused, single-area certificates for a learner who has completed Advanced Islamic Studies or the Diploma and wants named competency in one discipline -- Tajweed, Qur'an Recitation, Hifz, Tafsir, Hadith, Fiqh, Arabic, Qur'anic Arabic, Islamic Education, Da'wah, or Islamic History & Civilization -- rather than the full multi-year pathway. The Department may add further certificate courses over time.",
    descriptionAr:
      "شهادات تخصصية مركزة في مجال واحد لمن أتم الدراسات الإسلامية المتقدمة أو الدبلوم ويرغب في كفاءة معلومة في تخصص واحد — التجويد، تلاوة القرآن، الحفظ، التفسير، الحديث، الفقه، اللغة العربية، العربية القرآنية، التربية الإسلامية، الدعوة، أو التاريخ والحضارة الإسلامية — بدل المسار الكامل متعدد السنوات.",
  },
];

const units = [
  { id: "unit-rectorate", code: "RECTORATE", type: "RECTORATE", nameEn: "Office of the Rector", nameAr: "مكتب رئيس الجامعة" },
  { id: "unit-registrar", code: "REGISTRAR", type: "REGISTRAR", nameEn: "Registrar", nameAr: "أمانة السجلات" },
  { id: "unit-acad-admin", code: "ACAD_ADMIN", type: "ACADEMIC_ADMINISTRATION", nameEn: "Academic Administration", nameAr: "الإدارة الأكاديمية" },
  { id: "unit-registry-admissions", code: "REGISTRY_ADMISSIONS", type: "REGISTRY_ADMISSIONS", nameEn: "Registry / Admissions", nameAr: "القبول والتسجيل" },
  { id: "unit-exams-records", code: "EXAMS_RECORDS", type: "EXAMINATIONS_RECORDS", nameEn: "Examinations & Academic Records", nameAr: "الامتحانات والسجلات الأكاديمية" },
  { id: "unit-student-affairs", code: "STUDENT_AFFAIRS", type: "STUDENT_AFFAIRS", nameEn: "Student Affairs", nameAr: "شؤون الطلاب" },
  { id: "unit-finance", code: "FINANCE", type: "FINANCE", nameEn: "Finance", nameAr: "الشؤون المالية" },
  { id: "unit-library", code: "LIBRARY", type: "LIBRARY", nameEn: "Library", nameAr: "المكتبة" },
  { id: "unit-qa", code: "QA", type: "QUALITY_ASSURANCE", nameEn: "Quality Assurance", nameAr: "ضمان الجودة" },
  { id: "unit-ict", code: "ICT", type: "ICT", nameEn: "ICT", nameAr: "تقنية المعلومات" },
  { id: "unit-other-admin", code: "OTHER_ADMIN", type: "OTHER", nameEn: "Other Administrative Units", nameAr: "وحدات إدارية أخرى" },
];

// Fields used only when CREATING a brand-new Position row. If a row
// with this nameEn already exists (e.g. Dean/HOD/Instructor/Programme
// Coordinator, already wired to real Faculty/Department relations),
// its existing id AND code are left untouched — only nameAr/isAcademic
// are refreshed. This avoids duplicating or corrupting real data.
const positions = [
  { code: "RECTOR", nameEn: "Rector", nameAr: "رئيس الجامعة", isAcademic: false },
  { code: "VICE_RECTOR", nameEn: "Vice Rector", nameAr: "نائب رئيس الجامعة", isAcademic: false },
  { code: "REGISTRAR_OFFICER", nameEn: "Registrar", nameAr: "أمين السجلات", isAcademic: false },
  { code: "ACAD_ADMIN_OFFICER", nameEn: "Academic Administrator", nameAr: "إداري أكاديمي", isAcademic: false },
  { code: "ACADEMY_DIRECTOR", nameEn: "Academy Director", nameAr: "مدير الأكاديمية", isAcademic: true },
  { code: "DEAN", nameEn: "Dean", nameAr: "عميد", isAcademic: true },
  { code: "HOD", nameEn: "Head of Department", nameAr: "رئيس القسم", isAcademic: true },
  { code: "PC", nameEn: "Programme Coordinator", nameAr: "منسق البرنامج", isAcademic: true },
  { code: "LECTURER", nameEn: "Lecturer", nameAr: "محاضر", isAcademic: true },
  { code: "INST", nameEn: "Instructor", nameAr: "مدرب", isAcademic: true },
  { code: "SR_INST", nameEn: "Senior Instructor", nameAr: "مدرب أول", isAcademic: true },
  { code: "ACADEMIC_ADVISOR", nameEn: "Academic Advisor", nameAr: "مرشد أكاديمي", isAcademic: true },
  { code: "ADMISSIONS_OFFICER", nameEn: "Admissions Officer", nameAr: "موظف قبول", isAcademic: false },
  { code: "EXAMS_OFFICER", nameEn: "Examinations Officer", nameAr: "موظف امتحانات", isAcademic: false },
  { code: "STUDENT_AFFAIRS_OFFICER", nameEn: "Student Affairs Officer", nameAr: "موظف شؤون طلاب", isAcademic: false },
  { code: "FINANCE_OFFICER", nameEn: "Finance Officer", nameAr: "موظف مالي", isAcademic: false },
  { code: "LIBRARIAN", nameEn: "Librarian", nameAr: "أمين مكتبة", isAcademic: false },
  { code: "QA_OFFICER", nameEn: "Quality Assurance Officer", nameAr: "موظف ضمان جودة", isAcademic: false },
  { code: "RESEARCH_OFFICER", nameEn: "Research & Scholarly Affairs Officer", nameAr: "موظف الشؤون البحثية والعلمية", isAcademic: true },
  { code: "ICT_OFFICER", nameEn: "ICT Officer", nameAr: "موظف تقنية معلومات", isAcademic: false },
  { code: "OTHER_ADMIN_STAFF", nameEn: "Administrative Staff", nameAr: "موظف إداري", isAcademic: false },
  { code: "SUPER_ADMIN_STAFF", nameEn: "Super Admin", nameAr: "مسؤول عام", isAcademic: false },
];

// All Module enum values, used to grant Super Admin / Rector full-institution view.
const ALL_MODULES = [
  "STUDENT_MATTERS",
  "ACADEMIC_RECORDS",
  "FACULTY_MATTERS",
  "DEPARTMENT_MATTERS",
  "PROGRAM_MATTERS",
  "COURSES_GRADES",
  "EXAMINATIONS",
  "FINANCE_FEES",
  "FINANCE_PAYROLL",
  "LIBRARY_OPS",
  "ICT_OPS",
  "ADMISSIONS",
  "QUALITY_ASSURANCE",
  "OTHER_ADMIN",
  "RESEARCH_OPS",
];

// Maps each Position code -> the Modules it can view/edit in the Admin
// console. Admin/Super Admin see everything; Rector/Vice Rector see
// everything but can't edit (oversight, not operational control); every
// other position gets edit on its own domain and view on the layer
// directly beneath it, matching the "Admin sees everything, the
// designated body owns the work" architecture.
// Keyed by Position.nameEn (the actual unique constraint) rather than
// code — this way pre-existing real rows (Dean/HOD/Instructor/
// Programme Coordinator) still get matched correctly even though their
// existing `code` values differ from the ones used above for new rows.
const positionPermissions = {
  "Super Admin": ALL_MODULES.map((m) => ({ module: m, canView: true, canEdit: true })),
  "Rector": ALL_MODULES.map((m) => ({ module: m, canView: true, canEdit: false })),
  "Vice Rector": ALL_MODULES.map((m) => ({ module: m, canView: true, canEdit: false })),

  "Registrar": [
    { module: "ACADEMIC_RECORDS", canView: true, canEdit: true },
    { module: "STUDENT_MATTERS", canView: true, canEdit: false },
    { module: "ADMISSIONS", canView: true, canEdit: false },
  ],
  "Academic Administrator": [
    { module: "ACADEMIC_RECORDS", canView: true, canEdit: true },
    { module: "FACULTY_MATTERS", canView: true, canEdit: false },
    { module: "DEPARTMENT_MATTERS", canView: true, canEdit: false },
  ],
  "Academy Director": [
    { module: "FACULTY_MATTERS", canView: true, canEdit: false },
    { module: "DEPARTMENT_MATTERS", canView: true, canEdit: false },
    { module: "PROGRAM_MATTERS", canView: true, canEdit: false },
    { module: "COURSES_GRADES", canView: true, canEdit: false },
    { module: "ACADEMIC_RECORDS", canView: true, canEdit: false },
    { module: "QUALITY_ASSURANCE", canView: true, canEdit: false },
  ],
  "Dean": [
    { module: "FACULTY_MATTERS", canView: true, canEdit: true },
    { module: "DEPARTMENT_MATTERS", canView: true, canEdit: false },
    { module: "PROGRAM_MATTERS", canView: true, canEdit: false },
    { module: "COURSES_GRADES", canView: true, canEdit: false },
  ],
  "Head of Department": [
    { module: "DEPARTMENT_MATTERS", canView: true, canEdit: true },
    { module: "PROGRAM_MATTERS", canView: true, canEdit: false },
    { module: "COURSES_GRADES", canView: true, canEdit: false },
  ],
  "Programme Coordinator": [
    { module: "PROGRAM_MATTERS", canView: true, canEdit: true },
    { module: "COURSES_GRADES", canView: true, canEdit: false },
  ],
  "Lecturer": [{ module: "COURSES_GRADES", canView: true, canEdit: true }],
  "Instructor": [{ module: "COURSES_GRADES", canView: true, canEdit: true }],
  "Senior Instructor": [{ module: "COURSES_GRADES", canView: true, canEdit: true }, { module: "QUALITY_ASSURANCE", canView: true, canEdit: false }],
  "Academic Advisor": [{ module: "STUDENT_MATTERS", canView: true, canEdit: false }],
  "Admissions Officer": [{ module: "ADMISSIONS", canView: true, canEdit: true }],
  "Examinations Officer": [{ module: "EXAMINATIONS", canView: true, canEdit: true }],
  "Student Affairs Officer": [{ module: "STUDENT_MATTERS", canView: true, canEdit: true }],
  "Finance Officer": [
    { module: "FINANCE_FEES", canView: true, canEdit: true },
    { module: "FINANCE_PAYROLL", canView: true, canEdit: true },
  ],
  "Librarian": [{ module: "LIBRARY_OPS", canView: true, canEdit: true }],
  "Quality Assurance Officer": [{ module: "QUALITY_ASSURANCE", canView: true, canEdit: true }],
  "Research & Scholarly Affairs Officer": [{ module: "RESEARCH_OPS", canView: true, canEdit: true }],
  "ICT Officer": [{ module: "ICT_OPS", canView: true, canEdit: true }],
  "Administrative Staff": [{ module: "OTHER_ADMIN", canView: true, canEdit: true }],
};

async function seedCategories() {
  console.log("Seeding categories...");

  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        id: category.id,
      },
      update: {
        nameEn: category.nameEn,
        nameAr: category.nameAr,
        slug: category.slug,
      },
      create: category,
    });

    console.log(`  ✓ ${category.nameEn}`);
  }
}

async function seedCountries() {
  console.log("Seeding countries...");

  for (const country of countries) {
    await prisma.country.upsert({
      where: {
        id: country.id,
      },
      update: {
        code: country.code,
        name: country.name,
        currencyCode: country.currencyCode,
        currencySymbol: country.currencySymbol,
      },
      create: country,
    });

    console.log(`  ✓ ${country.name}`);
  }
}

async function seedExchangeRates() {
  console.log("Seeding exchange rates...");

  for (const rate of exchangeRates) {
    await prisma.exchangeRate.upsert({
      where: {
        id: rate.id,
      },
      update: {
        currencyCode: rate.currencyCode,
        rateToUSD: rate.rateToUSD,
        countryId: rate.countryId,
        updatedAt: new Date(),
      },
      create: {
        id: rate.id,
        currencyCode: rate.currencyCode,
        rateToUSD: rate.rateToUSD,
        countryId: rate.countryId,
        updatedAt: new Date(),
      },
    });

    console.log(`  ✓ ${rate.currencyCode}`);
  }
}

async function seedBooks() {
  console.log("Seeding books...");

  for (const book of books) {
    await prisma.book.upsert({
      where: {
        id: book.id,
      },
      update: {
        titleEn: book.titleEn,
        titleAr: book.titleAr,
        slug: book.slug,
        descriptionEn: book.descriptionEn,
        descriptionAr: book.descriptionAr,
        priceUSD: book.priceUSD,
        coverImageUrl: book.coverImageUrl,
        r2FileKey: book.r2FileKey,
        isFeatured: book.isFeatured,
        isNewRelease: book.isNewRelease,
        categoryId: book.categoryId,
      },
      create: book,
    });

    console.log(`  ✓ ${book.titleEn}`);
  }
}

async function seedUnits() {
  console.log("Seeding administrative units...");

  for (const unit of units) {
    await prisma.unit.upsert({
      where: {
        id: unit.id,
      },
      update: {
        code: unit.code,
        type: unit.type,
        nameEn: unit.nameEn,
        nameAr: unit.nameAr,
      },
      create: unit,
    });

    console.log(`  ✓ ${unit.nameEn}`);
  }
}

async function seedAcademyStructure() {
  console.log("Seeding Academy faculty and departments...");

  const faculty = await prisma.faculty.upsert({
    where: { code: academyFaculty.code },
    update: {
      nameEn: academyFaculty.nameEn,
      nameAr: academyFaculty.nameAr,
      description: academyFaculty.description,
    },
    create: academyFaculty,
  });

  console.log(`  ✓ ${faculty.nameEn}`);

  for (const department of academyDepartments) {
    const saved = await prisma.department.upsert({
      where: { code: department.code },
      update: {
        nameEn: department.nameEn,
        nameAr: department.nameAr,
        description: department.description,
        facultyId: faculty.id,
      },
      create: { ...department, facultyId: faculty.id },
    });

    console.log(`  ✓ ${saved.nameEn}`);
  }
}


// The Academy's 42 real courses (Model 12) — every course in the Course
// Catalogue & Coding System document, actually created as real Course
// records for the first time. Course Catalogue's own closing line said
// these were "illustrative — not yet real Course records"; later
// documents (Assessment, Faculty & Portals, Academic Regulations) then
// described them as already real without this ever having been done —
// a genuine inconsistency this document's audit found and this seed
// closes. SPEC-3xx is deliberately not created: the catalogue itself
// says it "has no defined content of its own," so seeding it would be
// inventing a course, not recording one. Prerequisites, semesterLevel
// (per-program sequencing for lib/courseAssignment.js's auto-assignment
// engine) and approvalStatus are all set from what the Course Catalogue
// and Course Specifications documents already, specifically say —
// including the courses those documents themselves flagged as pending
// Scholarly Review Committee sign-off (UNDER_REVIEW) or not yet able to
// run at all (IS-403: isPublished false, DRAFT).
const academyCourses = [
  {
    id: "course-is-101",
    courseCode: "IS-101",
    titleEn: "Islamic Foundations",
    titleAr: "أساسيات العقيدة والفقه",
    slug: "is-101-islamic-foundations",
    descriptionEn:
      "Core Aqeedah and Fiqh essentials for a learner starting from zero prior knowledge.",
    descriptionAr:
      "أساسيات العقيدة والفقه الجوهرية لمن يبدأ من غير معرفة سابقة.",
    creditHours: 3,
    categoryId: "cat-aqidah",
    programCode: "FOUNDATION-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: [],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-is-201",
    courseCode: "IS-201",
    titleEn: "Intermediate Aqeedah",
    titleAr: "العقيدة (المستوى المتوسط)",
    slug: "is-201-intermediate-aqeedah",
    descriptionEn:
      "Aqeedah taught as a connected, systematic body of knowledge rather than scattered facts.",
    descriptionAr:
      "تدريس العقيدة كمنظومة معرفية مترابطة لا مجرد معلومات متفرقة.",
    creditHours: 3,
    categoryId: "cat-aqidah",
    programCode: "INTERMEDIATE-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: ["IS-101"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-is-202",
    courseCode: "IS-202",
    titleEn: "Intermediate Fiqh",
    titleAr: "الفقه (المستوى المتوسط)",
    slug: "is-202-intermediate-fiqh",
    descriptionEn:
      "Systematic Fiqh instruction building on Foundation's essentials, applied to everyday situations.",
    descriptionAr:
      "تدريس الفقه بشكل منهجي مبني على أساسيات التأسيس، وتطبيقه في المواقف اليومية.",
    creditHours: 3,
    categoryId: "cat-fiqh",
    programCode: "INTERMEDIATE-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: ["IS-101"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-is-203",
    courseCode: "IS-203",
    titleEn: "Seerah I",
    titleAr: "السيرة النبوية (١)",
    slug: "is-203-seerah-i",
    descriptionEn:
      "The learner's first dedicated Seerah course — the essential events of the Prophetic biography.",
    descriptionAr:
      "أول مقرر مخصص للسيرة يتناول الأحداث الجوهرية للسيرة النبوية.",
    creditHours: 2,
    categoryId: "cat-seerah",
    programCode: "INTERMEDIATE-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: ["IS-101"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-is-301",
    courseCode: "IS-301",
    titleEn: "Advanced Aqeedah",
    titleAr: "العقيدة (المستوى المتقدم)",
    slug: "is-301-advanced-aqeedah",
    descriptionEn:
      "Deepens Aqeedah to independent, argument-following engagement within the Academy's manhaj.",
    descriptionAr:
      "تعميق العقيدة نحو التفاعل المستقل مع الأدلة ضمن منهج الأكاديمية.",
    creditHours: 3,
    categoryId: "cat-aqidah",
    programCode: "ADVANCED-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: ["IS-201"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-is-302",
    courseCode: "IS-302",
    titleEn: "Usul al-Fiqh",
    titleAr: "أصول الفقه",
    slug: "is-302-usul-al-fiqh",
    descriptionEn:
      "The methodology behind Fiqh rulings — how a ruling is derived from its sources, not just the ruling itself.",
    descriptionAr:
      "منهجية استنباط الأحكام الفقهية من مصادرها، لا الأحكام ذاتها فحسب.",
    creditHours: 3,
    categoryId: "cat-fiqh",
    programCode: "ADVANCED-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: ["IS-202"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-is-303",
    courseCode: "IS-303",
    titleEn: "Hadith Sciences",
    titleAr: "علوم الحديث",
    slug: "is-303-hadith-sciences",
    descriptionEn:
      "Hadith introduced and developed as its own dedicated discipline — classification and authentication criteria.",
    descriptionAr:
      "تقديم علم الحديث كعلم مستقل، مع أسس التصنيف ومعايير التوثيق.",
    creditHours: 3,
    categoryId: "cat-hadith",
    programCode: "ADVANCED-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: ["IS-202"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-is-304",
    courseCode: "IS-304",
    titleEn: "Islamic Thought",
    titleAr: "الفكر الإسلامي",
    slug: "is-304-islamic-thought",
    descriptionEn:
      "Classical and contemporary Islamic intellectual tradition — kalam, philosophical theology, schools of thought.",
    descriptionAr:
      "التراث الفكري الإسلامي الكلاسيكي والمعاصر — علم الكلام والمدارس الفكرية.",
    creditHours: 2,
    categoryId: "cat-aqidah",
    programCode: "ADVANCED-ISLAMIC-STUDIES",
    semesterLevel: 2,
    prerequisiteCodes: ["IS-301"],
    isPublished: true,
    approvalStatus: "UNDER_REVIEW",
    thumbnailUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-is-305",
    courseCode: "IS-305",
    titleEn: "Islamic Ethics",
    titleAr: "الأخلاق الإسلامية",
    slug: "is-305-islamic-ethics",
    descriptionEn:
      "Akhlaq as a reasoned discipline — the theoretical counterpart to Tazkiyah's practiced formation.",
    descriptionAr:
      "الأخلاق كعلم يُبحث فيه بالنظر، مكمّلاً للتزكية العملية.",
    creditHours: 2,
    categoryId: "cat-aqidah",
    programCode: "ADVANCED-ISLAMIC-STUDIES",
    semesterLevel: 2,
    prerequisiteCodes: ["IS-301"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-is-401",
    courseCode: "IS-401",
    titleEn: "Comparative Fiqh",
    titleAr: "الفقه المقارن",
    slug: "is-401-comparative-fiqh",
    descriptionEn:
      "Comparative treatment of Fiqh positions across schools — the Diploma's mastery-tier Fiqh course.",
    descriptionAr:
      "دراسة مقارنة للمذاهب الفقهية، وهو مقرر الفقه في مستوى الإتقان بالدبلوم.",
    creditHours: 3,
    categoryId: "cat-fiqh",
    programCode: "DIPLOMA-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: ["IS-302"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-is-402",
    courseCode: "IS-402",
    titleEn: "Hadith Methodology (Takhrij)",
    titleAr: "منهجية تخريج الحديث",
    slug: "is-402-hadith-methodology-takhrij",
    descriptionEn:
      "Hadith authentication methodology at mastery level — tracing and evaluating a chain of transmission.",
    descriptionAr:
      "منهجية توثيق الحديث في مستوى متقدم — تتبع السند وتقييمه.",
    creditHours: 3,
    categoryId: "cat-hadith",
    programCode: "DIPLOMA-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: ["IS-303"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-is-403",
    courseCode: "IS-403",
    titleEn: "Contemporary Islamic Issues",
    titleAr: "القضايا الإسلامية المعاصرة",
    slug: "is-403-contemporary-islamic-issues",
    descriptionEn:
      "Fiqh- and Aqeedah-based reasoning applied to modern questions — bioethics, Islamic finance, technology.",
    descriptionAr:
      "تطبيق الاستدلال الفقهي والعقدي على القضايا المعاصرة كالأخلاقيات الطبية والتمويل الإسلامي والتقنية.",
    creditHours: 2,
    categoryId: "cat-fiqh",
    programCode: "DIPLOMA-ISLAMIC-STUDIES",
    semesterLevel: 2,
    prerequisiteCodes: ["IS-401"],
    isPublished: false,
    approvalStatus: "DRAFT",
    thumbnailUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-qs-101",
    courseCode: "QS-101",
    titleEn: "Qur'an Reading Foundations",
    titleAr: "أساسيات قراءة القرآن",
    slug: "qs-101-qur-an-reading-foundations",
    descriptionEn:
      "Correct Qur'anic reading from a zero-prior-knowledge start.",
    descriptionAr:
      "القراءة الصحيحة للقرآن الكريم لمن يبدأ من غير معرفة سابقة.",
    creditHours: 3,
    categoryId: "cat-quran",
    programCode: "FOUNDATION-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: [],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-qs-102",
    courseCode: "QS-102",
    titleEn: "Tajweed Foundations",
    titleAr: "أساسيات التجويد",
    slug: "qs-102-tajweed-foundations",
    descriptionEn:
      "Foundational Tajwid rules applied to correct recitation.",
    descriptionAr:
      "قواعد التجويد الأساسية وتطبيقها في التلاوة الصحيحة.",
    creditHours: 2,
    categoryId: "cat-quran",
    programCode: "FOUNDATION-STUDIES",
    semesterLevel: 2,
    prerequisiteCodes: ["QS-101"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-qs-201",
    courseCode: "QS-201",
    titleEn: "Applied Tajweed",
    titleAr: "التجويد التطبيقي",
    slug: "qs-201-applied-tajweed",
    descriptionEn:
      "Tajwid applied with growing fluency across longer passages.",
    descriptionAr:
      "تطبيق أحكام التجويد بطلاقة متزايدة على مقاطع أطول.",
    creditHours: 2,
    categoryId: "cat-quran",
    programCode: "INTERMEDIATE-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: ["QS-102"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-qs-202",
    courseCode: "QS-202",
    titleEn: "Qur'an Comprehension I",
    titleAr: "فهم القرآن (١)",
    slug: "qs-202-qur-an-comprehension-i",
    descriptionEn:
      "The beginning of Qur'anic comprehension, not just correct reading.",
    descriptionAr:
      "بدايات فهم معاني القرآن، لا القراءة الصحيحة فحسب.",
    creditHours: 2,
    categoryId: "cat-quran",
    programCode: "INTERMEDIATE-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: ["QS-101"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-qs-301",
    courseCode: "QS-301",
    titleEn: "Advanced Tajweed",
    titleAr: "التجويد المتقدم",
    slug: "qs-301-advanced-tajweed",
    descriptionEn:
      "Tajwid mastered — the last dedicated Tajwid course before it is assumed rather than re-taught.",
    descriptionAr:
      "إتقان التجويد، وهو آخر مقرر مخصص له قبل افتراض إتقانه فيما بعد.",
    creditHours: 2,
    categoryId: "cat-quran",
    programCode: "ADVANCED-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: ["QS-201"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-qs-302",
    courseCode: "QS-302",
    titleEn: "Tafsir I",
    titleAr: "التفسير (١)",
    slug: "qs-302-tafsir-i",
    descriptionEn:
      "Verse-by-verse exegesis, comprehension deepened from Intermediate.",
    descriptionAr:
      "تفسير آيات مختارة تفسيراً تحليلياً، بعمق أكبر من المستوى المتوسط.",
    creditHours: 3,
    categoryId: "cat-quran",
    programCode: "ADVANCED-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: ["QS-202"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-qs-401",
    courseCode: "QS-401",
    titleEn: "Tafsir II",
    titleAr: "التفسير (٢)",
    slug: "qs-401-tafsir-ii",
    descriptionEn:
      "Tafsir mastered at Diploma tier — independently researching and presenting a Tafsir analysis.",
    descriptionAr:
      "إتقان التفسير في مستوى الدبلوم، ببحث مستقل وعرض تحليلي.",
    creditHours: 3,
    categoryId: "cat-quran",
    programCode: "DIPLOMA-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: ["QS-302"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-qs-402",
    courseCode: "QS-402",
    titleEn: "Ulum al-Qur'an",
    titleAr: "علوم القرآن",
    slug: "qs-402-ulum-al-qur-an",
    descriptionEn:
      "Sciences of the Qur'an — revelation circumstances, makki/madani, compilation history.",
    descriptionAr:
      "علوم القرآن — أسباب النزول، والمكي والمدني، وتاريخ الجمع.",
    creditHours: 2,
    categoryId: "cat-quran",
    programCode: "DIPLOMA-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: ["QS-302"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-ar-101",
    courseCode: "AR-101",
    titleEn: "Arabic Foundations",
    titleAr: "أساسيات اللغة العربية",
    slug: "ar-101-arabic-foundations",
    descriptionEn:
      "Zero-Arabic entry point building basic vocabulary and sentence structure.",
    descriptionAr:
      "نقطة بداية لمن لا يعرف العربية، لبناء المفردات الأساسية وبنية الجملة.",
    creditHours: 3,
    categoryId: "cat-arabic",
    programCode: "FOUNDATION-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: [],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-ar-201",
    courseCode: "AR-201",
    titleEn: "Arabic Grammar I",
    titleAr: "النحو العربي (١)",
    slug: "ar-201-arabic-grammar-i",
    descriptionEn:
      "Grammar sufficient to reduce dependence on translation.",
    descriptionAr:
      "قواعد نحوية كافية لتقليل الاعتماد على الترجمة.",
    creditHours: 3,
    categoryId: "cat-arabic",
    programCode: "INTERMEDIATE-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: ["AR-101"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-ar-301",
    courseCode: "AR-301",
    titleEn: "Arabic Grammar II",
    titleAr: "النحو العربي (٢)",
    slug: "ar-301-arabic-grammar-ii",
    descriptionEn:
      "Grammar deepened toward reading primary texts directly.",
    descriptionAr:
      "تعميق النحو تمهيداً لقراءة النصوص الأصلية مباشرة.",
    creditHours: 3,
    categoryId: "cat-arabic",
    programCode: "ADVANCED-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: ["AR-201"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-ar-302",
    courseCode: "AR-302",
    titleEn: "Conversation",
    titleAr: "المحادثة العربية",
    slug: "ar-302-conversation",
    descriptionEn:
      "Spoken fluency and applied dialogue, running alongside Grammar II rather than after it.",
    descriptionAr:
      "الطلاقة في التحدث والحوار التطبيقي، بالتوازي مع النحو (٢).",
    creditHours: 2,
    categoryId: "cat-arabic",
    programCode: "ADVANCED-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: ["AR-201"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-ar-401",
    courseCode: "AR-401",
    titleEn: "Classical Arabic & Source Reading",
    titleAr: "قراءة النصوص العربية الكلاسيكية",
    slug: "ar-401-classical-arabic-source-reading",
    descriptionEn:
      "Source-reading mastery — reading a classical source text directly, without translation support.",
    descriptionAr:
      "إتقان قراءة النصوص الكلاسيكية مباشرة دون الاعتماد على الترجمة.",
    creditHours: 3,
    categoryId: "cat-arabic",
    programCode: "DIPLOMA-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: ["AR-301"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-ar-402",
    courseCode: "AR-402",
    titleEn: "Writing",
    titleAr: "الكتابة العربية",
    slug: "ar-402-writing",
    descriptionEn:
      "Composition and written expression — composing a structured piece of Arabic writing on a given topic.",
    descriptionAr:
      "التعبير الكتابي — إنشاء نص عربي منظم حول موضوع محدد.",
    creditHours: 2,
    categoryId: "cat-arabic",
    programCode: "DIPLOMA-ISLAMIC-STUDIES",
    semesterLevel: 2,
    prerequisiteCodes: ["AR-401"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-ie-101",
    courseCode: "IE-101",
    titleEn: "Islamic Character & Adab",
    titleAr: "الأخلاق والآداب الإسلامية",
    slug: "ie-101-islamic-character-adab",
    descriptionEn:
      "The Foundation-tier adab/character anchor — demonstrating Islamic adab consistently in conduct.",
    descriptionAr:
      "الركيزة التأسيسية للأخلاق والآداب — إظهار الأدب الإسلامي بثبات في السلوك.",
    creditHours: 2,
    categoryId: "cat-education",
    programCode: "FOUNDATION-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: [],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-ie-201",
    courseCode: "IE-201",
    titleEn: "Communication & Leadership",
    titleAr: "التواصل والقيادة",
    slug: "ie-201-communication-leadership",
    descriptionEn:
      "Early responsibility and expressing what has been learned clearly, in writing and speech.",
    descriptionAr:
      "التعبير الواضح عمّا تعلمه الطالب، كتابةً ونطقاً، وتحمل المسؤولية المبكرة.",
    creditHours: 2,
    categoryId: "cat-education",
    programCode: "INTERMEDIATE-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: [],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-ie-202",
    courseCode: "IE-202",
    titleEn: "Tazkiyah I",
    titleAr: "التزكية (١)",
    slug: "ie-202-tazkiyah-i",
    descriptionEn:
      "Builds on Foundation's adab rather than re-teaching it — applying Tazkiyah principles to personal conduct.",
    descriptionAr:
      "يبني على أدب التأسيس ولا يعيد تدريسه — تطبيق مبادئ التزكية على السلوك الشخصي.",
    creditHours: 2,
    categoryId: "cat-tazkiyah",
    programCode: "INTERMEDIATE-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: ["IE-101"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-ie-401",
    courseCode: "IE-401",
    titleEn: "Islamic Education & Teaching Methodology",
    titleAr: "التربية الإسلامية ومنهجية التدريس",
    slug: "ie-401-islamic-education-teaching-methodology",
    descriptionEn:
      "Teacher-preparation for the Diploma's teaching-track learners — designing and delivering a basic lesson.",
    descriptionAr:
      "إعداد المعلمين لمسار التدريس بالدبلوم — تصميم درس أساسي وتقديمه.",
    creditHours: 2,
    categoryId: "cat-education",
    programCode: "DIPLOMA-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: ["IE-101"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-ie-402",
    courseCode: "IE-402",
    titleEn: "Da'wah & Outreach",
    titleAr: "الدعوة والتواصل الدعوي",
    slug: "ie-402-da-wah-outreach",
    descriptionEn:
      "Outreach methodology — applying basic da'wah/outreach methodology to a sample scenario. Placement provisional.",
    descriptionAr:
      "منهجية الدعوة والتواصل — تطبيق أساسيات منهجية الدعوة على سيناريو نموذجي. (موضعه في المسار ما زال مبدئياً)",
    creditHours: 2,
    categoryId: "cat-education",
    programCode: "DIPLOMA-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: ["IE-201"],
    isPublished: true,
    approvalStatus: "UNDER_REVIEW",
    thumbnailUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-ie-403",
    courseCode: "IE-403",
    titleEn: "Islamic Curriculum Design",
    titleAr: "تصميم المناهج الإسلامية",
    slug: "ie-403-islamic-curriculum-design",
    descriptionEn:
      "How to design and sequence Islamic teaching material — a companion to IE-401 for the same track.",
    descriptionAr:
      "كيفية تصميم وترتيب المادة التعليمية الإسلامية، مكمّلاً لمقرر منهجية التدريس.",
    creditHours: 2,
    categoryId: "cat-education",
    programCode: "DIPLOMA-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: ["IE-101"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-ie-404",
    courseCode: "IE-404",
    titleEn: "Youth Education",
    titleAr: "تربية الناشئة",
    slug: "ie-404-youth-education",
    descriptionEn:
      "Age-specific pedagogy for younger learners, distinct from IE-401's general teaching methodology.",
    descriptionAr:
      "أساليب تربوية خاصة بصغار السن، تختلف عن منهجية التدريس العامة.",
    creditHours: 2,
    categoryId: "cat-education",
    programCode: "DIPLOMA-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: ["IE-101"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-ie-405",
    courseCode: "IE-405",
    titleEn: "Family Education",
    titleAr: "التربية الأسرية",
    slug: "ie-405-family-education",
    descriptionEn:
      "How to raise and teach children Islamically — advising on age-appropriate Islamic upbringing practices.",
    descriptionAr:
      "كيفية تربية الأبناء وتعليمهم إسلامياً — إرشادات تربوية مناسبة لكل عمر.",
    creditHours: 2,
    categoryId: "cat-education",
    programCode: "DIPLOMA-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: ["IE-101"],
    isPublished: true,
    approvalStatus: "UNDER_REVIEW",
    thumbnailUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-ic-201",
    courseCode: "IC-201",
    titleEn: "Islamic History & Civilization I",
    titleAr: "التاريخ والحضارة الإسلامية (١)",
    slug: "ic-201-islamic-history-civilization-i",
    descriptionEn:
      "The learner's first structured exposure to the department's subject matter — the essential arc of Islamic history.",
    descriptionAr:
      "أول تعرّف منظم على مادة القسم — المسار الجوهري للتاريخ والحضارة الإسلامية.",
    creditHours: 2,
    categoryId: "cat-civilization",
    programCode: "INTERMEDIATE-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: [],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-ic-301",
    courseCode: "IC-301",
    titleEn: "Islamic Social Thought",
    titleAr: "الفكر الاجتماعي الإسلامي",
    slug: "ic-301-islamic-social-thought",
    descriptionEn:
      "Civilizational and social application of Islamic thought — how it has shaped social and civilizational life.",
    descriptionAr:
      "التطبيق الاجتماعي والحضاري للفكر الإسلامي — أثره في الحياة الاجتماعية والحضارية.",
    creditHours: 2,
    categoryId: "cat-civilization",
    programCode: "ADVANCED-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: ["IC-201"],
    isPublished: true,
    approvalStatus: "UNDER_REVIEW",
    thumbnailUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-ic-401",
    courseCode: "IC-401",
    titleEn: "Contemporary Muslim Issues",
    titleAr: "قضايا المسلمين المعاصرة",
    slug: "ic-401-contemporary-muslim-issues",
    descriptionEn:
      "Sociological and communal challenges facing Muslim societies — analyzing a contemporary community challenge.",
    descriptionAr:
      "التحديات الاجتماعية والمجتمعية التي تواجه المسلمين — تحليل تحدٍّ معاصر لمجتمع مسلم.",
    creditHours: 2,
    categoryId: "cat-civilization",
    programCode: "DIPLOMA-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: ["IC-301"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-ic-402",
    courseCode: "IC-402",
    titleEn: "Family & Society",
    titleAr: "الأسرة والمجتمع",
    slug: "ic-402-family-society",
    descriptionEn:
      "The family as a social institution within Muslim civilization — a sociological/historical lens.",
    descriptionAr:
      "الأسرة كمؤسسة اجتماعية ضمن الحضارة الإسلامية — منظور اجتماعي وتاريخي.",
    creditHours: 2,
    categoryId: "cat-civilization",
    programCode: "DIPLOMA-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: ["IC-301"],
    isPublished: true,
    approvalStatus: "UNDER_REVIEW",
    thumbnailUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-rl-101",
    courseCode: "RL-101",
    titleEn: "Basic Study Skills",
    titleAr: "مهارات الدراسة الأساسية",
    slug: "rl-101-basic-study-skills",
    descriptionEn:
      "How to learn, take notes, and prepare for assessment.",
    descriptionAr:
      "كيفية التعلم وتدوين الملاحظات والاستعداد للتقييم.",
    creditHours: 1,
    categoryId: "cat-research",
    programCode: "FOUNDATION-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: [],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-rl-201",
    courseCode: "RL-201",
    titleEn: "Introductory Analytical Skills",
    titleAr: "مهارات التحليل التمهيدية",
    slug: "rl-201-introductory-analytical-skills",
    descriptionEn:
      "The first step toward reasoning within an Islamic epistemological framework, still guided rather than independent.",
    descriptionAr:
      "الخطوة الأولى نحو التفكير ضمن إطار معرفي إسلامي، بتوجيه لا باستقلالية بعد.",
    creditHours: 1,
    categoryId: "cat-research",
    programCode: "INTERMEDIATE-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: ["RL-101"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-rl-301",
    courseCode: "RL-301",
    titleEn: "Research Preparation",
    titleAr: "الإعداد للبحث العلمي",
    slug: "rl-301-research-preparation",
    descriptionEn:
      "Foundational research and source-verification skills, readying a learner for the Diploma's capstone.",
    descriptionAr:
      "مهارات البحث الأساسية والتحقق من المصادر، إعداداً لمشروع التخرج.",
    creditHours: 2,
    categoryId: "cat-research",
    programCode: "ADVANCED-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: ["RL-201"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-rl-401",
    courseCode: "RL-401",
    titleEn: "Capstone Research Project",
    titleAr: "مشروع البحث التكميلي (الكابستون)",
    slug: "rl-401-capstone-research-project",
    descriptionEn:
      "The Diploma's mastery-tier research component — producing and defending an independent research project.",
    descriptionAr:
      "عنصر البحث في مستوى الإتقان بالدبلوم — إعداد بحث مستقل والدفاع عنه.",
    creditHours: 3,
    categoryId: "cat-research",
    programCode: "DIPLOMA-ISLAMIC-STUDIES",
    semesterLevel: 1,
    prerequisiteCodes: ["RL-301"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=900&q=85",
  },

  // Specialized Certificate Programs' initial course list (Academy
  // Pathways §7, approved 2026-09) -- SC-101..SC-111, one course per
  // candidate certificate area named in §7's table. Each keeps its
  // natural department's categoryId (matching how Diploma courses
  // each keep their own department too), so reporting and admin
  // course-catalogue tools group them correctly even though the
  // programme itself is administratively hosted under Islamic
  // Studies. The Department can add more via the normal course-
  // management tools; nothing here is a closed list.
  {
    id: "course-sc-101",
    courseCode: "SC-101",
    titleEn: "Tajweed",
    titleAr: "التجويد",
    slug: "sc-101-tajweed",
    descriptionEn:
      "Rules and practice of correct Qur'anic recitation -- articulation points and the characteristics of letters, and the recitation rules a reciter is expected to apply correctly and consistently.",
    descriptionAr:
      "أحكام وممارسة التلاوة القرآنية الصحيحة — مخارج الحروف وصفاتها، وأحكام التلاوة التي يُتوقع من القارئ تطبيقها بدقة واستمرار.",
    creditHours: 3,
    categoryId: "cat-quran",
    programCode: "SPECIALIZED-CERTIFICATE-PROGRAMS",
    semesterLevel: 1,
    prerequisiteCodes: [],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-sc-102",
    courseCode: "SC-102",
    titleEn: "Qur'an Recitation",
    titleAr: "تلاوة القرآن الكريم",
    slug: "sc-102-quran-recitation",
    descriptionEn:
      "Guided, supervised recitation practice building fluency, correct pacing and confident recitation, building on the rules covered in Tajweed.",
    descriptionAr:
      "تدريب تلاوة موجّه ومُشرَف عليه لبناء الطلاقة وضبط السرعة والثقة في التلاوة، بناءً على أحكام التجويد.",
    creditHours: 3,
    categoryId: "cat-quran",
    programCode: "SPECIALIZED-CERTIFICATE-PROGRAMS",
    semesterLevel: 1,
    prerequisiteCodes: ["SC-101"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-sc-103",
    courseCode: "SC-103",
    titleEn: "Hifz (Qur'an Memorization)",
    titleAr: "حفظ القرآن الكريم",
    slug: "sc-103-hifz",
    descriptionEn:
      "Structured Qur'an memorization with a defined review (muraja'ah) cycle under a qualified supervisor, at a pace suited to the learner.",
    descriptionAr:
      "حفظ منظم للقرآن الكريم مع دورة مراجعة محددة تحت إشراف مؤهل، بوتيرة تناسب الدارس.",
    creditHours: 3,
    categoryId: "cat-quran",
    programCode: "SPECIALIZED-CERTIFICATE-PROGRAMS",
    semesterLevel: 1,
    prerequisiteCodes: ["SC-101"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-sc-104",
    courseCode: "SC-104",
    titleEn: "Tafsir",
    titleAr: "التفسير",
    slug: "sc-104-tafsir",
    descriptionEn:
      "Qur'anic exegesis -- how the Academy's confirmed scholarly tradition explains the meaning, context and application of Qur'anic verses.",
    descriptionAr:
      "تفسير القرآن الكريم — كيفية بيان معاني الآيات وسياقها وتطبيقها وفق المنهج العلمي المعتمد للأكاديمية.",
    creditHours: 3,
    categoryId: "cat-quran",
    programCode: "SPECIALIZED-CERTIFICATE-PROGRAMS",
    semesterLevel: 1,
    prerequisiteCodes: [],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-sc-105",
    courseCode: "SC-105",
    titleEn: "Hadith",
    titleAr: "الحديث",
    slug: "sc-105-hadith",
    descriptionEn:
      "The science and study of Hadith -- authentication terminology, major collections, and how prophetic narrations are read and applied.",
    descriptionAr:
      "علم الحديث ودراسته — مصطلح التصحيح والتضعيف، وأهم كتب الحديث، وكيفية فهم وتطبيق الأحاديث النبوية.",
    creditHours: 3,
    categoryId: "cat-hadith",
    programCode: "SPECIALIZED-CERTIFICATE-PROGRAMS",
    semesterLevel: 1,
    prerequisiteCodes: [],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-sc-106",
    courseCode: "SC-106",
    titleEn: "Fiqh",
    titleAr: "الفقه",
    slug: "sc-106-fiqh",
    descriptionEn:
      "Islamic jurisprudence at a specialized level -- the rulings, evidences and reasoning behind them across the areas of practice most relevant to a specialist track.",
    descriptionAr:
      "الفقه الإسلامي على مستوى تخصصي — الأحكام وأدلتها والاستدلال عليها في أبرز أبواب الفقه العملي.",
    creditHours: 3,
    categoryId: "cat-fiqh",
    programCode: "SPECIALIZED-CERTIFICATE-PROGRAMS",
    semesterLevel: 1,
    prerequisiteCodes: [],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-sc-107",
    courseCode: "SC-107",
    titleEn: "Arabic",
    titleAr: "اللغة العربية",
    slug: "sc-107-arabic",
    descriptionEn:
      "Arabic language proficiency -- grammar, morphology and comprehension at the level this certificate track requires.",
    descriptionAr:
      "إتقان اللغة العربية — النحو والصرف والفهم بالمستوى الذي يتطلبه هذا المسار التخصصي.",
    creditHours: 3,
    categoryId: "cat-arabic",
    programCode: "SPECIALIZED-CERTIFICATE-PROGRAMS",
    semesterLevel: 1,
    prerequisiteCodes: [],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-sc-108",
    courseCode: "SC-108",
    titleEn: "Qur'anic Arabic",
    titleAr: "العربية القرآنية",
    slug: "sc-108-quranic-arabic",
    descriptionEn:
      "Arabic focused specifically on direct engagement with the Qur'anic text -- vocabulary, syntax and expression as they appear in the Mushaf.",
    descriptionAr:
      "لغة عربية موجّهة للتعامل المباشر مع النص القرآني — المفردات والتراكيب والأسلوب كما وردت في المصحف.",
    creditHours: 3,
    categoryId: "cat-arabic",
    programCode: "SPECIALIZED-CERTIFICATE-PROGRAMS",
    semesterLevel: 1,
    prerequisiteCodes: ["SC-107"],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-sc-109",
    courseCode: "SC-109",
    titleEn: "Islamic Education",
    titleAr: "التربية الإسلامية",
    slug: "sc-109-islamic-education",
    descriptionEn:
      "Islamic pedagogy and teaching methodology -- how sound Islamic knowledge is prepared, structured and delivered to learners.",
    descriptionAr:
      "التربية الإسلامية وطرق التدريس — كيفية إعداد المادة العلمية الإسلامية وتنظيمها وإيصالها للدارسين.",
    creditHours: 3,
    categoryId: "cat-education",
    programCode: "SPECIALIZED-CERTIFICATE-PROGRAMS",
    semesterLevel: 1,
    prerequisiteCodes: [],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-sc-110",
    courseCode: "SC-110",
    titleEn: "Da'wah",
    titleAr: "الدعوة",
    slug: "sc-110-dawah",
    descriptionEn:
      "Da'wah methodology -- the principles, manners and practical approach of inviting others to Islam with wisdom and good conduct.",
    descriptionAr:
      "منهجية الدعوة — أصولها وآدابها والأسلوب العملي لدعوة الناس إلى الإسلام بالحكمة والخلق الحسن.",
    creditHours: 3,
    categoryId: "cat-civilization",
    programCode: "SPECIALIZED-CERTIFICATE-PROGRAMS",
    semesterLevel: 1,
    prerequisiteCodes: [],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "course-sc-111",
    courseCode: "SC-111",
    titleEn: "Islamic History & Civilization",
    titleAr: "التاريخ والحضارة الإسلامية",
    slug: "sc-111-islamic-history-civilization",
    descriptionEn:
      "The history of Islamic civilization -- its major eras, scholarly tradition and contribution, situating other studies in their historical context.",
    descriptionAr:
      "تاريخ الحضارة الإسلامية — أبرز عصورها وتراثها العلمي وإسهاماتها، ووضع بقية الدراسات في سياقها التاريخي.",
    creditHours: 3,
    categoryId: "cat-civilization",
    programCode: "SPECIALIZED-CERTIFICATE-PROGRAMS",
    semesterLevel: 1,
    prerequisiteCodes: [],
    isPublished: true,
    approvalStatus: "APPROVED",
    thumbnailUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85",
  },
];

async function seedAcademyPrograms() {
  console.log("Seeding Academy programs...");

  for (const program of academyPrograms) {
    const department = await prisma.department.findUnique({
      where: { code: program.departmentCode },
    });

    if (!department) {
      console.warn(
        `  ⚠ Department "${program.departmentCode}" not found — run seedAcademyStructure first, skipping ${program.nameEn}`
      );
      continue;
    }

    const { departmentCode, ...programData } = program;

    const saved = await prisma.program.upsert({
      where: { code: program.code },
      update: {
        nameEn: programData.nameEn,
        nameAr: programData.nameAr,
        level: programData.level,
        descriptionEn: programData.descriptionEn,
        descriptionAr: programData.descriptionAr,
        departmentId: department.id,
        facultyId: department.facultyId,
      },
      create: {
        ...programData,
        departmentId: department.id,
        facultyId: department.facultyId,
      },
    });

    console.log(`  ✓ ${saved.nameEn}`);
  }
}

async function seedAcademyCourses() {
  console.log("Seeding Academy courses...");

  const programByCode = {};
  for (const program of academyPrograms) {
    const saved = await prisma.program.findUnique({ where: { code: program.code } });
    if (!saved) {
      console.warn(`  ⚠ Program "${program.code}" not found — run seedAcademyPrograms first, skipping its courses`);
      continue;
    }
    programByCode[program.code] = saved;
  }

  // Pass 1: create/update every course (no prerequisites yet -- a course
  // can't reference another that doesn't exist in the DB yet, and
  // course order above isn't guaranteed to be prerequisite-first).
  for (const course of academyCourses) {
    const program = programByCode[course.programCode];
    if (!program) {
      console.warn(`  ⚠ Skipping ${course.courseCode} — program "${course.programCode}" unavailable`);
      continue;
    }

    await prisma.course.upsert({
      where: { courseCode: course.courseCode },
      update: {
        titleEn: course.titleEn,
        titleAr: course.titleAr,
        descriptionEn: course.descriptionEn,
        descriptionAr: course.descriptionAr,
        creditHours: course.creditHours,
        categoryId: course.categoryId,
        programId: program.id,
        semesterLevel: course.semesterLevel,
        isPublished: course.isPublished,
        approvalStatus: course.approvalStatus,
        thumbnailUrl: course.thumbnailUrl,
      },
      create: {
        id: course.id,
        courseCode: course.courseCode,
        titleEn: course.titleEn,
        titleAr: course.titleAr,
        slug: course.slug,
        descriptionEn: course.descriptionEn,
        descriptionAr: course.descriptionAr,
        creditHours: course.creditHours,
        categoryId: course.categoryId,
        programId: program.id,
        semesterLevel: course.semesterLevel,
        isPublished: course.isPublished,
        approvalStatus: course.approvalStatus,
        thumbnailUrl: course.thumbnailUrl,
        isPaid: false,
      },
    });

    console.log(`  ✓ ${course.courseCode} — ${course.titleEn}`);
  }

  // Pass 2: real prerequisite relationships, from the Course Catalogue's
  // own Prerequisite Map (section 5) -- Course.prerequisites was defined
  // in the schema from Model 9 onward but left empty for every course
  // until now (Model 12). connect-by-courseCode needs both courses to
  // already exist, hence the separate pass.
  console.log("Linking course prerequisites...");
  for (const course of academyCourses) {
    if (course.prerequisiteCodes.length === 0) continue;

    await prisma.course.update({
      where: { courseCode: course.courseCode },
      data: {
        prerequisites: {
          set: course.prerequisiteCodes.map((code) => ({ courseCode: code })),
        },
      },
    });

    console.log(`  ✓ ${course.courseCode} requires ${course.prerequisiteCodes.join(", ")}`);
  }
}

async function seedPositions() {
  console.log("Seeding staff positions...");

  const positionByName = {};

  for (const position of positions) {
    const saved = await prisma.position.upsert({
      where: {
        nameEn: position.nameEn,
      },
      update: {
        // Intentionally NOT updating `code` here — if this position
        // already existed (e.g. Dean, Head of Department, Instructor,
        // Programme Coordinator), its real code stays untouched so
        // nothing already referencing it elsewhere breaks.
        nameAr: position.nameAr,
        isAcademic: position.isAcademic,
      },
      create: position,
    });

    positionByName[position.nameEn] = saved;

    console.log(`  ✓ ${position.nameEn}${saved.code !== position.code ? ` (existing code kept: ${saved.code})` : ""}`);
  }

  return positionByName;
}

async function seedPositionPermissions(positionByName) {
  console.log("Seeding position permissions...");

  for (const [nameEn, perms] of Object.entries(positionPermissions)) {
    const position = positionByName[nameEn];

    if (!position) {
      console.warn(`  ⚠ Position "${nameEn}" not found, skipping`);
      continue;
    }

    for (const perm of perms) {
      await prisma.positionPermission.upsert({
        where: {
          positionId_module: {
            positionId: position.id,
            module: perm.module,
          },
        },
        update: {
          canView: perm.canView,
          canEdit: perm.canEdit,
        },
        create: {
          positionId: position.id,
          module: perm.module,
          canView: perm.canView,
          canEdit: perm.canEdit,
        },
      });
    }

    console.log(`  ✓ ${position.nameEn} (${perms.length} module${perms.length === 1 ? "" : "s"})`);
  }
}

const homepageHeroDefault = {
  id: "default-homepage-hero",
  badge: "A DIGITAL HOME FOR ISLAMIC KNOWLEDGE",
  title: "Excellence in Islamic Studies & Qur'anic Sciences",
  subtitle:
    "A structured environment for students seeking authentic, beneficial and disciplined Islamic knowledge through qualified instruction, classical texts, modern learning resources and academic programmes.",
  primaryLabel: "Apply Now →",
  primaryHref: "/admission",
  // 2026-09: was "Explore Academics →" / "/programs" -- duplicated the
  // ACADEMICS section's own "Explore Academic Departments →" link
  // further down the same homepage (same destination, near-identical
  // label). Now points at the narrative Academy Pathways page instead;
  // must match app/page.jsx's client default and
  // app/api/homepage-content/route.js's DEFAULT_HERO exactly, or the
  // homepage flashes one label and then replaces it with the other on
  // every load. This upsert is keyed on a fixed id, so re-running this
  // seed script is what actually applies this change to the live
  // "default-homepage-hero" row -- editing this file alone does not
  // change anything already saved in the database.
  secondaryLabel: "How the Academy Works →",
  secondaryHref: "/academy-pathways",
  features: [
    "Structured curriculum",
    "Online learning",
    "Academic resources",
    "Global access",
  ],
};

const socialLinksDefault = [
  { id: "social-facebook", name: "Facebook", icon: "f", url: "https://www.facebook.com/", order: 0 },
  { id: "social-youtube", name: "YouTube", icon: "▶", url: "https://www.youtube.com/", order: 1 },
  { id: "social-x", name: "X", icon: "𝕏", url: "https://x.com/", order: 2 },
  { id: "social-telegram", name: "Telegram", icon: "✈", url: "https://t.me/", order: 3 },
];

// The homepage footer has three kinds of link columns: these two
// CMS-managed groups (editable at /admin/homepage/footer-links without a
// code change), plus a "Resources" column that stays hardcoded in
// app/page.jsx because one of its entries opens a client-side modal
// rather than linking anywhere.
const footerLinkGroupsDefault = [
  {
    id: "footer-group-academics",
    title: "Academy",
    order: 0,
    links: [
      { id: "footer-link-academic-programmes", label: "Academic Programmes", href: "/programs", order: 0 },
      { id: "footer-link-academic-departments", label: "Academic Departments", href: "/departments", order: 1 },
      { id: "footer-link-faculty", label: "Faculty", href: "/faculty", order: 2 },
      { id: "footer-link-academic-calendar", label: "Academic Calendar", href: "/academic-calendar", order: 3 },
      { id: "footer-link-academy-foundation", label: "Academy Foundation", href: "/academy-foundation", order: 4 },
      { id: "footer-link-academy-pathways", label: "Academy Pathways", href: "/academy-pathways", order: 5 },
      { id: "footer-link-admission-registration", label: "Admission & Registration", href: "/admission", order: 6 },
      { id: "footer-link-student-portal-login", label: "Student Portal Login", href: "/login", order: 7 },
    ],
  },
  // "Academic Governance" (12 raw internal governance/curriculum/
  // spec/build-tracking documents) deliberately removed -- those
  // documents were written to brief the real build, not to stay
  // published as a public footer sitemap, and the systems they
  // describe already exist in their own dashboards. Academy
  // Foundation and Academy Pathways (genuinely public) moved into
  // the Academy group above.
  {
    id: "footer-group-institute",
    title: "Institute",
    order: 2,
    links: [
      { id: "footer-link-about", label: "About Ulul Azm", href: "/about", order: 0 },
      { id: "footer-link-alumni", label: "Alumni", href: "/alumni", order: 1 },
      { id: "footer-link-verify", label: "Verify a Document", href: "/verify", order: 2 },
      { id: "footer-link-contact", label: "Contact", href: "/contact", order: 3 },
      { id: "footer-link-privacy", label: "Privacy Policy", href: "/privacy", order: 4 },
      { id: "footer-link-terms", label: "Terms of Use", href: "/terms", order: 5 },
      { id: "footer-link-refund", label: "Refund Policy", href: "/refund", order: 6 },
      { id: "footer-link-admin-portal", label: "Staff & Admin Portal", href: "/admin", order: 7 },
    ],
  },
];

async function seedHomepageContent() {
  console.log("Seeding homepage hero, social links and footer link groups...");

  await prisma.homepageHero.upsert({
    where: { id: homepageHeroDefault.id },
    update: {
      badge: homepageHeroDefault.badge,
      title: homepageHeroDefault.title,
      subtitle: homepageHeroDefault.subtitle,
      primaryLabel: homepageHeroDefault.primaryLabel,
      primaryHref: homepageHeroDefault.primaryHref,
      secondaryLabel: homepageHeroDefault.secondaryLabel,
      secondaryHref: homepageHeroDefault.secondaryHref,
      features: homepageHeroDefault.features,
    },
    create: homepageHeroDefault,
  });
  console.log("  ✓ Homepage hero");

  for (const link of socialLinksDefault) {
    await prisma.socialLink.upsert({
      where: { id: link.id },
      update: { name: link.name, icon: link.icon, url: link.url, order: link.order, isActive: true },
      create: { ...link, isActive: true },
    });
    console.log(`  ✓ Social link: ${link.name}`);
  }

  for (const group of footerLinkGroupsDefault) {
    await prisma.footerLinkGroup.upsert({
      where: { id: group.id },
      update: { title: group.title, order: group.order, isActive: true },
      create: { id: group.id, title: group.title, order: group.order, isActive: true },
    });

    for (const link of group.links) {
      await prisma.footerLink.upsert({
        where: { id: link.id },
        update: { label: link.label, href: link.href, order: link.order, groupId: group.id, isActive: true },
        create: { id: link.id, label: link.label, href: link.href, order: link.order, groupId: group.id, isActive: true },
      });
    }
    console.log(`  ✓ Footer link group: ${group.title} (${group.links.length} links)`);
  }
}

const academyHubHeroDefault = {
  id: "default-academy-hub-hero",
  badge: "Ulul Azm",
  title: "The Academy",
  subtitle:
    "Everything that defines how Ulul Azm Academy teaches, assesses and progresses its students — from the programmes you can enrol in today to the institutional documents that govern them.",
};

const academyHubCardsDefault = [
  { id: "academy-hub-card-foundation", icon: "🕌", title: "Academy Foundation", description: "The Academy's institutional identity, educational philosophy, the learners it serves, and the principles that govern every curriculum, program and course decision.", href: "/academy-foundation", order: 0 },
  { id: "academy-hub-card-pathways", icon: "🎓", title: "Academy Pathways", description: "The academic pathways and qualification framework — Foundation, Intermediate, Advanced, Diploma and Specialized Certificates.", href: "/academy-pathways", order: 1 },
];
// The other 10 governance/curriculum/assessment/etc. cards were removed
// here (2026-09) -- those documents are real internal content, still
// fully editable at /admin/academy-*, but are no longer public Academy
// Hub cards. See _to_delete/fix_footer_governance_links.js for the
// one-off script that applies the same change to an already-seeded
// live database.

async function seedAcademyHub() {
  console.log("Seeding the Academy hub page (hero + document cards)...");

  await prisma.academyHubHero.upsert({
    where: { id: academyHubHeroDefault.id },
    update: {
      badge: academyHubHeroDefault.badge,
      title: academyHubHeroDefault.title,
      subtitle: academyHubHeroDefault.subtitle,
    },
    create: academyHubHeroDefault,
  });
  console.log("  ✓ Academy hub hero");

  for (const card of academyHubCardsDefault) {
    await prisma.academyHubCard.upsert({
      where: { id: card.id },
      update: {
        icon: card.icon,
        title: card.title,
        description: card.description,
        href: card.href,
        order: card.order,
        isActive: true,
      },
      create: { ...card, isActive: true },
    });
  }
  console.log(`  ✓ Academy hub cards (${academyHubCardsDefault.length})`);
}

const assistantSettingsDefault = {
  id: "default-assistant-settings",
  isEnabled: true,
  welcomeMessageEn:
    "Assalamu alaikum! I'm the Ulul Azm assistant. How may I help you today?",
  welcomeMessageAr: "السلام عليكم! أنا مساعد أولو العزم. كيف يمكنني مساعدتك اليوم؟",
  supportedLanguages: ["en", "ar"],
};

async function seedAssistantSettings() {
  console.log("Seeding AI Assistant settings...");

  await prisma.assistantSettings.upsert({
    where: { id: assistantSettingsDefault.id },
    update: {
      isEnabled: assistantSettingsDefault.isEnabled,
      welcomeMessageEn: assistantSettingsDefault.welcomeMessageEn,
      welcomeMessageAr: assistantSettingsDefault.welcomeMessageAr,
      supportedLanguages: assistantSettingsDefault.supportedLanguages,
    },
    create: assistantSettingsDefault,
  });
  console.log("  ✓ Assistant settings");
}

// =====================================================================
// DEMO STAFF ACCOUNTS -- one login-capable demo User + StaffProfile per
// seeded staff Position, so every staff dashboard (Librarian, QA
// Officer, Research & Scholarly Affairs Officer, Registrar, Finance
// Officer, Dean, HOD, Programme Coordinator, Instructor, Academic
// Advisor, Admissions Officer, Examinations Officer, Student Affairs
// Officer, ICT Officer, Administrative Staff, Academic Administrator,
// Academy Director, Rector, Vice Rector, Lecturer, Senior Instructor,
// Super Admin) can actually be logged into and exercised, not just
// exist as a Position + PositionPermission row with nobody assigned to
// it. Before this function, seedPositions()/seedPositionPermissions()
// created the roles themselves but never a single real account for any
// of them -- confirmed by grepping this whole file for
// prisma.user.create/prisma.user.upsert, which turned up nothing.
//
// Every account here is unmistakably a demo account:
//   - name is prefixed "Demo "
//   - email lives under the reserved, non-resolvable demo domain
//     @ululazm.test (IANA-reserved .test TLD -- can never collide
//     with the Institute's real ululazm.org mail, and can never
//     accidentally be treated as a live address by anything)
//   - this comment block says so
//
// role stays "USER" for every ordinary staff position -- confirmed by
// reading lib/permissions.ts's requireModulePermission()/
// getStaffDestination(): all real operational authority for a staff
// member comes from the StaffProfile -> Position -> PositionPermission
// chain, not from the User.role enum, which only distinguishes
// USER/AUTHOR/ADMIN/SUPER_ADMIN/STUDENT/INSTRUCTOR at the account
// level. Only the Super Admin demo account gets role: "SUPER_ADMIN",
// since that's the one role permissions.ts explicitly bypasses module
// checks for. No pre-existing SUPER_ADMIN bootstrap account was found
// anywhere else in this codebase -- prisma/seed_homepage_demo_content.js
// (and its _to_delete/ copy) both *look up* an existing ADMIN/SUPER_ADMIN
// user and error out if none exists, they don't create one -- so a demo
// Super Admin is included here rather than skipped.
//
// Every account shares one simple, clearly-fake password so the user
// can log into any of them while testing without juggling per-account
// secrets. All idempotent: re-running this seed re-upserts the same
// rows by email / userId rather than failing on a duplicate.
const DEMO_STAFF_PASSWORD = "DemoPass123!";
const DEMO_EMAIL_DOMAIN = "ululazm.test";

// One entry per seeded Position (matched by `positions` array's own
// `nameEn`, the same key seedPositions()/seedPositionPermissions() use).
// `slug` drives both the demo email's local part and the deterministic
// `employeeNo` (DEMO-<CODE>). `role` defaults to "USER" and is only
// overridden below for the Super Admin tier.
const demoStaffAccounts = [
  { nameEn: "Rector", slug: "rector" },
  { nameEn: "Vice Rector", slug: "vice-rector" },
  { nameEn: "Registrar", slug: "registrar" },
  { nameEn: "Academic Administrator", slug: "academic-administrator" },
  { nameEn: "Academy Director", slug: "academy-director" },
  { nameEn: "Dean", slug: "dean", facultyCode: "ACADEMY" },
  { nameEn: "Head of Department", slug: "hod", departmentCode: "DEPT-ISLAMIC-STUDIES" },
  { nameEn: "Programme Coordinator", slug: "coordinator", programCode: "FOUNDATION-STUDIES" },
  { nameEn: "Lecturer", slug: "lecturer" },
  { nameEn: "Instructor", slug: "instructor" },
  { nameEn: "Senior Instructor", slug: "senior-instructor" },
  { nameEn: "Academic Advisor", slug: "advisor" },
  { nameEn: "Admissions Officer", slug: "admissions" },
  { nameEn: "Examinations Officer", slug: "exams" },
  { nameEn: "Student Affairs Officer", slug: "student-affairs" },
  { nameEn: "Finance Officer", slug: "finance", unitId: "unit-finance" },
  { nameEn: "Librarian", slug: "librarian", unitId: "unit-library" },
  { nameEn: "Quality Assurance Officer", slug: "qa", unitId: "unit-qa" },
  { nameEn: "Research & Scholarly Affairs Officer", slug: "research" },
  { nameEn: "ICT Officer", slug: "ict", unitId: "unit-ict" },
  { nameEn: "Administrative Staff", slug: "admin-staff", unitId: "unit-other-admin" },
  { nameEn: "Super Admin", slug: "super-admin", role: "SUPER_ADMIN" },
];

async function seedDemoStaffAccounts(positionByName) {
  console.log("Seeding demo staff login accounts...");

  const passwordHash = await bcrypt.hash(DEMO_STAFF_PASSWORD, 12);
  const createdAccounts = [];

  for (const account of demoStaffAccounts) {
    const position = positionByName[account.nameEn];

    if (!position) {
      console.warn(
        `  ⚠ Position "${account.nameEn}" not found in positionByName — skipping its demo account`
      );
      continue;
    }

    const email = `demo.${account.slug}@${DEMO_EMAIL_DOMAIN}`;
    const userId = `demo-user-${account.slug}`;
    const name = `Demo ${account.nameEn}`;
    const role = account.role || "USER";

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        passwordHash,
        role,
      },
      create: {
        id: userId,
        name,
        email,
        passwordHash,
        role,
      },
    });

    const staffProfile = await prisma.staffProfile.upsert({
      where: { userId: user.id },
      update: {
        positionId: position.id,
        title: account.nameEn,
        isActive: true,
        status: "ACTIVE",
        unitId: account.unitId || null,
      },
      create: {
        userId: user.id,
        positionId: position.id,
        employeeNo: `DEMO-${position.code}`,
        title: account.nameEn,
        isActive: true,
        status: "ACTIVE",
        joinedAt: new Date(),
        unitId: account.unitId || null,
      },
    });

    // Link Dean/HOD/Programme Coordinator to a REAL, already-seeded
    // Faculty/Department/Program (created earlier in main() by
    // seedAcademyStructure()/seedAcademyPrograms(), which runs before
    // this function) so their dashboards have real data to show,
    // rather than leaving these null or inventing fake rows.
    if (account.facultyCode) {
      const faculty = await prisma.faculty.findUnique({ where: { code: account.facultyCode } });
      if (faculty) {
        await prisma.staffProfile.update({
          where: { id: staffProfile.id },
          data: { facultyId: faculty.id },
        });
        await prisma.faculty.update({
          where: { id: faculty.id },
          data: { deanId: staffProfile.id },
        });
      } else {
        console.warn(`  ⚠ Faculty "${account.facultyCode}" not found — demo Dean left unlinked`);
      }
    }

    if (account.departmentCode) {
      const department = await prisma.department.findUnique({ where: { code: account.departmentCode } });
      if (department) {
        await prisma.staffProfile.update({
          where: { id: staffProfile.id },
          data: { facultyId: department.facultyId, departmentId: department.id },
        });
        await prisma.department.update({
          where: { id: department.id },
          data: { headId: staffProfile.id },
        });
      } else {
        console.warn(`  ⚠ Department "${account.departmentCode}" not found — demo HOD left unlinked`);
      }
    }

    if (account.programCode) {
      const program = await prisma.program.findUnique({ where: { code: account.programCode } });
      if (program) {
        await prisma.staffProfile.update({
          where: { id: staffProfile.id },
          data: { facultyId: program.facultyId, departmentId: program.departmentId },
        });
        await prisma.program.update({
          where: { id: program.id },
          data: { coordinatorId: staffProfile.id },
        });
      } else {
        console.warn(`  ⚠ Program "${account.programCode}" not found — demo Coordinator left unlinked`);
      }
    }

    createdAccounts.push({ email, nameEn: account.nameEn });
    console.log(`  ✓ ${email} — ${account.nameEn}`);
  }

  console.log("");
  console.log("  ----------------------------------------");
  console.log(`  DEMO STAFF LOGINS (password: ${DEMO_STAFF_PASSWORD})`);
  console.log("  ----------------------------------------");

  const emailWidth = Math.max(...createdAccounts.map((a) => a.email.length)) + 3;
  for (const account of createdAccounts) {
    console.log(`  ${account.email.padEnd(emailWidth)} -> ${account.nameEn}`);
  }
  console.log("  ----------------------------------------");
}

async function main() {
  console.log("");
  console.log("========================================");
  console.log("       ULUL AZM DATABASE SEED");
  console.log("========================================");
  console.log("");

  await seedCategories();
  console.log("");

  await seedCountries();
  console.log("");

  await seedExchangeRates();
  console.log("");

  await seedBooks();
  console.log("");

  await seedUnits();
  console.log("");

  await seedAcademyStructure();
  console.log("");

  await seedAcademyPrograms();
  console.log("");

  await seedAcademyCourses();
  console.log("");

  const positionByName = await seedPositions();
  console.log("");

  await seedPositionPermissions(positionByName);
  console.log("");

  await seedDemoStaffAccounts(positionByName);
  console.log("");

  await seedHomepageContent();
  console.log("");

  await seedAcademyHub();
  console.log("");

  await seedAssistantSettings();
  console.log("");

  console.log("========================================");
  console.log("       SEED COMPLETED SUCCESSFULLY");
  console.log("========================================");
  console.log("");
}

async function runWithRetry(fn, maxAttempts = 4) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await fn();
      return;
    } catch (error) {
      const isConnectionIssue =
        error instanceof Error &&
        /connection terminated|econnreset|timeout|P1017/i.test(error.message);

      if (!isConnectionIssue || attempt === maxAttempts) {
        throw error;
      }

      const delayMs = attempt * 1500;
      console.warn(
        `  ⚠ Connection dropped (attempt ${attempt}/${maxAttempts}). Retrying in ${delayMs}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

runWithRetry(main)
  .catch((error) => {
    console.error("");
    console.error("========================================");
    console.error("           SEED FAILED");
    console.error("========================================");
    console.error("");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });