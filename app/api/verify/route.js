import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Public document verification -- given the exact verification code
// printed on an official transcript, graduation certificate or
// statement of completion, confirms whether it is a real record this
// institution issued. Exact-code lookup only, no search or browsing:
// a code has enough entropy (lib/verificationCode.js) that this can't
// be used to enumerate students' records.
function formatDate(date) {
  return new Date(date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
}

const GRADUATION_DOC_LABEL = {
  CERTIFICATE: "Graduation Certificate",
  STATEMENT_OF_COMPLETION: "Statement of Completion",
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = (searchParams.get("code") || "").trim().toUpperCase();

  if (!code) {
    return Response.json({ success: false, error: "Enter a verification code." }, { status: 400 });
  }

  try {
    const [graduationDoc, transcript] = await Promise.all([
      prisma.graduationDocument.findUnique({
        where: { verificationCode: code },
        include: {
          student: { include: { user: { select: { name: true } } } },
          application: { include: { program: { select: { nameEn: true, level: true } } } },
        },
      }),
      prisma.transcriptIssue.findUnique({
        where: { verificationCode: code },
        include: {
          student: {
            include: { user: { select: { name: true } }, program: { select: { nameEn: true, level: true } } },
          },
        },
      }),
    ]);

    if (graduationDoc) {
      return Response.json({
        success: true,
        found: true,
        result: {
          documentType: GRADUATION_DOC_LABEL[graduationDoc.type] || graduationDoc.type,
          holderName: graduationDoc.student?.user?.name || "",
          programme: graduationDoc.application?.program?.nameEn || "",
          level: graduationDoc.application?.program?.level || "",
          issuedOn: formatDate(graduationDoc.issuedAt),
        },
      });
    }

    if (transcript) {
      return Response.json({
        success: true,
        found: true,
        result: {
          documentType: "Official Academic Transcript",
          holderName: transcript.student?.user?.name || "",
          programme: transcript.student?.program?.nameEn || "",
          level: transcript.student?.program?.level || "",
          issuedOn: formatDate(transcript.issuedAt),
        },
      });
    }

    return Response.json({ success: true, found: false });
  } catch (error) {
    console.error("Document verification error:", error);
    return Response.json(
      { success: false, error: "Unable to verify this code right now. Please try again shortly." },
      { status: 500 }
    );
  }
}
