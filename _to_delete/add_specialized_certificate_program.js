// One-off data fix -- run ONCE against the real database:
//   node _to_delete/add_specialized_certificate_program.js
//
// Creates the real "Specialized Certificate Programs" Program (Academy
// Pathways §7, Tier 5) and its initial 11-course catalogue (SC-101..
// SC-111), so it becomes the 5th selectable, applyable option in the
// admission wizard's "Choose Your Programme" step and on the homepage's
// pathway cards -- matching what prisma/seed.js now seeds for any
// future fresh install (this script does the same thing against the
// database that already exists, since prisma/seed.js as a whole is not
// normally re-run against a live database).
//
// Safe to run more than once (upserts by fixed code/courseCode, exactly
// like seedAcademyPrograms()/seedAcademyCourses() in prisma/seed.js).
import 'dotenv/config';
import { prisma } from '../lib/prisma.js';

const PROGRAM = {
  code: 'SPECIALIZED-CERTIFICATE-PROGRAMS',
  nameEn: 'Specialized Certificate Programs',
  nameAr: 'برامج الشهادات التخصصية',
  level: 'CERTIFICATE',
  departmentCode: 'DEPT-ISLAMIC-STUDIES',
  descriptionEn:
    "Focused, single-area certificates for a learner who has completed Advanced Islamic Studies or the Diploma and wants named competency in one discipline -- Tajweed, Qur'an Recitation, Hifz, Tafsir, Hadith, Fiqh, Arabic, Qur'anic Arabic, Islamic Education, Da'wah, or Islamic History & Civilization -- rather than the full multi-year pathway. The Department may add further certificate courses over time.",
  descriptionAr:
    'شهادات تخصصية مركزة في مجال واحد لمن أتم الدراسات الإسلامية المتقدمة أو الدبلوم ويرغب في كفاءة معلومة في تخصص واحد — التجويد، تلاوة القرآن، الحفظ، التفسير، الحديث، الفقه، اللغة العربية، العربية القرآنية، التربية الإسلامية، الدعوة، أو التاريخ والحضارة الإسلامية — بدل المسار الكامل متعدد السنوات.',
};

const COURSES = [
  { id: 'course-sc-101', courseCode: 'SC-101', titleEn: 'Tajweed', titleAr: 'التجويد', slug: 'sc-101-tajweed',
    descriptionEn: "Rules and practice of correct Qur'anic recitation -- articulation points and the characteristics of letters, and the recitation rules a reciter is expected to apply correctly and consistently.",
    descriptionAr: 'أحكام وممارسة التلاوة القرآنية الصحيحة — مخارج الحروف وصفاتها، وأحكام التلاوة التي يُتوقع من القارئ تطبيقها بدقة واستمرار.',
    categoryId: 'cat-quran', prerequisiteCodes: [], thumbnailUrl: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=85' },
  { id: 'course-sc-102', courseCode: 'SC-102', titleEn: "Qur'an Recitation", titleAr: 'تلاوة القرآن الكريم', slug: 'sc-102-quran-recitation',
    descriptionEn: 'Guided, supervised recitation practice building fluency, correct pacing and confident recitation, building on the rules covered in Tajweed.',
    descriptionAr: 'تدريب تلاوة موجّه ومُشرَف عليه لبناء الطلاقة وضبط السرعة والثقة في التلاوة، بناءً على أحكام التجويد.',
    categoryId: 'cat-quran', prerequisiteCodes: ['SC-101'], thumbnailUrl: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=85' },
  { id: 'course-sc-103', courseCode: 'SC-103', titleEn: "Hifz (Qur'an Memorization)", titleAr: 'حفظ القرآن الكريم', slug: 'sc-103-hifz',
    descriptionEn: "Structured Qur'an memorization with a defined review (muraja'ah) cycle under a qualified supervisor, at a pace suited to the learner.",
    descriptionAr: 'حفظ منظم للقرآن الكريم مع دورة مراجعة محددة تحت إشراف مؤهل، بوتيرة تناسب الدارس.',
    categoryId: 'cat-quran', prerequisiteCodes: ['SC-101'], thumbnailUrl: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=85' },
  { id: 'course-sc-104', courseCode: 'SC-104', titleEn: 'Tafsir', titleAr: 'التفسير', slug: 'sc-104-tafsir',
    descriptionEn: "Qur'anic exegesis -- how the Academy's confirmed scholarly tradition explains the meaning, context and application of Qur'anic verses.",
    descriptionAr: 'تفسير القرآن الكريم — كيفية بيان معاني الآيات وسياقها وتطبيقها وفق المنهج العلمي المعتمد للأكاديمية.',
    categoryId: 'cat-quran', prerequisiteCodes: [], thumbnailUrl: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=85' },
  { id: 'course-sc-105', courseCode: 'SC-105', titleEn: 'Hadith', titleAr: 'الحديث', slug: 'sc-105-hadith',
    descriptionEn: 'The science and study of Hadith -- authentication terminology, major collections, and how prophetic narrations are read and applied.',
    descriptionAr: 'علم الحديث ودراسته — مصطلح التصحيح والتضعيف، وأهم كتب الحديث، وكيفية فهم وتطبيق الأحاديث النبوية.',
    categoryId: 'cat-hadith', prerequisiteCodes: [], thumbnailUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85' },
  { id: 'course-sc-106', courseCode: 'SC-106', titleEn: 'Fiqh', titleAr: 'الفقه', slug: 'sc-106-fiqh',
    descriptionEn: 'Islamic jurisprudence at a specialized level -- the rulings, evidences and reasoning behind them across the areas of practice most relevant to a specialist track.',
    descriptionAr: 'الفقه الإسلامي على مستوى تخصصي — الأحكام وأدلتها والاستدلال عليها في أبرز أبواب الفقه العملي.',
    categoryId: 'cat-fiqh', prerequisiteCodes: [], thumbnailUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85' },
  { id: 'course-sc-107', courseCode: 'SC-107', titleEn: 'Arabic', titleAr: 'اللغة العربية', slug: 'sc-107-arabic',
    descriptionEn: 'Arabic language proficiency -- grammar, morphology and comprehension at the level this certificate track requires.',
    descriptionAr: 'إتقان اللغة العربية — النحو والصرف والفهم بالمستوى الذي يتطلبه هذا المسار التخصصي.',
    categoryId: 'cat-arabic', prerequisiteCodes: [], thumbnailUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=85' },
  { id: 'course-sc-108', courseCode: 'SC-108', titleEn: "Qur'anic Arabic", titleAr: 'العربية القرآنية', slug: 'sc-108-quranic-arabic',
    descriptionEn: "Arabic focused specifically on direct engagement with the Qur'anic text -- vocabulary, syntax and expression as they appear in the Mushaf.",
    descriptionAr: 'لغة عربية موجّهة للتعامل المباشر مع النص القرآني — المفردات والتراكيب والأسلوب كما وردت في المصحف.',
    categoryId: 'cat-arabic', prerequisiteCodes: ['SC-107'], thumbnailUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=85' },
  { id: 'course-sc-109', courseCode: 'SC-109', titleEn: 'Islamic Education', titleAr: 'التربية الإسلامية', slug: 'sc-109-islamic-education',
    descriptionEn: 'Islamic pedagogy and teaching methodology -- how sound Islamic knowledge is prepared, structured and delivered to learners.',
    descriptionAr: 'التربية الإسلامية وطرق التدريس — كيفية إعداد المادة العلمية الإسلامية وتنظيمها وإيصالها للدارسين.',
    categoryId: 'cat-education', prerequisiteCodes: [], thumbnailUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=900&q=85' },
  { id: 'course-sc-110', courseCode: 'SC-110', titleEn: "Da'wah", titleAr: 'الدعوة', slug: 'sc-110-dawah',
    descriptionEn: 'Da\'wah methodology -- the principles, manners and practical approach of inviting others to Islam with wisdom and good conduct.',
    descriptionAr: 'منهجية الدعوة — أصولها وآدابها والأسلوب العملي لدعوة الناس إلى الإسلام بالحكمة والخلق الحسن.',
    categoryId: 'cat-civilization', prerequisiteCodes: [], thumbnailUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85' },
  { id: 'course-sc-111', courseCode: 'SC-111', titleEn: 'Islamic History & Civilization', titleAr: 'التاريخ والحضارة الإسلامية', slug: 'sc-111-islamic-history-civilization',
    descriptionEn: 'The history of Islamic civilization -- its major eras, scholarly tradition and contribution, situating other studies in their historical context.',
    descriptionAr: 'تاريخ الحضارة الإسلامية — أبرز عصورها وتراثها العلمي وإسهاماتها، ووضع بقية الدراسات في سياقها التاريخي.',
    categoryId: 'cat-civilization', prerequisiteCodes: [], thumbnailUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85' },
];

async function main() {
  const department = await prisma.department.findUnique({ where: { code: PROGRAM.departmentCode } });
  if (!department) {
    console.log(`Department "${PROGRAM.departmentCode}" not found -- run the main seed's academy structure step first.`);
    return;
  }

  const { departmentCode, ...programData } = PROGRAM;

  const program = await prisma.program.upsert({
    where: { code: PROGRAM.code },
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
  console.log(`✓ Program: ${program.nameEn} (${program.code})`);

  for (const course of COURSES) {
    await prisma.course.upsert({
      where: { courseCode: course.courseCode },
      update: {
        titleEn: course.titleEn,
        titleAr: course.titleAr,
        descriptionEn: course.descriptionEn,
        descriptionAr: course.descriptionAr,
        creditHours: 3,
        categoryId: course.categoryId,
        programId: program.id,
        semesterLevel: 1,
        isPublished: true,
        approvalStatus: 'APPROVED',
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
        creditHours: 3,
        categoryId: course.categoryId,
        programId: program.id,
        semesterLevel: 1,
        isPublished: true,
        approvalStatus: 'APPROVED',
        thumbnailUrl: course.thumbnailUrl,
        isPaid: false,
      },
    });
    console.log(`  ✓ ${course.courseCode} — ${course.titleEn}`);
  }

  console.log('Linking course prerequisites...');
  for (const course of COURSES) {
    if (course.prerequisiteCodes.length === 0) continue;
    await prisma.course.update({
      where: { courseCode: course.courseCode },
      data: { prerequisites: { set: course.prerequisiteCodes.map((code) => ({ courseCode: code })) } },
    });
    console.log(`  ✓ ${course.courseCode} requires ${course.prerequisiteCodes.join(', ')}`);
  }

  console.log('Done -- Specialized Certificate Programs is now a real, applyable 5th programme.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
