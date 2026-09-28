import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeAttendanceStatus } from '@/lib/attendancePolicy';
import { requireUser } from "@/lib/auth";
import { gradeLetter, computeGpa, latestGradeByCourse } from "@/lib/grading";
import { getR2PresignedUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();

    if (user.role !== "STUDENT") {
      return NextResponse.json(
        { success: false, error: "Student access required." },
        { status: 403 }
      );
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
      include: {
        faculty: true,
        department: true,
        program: { include: { courses: true } },
        academicAdvisor: { include: { user: true } },
      },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { success: false, error: "No student profile found for this account." },
        { status: 404 }
      );
    }

    const [enrollments, grades, termRecords, requests, transcripts, announcements, notifications] =
      await Promise.all([
        prisma.enrollment.findMany({
          where: { userId: user.id },
          include: { course: true },
          orderBy: { createdAt: "desc" },
        }),
        prisma.grade.findMany({
          where: { studentId: user.id },
          include: { course: true, term: { select: { id: true, name: true } } },
          orderBy: { updatedAt: "desc" },
        }),
        prisma.termRecord.findMany({
          where: { studentId: studentProfile.id },
          include: { term: true },
          orderBy: { createdAt: "desc" },
        }),
        prisma.request.findMany({
          where: { studentId: studentProfile.id },
          orderBy: { createdAt: "desc" },
          include: {
            assignedUnit: { select: { nameEn: true, nameAr: true, type: true } },
            recipientDepartment: { select: { nameEn: true, nameAr: true } },
            activities: { orderBy: { createdAt: "asc" } },
          },
        }),
        prisma.transcriptIssue.findMany({
          where: { studentId: studentProfile.id },
          orderBy: { issuedAt: "desc" },
        }),
        prisma.announcement.findMany({
          where: {
            isActive: true,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
            AND: [
              {
                OR: [
                  { scope: "INSTITUTION" },
                  ...(studentProfile.facultyId
                    ? [{ scope: "FACULTY", facultyId: studentProfile.facultyId }]
                    : []),
                  ...(studentProfile.departmentId
                    ? [{ scope: "DEPARTMENT", departmentId: studentProfile.departmentId }]
                    : []),
                  ...(studentProfile.programId
                    ? [{ scope: "PROGRAM", programId: studentProfile.programId }]
                    : []),
                ],
              },
            ],
          },
          include: { createdBy: { select: { name: true } } },
          orderBy: { publishedAt: "desc" },
          take: 20,
        }),
        prisma.notification.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
      ]);

    const enrolledCourseIds = enrollments.map((e) => e.courseId);

    // Course-scoped announcements (an instructor's own course notices --
    // see app/api/instructor/announcements/route.ts) couldn't be included
    // in the Promise.all above since they depend on enrolledCourseIds,
    // which is only known once enrollments has resolved. A small,
    // separate query merged in below, same shape as the others.
    const courseAnnouncements = enrolledCourseIds.length
      ? await prisma.announcement.findMany({
          where: {
            isActive: true,
            scope: "COURSE",
            courseId: { in: enrolledCourseIds },
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
          include: { createdBy: { select: { name: true } } },
          orderBy: { publishedAt: "desc" },
          take: 20,
        })
      : [];

    const allAnnouncements = [...announcements, ...courseAnnouncements].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    const [
      attendanceRecords,
      examTimetable,
      assignments,
      mySubmissions,
      assignmentInstructors,
      tutoringRequests,
      availableInstructors,
      advisorMessages,
      fees,
      liveClasses,
      absenceExcuses,
      userAvatar,
    ] = await Promise.all([
      prisma.attendance.findMany({
        where: { studentId: studentProfile.id },
        include: { course: true },
      }),
      prisma.exam.findMany({
        where: { courseId: { in: enrolledCourseIds } },
        include: { course: true },
        orderBy: { scheduledAt: "asc" },
      }),
      prisma.assignment.findMany({
        where: { courseId: { in: enrolledCourseIds } },
        include: { course: true },
        orderBy: { dueDate: "asc" },
      }),
      prisma.submission.findMany({
        where: { studentId: user.id },
      }),
      prisma.instructorCourse.findMany({
        where: { courseId: { in: enrolledCourseIds } },
        include: { instructor: { select: { name: true } } },
      }),
      prisma.tutoringRequest.findMany({
        where: { studentId: studentProfile.id },
        include: { course: true, instructor: { include: { user: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.staffProfile.findMany({
        where: {
          isActive: true,
          position: { isAcademic: true },
          ...(studentProfile.departmentId
            ? { departmentId: studentProfile.departmentId }
            : studentProfile.facultyId
            ? { facultyId: studentProfile.facultyId }
            : {}),
        },
        include: {
          user: { include: { instructorCourses: { include: { course: true } } } },
        },
      }),
      prisma.advisorMessage.findMany({
        where: { studentId: studentProfile.id },
        orderBy: { createdAt: "asc" },
      }),
      prisma.studentFee.findMany({
        where: { studentId: studentProfile.id },
        include: { term: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.liveClass.findMany({
        where: { courseId: { in: enrolledCourseIds } },
        include: { course: true, instructor: { select: { name: true } } },
        orderBy: { scheduledAt: "asc" },
      }),
      prisma.absenceExcuse.findMany({
        where: { studentId: studentProfile.id },
        include: { course: true },
        orderBy: { createdAt: "desc" },
      }),
      // requireUser()'s SessionUser doesn't carry avatarUrl (see lib/auth.ts),
      // so it's fetched separately here rather than widening that shared,
      // app-wide session select for one page's use.
      prisma.user.findUnique({
        where: { id: user.id },
        select: { avatarUrl: true },
      }),
    ]);

    const submissionByAssignment = new Map(
      mySubmissions.map((s) => [s.assignmentId, s])
    );

    // A course may have more than one instructor assigned; show the
    // first for display purposes (matches how the instructor dashboard
    // itself treats InstructorCourse as a many-to-many).
    const instructorByCourse = new Map();
    for (const ic of assignmentInstructors) {
      if (!instructorByCourse.has(ic.courseId)) {
        instructorByCourse.set(ic.courseId, ic.instructor?.name ?? null);
      }
    }

    const latestTerm = termRecords[0] ?? null;

    const currentTerm = await prisma.academicTerm.findFirst({
      where: { isCurrent: true },
    });

    // Real per-course grade points, ready for computeGpa() — the one
    // shared calculation used for Semester GPA, per-term history, and
    // CGPA below. A repeated course can now have more than one Grade
    // row on record (see lib/grading.js), so there are two views of
    // it here: termGpaGrades keeps every attempt (a course can only
    // have one Grade row per actual term, so filtering this by a
    // single termId already gives that term's real courses/grades —
    // used for Semester GPA and the per-term history below); cgpaGrades
    // collapses to each course's most recently saved attempt, so a
    // repeated course is never counted twice toward the cumulative
    // figure.
    const termGpaGrades = grades.map((g) => ({
      letter: gradeLetter(g.final),
      creditHours: g.course.creditHours,
      termId: g.termId,
    }));
    const latestGrades = Array.from(latestGradeByCourse(grades).values());
    const cgpaGrades = latestGrades.map((g) => ({
      letter: gradeLetter(g.final),
      creditHours: g.course.creditHours,
      termId: g.termId,
    }));

    const avatarUrl = userAvatar?.avatarUrl
      ? await getR2PresignedUrl(userAvatar.avatarUrl, 3600).catch((err) => {
          console.error("Avatar presign error:", err);
          return null;
        })
      : null;

    const data = {
      profile: {
        studentId: studentProfile.studentNo,
        name: user.name,
        email: user.email,
        faculty: studentProfile.faculty?.nameEn ?? null,
        department: studentProfile.department?.nameEn ?? null,
        enrolledProgramme: studentProfile.program?.nameEn ?? null,
        studyType: studentProfile.studySession ?? null,
        academicStatus: studentProfile.status,
        academicAdvisor: studentProfile.academicAdvisor?.user?.name ?? null,
        level: studentProfile.level,
        admissionYear: studentProfile.admissionYear,
        avatarUrl,
      },
      registeredCourses: enrollments.map((e) => ({
        id: e.course.id,
        title: e.course.titleEn,
        code: e.course.courseCode,
        status: e.status,
      })),
      grades: grades.map((g) => ({
        courseId: g.courseId,
        course: g.course.titleEn,
        courseCode: g.course.courseCode,
        creditHours: g.course.creditHours,
        quiz1: g.quiz1,
        quiz2: g.quiz2,
        assignment: g.assignment,
        midterm: g.midterm,
        final: g.final,
        letter: gradeLetter(g.final) || "-",
        termId: g.termId,
        termName: g.term?.name ?? null,
        // Lets the client pick each course's latest attempt the same
        // way the server does (a repeated course can now list more
        // than one attempt here — see lib/grading.js).
        updatedAt: g.updatedAt,
      })),
      academicProgress: {
        // Real, credit-weighted GPA computed live from this student's
        // actual final grades every time the portal loads — never a
        // manually-entered figure, so it's always current the moment a
        // grade is entered or changed.
        semesterGPA: computeGpa(
          termGpaGrades.filter((g) => currentTerm && g.termId === currentTerm.id)
        ),
        cgpa: computeGpa(cgpaGrades),
        standing: latestTerm?.standing ?? null,
        creditsEarned: latestTerm?.creditsEarned ?? null,
        creditsAttempted: latestTerm?.creditsAttempted ?? null,
        currentTermId: currentTerm?.id ?? null,
        currentTermName: currentTerm?.name ?? null,
        history: termRecords.map((t) => ({
          term: t.term.name,
          termId: t.termId,
          gpa: computeGpa(termGpaGrades.filter((g) => g.termId === t.termId)),
          standing: t.standing,
          creditsAttempted: t.creditsAttempted,
          creditsEarned: t.creditsEarned,
        })),
      },
      programCurriculum: studentProfile.program
        ? {
            id: studentProfile.program.id,
            name: studentProfile.program.nameEn,
            level: studentProfile.program.level,
            durationYears: studentProfile.program.durationYears,
            curriculum: studentProfile.program.courses.map((c) => ({
              id: c.id,
              title: c.titleEn,
              code: c.courseCode,
              credits: c.creditHours,
            })),
          }
        : null,
      requests: requests.map((r) => ({
        id: r.id,
        type: r.type,
        status: r.status,
        details: r.details,
        attachmentUrl: r.attachmentUrl ? true : null,
        createdAt: r.createdAt,
        responseNote: r.responseNote,
        topic: r.topic,
        recipientLabel: r.assignedUnit?.nameEn || r.recipientDepartment?.nameEn || null,
        activities: r.activities.map((a) => ({
          id: a.id,
          action: a.action,
          fromLabel: a.fromLabel,
          toLabel: a.toLabel,
          fromStatus: a.fromStatus,
          toStatus: a.toStatus,
          note: a.note,
          actorLabel: a.actorLabel,
          createdAt: a.createdAt,
        })),
      })),
      transcripts: transcripts.map((t) => ({
        id: t.id,
        requestId: t.requestId,
        pdfUrl: t.pdfUrl ? true : null,
        cumulative: t.cumulative,
        issuedAt: t.issuedAt,
      })),
      announcements: allAnnouncements.map((a) => ({
        id: a.id,
        title: a.titleEn,
        message: a.bodyEn,
        date: a.publishedAt,
        scope: a.scope,
        author: a.createdBy?.name ?? null,
      })),
      notifications: notifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type || null,
        isRead: n.isRead,
        createdAt: n.createdAt,
      })),
      attendance: attendanceRecords.map((a) => {
        const { rate, status } = computeAttendanceStatus(a.totalClasses, a.attended, a.late);
        return {
          courseId: a.courseId,
          course: a.course.titleEn,
          totalClasses: a.totalClasses,
          attended: a.attended,
          late: a.late,
          absent: a.absent,
          attendanceRate: rate,
          status,
        };
      }),
      examTimetable: examTimetable.map((e) => ({
        id: e.id,
        courseId: e.courseId,
        course: e.course.titleEn,
        examType: e.examType,
        date: e.scheduledAt,
        durationMin: e.durationMin,
        venue: e.venue,
      })),
      assignments: assignments.map((a) => {
        const sub = submissionByAssignment.get(a.id);
        return {
          id: a.id,
          courseId: a.courseId,
          course: a.course.titleEn,
          courseCode: a.course.courseCode,
          instructor: instructorByCourse.get(a.courseId) ?? null,
          title: a.title,
          description: a.description,
          dueDate: a.dueDate,
          maxScore: a.maxScore,
          attachmentUrl: a.attachmentUrl ? true : null,
          submission: sub
            ? {
                id: sub.id,
                status: sub.status,
                fileUrl: sub.fileUrl ? true : null,
                answerText: sub.answerText,
                score: sub.score,
                feedback: sub.feedback,
                submittedAt: sub.submittedAt,
              }
            : null,
        };
      }),
      tutoring: {
        availableInstructors: availableInstructors.map((s) => ({
          id: s.id,
          name: s.user.name,
          courses: s.user.instructorCourses.map((ic) => ic.course.titleEn),
        })),
        requests: tutoringRequests.map((t) => ({
          id: t.id,
          course: t.course.titleEn,
          instructor: t.instructor?.user?.name ?? null,
          status: t.status,
          feeUSD: t.feeUSD,
          isPaid: t.isPaid,
          paidAmount: t.paidAmount === null ? null : Number(t.paidAmount),
          notes: t.notes,
          createdAt: t.createdAt,
        })),
      },
      absenceExcuses: absenceExcuses.map((a) => ({
        id: a.id,
        type: a.type,
        course: a.course.titleEn,
        absenceDate: a.absenceDate,
        reason: a.reason,
        status: a.status,
        reviewNote: a.reviewNote,
        createdAt: a.createdAt,
      })),
      advisorMessages: advisorMessages.map((m) => ({
        id: m.id,
        senderRole: m.senderRole,
        message: m.message,
        isRead: m.isRead,
        createdAt: m.createdAt,
      })),
      fees: fees.map((f) => ({
        id: f.id,
        term: f.term?.name ?? null,
        feeType: f.feeType,
        amountUSD: f.amountUSD,
        paidUSD: f.paidUSD,
        balanceUSD: f.amountUSD - f.paidUSD,
        status: f.status,
        dueDate: f.dueDate,
      })),
      liveClasses: liveClasses.map((c) => ({
        id: c.id,
        courseId: c.courseId,
        course: c.course.titleEn,
        courseCode: c.course.courseCode,
        instructor: c.instructor?.name ?? null,
        topic: c.topic,
        scheduledAt: c.scheduledAt,
        durationMin: c.durationMin,
        meetingLink: c.meetingLink,
        notes: c.notes,
      })),
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("Student portal API error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to load student portal data." },
      { status: 500 }
    );
  }
}