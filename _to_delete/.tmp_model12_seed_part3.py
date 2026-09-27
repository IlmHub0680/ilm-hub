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

SEED_FN = """
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

"""

c = r1(
    c,
    "async function seedPositions() {",
    SEED_FN.strip("\n") + "\n\nasync function seedPositions() {",
    "insert seedAcademyCourses function before seedPositions",
)

c = r1(
    c,
    """  await seedAcademyPrograms();
  console.log("");

  const positionByName = await seedPositions();""",
    """  await seedAcademyPrograms();
  console.log("");

  await seedAcademyCourses();
  console.log("");

  const positionByName = await seedPositions();""",
    "wire seedAcademyCourses into main()",
)

save(path, c)
print("Step 3: seedAcademyCourses() function added and wired into main().")
