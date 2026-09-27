import { resend, isResendConfigured } from '@/lib/resend';

// First real usage of the Resend client in this app -- until now
// lib/resend.js/.ts was wired up but never called from anywhere.
// Admission decisions (Model 16, Section 44: "reuse the existing
// notification/email system") is where that gets rectified.
//
// Sending is intentionally best-effort: an admission decision (the
// database transition, the new student account) must never be
// rolled back or blocked just because an email failed to send, so
// every function here catches its own errors and returns a status
// instead of throwing.
//
// Two things must be configured in .env before mail actually goes
// out, and neither is invented here:
//   RESEND_API_KEY        -- a real Resend API key
//   ADMISSIONS_EMAIL_FROM  -- a verified sending address, e.g.
//                             "Admissions <admissions@yourdomain>"
// Until both are set, sends are skipped (with a clear console
// warning) rather than silently failing against a placeholder domain.

const FROM_ADDRESS = process.env.ADMISSIONS_EMAIL_FROM;

function canSend(): boolean {
  if (!isResendConfigured) {
    console.warn(
      '[admissionEmails] RESEND_API_KEY is not set -- skipping admission email send.'
    );
    return false;
  }

  if (!FROM_ADDRESS) {
    console.warn(
      '[admissionEmails] ADMISSIONS_EMAIL_FROM is not set -- skipping admission email send.'
    );
    return false;
  }

  return true;
}

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendAdmissionApprovedEmail(params: {
  to: string;
  applicantName: string;
  applicationNumber: string;
  programName?: string | null;
  departmentName?: string | null;
  studentNo?: string | null;
}): Promise<{ sent: boolean; error?: unknown }> {
  if (!canSend()) return { sent: false };

  const {
    to,
    applicantName,
    applicationNumber,
    programName,
    departmentName,
    studentNo,
  } = params;

  const programLine = programName
    ? `into the <strong>${escapeHtml(programName)}</strong>${
        departmentName ? ` (${escapeHtml(departmentName)})` : ''
      } programme`
    : 'programme';

  try {
    await resend.emails.send({
      from: FROM_ADDRESS as string,
      to,
      subject: 'Congratulations — Your Admission Has Been Approved',
      html: `
        <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
          <p>Dear ${escapeHtml(applicantName)},</p>
          <p>
            Congratulations! We are pleased to inform you that your admission application
            (<strong>${escapeHtml(applicationNumber)}</strong>) has been <strong>approved</strong>,
            and you have been admitted ${programLine} at Ulul Azm Institute.
          </p>
          ${
            studentNo
              ? `<p>Your student number is <strong>${escapeHtml(
                  studentNo
                )}</strong>. Please keep this for your records — you will need it to log in to the Student Portal.</p>`
              : ''
          }
          <p>We look forward to welcoming you. Further guidance on registration and next steps will follow.</p>
          <p>With warm regards,<br />Admissions &amp; Registration<br />Ulul Azm Institute</p>
        </div>
      `,
    });

    return { sent: true };
  } catch (error) {
    console.error('[admissionEmails] Failed to send approval email:', error);
    return { sent: false, error };
  }
}

export async function sendAdmissionLetterAvailableEmail(params: {
  to: string;
  applicantName: string;
  applicationNumber: string;
}): Promise<{ sent: boolean; error?: unknown }> {
  if (!canSend()) return { sent: false };

  const { to, applicantName, applicationNumber } = params;

  try {
    await resend.emails.send({
      from: FROM_ADDRESS as string,
      to,
      subject: 'Your Letter of Admission Is Now Available',
      html: `
        <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
          <p>Dear ${escapeHtml(applicantName)},</p>
          <p>
            Your official Letter of Admission for application
            <strong>${escapeHtml(applicationNumber)}</strong> has been finalized and is now
            available to download from your admission tracking page.
          </p>
          <p>With warm regards,<br />Admissions &amp; Registration<br />Ulul Azm Institute</p>
        </div>
      `,
    });

    return { sent: true };
  } catch (error) {
    console.error('[admissionEmails] Failed to send letter-available email:', error);
    return { sent: false, error };
  }
}

export async function sendAdmissionDeclinedEmail(params: {
  to: string;
  applicantName: string;
  applicationNumber: string;
  reason?: string | null;
}): Promise<{ sent: boolean; error?: unknown }> {
  if (!canSend()) return { sent: false };

  const { to, applicantName, applicationNumber, reason } = params;

  try {
    await resend.emails.send({
      from: FROM_ADDRESS as string,
      to,
      subject: 'Update on Your Admission Application',
      html: `
        <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
          <p>Dear ${escapeHtml(applicantName)},</p>
          <p>
            Thank you for your interest in Ulul Azm Institute and for the time you took to
            complete your admission application (<strong>${escapeHtml(applicationNumber)}</strong>).
          </p>
          <p>After careful review, we are unable to offer you admission at this time.</p>
          ${
            reason
              ? `<p><strong>Reason provided by Admissions &amp; Registration:</strong> ${escapeHtml(
                  reason
                )}</p>`
              : ''
          }
          <p>We appreciate your interest and wish you every success in your future studies.</p>
          <p>With respect,<br />Admissions &amp; Registration<br />Ulul Azm Institute</p>
        </div>
      `,
    });

    return { sent: true };
  } catch (error) {
    console.error('[admissionEmails] Failed to send decline email:', error);
    return { sent: false, error };
  }
}
