import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const connectionString = process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL is missing from .env");
}

const adapter = new PrismaPg({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({ adapter });

const DEMO_EMAIL = "demo.student@ilmhub.edu";
const DEMO_PASSWORD = "DemoStudent123!";
const DEMO_COORDINATOR_EMAIL = "demo.coordinator@ilmhub.edu";
const DEMO_COORDINATOR_PASSWORD = "DemoCoordinator123!";
const DEMO_REGISTRY_EMAIL = "demo.registry@ilmhub.edu";
const DEMO_REGISTRY_PASSWORD = "DemoRegistry123!";
const DEMO_FINANCE_EMAIL = "demo.finance@ilmhub.edu";
const DEMO_FINANCE_PASSWORD = "DemoFinance123!";
const DEMO_LIBRARIAN_EMAIL = "demo.librarian@ilmhub.edu";
const DEMO_LIBRARIAN_PASSWORD = "DemoLibrarian123!";
const DEMO_ICT_EMAIL = "demo.ict@ilmhub.edu";
const DEMO_ICT_PASSWORD = "DemoICT123!";
const DEMO_INSTRUCTOR_EMAIL = "demo.instructor@ilmhub.edu";
const DEMO_INSTRUCTOR_PASSWORD = "DemoInstructor123!";
const DEMO_QA_EMAIL = "demo.qa@ilmhub.edu";
const DEMO_QA_PASSWORD = "DemoQA123!";
const DEMO_STUDENT_AFFAIRS_EMAIL = "demo.studentaffairs@ilmhub.edu";
const DEMO_STUDENT_AFFAIRS_PASSWORD = "DemoStudentAffairs123!";
const DEMO_ACADEMY_DIRECTOR_EMAIL = "demo.academydirector@ilmhub.edu";
const DEMO_ACADEMY_DIRECTOR_PASSWORD = "DemoAcademyDirector123!";
const DEMO_DEAN_EMAIL = "demo.dean@ilmhub.edu";
const DEMO_DEAN_PASSWORD = "DemoDean123!";
const DEMO_HOD_EMAIL = "demo.hod@ilmhub.edu";
const DEMO_HOD_PASSWORD = "DemoHOD123!";
const DEMO_REGISTRAR_EMAIL = "demo.registrar@ilmhub.edu";
const DEMO_REGISTRAR_PASSWORD = "DemoRegistrar123!";
const DEMO_EXAMS_EMAIL = "demo.exams@ilmhub.edu";
const DEMO_EXAMS_PASSWORD = "DemoExams123!";
const DEMO_ADVISOR_EMAIL = "demo.advisor@ilmhub.edu";
const DEMO_ADVISOR_PASSWORD = "DemoAdvisor123!";

async function setupLibraryStaff() {
  console.log("Setting up demo Librarian...");

  const librarianPosition = await prisma.position.findUnique({
    where: { nameEn: "Librarian" },
  });

  if (!librarianPosition) {
    console.warn(
      "  ⚠ 'Librarian' Position not found — run the RBAC seed first."
    );
    return;
  }

  let librarianStaff = await prisma.staffProfile.findFirst({
    where: { positionId: librarianPosition.id },
    include: { user: true },
  });

  if (librarianStaff) {
    console.log(`Using existing library staff: ${librarianStaff.user.email}`);
  } else {
    const faculty = await prisma.faculty.findFirst();
    const department = await prisma.department.findFirst();

    let librarianUser = await prisma.user.findUnique({
      where: { email: DEMO_LIBRARIAN_EMAIL },
    });

    if (!librarianUser) {
      const passwordHash = await bcrypt.hash(
        DEMO_LIBRARIAN_PASSWORD,
        10
      );

      librarianUser = await prisma.user.create({
        data: {
          id: "user-demo-librarian-001",
          name: "Demo Librarian",
          email: DEMO_LIBRARIAN_EMAIL,
          passwordHash,
          role: "USER",
        },
      });
    }

    librarianStaff = await prisma.staffProfile.create({
      data: {
        userId: librarianUser.id,
        positionId: librarianPosition.id,
        facultyId: faculty?.id ?? null,
        departmentId: department?.id ?? null,
        employeeNo: "EMP-DEMO-LIBRARIAN-001",
      },
      include: { user: true },
    });

    console.log(
      `  ✓ Created demo librarian: ${DEMO_LIBRARIAN_EMAIL} / ${DEMO_LIBRARIAN_PASSWORD}`
    );
  }

  // Sample catalogue item + active loan.
  let item = await prisma.libraryItem.findFirst({
    where: { title: "Riyad As-Salihin" },
  });

  if (!item) {
    item = await prisma.libraryItem.create({
      data: {
        title: "Riyad As-Salihin",
        author: "Imam An-Nawawi",
        category: "Hadith",
        totalCopies: 3,
        availableCopies: 3,
      },
    });

    console.log(
      "  ✓ Demo library item created (Riyad As-Salihin, 3 copies)"
    );
  }

  const studentProfile = await prisma.studentProfile.findFirst({
    where: { user: { email: DEMO_EMAIL } },
  });

  if (studentProfile) {
    const existingLoan = await prisma.libraryLoan.findFirst({
      where: {
        itemId: item.id,
        studentId: studentProfile.id,
        status: "BORROWED",
      },
    });

    if (!existingLoan) {
      await prisma.$transaction([
        prisma.libraryLoan.create({
          data: {
            itemId: item.id,
            studentId: studentProfile.id,
            dueAt: new Date(
              Date.now() + 14 * 24 * 60 * 60 * 1000
            ),
            status: "BORROWED",
          },
        }),
        prisma.libraryItem.update({
          where: { id: item.id },
          data: {
            availableCopies: {
              decrement: 1,
            },
          },
        }),
      ]);

      console.log(
        "  ✓ Demo loan issued to demo student (due in 14 days)"
      );
    } else {
      console.log("  • Demo library loan already exists, skipped");
    }
  } else {
    console.log(
      "  • Demo student profile not found, skipping demo library loan"
    );
  }
}

async function setupICTStaff() {
  console.log("Setting up demo ICT Officer...");

  const ictPosition = await prisma.position.findUnique({
    where: { nameEn: "ICT Officer" },
  });

  if (!ictPosition) {
    console.warn(
      "  ⚠ 'ICT Officer' Position not found — run the RBAC seed first."
    );
    return;
  }

  let ictStaff = await prisma.staffProfile.findFirst({
    where: { positionId: ictPosition.id },
    include: { user: true },
  });

  if (ictStaff) {
    console.log(`Using existing ICT staff: ${ictStaff.user.email}`);
  } else {
    const faculty = await prisma.faculty.findFirst();
    const department = await prisma.department.findFirst();

    let ictUser = await prisma.user.findUnique({
      where: { email: DEMO_ICT_EMAIL },
    });

    if (!ictUser) {
      const passwordHash = await bcrypt.hash(
        DEMO_ICT_PASSWORD,
        10
      );

      ictUser = await prisma.user.create({
        data: {
          id: "user-demo-ict-001",
          name: "Demo ICT Officer",
          email: DEMO_ICT_EMAIL,
          passwordHash,
          role: "USER",
        },
      });
    }

    ictStaff = await prisma.staffProfile.create({
      data: {
        userId: ictUser.id,
        positionId: ictPosition.id,
        facultyId: faculty?.id ?? null,
        departmentId: department?.id ?? null,
        employeeNo: "EMP-DEMO-ICT-001",
      },
      include: { user: true },
    });

    console.log(
      `  ✓ Created demo ICT officer: ${DEMO_ICT_EMAIL} / ${DEMO_ICT_PASSWORD}`
    );
  }

  // Sample support ticket, raised by the demo student.
  const studentUser = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
  });

  if (studentUser) {
    const existingTicket = await prisma.iCTTicket.findFirst({
      where: {
        raisedByUserId: studentUser.id,
        subject: "Cannot access student portal",
      },
    });

    if (!existingTicket) {
      await prisma.iCTTicket.create({
        data: {
          raisedByUserId: studentUser.id,
          subject: "Cannot access student portal",
          description:
            "I keep getting logged out when I try to view my grades.",
        },
      });

      console.log(
        "  ✓ Demo IT ticket created (raised by demo student)"
      );
    } else {
      console.log("  • Demo IT ticket already exists, skipped");
    }
  } else {
    console.log(
      "  • Demo student not found, skipping demo IT ticket"
    );
  }
}

async function setupInstructorStaff(course) {
  console.log("Setting up demo Instructor...");

  const instructorPosition = await prisma.position.findUnique({
    where: { nameEn: "Instructor" },
  });

  if (!instructorPosition) {
    console.warn(
      "  ⚠ 'Instructor' Position not found — run the RBAC seed first."
    );
    return;
  }

  let instructorStaff = await prisma.staffProfile.findFirst({
    where: { positionId: instructorPosition.id },
    include: { user: true },
  });

  if (instructorStaff) {
    console.log(
      `Using existing instructor staff: ${instructorStaff.user.email}`
    );
  } else {
    const faculty = await prisma.faculty.findFirst();
    const department = await prisma.department.findFirst();

    let instructorUser = await prisma.user.findUnique({
      where: { email: DEMO_INSTRUCTOR_EMAIL },
    });

    if (!instructorUser) {
      const passwordHash = await bcrypt.hash(
        DEMO_INSTRUCTOR_PASSWORD,
        10
      );

      instructorUser = await prisma.user.create({
        data: {
          id: "user-demo-instructor-001",
          name: "Demo Instructor",
          email: DEMO_INSTRUCTOR_EMAIL,
          passwordHash,
          role: "INSTRUCTOR",
        },
      });

      console.log(
        `  ✓ Created demo instructor user: ${DEMO_INSTRUCTOR_EMAIL} / ${DEMO_INSTRUCTOR_PASSWORD}`
      );
    }

    instructorStaff = await prisma.staffProfile.create({
      data: {
        userId: instructorUser.id,
        positionId: instructorPosition.id,
        facultyId: faculty?.id ?? null,
        departmentId: department?.id ?? null,
        employeeNo: "EMP-DEMO-INSTRUCTOR-001",
      },
      include: { user: true },
    });

    console.log(
      `  ✓ Created demo instructor staff: ${instructorStaff.user.email}`
    );
  }

  // Link the instructor to the demo course.
  const existingAssignment = await prisma.instructorCourse.findUnique({
    where: {
      instructorId_courseId: {
        instructorId: instructorStaff.user.id,
        courseId: course.id,
      },
    },
  });

  if (!existingAssignment) {
    await prisma.instructorCourse.create({
      data: {
        instructorId: instructorStaff.user.id,
        courseId: course.id,
      },
    });

    console.log(
      `  ✓ Linked instructor to course: ${course.titleEn}`
    );
  } else {
    console.log(
      `  • Instructor already linked to course: ${course.titleEn}`
    );
  }

  console.log("");
  console.log("   Instructor login:");
  console.log(`   Email:    ${instructorStaff.user.email}`);

  if (instructorStaff.user.email === DEMO_INSTRUCTOR_EMAIL) {
    console.log(`   Password: ${DEMO_INSTRUCTOR_PASSWORD}`);
  } else {
    console.log("   (using existing instructor's own password)");
  }
}

async function setupFinanceStaff() {
  console.log("Setting up demo Finance Officer...");

  const financePosition = await prisma.position.findUnique({
    where: { nameEn: "Finance Officer" },
  });

  if (!financePosition) {
    console.warn(
      "  ⚠ 'Finance Officer' Position not found — run the RBAC seed first."
    );
    return;
  }

  let financeStaff = await prisma.staffProfile.findFirst({
    where: { positionId: financePosition.id },
    include: { user: true },
  });

  if (financeStaff) {
    console.log(
      `Using existing finance staff: ${financeStaff.user.email}`
    );
    return;
  }

  const faculty = await prisma.faculty.findFirst();
  const department = await prisma.department.findFirst();

  let financeUser = await prisma.user.findUnique({
    where: { email: DEMO_FINANCE_EMAIL },
  });

  if (!financeUser) {
    const passwordHash = await bcrypt.hash(
      DEMO_FINANCE_PASSWORD,
      10
    );

    financeUser = await prisma.user.create({
      data: {
        id: "user-demo-finance-001",
        name: "Demo Finance Officer",
        email: DEMO_FINANCE_EMAIL,
        passwordHash,
        role: "USER",
      },
    });
  }

  financeStaff = await prisma.staffProfile.create({
    data: {
      userId: financeUser.id,
      positionId: financePosition.id,
      facultyId: faculty?.id ?? null,
      departmentId: department?.id ?? null,
      employeeNo: "EMP-DEMO-FINANCE-001",
    },
    include: { user: true },
  });

  console.log(
    `  ✓ Created demo finance staff: ${DEMO_FINANCE_EMAIL} / ${DEMO_FINANCE_PASSWORD}`
  );
}

async function setupDemoFee() {
  console.log("Setting up a demo fee record...");

  const studentProfile = await prisma.studentProfile.findFirst({
    where: { user: { email: DEMO_EMAIL } },
  });

  if (!studentProfile) {
    console.warn(
      "  ⚠ Demo student profile not found, skipping demo fee."
    );
    return;
  }

  const existing = await prisma.studentFee.findFirst({
    where: {
      studentId: studentProfile.id,
      feeType: "Tuition",
    },
  });

  if (existing) {
    console.log("  • Demo fee already exists, skipped");
    return;
  }

  await prisma.studentFee.create({
    data: {
      studentId: studentProfile.id,
      feeType: "Tuition",
      amountUSD: 500,
      paidUSD: 200,
      status: "PARTIAL",
      dueDate: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ),
    },
  });

  console.log(
    "  ✓ Demo fee created (Tuition, $500 owed, $200 paid, PARTIAL)"
  );
}

async function setupDemoAdmissionApplication() {
  console.log(
    "Setting up a demo admission application (PAID, ready for review)..."
  );

  const existing = await prisma.admissionApplication.findUnique({
    where: {
      applicationNumber: "ILM-DEMO-APP-001",
    },
  });

  if (existing) {
    console.log(
      `Using existing demo application: ${existing.applicationNumber}`
    );
    return;
  }

  const application =
    await prisma.admissionApplication.create({
      data: {
        applicationNumber: "ILM-DEMO-APP-001",
        email: "demo.applicant@ilmhub.edu",
        fullName: "Demo Applicant",
        dateOfBirth: new Date("2005-03-15"),
        gender: "Male",
        nationality: "Ghanaian",
        countryOfResidence: "Ghana",
        phoneNumber: "+233240000001",
        idNumber: "GHA-DEMO-0001",
        residentialAddress: "123 Demo Street, Accra",
        applicantCategory: "New Student",
        guardianName: "Demo Guardian",
        guardianPhone: "+233240000002",
        guardianRelationship: "Parent",
        emergencyName: "Demo Emergency Contact",
        emergencyPhone: "+233240000003",
        emergencyRelationship: "Sibling",
        highestEducation: "Secondary School",
        institutionName: "Demo Secondary School",
        admissionType: "PROGRAM",
        studySession: "Morning",
        identityDocType: "National ID",
        admissionFee: 500,
        currencyCode: "GHS",
        feeBasis: "Standard",
        status: "PAID",
        paidAt: new Date(),
        payment: {
          create: {
            gateway: "PAYSTACK",
            method: "MTN_MOBILE_MONEY",
            status: "PAID",
            amount: 500,
            currencyCode: "GHS",
            gatewayReference: "DEMO-REF-0001",
            transactionId: "DEMO-TXN-0001",
            paidAt: new Date(),
          },
        },
      },
    });

  console.log(
    `  ✓ Created demo application: ${application.applicationNumber} (status: PAID)`
  );
  console.log(
    "    Ready for the Registry dashboard: Move to Review → Approve/Reject."
  );
}

async function setupRegistryStaff() {
  console.log(
    "Setting up demo Registry / Admissions Officer..."
  );

  const admissionsPosition =
    await prisma.position.findUnique({
      where: { nameEn: "Admissions Officer" },
    });

  if (!admissionsPosition) {
    console.warn(
      "  ⚠ 'Admissions Officer' Position not found — run the RBAC seed first."
    );
    return;
  }

  let registryStaff =
    await prisma.staffProfile.findFirst({
      where: {
        positionId: admissionsPosition.id,
      },
      include: { user: true },
    });

  if (registryStaff) {
    console.log(
      `Using existing registry staff: ${registryStaff.user.email}`
    );
    return;
  }

  const faculty = await prisma.faculty.findFirst();
  const department = await prisma.department.findFirst();

  let registryUser = await prisma.user.findUnique({
    where: { email: DEMO_REGISTRY_EMAIL },
  });

  if (!registryUser) {
    const passwordHash = await bcrypt.hash(
      DEMO_REGISTRY_PASSWORD,
      10
    );

    registryUser = await prisma.user.create({
      data: {
        id: "user-demo-registry-001",
        name: "Demo Admissions Officer",
        email: DEMO_REGISTRY_EMAIL,
        passwordHash,
        role: "USER",
      },
    });
  }

  registryStaff = await prisma.staffProfile.create({
    data: {
      userId: registryUser.id,
      positionId: admissionsPosition.id,
      facultyId: faculty?.id ?? null,
      departmentId: department?.id ?? null,
      employeeNo: "EMP-DEMO-REGISTRY-001",
    },
    include: { user: true },
  });

  console.log(
    `  ✓ Created demo registry staff: ${DEMO_REGISTRY_EMAIL} / ${DEMO_REGISTRY_PASSWORD}`
  );
}

async function setupAdditionalStaffDemos() {
  console.log("");
  console.log("Setting up demo Quality Assurance Officer...");

  const qaPosition = await prisma.position.findUnique({
    where: {
      nameEn: "Quality Assurance Officer",
    },
  });

  if (!qaPosition) {
    console.warn(
      "  ⚠ 'Quality Assurance Officer' Position not found — run the RBAC seed first."
    );
  } else {
    const faculty = await prisma.faculty.findFirst();
    const department = await prisma.department.findFirst();

    let qaUser = await prisma.user.findUnique({
      where: {
        email: DEMO_QA_EMAIL,
      },
    });

    if (!qaUser) {
      const passwordHash = await bcrypt.hash(
        DEMO_QA_PASSWORD,
        10
      );

      qaUser = await prisma.user.create({
        data: {
          id: "user-demo-qa-001",
          name: "Demo Quality Assurance Officer",
          email: DEMO_QA_EMAIL,
          passwordHash,
          role: "USER",
        },
      });
    }

    const existingQA = await prisma.staffProfile.findFirst({
      where: {
        userId: qaUser.id,
      },
    });

    if (!existingQA) {
      await prisma.staffProfile.create({
        data: {
          userId: qaUser.id,
          positionId: qaPosition.id,
          facultyId: faculty?.id ?? null,
          departmentId: department?.id ?? null,
          employeeNo: "EMP-DEMO-QA-001",
        },
      });

      console.log(
        `  ✓ Created demo QA Officer: ${DEMO_QA_EMAIL} / ${DEMO_QA_PASSWORD}`
      );
    } else {
      console.log(
        `Using existing QA staff: ${qaUser.email}`
      );
    }

    const qaStaff = await prisma.staffProfile.findFirst({
      where: { userId: qaUser.id },
    });
    const demoProgram = await prisma.program.findFirst();

    if (qaStaff && demoProgram) {
      const existingReview = await prisma.qualityReview.findFirst({
        where: { reviewedById: qaStaff.id, programId: demoProgram.id },
      });

      if (!existingReview) {
        await prisma.qualityReview.create({
          data: {
            subjectType: "PROGRAM",
            programId: demoProgram.id,
            reviewType: "Programme Review",
            findings: "Initial demo review — findings pending.",
            status: "SCHEDULED",
            reviewedById: qaStaff.id,
          },
        });

        console.log("  ✓ Demo Quality Review scheduled");
      }
    }
  }

  console.log("");
  console.log("Setting up demo Student Affairs Officer...");

  const studentAffairsPosition = await prisma.position.findUnique({
    where: {
      nameEn: "Student Affairs Officer",
    },
  });

  if (!studentAffairsPosition) {
    console.warn(
      "  ⚠ 'Student Affairs Officer' Position not found — run the RBAC seed first."
    );
  } else {
    const faculty = await prisma.faculty.findFirst();
    const department = await prisma.department.findFirst();

    let studentAffairsUser = await prisma.user.findUnique({
      where: {
        email: DEMO_STUDENT_AFFAIRS_EMAIL,
      },
    });

    if (!studentAffairsUser) {
      const passwordHash = await bcrypt.hash(
        DEMO_STUDENT_AFFAIRS_PASSWORD,
        10
      );

      studentAffairsUser = await prisma.user.create({
        data: {
          id: "user-demo-student-affairs-001",
          name: "Demo Student Affairs Officer",
          email: DEMO_STUDENT_AFFAIRS_EMAIL,
          passwordHash,
          role: "USER",
        },
      });
    }

    const existingStudentAffairs =
      await prisma.staffProfile.findFirst({
        where: {
          userId: studentAffairsUser.id,
        },
      });

    if (!existingStudentAffairs) {
      await prisma.staffProfile.create({
        data: {
          userId: studentAffairsUser.id,
          positionId: studentAffairsPosition.id,
          facultyId: faculty?.id ?? null,
          departmentId: department?.id ?? null,
          employeeNo: "EMP-DEMO-STUDENT-AFFAIRS-001",
        },
      });

      console.log(
        `  ✓ Created demo Student Affairs Officer: ${DEMO_STUDENT_AFFAIRS_EMAIL} / ${DEMO_STUDENT_AFFAIRS_PASSWORD}`
      );
    } else {
      console.log(
        `Using existing Student Affairs staff: ${studentAffairsUser.email}`
      );
    }

    const demoStudent = await prisma.studentProfile.findFirst({
      where: { user: { email: DEMO_EMAIL } },
    });

    if (demoStudent) {
      const existingRequest = await prisma.request.findFirst({
        where: { studentId: demoStudent.id, type: "LEAVE_OF_ABSENCE" },
      });

      if (!existingRequest) {
        await prisma.request.create({
          data: {
            studentId: demoStudent.id,
            type: "LEAVE_OF_ABSENCE",
            details:
              "Requesting a one-term leave of absence for family reasons.",
          },
        });

        console.log("  ✓ Demo student Request submitted (Leave of Absence)");
      }
    }
  }
}

async function setupSecondWaveStaffDemos() {
  console.log("");
  console.log("Setting up demo Academy Director, Dean, Head of Department, Registrar, and Examinations Officer...");

  // Resolved deterministically by code, not an unordered findFirst() —
  // seed.js re-upserts every Faculty/Department on each run, which can
  // rewrite row versions and silently change which row an unordered
  // findFirst() returns between runs. Falls back to an ordered findFirst()
  // if the expected Academy records aren't present yet.
  const firstFaculty =
    (await prisma.faculty.findUnique({ where: { code: "ACADEMY" } })) ||
    (await prisma.faculty.findFirst({ orderBy: { code: "asc" } }));
  const firstDepartment = firstFaculty
    ? (await prisma.department.findUnique({ where: { code: "DEPT-ISLAMIC-STUDIES" } })) ||
      (await prisma.department.findFirst({ where: { facultyId: firstFaculty.id }, orderBy: { code: "asc" } }))
    : await prisma.department.findFirst({ orderBy: { code: "asc" } });

  // --- Academy Director ---
  // View-only oversight across the whole Academy (Faculty through
  // Quality Assurance) — not tied to a single Faculty, unlike Dean.
  const academyDirectorPosition = await prisma.position.findUnique({ where: { nameEn: "Academy Director" } });

  if (!academyDirectorPosition) {
    console.warn("  ⚠ 'Academy Director' Position not found — run the RBAC seed first.");
  } else {
    let academyDirectorUser = await prisma.user.findUnique({ where: { email: DEMO_ACADEMY_DIRECTOR_EMAIL } });

    if (!academyDirectorUser) {
      const passwordHash = await bcrypt.hash(DEMO_ACADEMY_DIRECTOR_PASSWORD, 10);
      academyDirectorUser = await prisma.user.create({
        data: {
          id: "user-demo-academy-director-001",
          name: "Demo Academy Director",
          email: DEMO_ACADEMY_DIRECTOR_EMAIL,
          passwordHash,
          role: "ADMIN",
        },
      });
    }

    let academyDirectorStaff = await prisma.staffProfile.findFirst({ where: { userId: academyDirectorUser.id } });

    if (!academyDirectorStaff) {
      academyDirectorStaff = await prisma.staffProfile.create({
        data: {
          userId: academyDirectorUser.id,
          positionId: academyDirectorPosition.id,
          employeeNo: "EMP-DEMO-ACAD-DIR-001",
        },
      });

      console.log(`  ✓ Created demo Academy Director: ${DEMO_ACADEMY_DIRECTOR_EMAIL} / ${DEMO_ACADEMY_DIRECTOR_PASSWORD}`);
    } else {
      console.log(`Using existing Academy Director staff: ${academyDirectorUser.email}`);
    }
  }

  // --- Dean ---
  const deanPosition = await prisma.position.findUnique({ where: { nameEn: "Dean" } });

  if (!deanPosition) {
    console.warn("  ⚠ 'Dean' Position not found — run the RBAC seed first.");
  } else if (!firstFaculty) {
    console.warn("  ⚠ No Faculty found — cannot set up demo Dean.");
  } else {
    let deanUser = await prisma.user.findUnique({ where: { email: DEMO_DEAN_EMAIL } });

    if (!deanUser) {
      const passwordHash = await bcrypt.hash(DEMO_DEAN_PASSWORD, 10);
      deanUser = await prisma.user.create({
        data: {
          id: "user-demo-dean-001",
          name: "Demo Dean",
          email: DEMO_DEAN_EMAIL,
          passwordHash,
          role: "USER",
        },
      });
    }

    let deanStaff = await prisma.staffProfile.findFirst({ where: { userId: deanUser.id } });

    if (!deanStaff) {
      deanStaff = await prisma.staffProfile.create({
        data: {
          userId: deanUser.id,
          positionId: deanPosition.id,
          facultyId: firstFaculty.id,
          employeeNo: "EMP-DEMO-DEAN-001",
        },
      });

      console.log(`  ✓ Created demo Dean: ${DEMO_DEAN_EMAIL} / ${DEMO_DEAN_PASSWORD}`);
    } else {
      console.log(`Using existing Dean staff: ${deanUser.email}`);
    }

    const currentFaculty = await prisma.faculty.findUnique({ where: { id: firstFaculty.id } });
    const deanAlreadyLeadsElsewhere = await prisma.faculty.findFirst({ where: { deanId: deanStaff.id, id: { not: firstFaculty.id } } });

    if (!currentFaculty.deanId && !deanAlreadyLeadsElsewhere) {
      await prisma.faculty.update({
        where: { id: firstFaculty.id },
        data: { deanId: deanStaff.id },
      });
      console.log(`  ✓ Assigned demo Dean to lead ${firstFaculty.nameEn}`);
    } else if (deanAlreadyLeadsElsewhere) {
      console.log(`  • Demo Dean already leads ${deanAlreadyLeadsElsewhere.nameEn}, left unchanged`);
    }
  }

  // --- Head of Department ---
  const hodPosition = await prisma.position.findUnique({ where: { nameEn: "Head of Department" } });

  if (!hodPosition) {
    console.warn("  ⚠ 'Head of Department' Position not found — run the RBAC seed first.");
  } else if (!firstDepartment) {
    console.warn("  ⚠ No Department found — cannot set up demo Head of Department.");
  } else {
    let hodUser = await prisma.user.findUnique({ where: { email: DEMO_HOD_EMAIL } });

    if (!hodUser) {
      const passwordHash = await bcrypt.hash(DEMO_HOD_PASSWORD, 10);
      hodUser = await prisma.user.create({
        data: {
          id: "user-demo-hod-001",
          name: "Demo Head of Department",
          email: DEMO_HOD_EMAIL,
          passwordHash,
          role: "USER",
        },
      });
    }

    let hodStaff = await prisma.staffProfile.findFirst({ where: { userId: hodUser.id } });

    if (!hodStaff) {
      hodStaff = await prisma.staffProfile.create({
        data: {
          userId: hodUser.id,
          positionId: hodPosition.id,
          facultyId: firstDepartment.facultyId,
          departmentId: firstDepartment.id,
          employeeNo: "EMP-DEMO-HOD-001",
        },
      });

      console.log(`  ✓ Created demo Head of Department: ${DEMO_HOD_EMAIL} / ${DEMO_HOD_PASSWORD}`);
    } else {
      console.log(`Using existing Head of Department staff: ${hodUser.email}`);
    }

    const currentDepartment = await prisma.department.findUnique({ where: { id: firstDepartment.id } });
    const hodAlreadyLeadsElsewhere = await prisma.department.findFirst({ where: { headId: hodStaff.id, id: { not: firstDepartment.id } } });

    if (!currentDepartment.headId && !hodAlreadyLeadsElsewhere) {
      await prisma.department.update({
        where: { id: firstDepartment.id },
        data: { headId: hodStaff.id },
      });
      console.log(`  ✓ Assigned demo Head to lead ${firstDepartment.nameEn}`);
    } else if (hodAlreadyLeadsElsewhere) {
      console.log(`  • Demo Head of Department already leads ${hodAlreadyLeadsElsewhere.nameEn}, left unchanged`);
    }
  }

  // --- Registrar (Academic Records) ---
  const registrarPosition = await prisma.position.findUnique({ where: { nameEn: "Registrar" } });

  if (!registrarPosition) {
    console.warn("  ⚠ 'Registrar' Position not found — run the RBAC seed first.");
  } else {
    let registrarUser = await prisma.user.findUnique({ where: { email: DEMO_REGISTRAR_EMAIL } });

    if (!registrarUser) {
      const passwordHash = await bcrypt.hash(DEMO_REGISTRAR_PASSWORD, 10);
      registrarUser = await prisma.user.create({
        data: {
          id: "user-demo-registrar-001",
          name: "Demo Registrar",
          email: DEMO_REGISTRAR_EMAIL,
          passwordHash,
          role: "USER",
        },
      });
    }

    const existingRegistrarStaff = await prisma.staffProfile.findFirst({ where: { userId: registrarUser.id } });

    if (!existingRegistrarStaff) {
      await prisma.staffProfile.create({
        data: {
          userId: registrarUser.id,
          positionId: registrarPosition.id,
          employeeNo: "EMP-DEMO-REGISTRAR-001",
        },
      });

      console.log(`  ✓ Created demo Registrar: ${DEMO_REGISTRAR_EMAIL} / ${DEMO_REGISTRAR_PASSWORD}`);
    } else {
      console.log(`Using existing Registrar staff: ${registrarUser.email}`);
    }

    const demoStudent = await prisma.studentProfile.findFirst({ where: { user: { email: DEMO_EMAIL } } });

    if (demoStudent) {
      const existingTranscriptRequest = await prisma.request.findFirst({
        where: { studentId: demoStudent.id, type: "TRANSCRIPT" },
      });

      if (!existingTranscriptRequest) {
        await prisma.request.create({
          data: {
            studentId: demoStudent.id,
            type: "TRANSCRIPT",
            details: "Requesting an official transcript for a scholarship application.",
          },
        });
        console.log("  ✓ Demo transcript Request submitted");
      }
    }
  }

  // --- Examinations Officer ---
  const examsPosition = await prisma.position.findUnique({ where: { nameEn: "Examinations Officer" } });

  if (!examsPosition) {
    console.warn("  ⚠ 'Examinations Officer' Position not found — run the RBAC seed first.");
  } else {
    let examsUser = await prisma.user.findUnique({ where: { email: DEMO_EXAMS_EMAIL } });

    if (!examsUser) {
      const passwordHash = await bcrypt.hash(DEMO_EXAMS_PASSWORD, 10);
      examsUser = await prisma.user.create({
        data: {
          id: "user-demo-exams-001",
          name: "Demo Examinations Officer",
          email: DEMO_EXAMS_EMAIL,
          passwordHash,
          role: "USER",
        },
      });
    }

    const existingExamsStaff = await prisma.staffProfile.findFirst({ where: { userId: examsUser.id } });

    if (!existingExamsStaff) {
      await prisma.staffProfile.create({
        data: {
          userId: examsUser.id,
          positionId: examsPosition.id,
          employeeNo: "EMP-DEMO-EXAMS-001",
        },
      });

      console.log(`  ✓ Created demo Examinations Officer: ${DEMO_EXAMS_EMAIL} / ${DEMO_EXAMS_PASSWORD}`);
    } else {
      console.log(`Using existing Examinations Officer staff: ${examsUser.email}`);
    }

    const demoStudentForAppeal = await prisma.studentProfile.findFirst({ where: { user: { email: DEMO_EMAIL } } });

    if (demoStudentForAppeal) {
      const existingAppeal = await prisma.request.findFirst({
        where: { studentId: demoStudentForAppeal.id, type: "GRADE_APPEAL" },
      });

      if (!existingAppeal) {
        await prisma.request.create({
          data: {
            studentId: demoStudentForAppeal.id,
            type: "GRADE_APPEAL",
            details: "Requesting a re-check of the midterm grade for this course.",
          },
        });
        console.log("  ✓ Demo grade appeal Request submitted");
      }
    }
  }

  // --- Academic Advisor ---
  console.log("");
  console.log("Setting up demo Academic Advisor...");

  const advisorPosition = await prisma.position.findUnique({ where: { nameEn: "Academic Advisor" } });

  if (!advisorPosition) {
    console.warn("  ⚠ 'Academic Advisor' Position not found — run the RBAC seed first.");
  } else {
    let advisorUser = await prisma.user.findUnique({ where: { email: DEMO_ADVISOR_EMAIL } });

    if (!advisorUser) {
      const passwordHash = await bcrypt.hash(DEMO_ADVISOR_PASSWORD, 10);
      advisorUser = await prisma.user.create({
        data: {
          id: "user-demo-advisor-001",
          name: "Demo Academic Advisor",
          email: DEMO_ADVISOR_EMAIL,
          passwordHash,
          role: "USER",
        },
      });
    }

    let advisorStaff = await prisma.staffProfile.findFirst({ where: { userId: advisorUser.id } });

    if (!advisorStaff) {
      advisorStaff = await prisma.staffProfile.create({
        data: {
          userId: advisorUser.id,
          positionId: advisorPosition.id,
          employeeNo: "EMP-DEMO-ADVISOR-001",
        },
      });

      console.log(`  ✓ Created demo Academic Advisor: ${DEMO_ADVISOR_EMAIL} / ${DEMO_ADVISOR_PASSWORD}`);
    } else {
      console.log(`Using existing Academic Advisor staff: ${advisorUser.email}`);
    }

    const demoStudentForAdvising = await prisma.studentProfile.findFirst({
      where: { user: { email: DEMO_EMAIL } },
    });

    if (demoStudentForAdvising && !demoStudentForAdvising.academicAdvisorId) {
      await prisma.studentProfile.update({
        where: { id: demoStudentForAdvising.id },
        data: { academicAdvisorId: advisorStaff.id },
      });
      console.log("  ✓ Assigned demo student to demo Academic Advisor");
    }

    if (demoStudentForAdvising) {
      const existingThread = await prisma.advisorMessage.findFirst({
        where: { studentId: demoStudentForAdvising.id },
      });

      if (!existingThread) {
        await prisma.advisorMessage.create({
          data: {
            studentId: demoStudentForAdvising.id,
            senderRole: "STUDENT",
            message: "Assalamu alaikum, could I get guidance on my course load for next term?",
          },
        });
        console.log("  ✓ Demo advisor message thread started");
      }
    }
  }
}

// Real Islamic Studies course catalog — populates the programme's
// actual curriculum (courseCode, credit hours, semesterLevel,
// prerequisites, category) so the automatic course-registration engine
// (lib/courseAssignment.js) and the new Programme Coordinator
// curriculum tools (app/api/coordinator/courses) have genuine content
// to work with instead of the single fallback demo course. Idempotent
// per course (matched by courseCode) — safe to run repeatedly, and
// never overwrites a course that already exists under that code.
async function seedIslamicCourseCatalog(programId) {
  const COURSES = [
    // Level 1 — Foundational
    {
      courseCode: "ISL-101",
      titleEn: "Introduction to Aqidah",
      titleAr: "مدخل إلى العقيدة الإسلامية",
      descriptionEn:
        "The foundations of Islamic creed: the six pillars of iman, the nature of tawhid, and the sources of belief in the Qur'an and Sunnah.",
      descriptionAr:
        "أسس العقيدة الإسلامية: أركان الإيمان الستة، وحقيقة التوحيد، ومصادر الاعتقاد من الكتاب والسنة.",
      categoryId: "cat-aqidah",
      semesterLevel: 1,
      prereqCodes: [],
    },
    {
      courseCode: "ISL-102",
      titleEn: "Qur'an Recitation & Tajweed I",
      titleAr: "تلاوة القرآن والتجويد (١)",
      descriptionEn:
        "Correct pronunciation of Arabic letters (makharij), the core rules of tajweed, and supervised recitation practice.",
      descriptionAr:
        "مخارج الحروف العربية الصحيحة، وأحكام التجويد الأساسية، وتدريب عملي على التلاوة تحت إشراف.",
      categoryId: "cat-quran",
      semesterLevel: 1,
      prereqCodes: [],
    },
    {
      courseCode: "ISL-103",
      titleEn: "Introduction to Hadith Sciences",
      titleAr: "مدخل إلى علوم الحديث",
      descriptionEn:
        "An overview of hadith terminology, the chain of narration (isnad), and how hadith are classified and preserved.",
      descriptionAr:
        "نظرة عامة على مصطلح الحديث، والإسناد، وكيفية تصنيف الأحاديث وحفظها.",
      categoryId: "cat-hadith",
      semesterLevel: 1,
      prereqCodes: [],
    },
    {
      courseCode: "ISL-104",
      titleEn: "Arabic Grammar I (Nahw)",
      titleAr: "النحو العربي (١)",
      descriptionEn:
        "Foundational Arabic syntax: sentence structure, case endings (i'rab), and the grammar needed to read classical texts.",
      descriptionAr:
        "أساسيات النحو العربي: تركيب الجملة، والإعراب، والقواعد اللازمة لقراءة النصوص الكلاسيكية.",
      categoryId: "cat-arabic",
      semesterLevel: 1,
      prereqCodes: [],
    },
    {
      courseCode: "ISL-105",
      titleEn: "Seerah: The Meccan Period",
      titleAr: "السيرة النبوية: العهد المكي",
      descriptionEn:
        "The life of the Prophet Muhammad (peace be upon him) from birth through the call to Islam and the Meccan trials.",
      descriptionAr:
        "سيرة النبي محمد صلى الله عليه وسلم من مولده إلى بعثته ومحن العهد المكي.",
      categoryId: "cat-seerah",
      semesterLevel: 1,
      prereqCodes: [],
    },

    // Level 2 — Intermediate
    {
      courseCode: "ISL-201",
      titleEn: "Advanced Aqidah: Schools of Islamic Theology",
      titleAr: "العقيدة المتقدمة: المدارس الكلامية الإسلامية",
      descriptionEn:
        "A comparative study of the major theological schools and their positions on the divine attributes and free will.",
      descriptionAr:
        "دراسة مقارنة للمدارس الكلامية الكبرى ومواقفها من الصفات الإلهية والقضاء والقدر.",
      categoryId: "cat-aqidah",
      semesterLevel: 2,
      prereqCodes: ["ISL-101"],
    },
    {
      courseCode: "ISL-202",
      titleEn: "Usul al-Fiqh: Foundations of Islamic Jurisprudence",
      titleAr: "أصول الفقه",
      descriptionEn:
        "The methodology of Islamic law: the sources of legislation, rules of interpretation, and how jurists derive rulings.",
      descriptionAr:
        "منهجية الفقه الإسلامي: مصادر التشريع، وقواعد الاستنباط، وكيفية استخراج الأحكام.",
      categoryId: "cat-fiqh",
      semesterLevel: 2,
      prereqCodes: [],
    },
    {
      courseCode: "ISL-203",
      titleEn: "Forty Hadith of Imam Nawawi",
      titleAr: "الأربعون النووية",
      descriptionEn:
        "A close reading of Imam al-Nawawi's forty hadith collection and its foundational role in Islamic ethics and law.",
      descriptionAr:
        "قراءة متأنية لأربعين الإمام النووي ودورها التأسيسي في الأخلاق والفقه الإسلامي.",
      categoryId: "cat-hadith",
      semesterLevel: 2,
      prereqCodes: ["ISL-103"],
    },
    {
      courseCode: "ISL-204",
      titleEn: "Arabic Morphology (Sarf)",
      titleAr: "الصرف العربي",
      descriptionEn:
        "Word patterns and derivation in Arabic: verb forms, root systems, and the morphological analysis of classical texts.",
      descriptionAr:
        "الأوزان والاشتقاق في اللغة العربية: أبنية الأفعال، والجذور، والتحليل الصرفي للنصوص الكلاسيكية.",
      categoryId: "cat-arabic",
      semesterLevel: 2,
      prereqCodes: ["ISL-104"],
    },
    {
      courseCode: "ISL-205",
      titleEn: "Seerah: The Medinan Period",
      titleAr: "السيرة النبوية: العهد المدني",
      descriptionEn:
        "The Prophet's migration to Medina, the founding of the first Muslim community, and the major treaties and battles.",
      descriptionAr:
        "هجرة النبي إلى المدينة، وتأسيس أول مجتمع إسلامي، والمعاهدات والغزوات الكبرى.",
      categoryId: "cat-seerah",
      semesterLevel: 2,
      prereqCodes: ["ISL-105"],
    },
    {
      courseCode: "ISL-206",
      titleEn: "Tazkiyah: Purification of the Heart",
      titleAr: "تزكية النفس",
      descriptionEn:
        "Classical teachings on spiritual purification: sincerity, the diseases of the heart, and the etiquettes of worship.",
      descriptionAr:
        "التعاليم الكلاسيكية في تزكية النفس: الإخلاص، وأمراض القلوب، وآداب العبادة.",
      categoryId: "cat-tazkiyah",
      semesterLevel: 2,
      prereqCodes: [],
    },

    // Level 3 — Advanced
    {
      courseCode: "ISL-301",
      titleEn: "Fiqh of Worship (Ibadat)",
      titleAr: "فقه العبادات",
      descriptionEn:
        "The detailed rulings of purification, prayer, fasting, zakat and hajj, with comparative views across the schools of law.",
      descriptionAr:
        "أحكام الطهارة والصلاة والصيام والزكاة والحج بالتفصيل، مع عرض مقارن لآراء المذاهب الفقهية.",
      categoryId: "cat-fiqh",
      semesterLevel: 3,
      prereqCodes: ["ISL-202"],
    },
    {
      courseCode: "ISL-302",
      titleEn: "Tafsir Methodology",
      titleAr: "مناهج التفسير",
      descriptionEn:
        "How the Qur'an has been interpreted across history: tafsir bi'l-ma'thur, tafsir bi'l-ra'y, and the major exegetical works.",
      descriptionAr:
        "كيف فُسّر القرآن عبر التاريخ: التفسير بالمأثور، والتفسير بالرأي، وأبرز كتب التفسير.",
      categoryId: "cat-quran",
      semesterLevel: 3,
      prereqCodes: ["ISL-102"],
    },
    {
      courseCode: "ISL-303",
      titleEn: "Hadith Terminology (Mustalah al-Hadith)",
      titleAr: "مصطلح الحديث",
      descriptionEn:
        "Advanced classification of hadith by authenticity and transmission, and the tools scholars use to authenticate a narration.",
      descriptionAr:
        "التصنيف المتقدم للأحاديث من حيث الصحة والرواية، والأدوات التي يستخدمها العلماء لتوثيق الرواية.",
      categoryId: "cat-hadith",
      semesterLevel: 3,
      prereqCodes: ["ISL-203"],
    },
  ];

  const idByCode = {};
  let createdCount = 0;

  for (const def of COURSES) {
    let existing = await prisma.course.findUnique({ where: { courseCode: def.courseCode } });

    if (!existing) {
      existing = await prisma.course.create({
        data: {
          id: `course-${def.courseCode.toLowerCase()}`,
          titleEn: def.titleEn,
          titleAr: def.titleAr,
          slug: def.courseCode.toLowerCase(),
          courseCode: def.courseCode,
          descriptionEn: def.descriptionEn,
          descriptionAr: def.descriptionAr,
          creditHours: 3,
          semesterLevel: def.semesterLevel,
          categoryId: def.categoryId,
          programId,
          thumbnailUrl:
            "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=900&q=85",
          isPublished: true,
        },
      });
      createdCount += 1;
    }

    idByCode[def.courseCode] = existing.id;
  }

  // Second pass: wire up prerequisites now that every course in the
  // catalog has a real id (a course earlier in the list can require
  // one later in the list too, so this can't be done in one pass).
  for (const def of COURSES) {
    if (def.prereqCodes.length === 0) continue;

    await prisma.course.update({
      where: { id: idByCode[def.courseCode] },
      data: {
        prerequisites: {
          connect: def.prereqCodes.map((code) => ({ id: idByCode[code] })),
        },
      },
    });
  }

  if (createdCount > 0) {
    console.log(
      `  ✓ Seeded ${createdCount} Islamic Studies course(s) into the programme curriculum`
    );
  } else {
    console.log("  • Islamic Studies course catalog already present, left unchanged");
  }
}


// Real Islamic-institute academic department catalog — gives the
// Dean/Head-of-Department RBAC tools (app/dean-dashboard/departments,
// app/hod-dashboard/programs) genuine departmental structure to manage
// instead of a single ad-hoc demo row, and mirrors the same seven
// subject areas already used by the course/book Category catalog
// (cat-aqidah, cat-quran, cat-hadith, cat-fiqh, cat-seerah,
// cat-tazkiyah, cat-arabic — see prisma/seed.js) and by the Islamic
// Studies course catalog above, so a department's name always matches
// real, existing curriculum content rather than being invented in
// isolation.
//
// Idempotent and additive only: every department is upserted by its
// unique `code`, so an institute that already has a Hadith department
// (created earlier as a demo fallback under code "HADITH-DEMO") gets
// that same row polished with a professional name/description instead
// of a second, duplicate department being created alongside it.
async function seedAcademicDepartments(facultyId) {
  const DEPARTMENTS = [
    {
      code: "HADITH-DEMO",
      nameEn: "Department of Hadith Sciences",
      nameAr: "قسم علوم الحديث",
      description:
        "Hadith terminology, chain-of-narration criticism, and the study of the Prophetic tradition.",
    },
    {
      code: "DEPT-AQIDAH",
      nameEn: "Department of Aqidah & Islamic Theology",
      nameAr: "قسم العقيدة والفكر الإسلامي",
      description:
        "Islamic creed, the schools of theology, and the study of the divine attributes.",
    },
    {
      code: "DEPT-QURAN",
      nameEn: "Department of Qur'anic Studies & Tafsir",
      nameAr: "قسم الدراسات القرآنية والتفسير",
      description:
        "Qur'an recitation and tajweed, and the methodology and history of Qur'anic exegesis.",
    },
    {
      code: "DEPT-FIQH",
      nameEn: "Department of Fiqh & Islamic Jurisprudence",
      nameAr: "قسم الفقه وأصوله",
      description:
        "Islamic legal methodology (usul al-fiqh) and the comparative rulings of worship and transactions.",
    },
    {
      code: "DEPT-SEERAH",
      nameEn: "Department of Seerah & Islamic History",
      nameAr: "قسم السيرة والتاريخ الإسلامي",
      description:
        "The biography of the Prophet Muhammad (peace be upon him) and the broader history of the early Muslim community.",
    },
    {
      code: "DEPT-TAZKIYAH",
      nameEn: "Department of Tazkiyah & Islamic Spirituality",
      nameAr: "قسم التزكية والتربية الروحية",
      description:
        "The classical sciences of spiritual purification, character refinement, and the etiquettes of worship.",
    },
    {
      code: "DEPT-ARABIC",
      nameEn: "Department of Arabic Language & Literature",
      nameAr: "قسم اللغة العربية وآدابها",
      description:
        "Arabic grammar, morphology, and the language skills needed to engage classical Islamic texts directly.",
    },
  ];

  let createdCount = 0;
  let updatedCount = 0;

  for (const def of DEPARTMENTS) {
    const existing = await prisma.department.findUnique({ where: { code: def.code } });

    await prisma.department.upsert({
      where: { code: def.code },
      update: {
        nameEn: def.nameEn,
        nameAr: def.nameAr,
        description: def.description,
      },
      create: {
        facultyId,
        code: def.code,
        nameEn: def.nameEn,
        nameAr: def.nameAr,
        description: def.description,
      },
    });

    if (existing) {
      updatedCount += 1;
    } else {
      createdCount += 1;
    }
  }

  console.log(
    `  ✓ Academic departments: ${createdCount} created, ${updatedCount} polished with real content (${DEPARTMENTS.length} total)`
  );
}

async function main() {
  // One-time self-heal: earlier runs of this script created RBAC staff
  // demo accounts with role "ADMIN". Real authority for these accounts
  // comes entirely from their StaffProfile + PositionPermission (see
  // lib/permissions.ts), not from role — role "ADMIN" is reserved for
  // genuine oversight admins and also happens to pass requireAdmin(),
  // which would incorrectly grant these staff accounts access to
  // admin-only bookstore/publishing/order-approval endpoints. Correct
  // any already-seeded rows back to role "USER".
  const RBAC_STAFF_DEMO_USER_IDS = [
    "user-demo-librarian-001",
    "user-demo-ict-001",
    "user-demo-finance-001",
    "user-demo-registry-001",
    "user-demo-qa-001",
    "user-demo-student-affairs-001",
    "user-demo-coordinator-001",
  ];

  const corrected = await prisma.user.updateMany({
    where: {
      id: { in: RBAC_STAFF_DEMO_USER_IDS },
      role: "ADMIN",
    },
    data: { role: "USER" },
  });

  if (corrected.count > 0) {
    console.log(
      `  ✓ Corrected role on ${corrected.count} RBAC staff demo account(s) (ADMIN -> USER)`
    );
  }

  console.log("");
  console.log("========================================");
  console.log(
    "   DEMO DATA: Assignments / Exams / Attendance"
  );
  console.log("========================================");
  console.log("");

  // 1. Find any existing course to attach demo data to.
  let course = await prisma.course.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!course) {
    console.log(
      "No course found — creating a minimal demo course..."
    );

    course = await prisma.course.create({
      data: {
        id: "course-demo-001",
        titleEn: "Quarter of 40 Hadith",
        titleAr: "الأربعون النووية (ربع)",
        slug: "demo-quarter-of-40-hadith",
        courseCode: "DEMO-101",
        descriptionEn:
          "Demo course created for testing the student portal.",
        descriptionAr:
          "مقرر تجريبي لاختبار بوابة الطالب.",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=85",
        isPublished: true,
        categoryId: "cat-hadith",
      },
    });
  }

  console.log(
    `Using course: ${course.titleEn} (${course.id})`
  );

  // 2. Find any existing Faculty/Department/Program.
  const faculty = await prisma.faculty.findFirst();
  const department = await prisma.department.findFirst();
  const program = await prisma.program.findFirst();

  // 3. Find an existing student, or create a known demo one.
  let studentUser = await prisma.user.findFirst({
    where: {
      role: "STUDENT",
      studentProfile: { isNot: null },
    },
    include: {
      studentProfile: true,
    },
  });

  if (!studentUser) {
    console.log(
      "No existing student found — creating a demo student..."
    );

    const passwordHash = await bcrypt.hash(
      DEMO_PASSWORD,
      10
    );

    const createdUser = await prisma.user.create({
      data: {
        id: "user-demo-student-001",
        name: "Demo Student",
        email: DEMO_EMAIL,
        passwordHash,
        role: "STUDENT",
      },
    });

    const studentProfile =
      await prisma.studentProfile.create({
        data: {
          userId: createdUser.id,
          studentNo: "ILM-DEMO-001",
          facultyId: faculty?.id ?? null,
          departmentId: department?.id ?? null,
          programId: program?.id ?? null,
          level: 1,
          admissionYear: 2026,
          studySession: "Morning",
        },
      });

    studentUser = {
      ...createdUser,
      studentProfile,
    };

    console.log(
      `  ✓ Created demo student: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`
    );
  } else {
    console.log(
      `Using existing student: ${studentUser.email}`
    );
  }

  const studentProfileId =
    studentUser.studentProfile.id;

  // 4. Ensure enrollment exists.
  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: studentUser.id,
        courseId: course.id,
      },
    },
    update: {
      status: "APPROVED",
    },
    create: {
      id: `enrollment-demo-${studentUser.id}-${course.id}`,
      userId: studentUser.id,
      courseId: course.id,
      status: "APPROVED",
    },
  });

  console.log("  ✓ Enrollment confirmed");

  // 5. Ensure a grade row exists.
  await prisma.grade.upsert({
    where: {
      studentId_courseId: {
        studentId: studentUser.id,
        courseId: course.id,
      },
    },
    update: {},
    create: {
      studentId: studentUser.id,
      courseId: course.id,
      quiz1: 88,
      quiz2: 91,
      assignment: 90,
      midterm: 85,
      final: 92,
    },
  });

  console.log("  ✓ Grade record confirmed");

  // 6. Ensure an academic session + term exist.
  let session =
    await prisma.academicSession.findFirst({
      where: { isCurrent: true },
    });

  if (!session) {
    session = await prisma.academicSession.findFirst();
  }

  if (!session) {
    console.log(
      "No academic session found — creating one..."
    );

    session =
      await prisma.academicSession.create({
        data: {
          name: "2026/2027",
          startDate: new Date("2026-09-01"),
          endDate: new Date("2027-07-31"),
          isCurrent: true,
        },
      });
  }

  let term = await prisma.academicTerm.findFirst({
    where: { sessionId: session.id },
  });

  if (!term) {
    console.log(
      "No academic term found — creating one..."
    );

    term = await prisma.academicTerm.create({
      data: {
        sessionId: session.id,
        name: "Semester 1",
        code: "S1",
        startDate: new Date("2026-09-01"),
        endDate: new Date("2027-01-31"),
        isCurrent: true,
      },
    });
  }

  console.log(
    `Using term: ${term.name} (${session.name})`
  );

  // 7. Create a demo assignment.
  const existingAssignment =
    await prisma.assignment.findFirst({
      where: { courseId: course.id },
    });

  if (!existingAssignment) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    await prisma.assignment.create({
      data: {
        courseId: course.id,
        title: "Reflection Essay: Chapter 1",
        description:
          "Write a one-page reflection on the first chapter covered in class.",
        dueDate,
        maxScore: 100,
      },
    });

    console.log(
      "  ✓ Demo assignment created (due in 7 days)"
    );
  } else {
    console.log(
      "  • Assignment already exists for this course, skipped"
    );
  }

  // 8. Create a demo exam.
  const existingExam = await prisma.exam.findFirst({
    where: {
      courseId: course.id,
      termId: term.id,
    },
  });

  if (!existingExam) {
    const scheduledAt = new Date();
    scheduledAt.setDate(
      scheduledAt.getDate() + 14
    );
    scheduledAt.setHours(9, 0, 0, 0);

    await prisma.exam.create({
      data: {
        courseId: course.id,
        termId: term.id,
        examType: "FINAL",
        scheduledAt,
        durationMin: 120,
        venue: "Examination Hall A",
        maxScore: 100,
      },
    });

    console.log(
      "  ✓ Demo final exam created (scheduled in 14 days)"
    );
  } else {
    console.log(
      "  • Exam already exists for this course/term, skipped"
    );
  }

  // 9. Ensure an attendance record exists.
  await prisma.attendance.upsert({
    where: {
      studentId_courseId: {
        studentId: studentProfileId,
        courseId: course.id,
      },
    },
    update: {},
    create: {
      studentId: studentProfileId,
      courseId: course.id,
      totalClasses: 20,
      attended: 17,
      absent: 3,
    },
  });

  console.log("  ✓ Attendance record confirmed");

  // 10. Programme Coordinator demo account.
  console.log("");
  console.log(
    "Setting up demo Programme Coordinator..."
  );

  const coordinatorPosition =
    await prisma.position.findUnique({
      where: {
        nameEn: "Programme Coordinator",
      },
    });

  if (!coordinatorPosition) {
    console.warn(
      "  ⚠ 'Programme Coordinator' Position not found — run the RBAC seed first."
    );
  } else {
    let coordFaculty = faculty;

    if (!coordFaculty) {
      coordFaculty = await prisma.faculty.create({
        data: {
          nameEn: "Faculty of Islamic Studies",
          nameAr: "كلية الدراسات الإسلامية",
          code: "FIS-DEMO",
        },
      });

      console.log(
        "  ✓ Created demo Faculty (none existed)"
      );
    }

    let coordDepartment = department;

    if (!coordDepartment) {
      coordDepartment =
        await prisma.department.create({
          data: {
            facultyId: coordFaculty.id,
            nameEn: "Department of Hadith Studies",
            nameAr: "قسم الحديث",
            code: "HADITH-DEMO",
          },
        });

      console.log(
        "  ✓ Created demo Department (none existed)"
      );
    }

    let coordProgram = program;

    if (!coordProgram) {
      coordProgram =
        await prisma.program.create({
          data: {
            facultyId: coordFaculty.id,
            departmentId: coordDepartment.id,
            nameEn: "Diploma in Hadith Studies",
            nameAr: "دبلوم في علوم الحديث",
            code: "DIP-HADITH-DEMO",
            level: "DIPLOMA",
          },
        });

      console.log(
        "  ✓ Created demo Program (none existed)"
      );
    }

    let coordinatorStaff =
      await prisma.staffProfile.findFirst({
        where: {
          positionId: coordinatorPosition.id,
        },
        include: { user: true },
      });

    if (!coordinatorStaff) {
      let coordUser =
        await prisma.user.findUnique({
          where: {
            email: DEMO_COORDINATOR_EMAIL,
          },
        });

      if (!coordUser) {
        const coordPasswordHash =
          await bcrypt.hash(
            DEMO_COORDINATOR_PASSWORD,
            10
          );

        coordUser = await prisma.user.create({
          data: {
            id: "user-demo-coordinator-001",
            name: "Demo Programme Coordinator",
            email: DEMO_COORDINATOR_EMAIL,
            passwordHash: coordPasswordHash,
            role: "USER",
          },
        });
      }

      coordinatorStaff =
        await prisma.staffProfile.create({
          data: {
            userId: coordUser.id,
            positionId: coordinatorPosition.id,
            facultyId: coordFaculty.id,
            departmentId: coordDepartment.id,
            employeeNo: "EMP-DEMO-COORD-001",
          },
          include: { user: true },
        });

      console.log(
        `  ✓ Created demo coordinator: ${DEMO_COORDINATOR_EMAIL} / ${DEMO_COORDINATOR_PASSWORD}`
      );
    } else {
      console.log(
        `Using existing coordinator staff: ${coordinatorStaff.user.email}`
      );
    }

    if (!coordProgram.coordinatorId) {
      await prisma.program.update({
        where: {
          id: coordProgram.id,
        },
        data: {
          coordinatorId: coordinatorStaff.id,
        },
      });

      console.log(
        `  ✓ Assigned coordinator to program: ${coordProgram.nameEn}`
      );
    } else {
      console.log(
        "  • Program already has a coordinator, left unchanged"
      );
    }

    await seedIslamicCourseCatalog(coordProgram.id);

    await seedAcademicDepartments(coordFaculty.id);

    if (!course.programId) {
      await prisma.course.update({
        where: {
          id: course.id,
        },
        data: {
          programId: coordProgram.id,
        },
      });

      console.log(
        "  ✓ Linked demo course to program"
      );
    }

    console.log("");
    console.log("   Coordinator login:");
    console.log(
      `   Email:    ${coordinatorStaff.user.email}`
    );

    if (
      coordinatorStaff.user.email ===
      DEMO_COORDINATOR_EMAIL
    ) {
      console.log(
        `   Password: ${DEMO_COORDINATOR_PASSWORD}`
      );
    } else {
      console.log(
        "   (using existing coordinator's own password)"
      );
    }
  }

  // 11. Registry / Admissions.
  console.log("");
  await setupRegistryStaff();

  // 12. Demo admission application.
  await setupDemoAdmissionApplication();

  // 13. Finance.
  await setupFinanceStaff();

  // 14. Demo fee.
  await setupDemoFee();

  // 15. Library.
  await setupLibraryStaff();

  // 16. ICT.
  await setupICTStaff();

  // 17. Instructor.
  await setupInstructorStaff(course);
  
  await setupAdditionalStaffDemos();
  await setupSecondWaveStaffDemos();


  console.log("");
  console.log("========================================");
  console.log("   DONE — log in to test:");
  console.log(`   Email:    ${studentUser.email}`);

  if (studentUser.email === DEMO_EMAIL) {
    console.log(
      `   Password: ${DEMO_PASSWORD}`
    );
  } else {
    console.log(
      "   (using existing student's own password)"
    );
  }

  console.log("========================================");
  console.log("");
}

main()
  .catch((error) => {
    console.error("DEMO DATA FAILED:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
