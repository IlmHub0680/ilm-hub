import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { GRADUATE_SUPPORT_TOPICS } from "@/lib/graduateAssistance";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

const VALID_TYPES = [
  "TRANSCRIPT",
  "LEAVE_OF_ABSENCE",
  "DEFERMENT",
  "COURSE_ADD_DROP",
  "LETTER_CONFIRMATION",
  "GRADE_APPEAL",
  "COMPLAINT",
  "GRADUATE_SUPPORT",
  "OTHER",
];

export async function GET() {
  try {
    const user = await requireUser();

    const student = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
    });

    if (!student) {
      return errorResponse("Only students can view requests", 403);
    }

    const requests = await prisma.request.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: "desc" },
      include: {
        transcriptIssue: { select: { pdfUrl: true, issuedAt: true, cumulative: true } },
        assignedUnit: { select: { nameEn: true, nameAr: true, type: true } },
        recipientDepartment: { select: { nameEn: true, nameAr: true } },
        activities: { orderBy: { createdAt: "asc" } },
      },
    });

    return NextResponse.json({
      success: true,
      data: requests.map((r) => ({
        ...r,
        attachmentUrl: r.attachmentUrl ? true : null,
        transcriptIssue: r.transcriptIssue
          ? { ...r.transcriptIssue, pdfUrl: r.transcriptIssue.pdfUrl ? true : null }
          : null,
      })),
    });
  } catch (error) {
    console.error("List student requests error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);

    return errorResponse("Failed to load requests", 500);
  }
}

export async function POST(request) {
  try {
    const user = await requireUser();

    const student = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
    });

    if (!student) {
      return errorResponse("Only students can submit requests", 403);
    }

    const body = await request.json();

    const type = typeof body.type === "string" ? body.type : "";
    const details = typeof body.details === "string" ? body.details.trim() : "";
    const attachmentUrl =
      typeof body.attachmentUrl === "string" && body.attachmentUrl
        ? body.attachmentUrl
        : null;

    if (!VALID_TYPES.includes(type)) {
      return errorResponse("A valid request type is required", 400);
    }

    // Course registration (add/drop) is closed once a student has
    // graduated — enforced here, server-side, not just hidden in the UI,
    // per the account restriction rules for Graduate accounts.
    if (type === "COURSE_ADD_DROP" && student.status === "GRADUATED") {
      return errorResponse(
        "Course registration is closed for graduated accounts. Contact Graduate Assistant support if you need help with your records.",
        403
      );
    }

    // Course add/drop requests carry a structured course + action so
    // Academic Records can actually act on approval (create or remove
    // the real Enrollment row), instead of only reading free text.
    let courseId = null;
    let courseAction = null;

    if (type === "COURSE_ADD_DROP") {
      courseId = typeof body.courseId === "string" ? body.courseId : "";
      courseAction = typeof body.courseAction === "string" ? body.courseAction : "";

      if (!["ADD", "DROP"].includes(courseAction)) {
        return errorResponse("Please specify whether this is a request to add or drop the course", 400);
      }

      const course = courseId ? await prisma.course.findUnique({ where: { id: courseId } }) : null;

      if (!course) {
        return errorResponse("Please select a valid course", 400);
      }

      const existingEnrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: user.id, courseId } },
      });

      if (courseAction === "ADD" && existingEnrollment) {
        return errorResponse("You are already registered for this course", 400);
      }

      if (courseAction === "DROP" && !existingEnrollment) {
        return errorResponse("You are not currently registered for this course", 400);
      }
    }

    // Graduate Assistant support is, by definition, for graduates —
    // the topics (certificate/transcript/statement issues) only make
    // sense once a student has actually graduated.
    if (type === "GRADUATE_SUPPORT" && student.status !== "GRADUATED") {
      return errorResponse(
        "Graduate Assistant support becomes available once your graduation is completed.",
        403
      );
    }

    if (!details) {
      return errorResponse("Please describe your request", 400);
    }

    // Complaints additionally require a topic and a recipient (either an
    // institutional Unit — e.g. Rectorate, Student Affairs — or an
    // academic Department), chosen by the student in the picker UI.
    // Graduate Assistant requests also carry a topic, but are always
    // auto-routed to the Registrar rather than asking the graduate to
    // pick a recipient.
    let topic = null;
    let assignedUnitId = null;
    let recipientDepartmentId = null;
    let recipientLabel = "";

    if (type === "GRADUATE_SUPPORT") {
      topic = typeof body.topic === "string" ? body.topic.trim() : "";

      if (!GRADUATE_SUPPORT_TOPICS.some((t) => t.value === topic)) {
        return errorResponse("Please select a valid topic", 400);
      }

      const registrarUnit =
        (await prisma.unit.findFirst({
          where: { isActive: true, type: "REGISTRAR" },
          orderBy: { createdAt: "asc" },
        })) ||
        (await prisma.unit.findFirst({
          where: { isActive: true, type: "ACADEMIC_ADMINISTRATION" },
          orderBy: { createdAt: "asc" },
        }));

      if (registrarUnit) {
        assignedUnitId = registrarUnit.id;
        recipientLabel = registrarUnit.nameEn;
      }
    }

    if (type === "COMPLAINT") {
      topic = typeof body.topic === "string" ? body.topic.trim() : "";
      const recipientType = typeof body.recipientType === "string" ? body.recipientType : "";
      const recipientId = typeof body.recipientId === "string" ? body.recipientId : "";

      if (!topic) {
        return errorResponse("Please select a topic for your complaint", 400);
      }

      if (!["unit", "department"].includes(recipientType) || !recipientId) {
        return errorResponse("Please select who this should be sent to", 400);
      }

      if (recipientType === "unit") {
        const unit = await prisma.unit.findUnique({ where: { id: recipientId } });

        if (!unit || !unit.isActive) {
          return errorResponse("The selected recipient is not available", 400);
        }

        assignedUnitId = unit.id;
        recipientLabel = unit.nameEn;
      } else {
        const department = await prisma.department.findUnique({ where: { id: recipientId } });

        if (!department || !department.isActive) {
          return errorResponse("The selected recipient is not available", 400);
        }

        recipientDepartmentId = department.id;
        recipientLabel = department.nameEn;
      }
    }

    const created = await prisma.$transaction(async (tx) => {
      const newRequest = await tx.request.create({
        data: {
          studentId: student.id,
          type,
          details,
          attachmentUrl,
          topic,
          assignedUnitId,
          recipientDepartmentId,
          courseId,
          courseAction: courseAction || undefined,
        },
      });

      if (type === "COMPLAINT" || type === "GRADUATE_SUPPORT") {
        await tx.requestActivity.create({
          data: {
            requestId: newRequest.id,
            action: "Submitted",
            toLabel: recipientLabel,
            toStatus: "SUBMITTED",
            actorLabel: user.name || "Student",
          },
        });
      }

      return newRequest;
    });

    return NextResponse.json({ success: true, data: { ...created, attachmentUrl: created.attachmentUrl ? true : null } });
  } catch (error) {
    console.error("Create student request error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);

    return errorResponse("Failed to submit request", 500);
  }
}
