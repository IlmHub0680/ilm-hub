# -*- coding: utf-8 -*-
import io

PATH = "app/api/admin/admissions/[id]/decision/route.ts"

with io.open(PATH, "r", encoding="utf-8") as f:
    content = f.read()


def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d" % (label, c)
    return content.replace(old, new)


content = r1(
    content,
    'import { requireAdmissionsEdit } from "@/lib/permissions";\nimport crypto from "crypto";',
    'import { requireAdmissionsEdit } from "@/lib/permissions";\nimport { generateStudentNumber } from "@/lib/studentNumber";\nimport crypto from "crypto";',
    "import generateStudentNumber",
)

content = r1(
    content,
    """    const application = await prisma.admissionApplication.findUnique({
      where: { id },
      include: { payment: true },
    });""",
    """    const application = await prisma.admissionApplication.findUnique({
      where: { id },
      include: { payment: true, program: true },
    });""",
    "include program on application fetch",
)

content = r1(
    content,
    """      const updatedApplication =
        await tx.admissionApplication.update({
          where: { id },
          data: { status: "APPROVED" },
          include: { payment: true },
        });

      return {
        user,
        application: updatedApplication,
      };
    });""",
    """      const updatedApplication =
        await tx.admissionApplication.update({
          where: { id },
          data: { status: "APPROVED" },
          include: { payment: true },
        });

      /*
       * Student Lifecycle: Admission -> Placement -> Enrollment.
       * Approval is also where the applicant becomes a real student
       * record — everything downstream (Placement, Attendance,
       * Advising, Term Records, Graduation) hangs off StudentProfile,
       * not off AdmissionApplication or User alone. ADMITTED marks a
       * student who has been approved but not yet placed or
       * registered into courses (StudentStatus).
       */
      let studentProfile = await tx.studentProfile.findUnique({
        where: { userId: user.id },
      });

      if (!studentProfile) {
        const admissionYear = new Date().getFullYear();
        const studentNo = await generateStudentNumber(admissionYear);

        studentProfile = await tx.studentProfile.create({
          data: {
            userId: user.id,
            studentNo,
            facultyId: application.program?.facultyId || null,
            departmentId:
              application.program?.departmentId ||
              application.preferredDepartmentId ||
              null,
            programId: application.programId || null,
            admissionYear,
            studySession: application.studySession || null,
            status: "ADMITTED",
          },
        });
      }

      return {
        user,
        application: updatedApplication,
        studentProfile,
      };
    });""",
    "create StudentProfile on approval",
)

content = r1(
    content,
    """      data: {
        application: result.application,
        student: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        },
      },
    });""",
    """      data: {
        application: result.application,
        student: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        },
        studentProfile: {
          id: result.studentProfile.id,
          studentNo: result.studentProfile.studentNo,
          status: result.studentProfile.status,
        },
      },
    });""",
    "include studentProfile in response",
)

with io.open(PATH, "w", encoding="utf-8") as f:
    f.write(content)

print("decision route updated: creates StudentProfile on approval.")
