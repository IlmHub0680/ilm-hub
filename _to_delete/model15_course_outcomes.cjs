// Model 15 (Academy Digital Structure & Academic Content Integration).
//
// Populates Course.outcomeEn / Course.assessmentType for the 42 real,
// already-seeded courses -- text transcribed verbatim from the approved
// academy-course-catalogue governance document (section 3, "Master
// Course Catalogue"), never invented here. Requires the schema
// migration in prisma/migrations/20260917190000_add_public_academy_fields
// to have been applied first (npx prisma migrate deploy).
//
// This cloud assistant's shell has no network route to the Prisma
// database, so -- same pattern as every other DB content fix this
// project has used -- run this from your own terminal:
//
//   node _to_delete/model15_course_outcomes.cjs
//
// Safe to run any number of times: sets the same two fields to the same
// values every time, and skips any course code not found (rather than
// erroring the whole run) so it stays safe even if a code was renamed.

require("dotenv/config");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

// [courseCode, outcomeEn, assessmentType] -- every one of the 42 courses
// in academy-course-catalogue §3, in the same order as that document.
const COURSE_OUTCOMES = [
  ["IS-101", "Recall essential Aqeedah and Fiqh accurately.", "Written examination"],
  ["IS-201", "Explain Aqeedah systematically, not just recall it.", "Written examination"],
  ["IS-202", "Apply basic Fiqh rulings to everyday situations.", "Written examination"],
  ["IS-203", "Recall and narrate the essential events of the Prophetic biography.", "Written examination"],
  ["IS-301", "Reason independently within the Academy's manhaj on Aqeedah questions.", "Written examination"],
  ["IS-302", "Analyze how a Fiqh ruling is derived from its sources.", "Written examination"],
  ["IS-303", "Explain Hadith classification and basic authentication criteria.", "Written examination"],
  ["IS-304", "Engage the broader intellectual tradition, not only rulings.", "Written examination plus a short research essay"],
  ["IS-305", "Reason about moral questions using Islamic ethical frameworks, not only rules.", "Written examination"],
  ["IS-401", "Compare and evaluate differing Fiqh positions on a given issue.", "Written examination"],
  ["IS-402", "Trace and evaluate a Hadith's chain of transmission.", "Research project (a takhrij exercise)"],
  ["IS-403", "Apply juristic reasoning to a genuinely contemporary question.", "Written examination plus a case-study essay"],

  ["QS-101", "Read Qur'anic Arabic correctly at a foundational level.", "Oral recitation assessment"],
  ["QS-102", "Apply foundational Tajweed rules while reading.", "Oral recitation assessment"],
  ["QS-201", "Recite with improved fluency and Tajwid accuracy.", "Oral recitation assessment"],
  ["QS-202", "Demonstrate basic comprehension of recited passages.", "Written and oral assessment"],
  ["QS-301", "Recite with mastery-level Tajwid accuracy.", "Oral recitation assessment"],
  ["QS-302", "Explain the meaning of assigned verses using established Tafsir.", "Written examination"],
  ["QS-401", "Independently research and present a Tafsir analysis.", "Research project"],
  ["QS-402", "Explain how a verse's revelation context shapes its interpretation.", "Written examination"],

  ["AR-101", "Recognize basic vocabulary and sentence structure.", "Written examination"],
  ["AR-201", "Apply basic grammar rules to read simple texts.", "Written examination"],
  ["AR-301", "Read primary texts with reduced reliance on secondary summaries.", "Written examination"],
  ["AR-302", "Hold a basic conversational exchange in Arabic.", "Oral/practical assessment"],
  ["AR-401", "Read a classical source text directly, without translation support.", "Written examination"],
  ["AR-402", "Compose a structured piece of Arabic writing on a given topic.", "Written composition assessment"],

  ["IE-101", "Demonstrate Islamic adab consistently in conduct and interaction.", "Practical, instructor-observed assessment"],
  ["IE-201", "Communicate learned material clearly, in writing and speech.", "Presentation/practical assessment"],
  ["IE-202", "Apply Tazkiyah principles to personal conduct.", "Reflective portfolio / practical assessment"],
  ["IE-401", "Design and deliver a basic Islamic-studies lesson.", "Teaching demonstration plus written assessment"],
  ["IE-402", "Apply basic da'wah/outreach methodology to a sample scenario.", "Practical assessment (provisional -- see academy-course-catalogue decision 32)"],
  ["IE-403", "Sequence a short unit of Islamic teaching material.", "Practical/portfolio assessment"],
  ["IE-404", "Adapt a lesson for a younger age group.", "Teaching demonstration"],
  ["IE-405", "Advise on age-appropriate Islamic upbringing practices.", "Written/practical assessment"],

  ["IC-201", "Recall the essential arc of Islamic history and civilization.", "Written examination"],
  ["IC-301", "Explain how Islamic thought has shaped social and civilizational life.", "Written examination"],
  ["IC-401", "Analyze a contemporary challenge facing a Muslim community.", "Written examination plus a case-study essay"],
  ["IC-402", "Analyze the family's role as a social institution within Muslim civilization.", "Written examination"],

  ["RL-101", "Apply basic study and note-taking techniques.", "Practical/portfolio assessment"],
  ["RL-201", "Apply guided analytical reasoning to a given text.", "Written assessment"],
  ["RL-301", "Verify a source and apply basic research methodology.", "Research exercise"],
  ["RL-401", "Produce and defend an independent research or capstone project.", "Research project plus defense"],
];

async function main() {
  let updated = 0;
  let skipped = 0;

  for (const [courseCode, outcomeEn, assessmentType] of COURSE_OUTCOMES) {
    const existing = await prisma.course.findUnique({ where: { courseCode } });
    if (!existing) {
      console.log(`[${courseCode}] no matching Course row -- skipped.`);
      skipped++;
      continue;
    }

    await prisma.course.update({
      where: { courseCode },
      data: { outcomeEn, assessmentType },
    });
    console.log(`[${courseCode}] outcomeEn + assessmentType set.`);
    updated++;
  }

  console.log(`\nDone. ${updated} course(s) updated, ${skipped} skipped.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
